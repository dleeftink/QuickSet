export default function rewrite(func, pats, reps) {

  if (!Array.isArray(pats)) {
    pats = [pats];
  }

  if (!Array.isArray(reps)) {
    reps = [reps];
  }

  if (pats.length == reps.length) {
    let span = pats.length;
        func = func.toString();

    for (let i = 0; i < span; ++i) {
      func = func.replace(pats[i], reps[i]);
    }

  } else {
    throw new Error('Unbalanced pattern replacements');
  }
  
  return new Function('return '+func).call();
  
}