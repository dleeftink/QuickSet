export default function expects(int) {
  switch (true) {
    case int < 2 **  8: return [  Uint8Array, 1 ];
    case int < 2 ** 16: return [ Uint16Array, 2 ];
    case int < 2 ** 32: return [ Uint32Array, 4 ];
    default:
      throw Error('Expected count out of range');
  }
}
