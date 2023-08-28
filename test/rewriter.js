import rewrite from '../src/util/rewrite.js'

console.log(rewrite( function(val) { return val }, /val/g,'vals').toString())