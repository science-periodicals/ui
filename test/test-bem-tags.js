import assert from 'assert';
import { BemTags } from '../src';

describe('BemTags', function() {
  it(`should generate BEM classes for namespace`, () => {
    const bem = BemTags();

    assert.equal(bem`ns`, 'ns', 'first call set namespace');

    assert.equal(bem`sub`, 'ns__sub');
    assert.equal(bem`__sub`, 'ns__sub');
    assert.equal(bem`__s`, 'ns__s');

    // glue
    assert.equal(bem`__glued__`, 'ns__glued');
    assert.equal(bem`glued__`, 'ns__glued');
    assert.equal(bem`__sub`, 'ns__glued__sub');
    assert.equal(
      bem`__sub --modifier`,
      'ns__glued__sub ns__glued__sub--modifier'
    );
    // reset glue
    assert.equal(bem`reset`, 'ns__reset');

    //modifier
    assert.equal(bem`--modifier`, 'ns ns--modifier');
    assert.equal(bem`sub --modifier`, 'ns__sub ns__sub--modifier');
    assert.equal(
      bem`sub --modifier --modifier-2`,
      'ns__sub ns__sub--modifier ns__sub--modifier-2'
    );
  });

  it(`should work when constructed with a namespace`, () => {
    const bem = BemTags('ns');

    assert.equal(bem`sub`, `ns__sub`);
    assert.equal(bem`__sub`, `ns__sub`);

    //modifier
    assert.equal(bem`--modifier`, 'ns ns--modifier');
    assert.equal(bem`sub --modifier`, 'ns__sub ns__sub--modifier');
  });

  it(`should work when constructed with only a mixin namespace`, () => {
    const bem = BemTags('@gns');
    assert.equal(bem`ns`, 'ns');
    //mixin
    assert.equal(bem`@__mixin`, 'gns__mixin ns__mixin');
    assert.equal(bem`@--mixin-mod`, 'gns gns--mixin-mod ns ns--mixin-mod');
    assert.equal(bem`@__mixin-sub`, 'gns__mixin-sub ns__mixin-sub');
    assert.equal(bem`@__mixin-glue__`, 'gns__mixin-glue ns__mixin-glue');
    assert.equal(bem`@__sub`, 'gns__mixin-glue__sub ns__mixin-glue__sub');
  });

  it(`should work when constructed with multiple namespaces`, () => {
    // test multiple name spaces
    const bem2 = BemTags('ns1', 'ns2', '@gns');
    assert.equal(
      bem2`sub`,
      'ns1__sub ns2__sub',
      'working with multiple namespaces'
    );

    assert.equal(bem2`sub`, 'ns1__sub ns2__sub');
    assert.equal(bem2`__sub`, 'ns1__sub ns2__sub');
    assert.equal(bem2`@__mixin`, 'ns1__mixin ns2__mixin gns__mixin');
  });

  it(`should work when constructed with null namespace`, () => {
    // test multiple name spaces
    const bem = BemTags(null, '@gns');
    assert.equal(bem`ns`, 'ns');

    assert.equal(bem`sub`, 'ns__sub');
    assert.equal(bem`__sub`, 'ns__sub');
    assert.equal(bem`@__mixin`, 'ns__mixin gns__mixin');
  });

  it(`should work when constructed with only mixin namespace and no regular namespace is provided later`, () => {
    // test multiple name spaces
    const bem = BemTags('@gns');

    assert.equal(bem`@__sub`, 'gns__sub');
    assert.equal(bem`@__sub2`, 'gns__sub2');
    assert.equal(bem`@__sub2 __sub3`, 'gns__sub2');
  });

  it(`should work when constructed wtih only a mixin namespace and then a namespace is added after first call`, () => {
    // test multiple name spaces
    const bem = BemTags('@gns');

    assert.equal(bem`@__sub`, 'gns__sub');
    assert.equal(bem`ns`, 'ns'); // declare top namespace after using mixin
    assert.equal(bem`@__sub2`, 'gns__sub2 ns__sub2');
    assert.equal(bem`@__sub2 __sub3`, 'gns__sub2 ns__sub2 ns__sub3');
  });

  it(`should work when declaring a specific namespace to use`, () => {
    const bem = BemTags('@gns', '@gns2');
    assert.equal(bem`ns`, 'ns');
    assert.equal(bem`@__sub`, 'gns__sub gns2__sub ns__sub');
    assert.equal(bem`@gns__sub`, 'gns__sub ns__sub');
  });
});
