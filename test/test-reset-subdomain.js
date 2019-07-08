import assert from 'assert';
import { resetSubdomain } from '../src';

describe('resetSubdomain', function() {
  it('should reset subdomain when called with just a pathname', () => {
    const location = {
      hostname: 'joghl.sci.pe'
    };
    const href = resetSubdomain('/login', 'sci.pe', undefined, location);
    assert.equal(href, '//sci.pe/login');
  });

  it('should reset subdomain when called with force option and undefined location (SSR case)', () => {
    const href = resetSubdomain('/login', 'sci.pe', { force: true });
    assert.equal(href, '//sci.pe/login');
  });

  it('should not reset subdomain when called from 127.0.0.1', () => {
    const location = {
      hostname: '127.0.0.1'
    };
    const href = resetSubdomain('/logout', 'sci.pe', undefined, location);
    assert.equal(href, '/logout');
  });
});
