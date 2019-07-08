import React from 'react';
import { RdfaCaptionMetadata } from '../../src';

export default class RdfaCaptionMetadataExample extends React.Component {
  render() {
    return (
      <div className="example">
        <ul>
          <li>
            <RdfaCaptionMetadata
              object={{
                '@id': 'scienceai:table',
                '@type': 'Table',
                license: 'spdx:CC-BY-ND-1.0',
                alternateName: 'table 1',
                author: {
                  '@type': 'Person',
                  name: 'Peter Jon Smith'
                },
                contributor: {
                  '@type': 'Person',
                  name: 'Lea Clark'
                },
                caption: 'Caption text',
                copyrightYear: '2010',
                copyrightHolder: {
                  '@id': 'http://www.nyu.edu/',
                  '@type': 'CollegeOrUniversity',
                  name: 'New York University',
                  alternateName: 'NYU'
                },
                isBasedOn: [
                  {
                    '@id': 'scienceai:code1',
                    '@type': 'SoftwareSourceCode',
                    alternateName: 'Code 1'
                  },
                  {
                    '@id': 'scienceai:code2',
                    '@type': 'SoftwareSourceCode',
                    alternateName: 'Code 2'
                  },
                  {
                    '@id': 'scienceai:data',
                    '@type': 'Dataset',
                    alternateName: 'Data 1'
                  }
                ]
              }}
            />
          </li>
          <li>
            <RdfaCaptionMetadata
              object={{
                '@id': 'scienceai:image',
                '@type': 'Image',
                alternateName: 'figure 1',
                caption: 'Caption text',
                provider: {
                  '@type': 'Person',
                  name: 'Sandra Bullock'
                },
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
          </li>
        </ul>
      </div>
    );
  }
}
