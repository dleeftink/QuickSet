function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export default (Class, methods, raw = false) => {
  let source = Class.toString();

  for (let call in methods) {
    
    let flag = `\\s${escapeRegExp(call)}.*\\{[\\s\\S]+?\\}`;
    let head = new RegExp(flag, "m");
    
    // cheap function parsing;
    let body = methods[call].toString().replace(/function .*?\(/, `${call}(`)
    
    if ( body.indexOf("=>") > 0 && !body.startsWith("async"))
         body = body.replace("(", call + " = (");
  
       source = source.replace(head, body);

  }
  
  return raw ? source : new Function("return " + source).call();
};