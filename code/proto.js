import batch from './core/batch.js';
import clear from './core/clear.js';
import minsum from './rank/minsum.js';
import winsum from './rank/winsum.js';
import unique from './core/unique.js';
import lowest from './util/lowest.js';
import resize from './core/resize.js';
import expects from './util/expects.js';
import invalid from './util/invalid.js';
import rewrite from './util/rewrite.js';
import { get, has } from './core/getters.js';
import { add, put } from './core/setters.js';
import { del, rem } from './core/jetters.js';
import { top, topK, topV } from './core/windows.js';
import { keys, values, sorted, entries } from './core/sorters.js';

const prototype = {
  add,
  put,
  get,
  has,
  top,
  topK,
  topV,
  batch,
  clear,
  unique,

  $minsum: rewrite(
    minsum,
    [
      'val > this.tmin',
      'var low = this.tmin;',
      'if ( stat[ins] <= low ) break',
    ],
    [
      'val >= this.tmin',
      'var low = this.tmin; var old = this.prev+1; var pos;',
      'if(stat[pos = (ins + old) % slot] <= low ) { this.prev = ins = pos ; break }',
    ]
  ),

  $winsum: rewrite(
    winsum, ['val > this.tmin'], ['val >= this.tmin']
  ),

  minsum,
  winsum,
  resize,
  expects,
  lowest,
  delete: del,
  derank: rem,
  invalid,
  keys,
  values,
  sorted,
  entries,
};

export default prototype;
