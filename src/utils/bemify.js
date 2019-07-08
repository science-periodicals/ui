export default function bemify(base = '') {
  return function bem(template, ...expressions) {
    if (!template || !template.length) {
      return base;
    }
    const interpolated = template.reduce((accumulator, part, i) => {
      return accumulator + expressions[i - 1] + part;
    });

    return interpolated
      .split(/\s+/)
      .map(part => {
        if (part && !part.startsWith('__') && !part.startsWith('--')) {
          throw new Error(
            `bem error. Invalid value for bem (doesn't start with __ or -- (got ${part})).`
          );
        }
        return base + part;
      })
      .join(' ');
  };
}
