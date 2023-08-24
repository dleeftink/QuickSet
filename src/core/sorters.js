function keys(iter) {

  let bits = this.bits;
  let span = iter ?? this.bits.length;
  
  let exit = new this.default.Rank(span);
  let last = 0;
  
  for (let i = 0; i < span; ++i) {
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
  
  for (let i = 0; i < span; ++i) {
    let val = bits[i]
    if (val) exit[last++] = val
  }
  
  return exit.subarray(0,last)
  
}

function entries(iter) {

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

export { keys, values, entries }