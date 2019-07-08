/**
 * Hash function djb2a
 * Taken from: https://github.com/ampproject/amphtml/blob/371a072ed4986410b3671469f603e88721890bad/src/string.js#L121-L129
 * This is intended to be a simple, fast hashing function using minimal code.
 * It does *not* have good cryptographic properties.
 * @param {string} str
 * @return {string} 32-bit unsigned hash of the string
 */
export default function stringHash32(str) {
  const length = str.length;
  let hash = 5381;
  for (let i = 0; i < length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert from 32-bit signed to unsigned.
  return String(hash >>> 0);
}
