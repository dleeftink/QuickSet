export default function batch(...data) {
  
  let vals, step;

  if (
    typeof data[0] == "object" && data[0].length &&
    typeof data[1] == "object" && data[1].length
  ) {
    vals = data[1];
    data = data[0];
    step = vals.length;
  } else if (typeof data[0] == "object" && data[0].length) {
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

  return this

}