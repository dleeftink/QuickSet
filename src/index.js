import assign from './util/assign.js'
// import rewrite from './util/rewrite.js'
import methods from './proto.js'

export default assign(class QuickSet {

  #bits;
  constructor({
    mode = "minsum" || "winsum", 
    clip = 0 , span = 512 , // integer range min - max
    slot = 0 , high = 128 , // frequency slots + range 
    freq = 1 , // minimum item cut frequency 
    fifo = false,
    } = {}) {

    if (span > 2**28) 
    throw Error('Expected integer beyond memory range');

    if (high > (2**32)-1) 
    throw Error('Expected count beyond frequency range');

    if (slot > 16) 
    throw Error('Rank slots performance degradation > 16');

    if (span < slot) slot = span;

    if (fifo) { 

      this.constructor.prototype.minsum = this.rewrite ( this.minsum, 'val > this.tmin', 'val >= this.tmin');
      this.constructor.prototype.winsum = this.rewrite ( this.winsum, 'val > this.tmin', 'val >= this.tmin');

    }

    // Object.assign(this.constructor.prototype, prototype);

    let [ Rank , mult ] = this.expects( span - 1 ), m = 2**(mult*8)-0;
    let [ Pool , byte ] = this.expects( high - 1 ), b = 2**(byte*8)-1;
    
    this.constructor.prototype.default = { Rank, Pool, mode, fifo, mult, byte };
    this.constructor.prototype.sum = this[mode];

    const data = new ArrayBuffer(byte*( span + 1 )); // range+1 to make inclusive // 

    this.rank = new Rank(slot);
    this.stat = new Pool(slot);
    this.bits = new Pool(data);

    Object.defineProperty(this,'bits', {
      writable: false,
      enumerable: false,
      configurable: false,
    });
    
    this.span = span = Math.min(span,m); // clip integers above range extent (inclusive)
    this.clip = clip = Math.max(clip,0); // clip integers under range extent

    this.high = high = Math.min(high,b); // skip integers more frequent than (exclusive)
    this.freq = freq = Math.max(freq,0); // skip integers less frequent than
    
    this.slot = slot; // ranked integer slots
    this.last = slot - 1 ; // last item const

    this.tmin = freq //?? 0; // keeps track of min in window
    this.tmax = 0; // keeps track of max in window

  }    

  minsum() {
  // placeholder
  }

  winsum() {
  // placeholder
  }

  unique() {
  // placeholder 
  }

  lowest() {
  // placeholder
  }

  batch() {
  // placeholder 
  }

  clear() {
  // placeholder   
  }

  add() {
  // placeholder
  }
  
  get() {
  // placeholder
  }
  
  has() {
  // placeholder
  }

  put() {
  // placeholder
  }

  sum() {
  // placeholder
  }

  top() {
  // placeholder
  }
  
  topK() {
  // placeholder    
  }

  topV() {
  // placeholder    
  }

  keys() {
  // placeholder
  }
  
  delete() {
  // placeholder    
  }
  
  derank() {
  // placeholder    
  }

  values() {
  // placeholder
  }

  sorted() {
  // placeholder
  }

  resize() {
  // placeholder  
  }
  
  entries() {
  // placeholder
  }

  expects() {
  // placeholder
  }

  rewrite() {

  }

  invalid() {
  // placeholder  
  }

  default() {
  // placeholder
  }

}, methods)