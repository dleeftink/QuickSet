
import batch from './core/batch.js';
import clear from './core/clear.js';
import minsum from './rank/minsum.js';
import winsum from './rank/winsum.js';
import unique from './core/unique.js';
import lowest from './util/lowest.js';
import expects from './util/expects.js';
import invalid from './util/invalid.js';
import { get, has } from './core/getters.js';
import { add, put } from './core/setters.js';
import { del, rem } from './core/jetters.js';
import {
  top,
  topK,
  topV,
} from './core/copiers.js';
import { 
  keys, 
  values, 
  sorted, 
  entries 
} from './core/sorters.js';

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
  minsum,
  winsum,
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
