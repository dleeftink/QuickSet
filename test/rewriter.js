import rewrite from '../code/util/rewrite.js'

console.log(rewrite( function(val) { return val }, /val/g,'vals').toString())