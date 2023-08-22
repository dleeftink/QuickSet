// run `node index.js` in the terminal

import minsum from './rankers/minsum.js'

class QuickSet {

  #view; #bits;
  constructor({
    mode = "minsum" || "winsum", 
    clip = 0 , span = 512 , // integer range min - max
    slot = 0 , high = 128 , // frequency slots + range 
    freq = 1 , // minimum item cut frequency 
    } = {}) {

    if (span > 2**28) 
    throw Error('Expected integer beyond memory range');

    if (high > (2**32)-1) 
    throw Error('Expected frequency beyond counting extent');

    if (slot > 16) 
    throw Error('Rank slots performance degradation > 16');
    
    if (span < slot) slot = span;
    this.constructor.prototype.minsum = minsum;
    this.constructor.prototype.sum = this[mode];

    let [ Rank , mult ] = this.expects( span - 1 ), m = 2**(mult*8)-0;
    let [ Pool , byte ] = this.expects( high - 1 ), b = 2**(byte*8)-1;

    const data = new ArrayBuffer(byte*( span + 1 )); // range+1 to make inclusive // 
    this.constructor.prototype.default = { Rank, Pool, mode , mult, byte };
    // this.view = new Float64Array(data);      

    this.rank  = new Rank(slot);
    this.stat  = new Pool(slot);
    this.#bits = new Pool(data); 

    this.span  = span = Math.min(span,m); // clip integers above range extent (inclusive)
    this.clip  = clip = Math.max(clip,0); // clip integers under range extent

    this.high  = high = Math.min(high,b); // skip integers more frequent than (exclusive)
    this.freq  = freq = Math.max(freq,0); // skip integers less frequent than
    
    this.slot  = slot; // ranked integer slots
    this.last  = slot - 1 ; // last item const

    this.tmin   = freq //?? 0; // keeps track of min in window
    this.tmax   = 0; // keeps track of max in window

  }

  minsum () {

  }

  sum() {

  }

  expects(int) {
    switch(true) {
      case int < (2** 8) : return [Uint8Array,1];
      case int < (2**16) : return [Uint16Array,2];
      case int < (2**32) : return [Uint32Array,4];
      default : throw Error('Expected count out of range') 
    }
  }

}

console.log(new QuickSet());
