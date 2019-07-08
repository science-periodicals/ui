import React from 'react';
import { Value } from '../../src/';

export default function ValueExample(props) {
  return (
    <div className="example">
      <Value>Some text</Value>
      <Value>
        {{
          '@type': 'rdf:HTML',
          '@value': 'A typed value with <a href="#">HTML in it</a>.'
        }}
      </Value>
    </div>
  );
}
