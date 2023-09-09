import fs from 'node:fs'
import assign from '../code/util/assign.js'
import methods from '../code/proto.js'
import QuickSet from '../code/index.js'
import * as params from '../code/core/params.js'
import * as prettier from 'prettier'

// build script that inserts imports 
// and applies some quickfixes

(async function() {

  let source = 'export default ' + assign(QuickSet,methods,params,true)
    .replace(/Object.assign\(this\.constructor\.prototype.*?\)/g,'')
    //.replace(/Object\.defineProperties\(this,{[\s\S]+?\}\)\;/gm, '')
      //.replaceAll('this.bits', 'this.#bits')
     // .replaceAll('$minsum', '#minsum')
     // .replaceAll('$winsum', '#winsum')
      .replaceAll(/\/\/.*/g,'');  

  let format = 
    await prettier.format(source, { semi: true, printWidth: 60, parser: "babel" });
    await fs.writeFile('./dist/index.js', format,()=>{})

})()
