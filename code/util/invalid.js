// why is this faster on stackblitz?
export default function invalid(input) {
  return (input ^ 0) !== input;
}
