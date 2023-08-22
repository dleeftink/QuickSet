import batch from './core/batch.js';
import minsum from './rank/minsum.js';
import winsum from './rank/winsum.js';
import expects from './util/expects.js';

export default class QuickSet {

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
    
    Object.defineProperty(this,'bits', {
      writable: false,
      enumerable: false,
      configurable: false,
    });

    Object.assign(this.constructor.prototype, {
      batch,minsum,winsum,expects,
    });

    let [ Rank , mult ] = this.expects( span - 1 ), m = 2**(mult*8)-0;
    let [ Pool , byte ] = this.expects( high - 1 ), b = 2**(byte*8)-1;
    
    const data = new ArrayBuffer(byte*( span + 1 )); // range+1 to make inclusive // 
    // this.view = new Float64Array(data);      

    this.rank  = new Rank(slot);
    this.stat  = new Pool(slot);
    this.bits  = new Pool(data);

    this.span  = span = Math.min(span,m); // clip integers above range extent (inclusive)
    this.clip  = clip = Math.max(clip,0); // clip integers under range extent

    this.high  = high = Math.min(high,b); // skip integers more frequent than (exclusive)
    this.freq  = freq = Math.max(freq,0); // skip integers less frequent than
    
    this.slot  = slot; // ranked integer slots
    this.last  = slot - 1 ; // last item const

    this.tmin   = freq //?? 0; // keeps track of min in window
    this.tmax   = 0; // keeps track of max in window

    this.constructor.prototype.sum = this[mode];
    this.constructor.prototype.default = { Rank, Pool, mode , mult, byte };

  }

  minsum () {
  // placeholder
  }

  winsum () {
  // placeholder
  }

  batch() {
  // placeholder 
  }

  clear(slot) {
    
    this.bits.fill(0);
    if (slot === true) {
      
      this.rank.fill(0);
      this.stat.fill(0)
      
    } else if (Number.isInteger(slot)) {
      
      this.slot = slot;
      this.last = slot - 1;
      this.rank = new this.default.Rank(slot);
      this.stat = new this.default.Pool(slot); 
      
    }

    this.tmin = this.freq;
    this.tmax = 0;
    
  }

  add(uint, val = 1) {

    if (uint < this.clip || uint > this.span) return //this
    if (val > this.default.byte ) return // prevent overflow

    this.bits[uint] = val
    
  }
      // 
  
  get(uint) {
    return this.bits[uint]  
  }
  
  has(uint) {

    if (uint < this.clip || uint > this.span) return false
    return !!this.bits[uint]

  }

  put(uint, val = 1) {

    // 'unsafe' add
    if (uint < this.clip || uint > this.span) return //this
    this.bits[uint] = val
    
  }

  sum () {
  // placeholder
  }
  
  keys(iter) {

    let bits = this.bits;
    let span = iter ?? this.bits.length;
    
    let exit = new Uint32Array(this.span);
    let last = 0;
    
    for (let i = 0; i < span; ++i) {
      let key = bits[i]
      if (key) exit[last++] = i
    }
    
    return exit.subarray(0,last)
    
  }
  
  values(iter) {

    let bits = this.bits;
    let span = iter ?? this.bits.length;
    
    let exit = new Uint16Array(this.span);
    let last = 0;
    
    for (let i = 0; i < span; ++i) {
      let val = bits[i]
      if (val) exit[last++] = val
    }
    
    return exit.subarray(0,last)
    
  }
  
  delete(uint) {
    
    if (uint < this.clip || uint > this.span) return //this
    this.bits[uint] = 0
    
  }
  
  derank(uint) {

    if (uint < this.clip || uint > this.span) return //this
    this.bits[uint] = 0;
    this.tmin = 0;
    
    let slot = this.slot;
    let rank = this.rank;
    let stat = this.stat;
    for (var idx = -1; idx < slot; ++idx) { 
     if (rank[idx] == uint) { 
         rank[idx] = 0;
         stat[idx] = 0; 
         break } 
    }
    if(idx >= 0 && this.default.mode == 'winsum') {
    let last = this.last;
      
      rank.copyWithin(idx,idx+1);
      stat.copyWithin(idx,idx+1);
      rank[last] = 0;
      stat[last] = 0;
      this.tmin = stat[last-1];
    }
    
  }

  lowest(arr,min = Infinity) {

    let len = arr.length;
    for (let i = 0; i < len; ++i) {
      let val = arr[i]
      if(val < min) min = val
    }
    return min
  }
  
  entries(iter) {

    let bits = this.bits;
    let span = iter ?? this.bits.length;
    
    let exit = new Array(this.span);
    let last = 0;
    
    for (let i = 0; i < span; ++i) {
      let val = bits[i]
      if (val > this.freq) exit[last++] = [i,val]
    }
    
    return exit.slice(0,last)
    
  }

  expects() {
  // placeholder
  }

  default() {
  // placeholder  
  }

}