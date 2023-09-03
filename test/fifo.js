import QuickSet from '../dist/index.js';

let set = new QuickSet({
  slot:4,
  mode:"winsum",
  fifo: false  ,
  freq:0
});
set.batch(0,1,2,0,3,2,0);
set[set.default.mode](4)

console.log(set,set.default)