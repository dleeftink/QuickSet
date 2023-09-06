# QuickSet
A fast and performant *Least Frequently Used* (LFU) sorted set implementation for working with reasonably sized integers (unsigned). 
Trades memory for performance, optimised for frequently updating and counting a relatively small set of integers (integers ranging from 0 to 2^16) or extracting unique integers from a large pool of numbers in one go (integers ranging from 0 to 2^28). 
Sorted in natural ascending order of integers by default.

### Use cases
1. Finding top-k most frequent items in one or many lists
2. Nearest neighbour finding based on frequency of occurrence
3. Ordering random integers for binary search
4. A lightweight key/value dictionary
5. Duplicate integer counting
6. Unique integer extraction

## How it works
Once initialised, [`QuickSet`](https://github.com/dleeftink/QuickSet) allocates a TypedArray based on the expected range of integers (numbers between 0 and 2^28) and frequency of occurrence (counts between 0 and 2^32). 
Additionally, it keeps track of how often individual integers are added to the set, providing a top-k window of most frequent integers. 

Two modes are provided for establishing top-k ranks, `minsum` and `winsum`.
Both eject the least frequent integer from the ranking upon inserting new items, yielding a ranked 'window' that guarantees the k-most occurring elements of the set to 'bubble up' (ejecting the *Least Frequently Used* or LFU). 
Whereas `minsum` ejects integers from their initial point of insertion (i.e. random access), `winsum` keeps integers sorted  in decreasing order of occurrence (slightly more computationally expensive).

This makes [`QuickSet`](https://github.com/dleeftink/QuickSet) a fast alternative to counting and sorting all elements in a given set, preventing costly sorting operations and returning a ranked window of most frequent  integers up till a point of your choosing. 
This enables working with frequently occurring items 'earlier' compared to processing and sorting the input data in full, especially if the underlying integers follow a non-uniform distribution.

## Quickstart 

```
npm install @suptxt/quickset
```

After installing, create a `QuickSet` by calling:

``` js

let set = new QuickSet()

```

This instantiates a new set with [default parameters](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#new-quickset-config) and a top-k window of 0-length, which may need additional configuring to suit your needs. As a rule of thumb:

1. If you are interested in using unweighted set operations only, use [`add`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#add-uint-value) or [`put`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#put-uint-value) for single and [`unique`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#unique-uints) for bulk insertions.
2. If you want to assign weights to integers, use [`sum`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#sum-uint-value) for single and [`batch`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#batch-uints-values) for bulk insertions.
Updates to the top-k window are only made when the [`slot`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#slot-0--16) parameter is set.

Methods can be mixed and matched to your liking, but may yield unwanted results if used without caution: 
- [`add`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#add-uint-value) , [`put`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#put-uint-value) and [`unique`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#unique-uints) overwrite previous values and ***do not*** update the top-k window on integer insertion
- [`sum`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#sum-uint-value) and [`batch`](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#batch-uints-values) maintain previous values and ***do*** update the top-k window on integer insertion

See the [tombstoning](https://github.com/dleeftink/QuickSet/tree/main/docs/config.md#put-uint-value) example for why this is useful.

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
2. Only limited top-k slots available (<64)
3. No set size parameter yet
4. No type checking of unsigned integers
5. Reverse iteration not implemented yet

## Benchmarks
On a Intel(R) Core(TM) i7-8565U CPU @ 1.80GHz-1.99 GHz with 16GB RAM,
average time to extract unique keys on 5 runs of random integers:

| Random keys | instance | ms | factor | 
| -: | :- | -: | :- |
| 2^28 | native | size exceeded | - |
| = 268 435 456 | QuickSet | 4592 | - |
| 2^24 | native | 6095 | - |
| = 16 777 216 | QuickSet|  212 | 28x |
| 2^16 | native |  4.4 | - |
| = 65 536 |QuickSet | 1.3 | 3x |

Compare:
- [DW Cache](https://www.npmjs.com/package/dw-cache)
- [Fast Int Set](https://www.npmjs.com/package/fast-int-set)
- [Boolean Array](https://www.npmjs.com/package/@asaitama/boolean-array)
- [Rimbu MultiSet](https://rimbu.org/docs/collections/multiset)
