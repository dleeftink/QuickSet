function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// only inlines Class methods
// not nested functions inside methods

export default (Class, methods, params, raw = false) => {
  let source = Class.toString();

  for (let call in methods) {
    
    let flag = `\\s${escapeRegExp(call)}.*\\)\\s\\{[\\s\\S]+?\\}`;
    let head = new RegExp(flag, "m");
    
    // cheap function parsing;
    let body = methods[call].toString().replace(/function .*?\(/, `${call}(`)
    
    if ( body.indexOf("=>") > 0 && !body.startsWith("async"))
         body = body.replace("(", call + " = (");
  
       source = source.replace(head, body);

  }

  for(let name in params) {
    // find and replace Stackblitz filename prefix
    // let rgx = new RegExp('[\\w_]+\\.(?=' + name + ')','g') // => negative match
    let rgx = new RegExp('[\\w_]+\\.(' + name + ')','g')
     source = source.replace(rgx,params[name])
     
   }

  return raw ? source : new Function("return " + source).call();
};
