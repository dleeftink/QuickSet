import QuickSet from '../dist/index.js';

let ints = Uint32Array.from(
  { length: 2 ** 10 },
  () => ((0 + Math.random() /*Math.random()*/) * 2 ** 10) | 0
);

let t1 = performance.now();

let set = new QuickSet({
  span: 2 ** 10,
  high: 32,
  slot: 4,
  freq: 2,
  mode: 'minsum',
  fifo: false,
});

let span = ints.length;

let iter = 10000;
let temp = Array(iter);

for (let n = 0; n < iter; ++n) {

  set.clear(true);

  // unrolling only works when multiples of two
  for (let i = 0; i < span; i = i + 2) {
    //let key = ints[i] //+ ( n % 255);
    // let mod = n % 255;
    set.sum(ints[i])// + (mod))
    set.sum(ints[i + 1])// +  (mod));
    
  }
  //set.batch(ints);

  //temp[n] = set.top(2)

}

let t2 = performance.now() - t1;

console.log(temp, set,t2)
