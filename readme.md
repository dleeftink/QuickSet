# QuickSet

A performant sorted *Least Frequently Used* (LFU) set implementation for working with reasonably sized integers (unsigned). Trades memory for performance, optimised for frequently updating and counting a relatively small set of integers (spanning from 0 to 2^16), or extracting unique integers (spanning from 0 to 2^28) from a large pool of numbers in one pass.

### Use cases

## How it works
Once initialised, `QuickSet` allocates a TypedArray based on the expected range of integers (any range between 0 and 2^28) and frequency of occurance. 
Additionally, it keeps track of how often individual integers are added to the set, providing a (sorted) top-k window of most frequent integers. 

Two modes are provided for establishing top-k ranks, `minsum` and `winsum`. 
Both eject the least frequent integer from the ranking upon inserting new items, yielding a ranked 'window' that guarantees the k-most occurring elements of the set to 'bubble up' (also known as *Least Frequently Used* or LFU). 
Whereas `minsum` ejects integers from their initial point of insertion (i.e. random access), `winsum` keeps a sorted ranking  in decreasing order of occurrence (slightly more computationally expensive).

This makes `QuickSet` a fast alternative to counting and sorting all elements in a given set, preventing costly sorting operations while providing a ranked window of most frequent  integers up till a break point of your choosing. 
This enables working with frequently occuring items 'earlier' compared to processing and sorting the input data in full, especially if the underlying integers follow a non-uniform distribution.

## Quickstart 

## Configuration

#### `new QuickSet({...config})`

Creates a new QuickSet instance with default settings (top-k window is turned off by default):

```js
let config = {

  mode: "minsum" || "winsum",

  span: 512, // max expected integer range (0 ... 2^28)
  clip:   0, // min expected integer range (0 ... 2^28)
  
  high: 128, // max expected integer count (0 ... 2^32)
  freq:   1, // min expected integer count (0 ... 2^32)

  slot:   0, // top-k ranked window slots  (0 ... 16)

}
```

##### `mode: "minsum" || "winsum"`
Sets the default summing mode when using `.sum()`. 
See [rankers](#rankers) for more.

##### `span: 0 ... 2^28`
Maximum expected integer in set (upper range bound). 
Values above this number are ignored when added to the set.

##### `clip: 0 ... 2^28`
Minimum expected integer in set (lower range bound). 
Values below this number are ignored when added to the set.

##### `high: 0 ... 2^32`
Maximum expected count of each discrete integer in set (upper frequency bound per integer). 
Counting is maximised to this value. 

##### `freq: 0 ... 2^32`
Minimum expected count of each discrete integer in set (lower frequency bound per integer). 
Functions as minimum threshold for integers to be included in top-k window.

##### `slot: 0 ... 16`
Amount of top-k slots to keep track of most frequent integers in set.

#### `QuickSet class { ... }`

## API

### Bulk

#### `.batch(...uints[, values])`
Batch loading method for inserting integers into the set and summing optional weights/values. 
Additionally updates the the top-k window based on [`mode`](#mode-minsum--winsum).

Basic example:

``` js

let set = new QuickSet();
    set.batch(0,1,1,2,4,6,7,7,1)

 // set.keys()   = [0,1,2,4,6,7,1]
 // set.values() = [1,3,1,1,1,2,1]

```

Array example:

``` js

let uints = [0,1,1,2,4,6,7,7,1]
    set.batch(uints)

 // set.keys()   = [0,1,2,4,6,7,1]
 // set.values() = [1,3,1,1,1,2,1]

```

Columnar example (values are summed for duplicate integers):

``` js

let uints = [1,5,7,1]
let vals  = [1,2,3,4]
    set.batch(uints, vals)

 // set.keys()   = [1,5,7]
 // set.values() = [5,2,3]

```

Strided columnar example (values are summed in strided fashion for duplicate integers):

``` js

let uints = [1,2,2,5]
let vals  = [1,3]
    set.batch(uints, vals)

 // set.keys()   = [1,2,5]
 // set.values() = [1,4,3]

```

Batch operations are chainable: 

``` js

set.batch(0,1,2,1).batch(1,2).entries() // = [ [0,1], [1,3], [2,2] ]

```

#### `.unique(...uints)`
Batch loading method for inserting unique integers into the set once. 
Resets previous set values (i.e. integer counts) to one. 
Does **not** update the top-k window (use `.batch()` for this).

Basic example:

``` js

let set = new QuickSet()
    set.unique(0,2,4,1,6,7,1,2);

 // set.keys()   = [0,1,2,4,6,7]
 // set.values() = [1,1,1,1,1,1]

```

Array example:

``` js

let uints = [0,2,4,1,6,7,1,2]
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

#### `.add(uint[, value])`
Inserts a single integer into the set if within range (`clip` and `span` parameters), with an optional weight/value. 
Useful for initialising a set with weights, or quickly adding integers to the set (use `.unique()` for even speedier insertion). 
Overwrites previously set values, but does not update the top-k window (use `.sum()` for this).

Example:

``` js

let set = new QuickSet()
    set.add(1);
    set.add(2,1);
    set.add(2,4);

 // set.keys()   = [ 1,2 ]
 // set.values() = [ 1,4 ]

 // set.rank = []
 // set.stat = []

```

#### `.put(uint[, value])`
'Unsafe' adds an integer to the set with an optional value without checking if the integer falls within range or its value exceeds the `high` frequency mark. Overwrites previously set values, but does not update the top-k window (use `.sum()` for this).

Should in theory provide better performance compared to `.add()` with the risk of adding integers beyond the configured range or expected frequency (potentially causing overflows). 

Example:

``` js
let set = new QuickSet({
      high: 255
    });

    set.put(1,255);
    set.put(2,256);

 // set.keys()   = [ 1 , 2 ]
 // set.values() = [ 255,0 ]

 // set.rank = []
 // set.stat = []

```

This method is useful for 'tombstoning' integers, e.g. setting an integer's value higher than the `high` watermark to prevent it being picked up by `.sum()`'s top-k window:

``` js
let set = new QuickSet({
      mode; "minsum",
      high: 127,
      slot: 2
    });

    set.put(1,128);
    set.sum(2,4);
    set.sum(1,1); 

 // set.rank = [ 2, 0 ]
 // set.stat = [ 4, 0 ]

 // allow 1 to be picked up by .sum() again
 // by setting its value below the 'high' frequency mark
 // note: the first .put() does not update the top-k window, but .sum() does

    set.put(1,2);
    set.sum(1,3);

 // set.rank = [ 2, 1 ]
 // set.stat = [ 4, 5 ]

```

This technique can be used to build a 'drop' list of integers and keep unwanted integers out of the top-k ranking without having to validate each integer during more expansive `.sum()` operations ('tombstoned' values are simply ignored).

#### `.sum(uint[, value])`

Inserts a single integer into the set if within range (`clip` and `span` parameters). If already present, increases its frequency by one or a custom weight/value. 
Additionally updates the top-k window based on [`mode`](#mode-minsum--winsum) when the updated value exceeds the minimum `freq` parameter.

Example:

``` js

let set = new QuickSet({
      mode: "minsum",
      high: 16,
      freq:  2,
      slot:  4,
    })

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

#### `.has(uint)`
Checks whether the given integer is present in the set.

``` js

let uints = [0,1,5,7]
    set.batch(uints);

    set.has(7) // => true
    set.has(3) // => false

```

#### `.get(uint)`
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

#### `.delete(uint)`
Removes a single integer and its value from the set. Does **not** update `.sum()`'s top-k window (use `.derank()` for that). 
Useful for resetting an integer's count to zero in the backing array while maintaining its last position and value in the top-k window.

Example:

``` js

let set = new QuickSet({
      mode: "winsum",
      freq:  1,
      slot:  6
    });
    set.batch(3,1,0,1,3,4,3,5,7,1)

//  Backing array
//  set.keys()   = [ 0,1,3,4,5,7 ]
//  set.values() = [ 1,3,2,1,1,1 ]

//  Top-k window 
//  set.rank = [ 1,3,0,4,5,7 ]
//  set.stat = [ 3,2,1,1,1,1 ]

    set.delete(1);
    set.delete(3);

//  1 & 3  deleted from backing array
//  set.keys()   = [ 0,4,5,7 ]
//  set.values() = [ 1,1,1,1 ]

//  1 & 3 kept in top-k window
//  set.rank = [ 1,3,0,4,5,7 ]
//  set.stat = [ 3,2,1,1,1,1 ]

```

This method is useful to reset integer counts to 0 when exceeding a threshold, which downsamples frequent integers during later `.sum()` operations.

#### `.derank(uint)`
Removes a single integer and its value from the set. Additionally updates `.sum()`'s top-k window based on [`mode`](#mode-minsum--winsum). 
Useful to delete an integer from the set and remove it from the top-k window.

``` js

let set = new QuickSet({
      mode: "winsum",
      freq:  1,
      slot:  6
    });
    set.batch(3,1,0,1,3,4,3,5,7,1)

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
Methods for inserting and updating integers counts by one or a custom value, including the top-k window.

#### `.minsum(uint[, value])`
Inserts a single integer into the set if within range (`clip` and `span` parameters). If already present, increases its frequency by one or a custom weight/value. 
Additionally updates the top-k window using the `minsum` strategy when the updated value exceeds the minimum `freq` parameter:

1. Find the first integer with lowest frequency count
2. Replace this integer with the updated one and its new value

This insertion method resembles random access while guaranteeing the most frequent elements to bubble up. A bit more efficient than `.winsum()` 

#### `.winsum(uint[, value])`
Inserts a single integer into the set if within range (`clip` and `span` parameters). If already present, increases its frequency by one or a custom weight/value. 
Additionally updates the top-k window using the `winsum` strategy when the updated value exceeds the minimum `freq` parameter:

1. Find the last integer in the window with a value exceeding the updated value
2. From this index Move every integer and its value one position to the right
3. Insert the new integer and its value into the newly opened position

This method resembles insertion sort, and keeps all integers in the top-k window sorted by decreasing order of frequency. Slightly slower than `.minsum()` on account of frequent copying.

### Sorters 

#### `.keys(iters[, reverse])`

#### `.values(iters[, reverse])`

#### `.entries(iters[, reverse])` 

#### `.sorted(iters[, reverse])`

### Windows

#### `.topk(pick[, reverse])`

#### `.topv(pick[, reverse])`

### Disposal

#### `.clear(true || 0-16)`

### Resizing

#### `.expand(slots)`

#### `.shrink(slots)`

## Tips

1. Reuse a single instance
2. Randomly switch between modes
3. Use multiple QuickSets with a small integer span
4. Maintain a `new Map()` for reverse value lookups

## Caveats

1. Large sets affect performance 
