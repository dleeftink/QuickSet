# QuickSet

A performant sorted *Least Frequently Used* (LFU) set implementation for working with reasonably sized integers. Trades memory for performance, optimised for frequently updating and counting a relatively small set of integers (spanning from 0 to 2^16), or extracting unique integers from a large pool of numbers in one pass (between 0 and 2^28).

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
Sets the default summing mode when using `.sum()`. See [rankers](#rankers) for more.

##### `span: 0 ... 2^28`
Maximum expected integer in set (upper range bound). Values above this number are ignored when added to the set.

##### `clip: 0 ... 2^28`
Minimum expected integer in set (lower range bound). Values below this number are ignored when added to the set.

##### `high: 0 ... 2^32`
Maximum expected count of each discrete integer in set (upper frequency bound per integer). Counting is maximised to this value. 

##### `freq: 0 ... 2^32`
Minimum expected count of each discrete integer in set (lower frequency bound per integer). Functions as minimum threshold for integers to be included in top-k window.

##### `slot: 0 ... 16`
Amount of top-k slots to keep track of most frequent integers in set.

## API

### Bulk

#### `.batch(...uints[, values])`
Batch loading method for adding integers and optional  weights/values into the set.

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

Columnar example (strided values are summed for duplicate integers):

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
Batch loading method for inserting unique integers into the set once. Overwrites previously set values (i.e. integer frequency).

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

#### `.add(uint[, value])`
Adds a single integer within the configured range (`clip` and `span` parameters), with an optional weight/value to the set. Useful for initialising a set with weights, or quickly adding integers to the set (use `.unique()` for even speedier insertion). Overwrites previously set values, but does not update the top-k window (use `.sum()` for this).

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

This method is useful for 'tombstoning' integers, e.g. setting an integer's value higher than the `high` watermark to prevent it being picked up by the `.sum()` top-k window:

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

// allow 1 to be picked up by .sum()
// by setting its value below the 'high' frequency mark
   set.put(1,2);
   set.sum(1,3);

// set.rank = [ 2, 1 ]
// set.stat = [ 4, 5 ]

```

This technique can be used to build a 'drop' list of integers, or keep unwanted integers out of the top-k ranking without having to validate integers during more expansive `.sum()` operations ('tombstoned' values are simply ignored).

#### `.sum(uint[, value])`

Inserts integer into the set and increases its frequency by one (or optional custom weight/value) if already present. Also updates the top-k window based on `mode` if the integer count exceeds the minimum `freq` value.

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

#### `.has(uint)`

#### `.get(uint)`

### Jetters 

#### `.delete(uint)`

#### `.derank(uint)`

### Rankers

#### `.minsum(uint[, value])`

#### `.winsum(uint[, value])`

### Sorters 

#### `.keys(iters[, reverse])`

#### `.values(iters[, reverse])`

#### `.entries(iters[, reverse])` 

### Disposal

#### `.clear(true || 0-16)`

## Tips

## Caveats
