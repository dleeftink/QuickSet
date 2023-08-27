export default function unique(...data) {
  
  if (typeof data[0] == 'object' && data[0].length) {
    data = data[0];
  }

  let span = data.length;

  // unrolled loop, data is validated in each .add() call
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

  return this

}
