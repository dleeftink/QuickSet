# QuickSet

A performant sorted LFU set implementation for working with reasonably sized integers. Trades memory for performance, optimised for frequently updating and counting a relatively small set of keys (spanning from 0 to 2^16), or quickly extracting unique keys from a large pool of integers (between 0  2^28).

## How it works
Once initialised, QuickSet allocates a TypedArray based on the expected range of integers (any range between 0 and 2^28). 
Additionally, it keeps track of how frequent individual integers are added to the set, providing a (sorted) top-k window of mostly occurring integers. 

Two modes are provided for building the top-k ranks, "minsum" and "winsum". 
Both eject the least frequent integer from the ranks upon inserting new integers, yielding a ranking that guarantees to include the k-most occurring elements of the set (Least Frequently Used or LFU). 
But whereas `minsum` ejects integers from their initial point of insertion (random access), `winsum` keeps the top-k list sorted in descending order of occurrence (slightly more computationally expansive)

This makes QuickSet a suitable alternative to counting each element in a set and sorting them afterwards (preventing costly sorting operations), providing a ranked window of most frequent  integers up till a break point of your choosing. 
This allows you to access frequent integers 'earlier' compared to processing the input data in full, especially if the underlying data follows a non-uniform distribution.
