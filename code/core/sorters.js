function keys(iter) {

  let bits = this.bits;
  let span = iter ?? this.bits.length;
  
  let exit = new this.default.Rank(span);
  let last = 0;
  
  for (var i = 0; i < span; i = i+1) {
    let key = bits[i]
    if (key) exit[last++] = i
  }
  
  return exit.subarray(0,last)
  
}

function values(iter) {

  let bits = this.bits;
  let span = iter ?? this.bits.length;
  
  let exit = new this.default.Pool(span);
  let last = 0;
  
  for (var i = 0; i < span; i = i+1) {
    let val = bits[i]
    if (val) exit[last++] = val
  }
  
  return exit.subarray(0,last)
  
}

function sorted(iter) {

  let bits = this.bits;
  let span = iter ?? this.bits.length;

  let size = 0;

  for (var i = 0; i < span; i = i+1) {
    size = size + bits[i];
  }
  
  let exit = new this.default.Rank(size);
  let last = 0;

  for (var i = 0; i < span; i = i+1) {
    let freq = bits[i];
    if (freq===0) continue 
    for (let j = 0; j < freq; j = j+1) {
      exit[last++] = i
    }
  }
  
  return exit    
}

function entries(iter) {

  let bits = this.bits;
  let span = iter ?? this.bits.length;
  
  let exit = new Array(this.span);
  let last = 0;
  
  for (var i = 0; i < span; i = i+1) {
    let val = bits[i]
    if (val > this.freq) exit[last++] = [i,val]
  }
  
  return exit.slice(0,last)
  
}

export { keys, values, sorted, entries }