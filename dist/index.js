export default class QuickSet {
  constructor({
    mode = "minsum" || "winsum",
    clip = 0,
    span = 512,
    slot = 0,
    high = 128,
    freq = 1,
    fifo = false,
  } = {}) {
    if (span > 268435456)
      throw Error("Expected integer beyond memory range");

    if (high > 4294967295)
      throw Error("Expected count beyond frequency range");

    if (slot > 64)
      throw Error("Rank slots exceed recommended length");

    if (span < slot) slot = span;

    if (fifo) {
      this.minsum = this.$minsum;
      this.winsum = this.$winsum;
    }

    let [Rank, mult] = this.expects(span - 1),
      m = 2 ** (mult * 8) - 0;
    let [Pool, byte] = this.expects(high - 1),
      b = 2 ** (byte * 8) - 1;

    this.constructor.prototype.default = {
      Rank,
      Pool,
      mode,
      fifo,
      mult,
      byte,
    };

    this.constructor.prototype.sum = this[mode];

    const data = new ArrayBuffer(byte * (span + 1));

    this.rank = new Rank(slot);
    this.stat = new Pool(slot);
    this.bits = new Pool(data);

    Object.defineProperties(this, {
      bits: {
        writable: false,
        enumerable: false,
        configurable: false,
      },
    });

    this.span = span = Math.min(span, m);
    this.clip = clip = Math.max(clip, 0);

    this.high = high = Math.min(high, b);
    this.freq = freq = Math.max(freq, 0);

    this.slot = slot;
    this.last = slot - 1;

    this.tmin = freq;
    this.tmax = 0;
  }

  $minsum(uint, val = 1) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint) ||
      invalid(val)
    )
      return;

    var old = this.bits[uint];
    val = old + val;

    if (val > this.high) return;

    this.bits[uint] = val;
    let rank = this.rank,
      stat = this.stat;

    if (val >= this.tmin && val > this.freq) {
      let slot = this.slot;
      let last = this.last;

      for (var idx = 0; idx < slot; idx = idx + 1) {
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
        for (var ins = 0; ins < slot; ins = ins + 1) {
          if (stat[ins] <= low) break;
        }

        rank[ins] = uint;
        stat[ins] = val;

        this.tmin = this.lowest(stat);
      }

      if (val > this.tmax) this.tmax = val;
    }
  }

  $winsum(uint, val = 1) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint) ||
      invalid(val)
    )
      return;

    var old = this.bits[uint];
    val = old + val;

    if (val > this.high) return;

    this.bits[uint] = val;
    let rank = this.rank,
      stat = this.stat;

    if (val >= this.tmin && val > this.freq) {
      var slot = this.slot;
      var idx, ins;

      for (var i = 0; i < slot; i = i + 1) {
        if (idx >= 0 && ins >= 0) break;
        if (idx == undefined && rank[i] == uint) idx = i;
        if (ins == undefined && stat[i] <= val) ins = i;
      }

      if (ins == undefined) return;

      if (idx >= 0) {
        if (ins > idx) return;

        rank.copyWithin(ins + 1, ins, idx);
        stat.copyWithin(ins + 1, ins, idx);

        rank[ins] = uint;
        stat[ins] = val;
      } else {
        rank.copyWithin(ins + 1, ins);
        stat.copyWithin(ins + 1, ins);

        rank[ins] = uint;
        stat[ins] = val;

        this.tmin = stat[this.last] ?? 0;
      }

      this.tmax = stat[0] ?? 0;
    }
  }

  minsum(uint, val = 1) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint) ||
      invalid(val)
    )
      return;

    var old = this.bits[uint];
    val = old + val;

    if (val > this.high) return;

    this.bits[uint] = val;
    let rank = this.rank,
      stat = this.stat;

    if (val > this.tmin && val > this.freq) {
      let slot = this.slot;
      let last = this.last;

      for (var idx = 0; idx < slot; idx = idx + 1) {
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
        for (var ins = 0; ins < slot; ins = ins + 1) {
          if (stat[ins] <= low) break;
        }

        rank[ins] = uint;
        stat[ins] = val;

        this.tmin = this.lowest(stat);
      }

      if (val > this.tmax) this.tmax = val;
    }
  }

  winsum(uint, val = 1) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint) ||
      invalid(val)
    )
      return;

    var old = this.bits[uint];
    val = old + val;

    if (val > this.high) return;

    this.bits[uint] = val;
    let rank = this.rank,
      stat = this.stat;

    if (val > this.tmin && val > this.freq) {
      var slot = this.slot;
      var idx, ins;

      for (var i = 0; i < slot; i = i + 1) {
        if (idx >= 0 && ins >= 0) break;
        if (idx == undefined && rank[i] == uint) idx = i;
        if (ins == undefined && stat[i] <= val) ins = i;
      }

      if (ins == undefined) return;

      if (idx >= 0) {
        if (ins > idx) return;

        rank.copyWithin(ins + 1, ins, idx);
        stat.copyWithin(ins + 1, ins, idx);

        rank[ins] = uint;
        stat[ins] = val;
      } else {
        rank.copyWithin(ins + 1, ins);
        stat.copyWithin(ins + 1, ins);

        rank[ins] = uint;
        stat[ins] = val;

        this.tmin = stat[this.last] ?? 0;
      }

      this.tmax = stat[0] ?? 0;
    }
  }

  unique(...data) {
    if (typeof data[0] == "object" && data[0].length) {
      data = data[0];
    }

    let span = data.length;

    for (var i = 0; i < span - 7; i = i + 8) {
      this.add(data[i]);
      this.add(data[i + 1]);
      this.add(data[i + 2]);
      this.add(data[i + 3]);
      this.add(data[i + 4]);
      this.add(data[i + 5]);
      this.add(data[i + 6]);
      this.add(data[i + 7]);
    }

    return this;
  }

  lowest(arr, min = Infinity) {
    let len = arr.length;

    for (let i = 0; i < len; ++i) {
      let val = arr[i];
      if (val < min) min = val;
    }

    return min;
  }

  batch(...data) {
    let vals, step;

    if (
      typeof data[0] == "object" &&
      data[0].length &&
      typeof data[1] == "object" &&
      data[1].length
    ) {
      vals = data[1];
      data = data[0];
      step = vals.length;
    } else if (
      typeof data[0] == "object" &&
      data[0].length
    ) {
      data = data[0];
    }

    let span = data.length;

    if (vals) {
      for (var i = 0; i < span; i = i + 1) {
        let uint = data[i];
        this.sum(uint, vals[i % step]);
      }
    } else {
      for (var i = 0; i < span; i = i + 1) {
        let uint = data[i];
        this.sum(uint);
      }
    }

    return this;
  }

  clear(slot) {
    this.bits.fill(0);

    if (slot === true) {
      this.rank.fill(0);
      this.stat.fill(0);
    } else if (slot > 0) {
      this.slot = Math.min(slot, 64);
      this.last = slot - 1;

      this.rank = new this.default.Rank(slot);
      this.stat = new this.default.Pool(slot);
    }

    this.tmin = this.freq;
    this.tmax = 0;
  }

  add(uint, val = 1) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint) ||
      invalid(val)
    )
      return;
    if (val > this.default.byte) return;

    this.bits[uint] = val;
  }

  get(uint) {
    return this.bits[uint];
  }

  has(uint) {
    if (uint < this.clip || uint > this.span) return false;
    return !!this.bits[uint];
  }

  put(uint, val = 1) {
    this.bits[uint] = val;
  }

  sum() {}

  top(k = this.slot) {
    if (k > this.slot) {
      k = this.slot;
    }

    let exit = new Array(k);
    let rank = this.rank,
      stat = this.stat;

    for (var i = 0; i < k; i = i + 1) {
      exit[i] = [rank[i], stat[i]];
    }

    return exit;
  }

  topK(k = this.slot) {
    return this.rank.slice(0, k);
  }

  topV(k = this.slot) {
    return this.stat.slice(0, k);
  }

  keys(iter) {
    let bits = this.bits;
    let span = iter ?? this.bits.length;

    let exit = new this.default.Rank(span);
    let last = 0;

    for (var i = 0; i < span; i = i + 1) {
      let key = bits[i];
      if (key) exit[last++] = i;
    }

    return exit.subarray(0, last);
  }

  delete(uint) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint)
    )
      return;
    this.bits[uint] = 0;
  }

  derank(uint) {
    let invalid = this.invalid;

    if (
      uint < this.clip ||
      uint > this.span ||
      invalid(uint)
    )
      return;

    this.bits[uint] = 0;
    this.tmin = 0;

    let slot = this.slot;
    let rank = this.rank;
    let stat = this.stat;

    for (var idx = -1; idx < slot; ++idx) {
      if (rank[idx] == uint) {
        rank[idx] = 0;
        stat[idx] = 0;
        break;
      }
    }

    if (idx >= 0 && this.default.mode == "winsum") {
      let last = this.last;

      rank.copyWithin(idx, idx + 1);
      stat.copyWithin(idx, idx + 1);
      rank[last] = 0;
      stat[last] = 0;
      this.tmin = stat[last - 1];
    }
  }

  values(iter) {
    let bits = this.bits;
    let span = iter ?? this.bits.length;

    let exit = new this.default.Pool(span);
    let last = 0;

    for (var i = 0; i < span; i = i + 1) {
      let val = bits[i];
      if (val) exit[last++] = val;
    }

    return exit.subarray(0, last);
  }

  sorted(iter) {
    let bits = this.bits;
    let span = iter ?? this.bits.length;

    let size = 0;

    for (var i = 0; i < span; i = i + 1) {
      size = size + bits[i];
    }

    let exit = new this.default.Rank(size);
    let last = 0;

    for (var i = 0; i < span; i = i + 1) {
      let freq = bits[i];
      if (freq === 0) continue;
      for (let j = 0; j < freq; j = j + 1) {
        exit[last++] = i;
      }
    }

    return exit;
  }

  resize(slot) {
    if (slot >= 0 && slot <= 64) {
      let rank = new this.default.Rank(slot);
      let stat = new this.default.Pool(slot);

      let span = Math.min(this.slot, slot);
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
      throw new Error(
        "Set window size between 0 an 16 inclusive.",
      );
    }
  }

  entries(iter) {
    let bits = this.bits;
    let span = iter ?? this.bits.length;

    let exit = new Array(this.span);
    let last = 0;

    for (var i = 0; i < span; i = i + 1) {
      let val = bits[i];
      if (val > this.freq) exit[last++] = [i, val];
    }

    return exit.slice(0, last);
  }

  expects(int) {
    switch (true) {
      case int < 2 ** 8:
        return [Uint8Array, 1];
      case int < 2 ** 16:
        return [Uint16Array, 2];
      case int < 2 ** 32:
        return [Uint32Array, 4];
      default:
        throw Error("Expected count out of range");
    }
  }

  invalid(input) {
    return (input ^ 0) !== input;
  }

  default() {}
}
