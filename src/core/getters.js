function get(uint) {
  return this.bits[uint]  
}

function has(uint) {

  if (uint < this.clip || uint > this.span) return false
  return !!this.bits[uint]

}

export default { get, has }