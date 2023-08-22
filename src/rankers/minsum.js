class template {

  #bits
  static minsum(uint, val = 1) {
    // range guard
    if (uint < this.clip || uint > this.span) return;
  
    var old = this.#bits[uint]; //let val = 1 + (this.#bits[uint]++) // => unweighted
        val = old + val;
  
    // count guard
    if (val > this.high) {
      return;
    }
  
    this.#bits[uint] = val;
  
    let rank = this.rank,
      stat = this.stat;
    if (val > this.tmin && val > this.freq) {
      var slot = this.slot;
      var last = this.last;
  
      //let idx = rank.indexOf(uint); // -> slower
      for (var idx = 0; idx < slot; ++idx) {
        if (rank[idx] == uint) {
          break;
        } else if (idx == last) {
          idx = -1;
          break;
        }
      }
  
      if (idx >= 0) {
        stat[idx] = val;
      } else {
        var low = this.tmin;
        for (var ins = 0; ins < slot; ++ins) {
          if (stat[ins] <= low) {
            break;
          }
        }
  
        rank[ins] = uint;
        stat[ins] = val;
  
        //if((this.tmin = lowest(stat)) < this.freq ) { this.tmin = this.freq } // => Math.max(lowest(stat),this.freq)
        this.tmin = this.lowest(stat); // TO DO: autotuning in case freq settings == 0
      }
      if (val > this.tmax) this.tmax = val;
    }
    //return this
  }

}

export default template.minsum
