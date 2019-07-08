import Turndown from 'turndown';
import marked from 'marked';
import { getValue, createValue } from '@scipe/jsonld';

// TODO switch to https://github.com/showdownjs/showdown/blob/master/CHANGELOG.md when converter.makeMarkdown is no longer experimental

const turndown = new Turndown({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced'
});

export function toMarkdown(htmlNodeOrText) {
  return typeof htmlNodeOrText === 'string'
    ? htmlNodeOrText
    : htmlNodeOrText && htmlNodeOrText['@type'] === 'rdf:HTML'
    ? turndown.turndown(getValue(htmlNodeOrText))
    : '';
}

export function toHtmlNode(markdown) {
  return createValue(
    marked(markdown, { xhtml: true, gfm: true, breaks: true, table: true }),
    { coerceSinglePWithNoMarkupToText: true }
  );
}
