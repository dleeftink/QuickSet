export default function batch(...data) {
  if (data[0].length && typeof data[0] !== 'string' && arguments.length == 1) {
    data = data[0];
  } else if (
    data[1].length &&
    typeof data[1] !== 'string' &&
    arguments.length == 2
  ) {
    var data = data[0];
    var vals = data[1];
    var stride = vals.length; //=> doesn't work yet
  }

  let len = data.length;

  if (!vals) {
    for (var i = 0; i < len; i = i + 1) {
      //let uint = data[i]
      // if( uint < this.clip || uint > this.span ) continue
      this.sum(data[i]);
    }
  } else {
    for (var i = 0; i < len; i = i + 1) {
      let uint = data[i];
      // if( uint < this.clip || uint > this.span ) continue
      this.sum(uint, vals[i % stride]);
    }
  }

  // return this
}
