import { MAX_SLOTS } from './params.js';

export default function resize(slot) {
    
  if(slot >= 0 && slot <= MAX_SLOTS) {
    
    let rank = new this.default.Rank(slot);
    let stat = new this.default.Pool(slot);

    let span = Math.min(this.slot,slot);
    let prev = this.rank;
    let last = this.stat;

    for (let i = 0; i < span; ++i) {
      rank[i] = prev[i];
      stat[i] = last[i];
    }

    this.rank = rank;
    this.stat = stat;
    this.slot = slot;
    
  } else {
    throw new Error(`Set window size between 0 and ${MAX_SLOTS} inclusive.`)
  }
}
