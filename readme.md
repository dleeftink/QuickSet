# QuickSet

A performant sorted *Least Frequently Used* (LFU) set implementation for working with reasonably sized integers. Trades memory for performance, optimised for frequently updating and counting a relatively small set of integers (spanning from 0 to 2^16), or quickly extracting unique integers from a large pool of numbers in one go (between 0 and 2^28).

## How it works
Once initialised, `QuickSet` allocates a TypedArray based on the expected range of integers (any range between 0 and 2^28) and frequency of occurance. 
Additionally, it keeps track of how often individual integers are added to the set, providing a (sorted) top-k window of most frequently occurring integers. 

Two modes are provided for establishing top-k ranks, `minsum` and `winsum`. 
Both eject the least frequent integer from the ranking upon inserting new items, yielding a ranked 'window' that guarantees the k-most occurring elements of the set to 'bubble up' (also known as *Least Frequently Used* or LFU). 
But whereas `minsum` ejects integers from their initial point of insertion (i.e. random access), `winsum` keeps a sorted ranking  in decreasing order of occurrence (slightly more computationally expensive).

This makes QuickSet a faster alternative to counting and sorting all elements in a given set, preventing costly sorting operations while providing a ranked window of most frequent  integers up till a break point of your choosing. 
This allows you to work with frequently occuring items 'earlier' compared to processing and sorting the input data in full, especially if the underlying integers follow a non-uniform distribution.

## Quickstart 

## Configuration

#### `new QuickSet({...config})`

Creates a new QuickSet instance with default settings (top-k window is turned off by default):

```js
let config = {

  span: 512, // max expected integer range (0 ... 2^28)
  clip:   0, // min expected integer range (0 ... 2^28)
  
  high: 128, // max expected integer count (0 ... 2^32)
  freq:   1, // min expected integer count (0 ... 2^32)

  slot:   0, // top -k ranked window slots (0 ... 16)

}
```

##### `span: ...`

##### `clip: ...`

##### `high: ...`

##### `freq: ...`

##### `slot: ...`

## API

### Bulk

#### `.batch(...uints[, values])`

#### `.unique(...uints)`

### Setters

#### `.add(uint[, value])`

#### `.put(uint[, value])`

#### `.sum(uint[, value])`

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
