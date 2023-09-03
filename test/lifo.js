import QuickSet from '../code/index.js';

let set = new QuickSet({
  slot:4,
  mode:"winsum",
  lifo: true ,
  freq:0
});
set.batch(0,1,2,0,3,2,0);
set[set.default.mode](4)

console.log(set,set.default)