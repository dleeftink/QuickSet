# QuickSet
A performant *Least Frequently Used* (LFU) sorted set implementation for working with reasonably sized integers (unsigned). Trades memory for performance, optimised for frequently updating and counting a relatively small set of integers (integers spanning from 0 to 2^16 inclusive) or extracting unique integers from a large pool if numbers in one go (integers spanning from 0 to 2^28 inclusive). Sorted in natural ascending order of integers by default.

### Use cases
1. Finding top-k most frequent items in one or many lists
2. Nearest neighbour finding based on frequency of occurance
3. A lightweight key/value dictionary
4. Sorting random integers for binary search
5. Duplicate integer counting
6. Unique integer extraction

## How it works
Once initialised, `QuickSet` allocates a TypedArray based on the expected range of integers (numbers between 0 and 2^28) and frequency of occurance (counts between 0 and 2^32). 
Additionally, it keeps track of how often individual integers are added to the set, providing a (sorted) top-k window of most frequent integers. 

Two modes are provided for establishing top-k ranks, `minsum` and `winsum`. 
Both eject the least frequent integer from the ranking upon inserting new items, yielding a ranked 'window' that guarantees the k-most occurring elements of the set to 'bubble up' (ejecting the *Least Frequently Used* or LFU). 
Whereas `minsum` ejects integers from their initial point of insertion (i.e. random access), `winsum` keeps integers sorted  in decreasing order of occurrence (slightly more computationally expensive).

This makes `QuickSet` a fast alternative to counting and sorting all elements in a given set, preventing costly sorting operations and returning a ranked window of most frequent  integers up till a point of your choosing. 
This enables working with frequently occuring items 'earlier' compared to processing and sorting the input data in full, especially if the underlying integers follow a non-uniform distribution.

## Quickstart 

```
npm install @suptxt/quickset
```

After installing, instantiate a `QuickSet` by calling;

``` js

let set = new QuickSet()

```

This instantiates a new set with [default parameters](#new-quickset-config) and a top-k window of 0-length, which may need additional configuring to suit your needs. As a rule of thumb:

- If you are interested in using unweighted set operations only, use [`.add()`](#add-uint-value) or [`.put()`](#put-uint-value) for single and [`.unique()`](#unique-uints) for bulk insertions.
- If you want to assign weights to  integers, use [`.sum()`](#sum-uint-value) for single and [`.batch()`](#batch-uints-values) for bulk insertions.
Updates to the top-k window are only made when the [`slot`](#slot-0--16) parameter is set.

Methods can be mixed and matched to your liking, but may yield unwanted results if used without caution: 
- [`.add()`](#add-uint-value), [`.put()`](#put-uint-value) and [`.unique()`](#unique-uints) overwrite previous values and **do not** update the top-k window when inserting new integers and optional weights;
- [`.sum()`](#sum-uint-value) and [`.batch()`](#batch-uints-values) maintain previous values and **do** update the top-k window when inserting new integers and optional weights.

See the [`.put()`](#put-uint-value) examples for why this distinction is useful.

## Configuration

#### `new QuickSet` `({...config})`
Creates a new QuickSet instance with default settings (the top-k window is turned off by default):

```js
let config = {

  mode: "minsum" || "winsum",
  slot:   0, // top-k ranked window slots  (0 .. 16)

  span: 512, // max expected integer range (0 .. 2^28)
  clip:   0, // min expected integer range (0 .. 2^28)
  
  high: 128, // max expected integer count (0 .. 2^32)
  freq:   1, // min expected integer count (0 .. 2^32)

  lifo:   0, // replace earlier values in case of ties

}
```

###### `mode: "minsum" || "winsum"`
Sets the default summing mode when using [`sum`](#sum-uint-value). 
See [rankers](#rankers) for more.

###### `span: 0 .. 2 ^ 28`
Maximum expected integer in set (upper range bound). 
Values above this number are ignored when added to the set.

###### `clip: 0 .. 2 ^ 28`
Minimum expected integer in set (lower range bound). 
Values below this number are ignored when added to the set.

###### `high: 0 .. 2 ^ 32`
Maximum expected count of each discrete integer in set (upper frequency bound per integer). 
Counting is maximised to this value. 

###### `freq: 0 .. 2 ^ 32`
Minimum expected count of each discrete integer in set (lower frequency bound per integer). 
Acts as minimum threshold for integers to be included in top-k window.

###### `slot: 0 .. 16`
Amount of slots to keep track of top-k most frequent integers in the set.
Any value between `0` and `16` sets the top-k window width.
Defaults to `0`.

###### `lifo: true || false`
Whether to eject old values from the top-k window in case of ties. 
Performance might be affected when set to `true`. 
Defaults to `false`.

#### `QuickSet class {...}`
Besides the configured options and methods, [`QuickSet`](#new-quickset-config) returns an object with two visible and one hidden backing array. 
The visible arrays, [`rank`](#setrank-uintarray) and [`stat`](#setstat-uintarray) provide the top-k window of most frequent integers (rank) and values (stat) present in a set, while the hidden [`bits`](#setbits-uintarray) array tracks the frequencies of all integers in the set.

While each array can be read without issue (for instance, to execute some logic when a specific integer reaches a certain top-k position or when its frequency exceeds a certain threshold), modifying them can lead to unwanted behaviour. 
Some additional properties describe the internal state of the set.

###### `set.bits: [UintArray]`
This non-enumerable property contains the Typed backing array that stores all integers present in the set as well as their values. 

###### `set.rank: [UintArray]`
This enumerable property displays the Typed top-k window of ranked integers. 
The window size is determined from [`slot`](#slot-0--16).

###### `set.stat: [UintArray]`
This enumerable property displays the values associated with the ranked integers.
Same length as [`rank`](#setrank-uintarray).

###### `set.last: Uint`
A constant parameter for accessing the last item in the top-k window defined by [`slot`](#slot-0--16).

###### `set.tmin: Uint`
A variable parameter displaying the minimum value in the top-k window, lower bounded by [`freq`](#freq-0--2--32).

###### `set.tmax: Uint`
A variable parameter displaying the maximum value in the top-k window, upper bounded by [`high`](#high-0--2--32).

> Note that due to being TypedArrays, `rank` and `stat` may contain multiple zeroes. If 0 is an integer you have previously inserted, you can access this by looking for the first indexed 0 in `rank` as well its value at the same index in `stat`.

## API

### Bulk

#### `.batch` `(...uints[, values])`
Batch loading method for inserting integers into the set and summing optional weights/values (uses [`.sum()`](#sum-uint-value) under the hood). 
Additionally updates the the top-k window based on [`mode`](#mode-minsum--winsum).

Basic example:

``` js

let set = new QuickSet();
    set.batch(0,1,1,2,4,6,7,7,1);

 // set.keys()   = [0,1,2,4,6,7,1]
 // set.values() = [1,3,1,1,1,2,1]

```

Array example:

``` js

let uints = [0,1,1,2,4,6,7,7,1];
    set.batch(uints);

 // set.keys()   = [0,1,2,4,6,7,1]
 // set.values() = [1,3,1,1,1,2,1]

```

Columnar example (values are summed for duplicate integers):

``` js

let uints = [1,5,7,1];
let vals  = [1,2,3,4];
    set.batch(uints, vals);

 // set.keys()   = [1,5,7]
 // set.values() = [5,2,3]

```

Strided columnar example (values are summed in strided fashion for duplicate integers):

``` js

let uints = [1,2,2,5];
let vals  = [1,3];
    set.batch(uints, vals);

 // set.keys()   = [1,2,5]
 // set.values() = [1,4,3]

```

Batch operations are chainable: 

``` js

set.batch(0,1,2,1).batch(1,2).entries() // = [ [0,1], [1,3], [2,2] ]

```

#### `.unique` `(...uints)`
Batch loading method for inserting unique integers into the set once (uses [`.add()`](#add-uint-value) under the hood). 
Resets previous set values (i.e. integer counts) to one. 
Does **not** update the top-k window (use [`.batch()`](#batch-uints-values) to track integer frequencies and have updates reflected).

Basic example:

``` js

let set = new QuickSet();
    set.unique(0,2,4,1,6,7,1,2);

 // set.keys()   = [0,1,2,4,6,7]
 // set.values() = [1,1,1,1,1,1]

```

Array example:

``` js

let uints = [0,2,4,1,6,7,1,2];
    set.unique(uints);

 // set.keys()   = [0,1,2,4,6,7]
 // set.values() = [1,1,1,1,1,1]

```

Unique operations are chainable: 

``` js

set.unique(0,1,2,1).unique(1,2).keys() // = [ 0,1,2 ]

```

### Setters
Methods for inserting and updating integer data.

#### `.add` `(​uint[, value])`
Inserts a single integer into the set if above the lower [`clip`](#clip-0--2--28) and below the upper [`span`](#span-0--2--28) bound, with an optional weight/value limited to [`high`](#high-0--2--32).
Useful for initialising a set with weights, or quickly adding integers to the set (use [`.unique()`](#unique) for faster key insertion). 
Overwrites previously set values, but does **not** update the top-k [window](#quickset-class) (use [`.sum()`](#sum-uint-value) to have updates reflected).

Example:

``` js

let set = new QuickSet({
      slot: 2,
    });

    set.add(1);
    set.add(2,1);
    set.add(2,4);

 // .add() overwrites backing array
 // set.keys()   = [ 1,2 ]
 // set.values() = [ 1,4 ]

 // .add() does not update top-k window
 // set.rank = [ 0,0 ]
 // set.stat = [ 0,0 ]

```

#### `.put` `(uint[, value])`
'Unsafe' adds an integer to the set with an optional value **without** checking if the integer falls within range or its value exceeds the [`high`](#high-0--2--32) frequency mark (use [`.add()`](#add-uint-value) for safe insertion). Overwrites previously set values, but does not update the top-k [window](#quickset-class) (use [`.sum()`](#sum-uint-value) to have updates reflected).

Should in theory provide better performance compared to [`.add()`](#add-uint-value) with the risk of adding integers beyond the configured range or expected frequency (potentially causing overflows). 

Example:

``` js
let set = new QuickSet({
      high: 255,
      slot: 2
    });

    set.put(1,255);
    set.put(2,256);

 // .put() overwrites backing array
 // set.keys()   = [ 1 , 2 ]
 // set.values() = [ 255,0 ]

 // .put() does not update top-k window
 // set.rank = [ 0,0 ]
 // set.stat = [ 0,0 ]

```

This method is useful for 'tombstoning' integers, e.g. setting an integer's value higher than the  [`high`](#high-0--2--32) watermark to prevent it being picked up by the [`.sum()`](#sum-uint-value) top-k window:

``` js
let set = new QuickSet({
      mode: "minsum",
      high: 127,
      slot: 2
    });

 // Integers with a value exceeding 'high' are ignored by .sum() 

    set.put(1,128);
    set.sum(2,4);
    set.sum(1,1); 

 // set.rank = [ 2, 0 ]
 // set.stat = [ 4, 0 ]

 // Enable 1 to be picked up by .sum() again
 // by setting its value below the 'high' frequency mark
 // note: the first .put() does not update top-k window, but .sum() does

    set.put(1,2);
    set.sum(1,3);

 // set.rank = [ 2, 1 ]
 // set.stat = [ 4, 5 ]

```

This technique can be used to build a 'drop' list of integers and keep unwanted integers out of the top-k ranking without having to validate each integer during more expansive [`.sum()`](#sum-uint-value) operations ('tombstoned' values are simply ignored).

#### `.sum` `(​uint[, value])`
Inserts a single integer into the set if above the lower [`clip`](#clip-0--2--28) and below the upper [`span`](#span-0--2--28) bound.
If already present, increases its frequency by one or a custom weight/value limited to [`high`](#high-0--2--32).
Additionally updates the top-k [window](#quickset-class) based on [`mode`](#mode-minsum--winsum) when the updated value exceeds the minimum [`freq`](#freq-0--2--32) parameter.

Example:

``` js

let set = new QuickSet({
      mode: "minsum",
      high: 16,
      freq:  2,
      slot:  4,
    });

    set.sum(1);
    set.sum(2);
    set.sum(1);
    set.sum(1);
    set.sum(9);
    set.sum(2,4);

 // set.rank = [ 1 , 2 , 0 , 0 ];
 // set.stat = [ 3 , 5 , 0 , 0 ]; 

```

### Getters
Methods for checking and retrieving integer data.

#### `.has` `(uint)`
Checks if the given integer is part of the set.

``` js

let uints = [0,1,5,7];
    set.batch(uints);

    set.has(7) // => true
    set.has(3) // => false

```

#### `.get` `(uint)`
Retrieves the given integer's value if present in the set.

``` js

let uints = [0,1,5,7];
    vals  = [1,2,3,4];
    set.batch(uints, vals);

    set.get(7) // => 4
    set.get(3) // => 0

```

### Jetters 
Methods for deleting and jettisoning integer data.

#### `.delete` `(uint)`
Removes a single integer and its value from the set. 
Does **not** update the top-k window (use [`.derank()`](#derank-uint) for this). 
Useful for resetting an integer's count to zero in the backing array while maintaining its last position and value in the top-k [window](#quickset-class).

Example:

``` js

let set = new QuickSet({
      mode: "winsum",
      freq:  1,
      slot:  6
    });
    set.batch(3,1,0,1,3,4,3,5,7,1);

//  Backing array
//  set.keys()   = [ 0,1,3,4,5,7 ]
//  set.values() = [ 1,3,2,1,1,1 ]

//  Top-k window 
//  set.rank = [ 1,3,0,4,5,7 ]
//  set.stat = [ 3,2,1,1,1,1 ]

    set.delete(1);
    set.delete(3);

//  [ 1,3 ]  deleted from backing array

//  set.keys()   = [ 0,4,5,7 ]
//  set.values() = [ 1,1,1,1 ]

//  [ 1,3 ] kept in top-k window

//  set.rank = [ 1,3,0,4,5,7 ]
//  set.stat = [ 3,2,1,1,1,1 ]

```

This method can also be used to reset integer counts to 0 when exceeding a threshold, which downsamples frequent integers during later [`.sum()`](#sum-uint-value) operations.

``` js
let example = forthcoming
```

#### `.derank` `(uint)`
Removes a single integer and its value from the set. Additionally updates the top-k window based on [`mode`](#mode-minsum--winsum).
Useful to delete an integer from the set and remove it from the [top-k window](#quickset-class).

``` js

let set = new QuickSet({
      mode: "winsum",
      freq:  1,
      slot:  6
    });
    set.batch(3,1,0,1,3,4,3,5,7,1);

//  Backing array
//  set.keys()   = [ 0,1,3,4,5,7 ]
//  set.values() = [ 1,3,2,1,1,1 ]

//  Top-k window 
//  set.rank = [ 1,3,0,4,5,7 ]
//  set.stat = [ 3,2,1,1,1,1 ]

    set.derank(1);
    set.derank(0);
    set.derank(4);

//  [ 1,0,4 ] deleted from backing array

//  set.keys()   = [ 3,5,7 ]
//  set.values() = [ 2,1,1 ]

//  [ 1,0,4 ] deranked from top-k window

//  set.rank = [ 3,5,7,0,0,0 ]
//  set.stat = [ 2,1,1,0,0,0 ]

```

### Rankers
Strategies for inserting and updating integer counts and updating the top-k window.

#### `.minsum` `(uint[, value])`
Inserts a single integer into the set if above the lower [`clip`](#clip-0--228) and below the upper [`span`](#span-0--228) bound.
If already present, increases its frequency by one or a custom weight/value limited to [`high`](#high-0--232). 
Additionally updates the top-k window using the 'minsum' strategy when the updated value exceeds the minimum [`freq`](#freq-0--232) parameter:

1. If already in top-k window, update count by one or a custom weight/value
2. If value exceeds [`freq`](#freq-0--232) find first integer with lowest frequency count
3. Replace this integer with the updated one and its new value

The count of each dropped integer remains accessible in the [Typed backing array](#setbits-uintarray). 
Depending on `lifo`, the `minsum` strategy executes as follows.

When `lifo = true` later insertions are kept (*last in-first out*):

``` js

let set = new QuickSet({
      mode: "minsum",
      lifo: true ,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,2,0);
    set.minsum(4);

//  when 4 is inserted 1 is overwritten
//
//                [4]
//                 v
//  set.rank = [ 0,1,2,3 ]
//  set.stat = [ 3,1,2,1 ]

```

When `lifo = false` earlier insertions are kept:

``` js

let set = new QuickSet({
      mode: "minsum",
      lifo: false ,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,2,0);
    set.minsum(4);

//  when 4 is inserted
//  find empty slot with a lower count
//
//                [4] [4]    [4]
//                 x   x  ->  v
//  set.rank = [ 0,1,2,3 ]   [4] not inserted 
//  set.stat = [ 3,1,2,1 ]   [1] not inserted

```

This insertion method resembles random access while guaranteeing the most frequent elements to bubble up. 
If integer counts are tied, [`lifo`](#lifo-true--false) is enacted based on its setting.
More efficient than [`winsum`](#winsum-uint-value) due to absence of copying, but `lifo: true` can introduce a performance penalty.

#### `.winsum` `(uint[, value])`
Inserts a single integer into the set if above the lower [`clip`](#clip-0--228) and below the upper [`span`](#span-0--228) bound.
If already present, increases its frequency by one or a custom weight/value limited to [`high`](#high-0--232). 
Additionally updates the top-k window using the 'winsum' strategy when the updated value exceeds the minimum [`freq`](#freq-0--232) parameter:

1. Find the last integer in the window with a count exceeding the value to insert
2. From this index, move every integer and its value one position to the right
3. Insert the integer and its updated value into the newly opened spot

The count of each dropped integer remains accessible in the [Typed backing array](#setbits-uintarray).
Depending on `lifo`, the `winsum` strategy executes as follows:

When `lifo = true` later insertions are kept (*last in-first out*):

``` js

let set = new QuickSet({
      mode: "winsum",
      lifo: true,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,2,0);
    set.winsum(4);

//  when 4 is inserted 1 is ejected 
//
//                  [4]
//                   v
//  set.rank = [ 0,2,4,3 ] -> [1] dropped
//  set.stat = [ 3,2,1,1 ] -> [1] dropped

```

When `lifo = false` earlier insertions are kept:

``` js

let set = new QuickSet({
      mode: "winsum",
      lifo: false,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,2,0);
    set.winsum(4);

//  when 4 is inserted try to
//  find empty slot with a lower count
//
//                  [4 4]    [4]
//                   x x  ->  v
//  set.rank = [ 0,2,3,1 ]   [4] not inserted
//  set.stat = [ 3,2,1,1 ]   [1] not inserted

```

This method resembles insertion sort, and keeps all integers in the top-k window sorted by decreasing order of frequency.
If integer counts are tied, [`lifo`](#lifo-true--false) is enacted based on its setting.
Slightly slower than [`minsum`](#minsum-uint-value) due to frequent copying, with an additional performance penalty when `lifo: true`.

### Sorters 
Methods for sorting and returning the set data. 
Each can be exit early by providing a maximum number of `iters` (value greater than zero or `true` for a full sweep), or return items in descending order by setting its `reverse` to `true`.

#### `.keys` `(iters[, reverse])`
Method that returns all integer keys in the set in natural ascending order. 

``` js

let set = new QuickSet();
    set.batch(4,1,2,3,4,1,2,5,2,0);

//  set.keys()  = [0,1,2,3,4,5]
//  set.keys(2) = [0,1]

```

#### `.values` `(iters[, reverse])`
Method that returns all values associated to keys in natural ascending order of keys.

``` js

let set = new QuickSet();
    set.batch(4,1,2,3,4,1,2,5,2,0);

//  set.values()  = [1,2,3,1,2,1]
//  set.values(2) = [1,2]

```

#### `.entries` `(iters[, reverse])` 
Method that returns all key/value pairs in natural ascending order of keys.

``` js

let set = new QuickSet();
    set.batch(4,1,2,3,4,1,2,5,2,0);

//  set.entries()  = [[0,1], [1,2], [2,3], [3,1], [4,2], [5,1]]
//  set.entries(2) = [[0,1], [1,2]]

```

#### `.sorted` `(iters[, reverse])`
Method that sorts all integers in the set in natural ascending order.
Slightly faster than calling native `.sort()`.

``` js

let set = new QuickSet();
    set.batch(4,1,2,3,4,1,2,5,2,0);

//  set.sorted()  = [0,1,1,2,2,2,3,4,4,5]
//  set.sorted(2) = [0,1]

```

### Windows

#### `.top` `(k[, reverse])`
Method for *copying* the top window entries (`rank`|`stat`) up until position `k`.

``` js

let set = new QuickSet({
      mode: "minsum",
      lifo: false,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,4,2,0);

//  set.top()  = [ [0,3], [1,1], [2,2], [3,1] ]
//  set.top(2) = [ [0,3], [2,2] ]

```

#### `.topK` `(k[, reverse])`
Method for *copying* the top window **keys** (`rank`) up until position `k`.

``` js

let set = new QuickSet({
      mode: "minsum",
      lifo: false ,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,4,2,0);
 
//  set.topK()  = [ 0,1,2,3 ]
//  set.topK(2) = [ 0,1 ]

```

#### `.topV` `(k[, reverse])`
Method for *copying* the top window **values** (`stat`) up until position `k`.

``` js

let set = new QuickSet({
      mode: "minsum",
      lifo: false ,
      slot: 4,
      freq: 0
    });
    set.batch(0,1,2,0,3,4,2,0);
 
//  set.topV()  = [ 3,1,2,1 ]
//  set.topV(2) = [ 3,1 ]

```

### Resizing

#### `.expand` `(slots)`
Implementation forthcoming.

#### `.shrink` `(slots)`
Implementation forthcoming.

### Disposal

#### `.clear` `(true || 0-16)`
Method for clearing the [Typed backing array](#setbits-uintarray) (`.clear()`) and optionally the top-k window (`.clear(true)`). 
During clearing operations, the top-k window can be resized as desired between 1 and 16 slots (`.clear(1..16)`).
This method is useful for resetting and reusing a set between runs without having to construct a `new QuickSet()`.

``` js

let set = new QuickSet({
      mode: "minsum",
      lifo: false,
      slot: 4,
      freq: 0,
    });
    set.batch(0,1,1,2,3,4,6,3,1);

//  set.keys()   = [ 0,1,2,3,4,6 ];
//  set.values() = [ 1,3,1,2,1,1 ];

//  set.rank     = [ 0,1,2,3 ];
//  set.stat     = [ 1,3,1,2 ];

    set.clear();

//  set.keys()   = [ ];
//  set.values() = [ ];

//  set.rank     = [ 0,1,2,3 ];
//  set.stat     = [ 1,3,1,2 ];

    set.clear(true);

//  set.keys()   = [ ];
//  set.values() = [ ];

//  top-k window set to zeroes
//  set.rank     = [ 0,0,0,0 ];
//  set.stat     = [ 0,0,0,0 ];

    set.clear(6);
    set.batch(0,1,1,2,3,4,6,3,5,7);

//  set.keys()   = [ 0,1,2,3,4,5,6,7 ];
//  set.values() = [ 1,3,1,2,1,1,1,1 ];

//  top-k window resized to 6 slots
//  set.rank     = [ 0,1,2,3,4,6 ];
//  set.stat     = [ 1,3,1,2,1,1 ];

```

## Tips
1. Reuse a single instance
2. Randomly switch between modes
3. Use multiple QuickSets with a small integer span
4. Maintain a `new Map()` for reverse value lookups
5. Set `freq` to a value higher than 1 for top-k window speed-ups
6. Use multiple QuickSets with offsets to increase integer range
7. Subtract the minimum when working with a set of large integers to save on memory

## Caveats
1. Large sets affect performance
2. Only limited top-k slots available (<16)
3. No set size parameter yet
4. No type checking of unsigned integers 

## Benchmarks
On a Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz-1.99 GHz with 16GB RAM,
average time to extract unique keys on 5 runs of random integers:

| Random keys | instance | ms | factor | 
| -: | :- | -: | :- |
| 2^28 | native set | size exceeded | - |
| = 268 435 456 | QuickSet | 4592 | - |
| 2^24 | native set | 6095 | - |
| = 16 777 216 | QuickSet|  212 | 28x |
| 2^16 | native set |  4.4 | - |
| = 65 536 |QuickSet | 1.3 | 3x |
