import { MAX_SLOTS } from './params.js';

export default function clear(slot) {

  this.bits.fill(0);
  
  if (slot === true) {

    this.rank.fill(0);
    this.stat.fill(0);

  } else if (slot > 0) {

    this.slot = Math.min(slot,MAX_SLOTS); // maximum slot guard
    this.last = slot - 1;

    this.rank = new this.default.Rank(slot);
    this.stat = new this.default.Pool(slot);

  }

  this.tmin = this.freq;
  this.tmax = 0;

}