import assert from 'assert';
import { bemify } from '../src';

describe('bemify', function() {
  it('should work with no value', () => {
    const bem = bemify('foo');
    assert.equal(bem``, 'foo');
  });

  it('should work with values', () => {
    const bem = bemify('foo');
    assert.equal(bem`__bar --baz`, 'foo__bar foo--baz');
  });

  it('should work when starting with a white space', () => {
    const bem = bemify('foo');
    assert.equal(bem` --baz`, 'foo foo--baz');
  });

  it('should normalize white spaces', () => {
    const bem = bemify('foo');
    assert.equal(bem`__bar     --baz`, 'foo__bar foo--baz');
  });

  it('should work with values and expressions', () => {
    const bem = bemify('foo');
    const x = 'x';
    const y = '__y';
    assert.equal(
      bem`__bar --baz --pony-${x} ${y}`,
      'foo__bar foo--baz foo--pony-x foo__y'
    );
  });

  it('should throw on invalid syntax', () => {
    const bem = bemify('foo');
    assert.throws(() => {
      bem`invalid`;
    }, /^Error: bem error/);
  });
});
