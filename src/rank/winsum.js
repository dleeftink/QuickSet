export default function winsum(uint,val = 1) {

  let invalid = this.invalid;

  // range guard  
  if ( uint < this.clip || uint > this.span || invalid(uint) || invalid(val)) return

  var old = this.bits[uint];
      val = old + val; 
  
  // count guard
  if ( val > this.high ) return

  this.bits[uint] = val;
  let  rank = this.rank, 
       stat = this.stat;

  if ( val > this.tmin && val > this.freq ) {
    
    var slot = this.slot;
    var idx, ins;

    for (let i = 0; i < slot; ++i) {
  
      if(idx >= 0 && ins >= 0 ) break
      if(idx == undefined && rank[i] == uint) idx = i;
      if(ins == undefined && stat[i] <= val) ins = i;

   }

   if ( ins == undefined ) return
     
   if ( idx >= 0 ) {
    if ( ins > idx ) return // TO DO: overwrite buffer when restarting count to prevent having to .fill(0)
      
      rank.copyWithin(ins+1,ins,idx);
      stat.copyWithin(ins+1,ins,idx);
      
      rank[ins] = uint;
      stat[ins] = val;
     
    } else {
      
      rank.copyWithin(ins+1,ins);
      stat.copyWithin(ins+1,ins);
      
      rank[ins] = uint;
      stat[ins] = val;

      // TO DO: autotuning in case freq settings == 0
      this.tmin = stat[this.last] ?? 0  // min always last // Math.max(this.freq,stat[this.last])
      
       
    }

    this.tmax = stat[0] ?? 0 // max is always first
  
  } 
}