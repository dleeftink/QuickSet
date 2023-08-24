# QuickSet

A performant sorted LFU set implementation for working with reasonably sized integers. Trades memory for performance, optimised for frequently updating and counting a relatively small set of integers (spanning from 0 to 2^16), or quickly extracting unique integers from a large pool of numbers (between 0 and 2^28).

## How it works
Once initialised, QuickSet allocates a TypedArray based on the expected range of integers (any range between 0 and 2^28) and frequency of occurance. 
Additionally, it keeps track of how often individual integers are added to the set, providing a (sorted) top-k window of most frequently occurring integers. 

In addition, two modes are provided for building the top-k ranks, `minsum` and `winsum`. 
Both modes drop the least frequent integer upon inserting new items, yielding a ranked 'window' that guarantees to include the k-most occurring elements of the set up till a point (also known as *Least Frequently Used* or LFU). 
But whereas `minsum` ejects integers from their initial point of insertion (i.e. random access), `winsum` keeps a sorted ranking  in decreasing order of occurrence (slightly more computationally expensive).

This makes QuickSet a faster alternative to counting and sorting all elements in a set, preventing costly sorting operations and providing a ranked window of most frequent  integers up till a break point of your choosing. 
This allows you to work with frequently occuring items 'earlier' compared to processing and sorting the input data in full, especially if the underlying data follows a non-uniform distribution.
