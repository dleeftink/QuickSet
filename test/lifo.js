import QuickSet from '../src/index.js';

let set = new QuickSet({
  slot:4,
  mode:"minsum",
  lifo: false ,
  freq:0
});
set.batch(0,1,2,0,3,4,2,0);

console.log(set,set.default)