export default function minsum (uint, val = 1) {
  
  let invalid = this.invalid;

  // range guard
  if ( uint < this.clip || uint > this.span || invalid(uint) || invalid(val)) return //this

  var old = this.bits[uint];
      val = old + val;

  // count guard
  if ( val > this.high ) return //this

  this.bits[uint] = val;
  let  rank = this.rank,
       stat = this.stat;

  if ( val > this.tmin && val > this.freq ) {

    let slot = this.slot;
    let last = this.last;

    //let idx = rank.indexOf(uint); // -> slower
    for ( var idx = 0; idx < slot; idx = idx + 1 ) {
      if ( rank[idx] == uint ) {
        break;
      } else if ( idx == last ) {
        idx = -1;
        break;
      }
    }

    if ( idx >= 0 ) {
      stat[idx] = val;
    } else {

      var low = this.tmin;
      for ( var ins = 0; ins < slot; ins = ins + 1 ) {
       if ( stat[ins] <= low ) break
      }

      rank[ins] = uint;
      stat[ins] = val;

      this.tmin = this.lowest(stat); 
      
    }

    if (val > this.tmax) this.tmax = val;
  }
  // return this
};
