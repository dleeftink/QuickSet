import fs from 'node:fs'
import assign from './code/util/assign.js'
import methods from './code/proto.js'
import QuickSet from './code/index.js'
import * as prettier from 'prettier'

let source = assign(QuickSet,methods,true);
    source = 'export default ' + source
    .replaceAll(/\/\/.*/g,'')
    .replaceAll('this.bits', 'this.#bits')
    .replaceAll('$minsum', '#minsum')
    .replaceAll('$winsum', '#winsum')
    .replace(/Object.assign\(this\.constructor\.prototype.*?\)/g,'')
    .replace(/Object\.defineProperties\(this,{[\s\S]+?\}\)\;/gm, '');

(async function() {


  let format = await prettier.format(source, { semi: true, parser: "babel" });
  await fs.writeFile('./dist/index.js', format,()=>{})

})()
