function add(uint, val = 1) {

  if ( uint < this.clip || uint > this.span || !Number.isInteger(uint) || !Number.isInteger(val)) return;
  if ( val  > this.default.byte ) return; // prevent overflow

  this.bits[uint] = val;

}

function del(uint) {

  if ( uint < this.clip || uint > this.span || !Number.isInteger(uint) || !Number.isInteger(val)) return;
  this.bits[uint] = 0
  
}

function put(uint, val = 1) {

  // 'unsafe' add
  this.bits[uint] = val
  
}

export default { add, del, put }