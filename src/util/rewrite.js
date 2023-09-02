export default function rewrite (func, rgx, rep) {
  let pat = 'return function ' + func.toString().replace(rgx, rep) // remove 'function' keyword if base class !== string
  return new Function(pat).call() 
}