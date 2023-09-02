export default (Class, methods) => {
  let source = Class.toString();

  for (let call in methods) {
    
    let flag = `\\s\\s${call}.*\\{[\\s\\S]+?\\}`;
    let head = new RegExp(flag, "gim");
    
    let body = methods[call].toString()
      .replace("function", "")
    
    if ( body.indexOf("=>") > 0 && !body.startsWith("async"))
         body = body.replace("(", call + " = (")//.replace("(", " = ("); 
    
       source = source.replace(head, body);
  }
  
  return new Function("return " + source).call();
};