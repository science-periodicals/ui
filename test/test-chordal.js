import assert from 'assert';
import { schemaToChordal } from '../src';

describe('schemaToChordal', function() {
  this.timeout(2000);

  it('should work when imagePart is true', () => {
    const resources = [
      {
        '@id': '_:mp',
        '@type': 'Image',
        hasPart: ['_:p1', '_:p2']
      },
      {
        '@id': '_:p1',
        '@type': 'Image',
        isBasedOn: '_:video'
      },
      {
        '@id': '_:p2',
        '@type': 'Image',
        isBasedOn: '_:p1'
      },
      {
        '@id': '_:video',
        '@type': 'Video',
        isBasedOn: '_:p2'
      }
    ];

    const data = schemaToChordal(resources, { imagePart: true });

    assert.deepEqual(data, [
      { id: '_:mp', label: '', color: '#33ace0', links: [] },
      { id: '_:p1', label: '', color: '#33ace0', links: ['_:video'] },
      { id: '_:p2', label: '', color: '#33ace0', links: ['_:p1'] },
      { id: '_:video', label: '', color: '#3851cd', links: ['_:p2'] }
    ]);
  });

  it('should remap isBasedOn to parent for multi part figure when imagePart is false', () => {
    const resources = [
      {
        '@id': '_:mp',
        '@type': 'Image',
        hasPart: ['_:p1', '_:p2']
      },
      {
        '@id': '_:p1',
        '@type': 'Image',
        isBasedOn: '_:video'
      },
      {
        '@id': '_:p2',
        '@type': 'Image',
        isBasedOn: '_:p1'
      },
      {
        '@id': '_:video',
        '@type': 'Video',
        isBasedOn: '_:p2'
      }
    ];

    const data = schemaToChordal(resources, { imagePart: false });

    assert.deepEqual(data, [
      { id: '_:mp', label: '', color: '#33ace0', links: ['_:video'] },
      { id: '_:video', label: '', color: '#3851cd', links: ['_:mp'] }
    ]);
  });
});
