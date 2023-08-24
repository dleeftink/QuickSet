import batch from './core/batch.js';
import clear from './core/clear.js';

import minsum from './rank/minsum.js';
import winsum from './rank/winsum.js';
import derank from './rank/derank.js';
import unique from './core/unique.js';
import lowest from './util/lowest.js';

import expects from './util/expects.js';
import invalid from './util/invalid.js';

import { get, has } from './core/getters.js';
import { add, del, put } from './core/setters.js';

import { keys, values, entries } from './core/sorters.js';

const prototype = {
  add,
  put,
  get,
  has,
  batch,
  clear,
  unique,
  minsum,
  winsum,
  expects,
  derank,
  lowest,
  delete: del,
  invalid,
  keys,
  values,
  entries,
};

export default prototype;