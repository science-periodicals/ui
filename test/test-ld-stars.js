import assert from 'assert';
import { ldstars } from '../src';

describe('ldstars', function() {
  it('should give "of" and "re" stars if doc is empty', function() {
    var s = ldstars();
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: false
    });
  });

  it('should give an "ol" star if license is open', function() {
    const expected = { ol: true, of: true, re: true, uri: false, ld: false };
    assert.deepEqual(ldstars({ license: { name: 'CC0-1.0' } }), expected);
    assert.deepEqual(ldstars({ license: 'spdx:CC0-1.0' }), expected);
  });

  it('should give an "of" and "re" star if dataset use open machine readable format', function() {
    var s = ldstars({ distribution: [{ fileFormat: 'text/csv' }] });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: false
    });
  });

  it('should not give an "re" star if dataset use non open but machine readable format', function() {
    var s = ldstars({
      distribution: [{ fileFormat: 'application/vnd.ms-excel' }]
    });
    assert.deepEqual(s, {
      ol: false,
      of: false,
      re: true,
      uri: false,
      ld: false
    });
  });

  it('should not give an "re" star if article use image format', function() {
    var s = ldstars({ encoding: [{ fileFormat: 'application/pdf' }] });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: false,
      uri: false,
      ld: false
    });
  });

  it('should not give an "of" star if sourceCode use non open programming language', function() {
    var s = ldstars({ programmingLanguage: { name: 'matlab' } });
    assert.deepEqual(s, {
      ol: false,
      of: false,
      re: true,
      uri: false,
      ld: false
    });
  });

  it('should give an "of" star if image use open format', function() {
    var s = ldstars({ encoding: [{ fileFormat: 'image/png' }] });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: false,
      uri: false,
      ld: false
    });
  });

  it('should give a "re" star if image (or media) got a description', function() {
    var s = ldstars({
      description: 'xx',
      encoding: { fileFormat: 'image/png' }
    });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: false
    });
  });

  it('should give a "uri" star if @id is present', function() {
    var s = ldstars({ '@id': 'id' });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: true,
      ld: false
    });
  });

  it('should give a "uri" star if url is present', function() {
    var s = ldstars({ url: 'http://example.com' });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: true,
      ld: false
    });
  });

  it('should give a "ld" star if resource got about', function() {
    var s = ldstars({ about: { '@id': 'http://example.com' } });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: true
    });
  });

  it('should give an "ld" star if dataset a sourceCode or a image got a isBasedOn', function() {
    var s = ldstars({ isBasedOn: 'http://example.com' });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: true
    });
  });

  it('should give an "ld" star if a dataset got a about with sameAs url', function() {
    var s = ldstars({ about: { sameAs: 'http://example.com' } });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: true
    });
  });

  it('should give an "ld" star if article use open format and citation with URL', function() {
    var s = ldstars({
      encoding: { fileFormat: 'text/x-markdown' },
      citation: { url: 'http://ex.com' }
    });
    assert.deepEqual(s, {
      ol: false,
      of: true,
      re: true,
      uri: false,
      ld: true
    });
  });
});

describe('toString()', function() {
  it('should convert a score object to a string', function() {
    var rating = ldstars();
    var s = rating.toString.call({
      ol: false,
      of: false,
      re: true,
      uri: false,
      ld: true
    });
    assert.equal(s, 're-ld');
  });
});
