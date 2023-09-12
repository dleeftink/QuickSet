// why is this faster on stackblitz?
export default function invalid(input) {
  // rightshift max 32-bit input
  input >>>= 1;
  return (input ^ 0) !== input;
}
