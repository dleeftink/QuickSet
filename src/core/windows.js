function topK(k = this.slot) {
  return this.rank.slice(0,k)
}

function topV(k = this.slot) {
  return this.stat.slice(0,k)
}

function top(k = this.slot) {

  if ( k > this.slot ) 
     { k = this.slot }

  let exit = new Array(k);
  let rank = this.rank, stat = this.stat;

  for (var i = 0; i < k; i = i +1) {
    exit[i] = [rank[i],stat[i]]
  }

  return exit

}

export { top, topK, topV }