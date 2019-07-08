import React from 'react';
import { RdfaCaption } from '../../src';

export default class RdfaCaptionExample extends React.Component {
  render() {
    return (
      <div className="example">
        <RdfaCaption
          object={{
            '@id': 'scienceai:table',
            '@type': 'Table',
            alternateName: 'tabe 1',
            caption: 'Caption text'
          }}
        />

        <RdfaCaption
          object={{
            '@id': 'scienceai:image',
            '@type': 'Image',
            alternateName: 'figure 1',
            caption: 'Caption text',
            hasPart: [
              {
                '@id': 'scienceai:partA',
                '@type': 'Image',
                alternateName: 'A',
                caption: 'subcaption text'
              },
              {
                '@id': 'scienceai:partB',
                '@type': 'Image',
                alternateName: 'B',
                caption: 'another subcaption text'
              }
            ]
          }}
        />
      </div>
    );
  }
}
