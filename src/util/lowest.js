export default function lowest(arr,min = Infinity) {

  let len = arr.length;

  for (let i = 0; i < len; ++i) {

    let val = arr[i];
    if( val < min ) min = val;
  
  }

  return min

}