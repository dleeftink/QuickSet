export default function rewrite (func, rgx, rep) {

  let pat = 'return ' + func.toString() // remove /add'function' keyword if base class !== string
 // .replaceAll('function','').trim()
  .replace(rgx, rep) 

  return new Function(pat).call() 
}