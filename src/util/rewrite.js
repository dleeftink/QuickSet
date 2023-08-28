export default (func, rgx, rep) =>
  new Function('return ' + func.toString().replace(rgx, rep)).call();