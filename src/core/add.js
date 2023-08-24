export default function add(uint, val = 1) {

  if ( uint < this.clip || uint > this.span || !Number.isInteger(uint) || !Number.isInteger(val)) return;
  if ( val  > this.default.byte ) return; // prevent overflow

  this.bits[uint] = val;

}