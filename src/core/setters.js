function add(uint, val = 1) {

  let invalid = this.invalid;

  if ( uint < this.clip || uint > this.span || invalid(uint) || invalid(val)) return;
  if ( val  > this.default.byte ) return; // prevent overflow

  this.bits[uint] = val;

}

function del(uint) {

  let invalid = this.invalid;

  if ( uint < this.clip || uint > this.span || invalid(uint) || invalid(val)) return;
  this.bits[uint] = 0
  
}

function put(uint, val = 1) {

  // 'unsafe' add
  this.bits[uint] = val
  
}

export { add, del, put }