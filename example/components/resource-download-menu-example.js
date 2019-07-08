import React from 'react';
import { ResourceDownloadMenu, Menu, MenuItem } from '../../src/';

export default class ResourceDownloadMenuExample extends React.Component {
  render() {
    const image = {
      '@type': 'Image',
      encoding: [
        {
          '@id': 'scienceai:encodingId1',
          '@type': 'ImageObject',
          name: 'img.png',
          contentUrl: '/encoding/encodingId1',
          fileFormat: 'image/png',
          contentSize: 10246
        },
        {
          '@id': 'scienceai:encodingId2',
          '@type': 'ImageObject',
          name: 'img.jpg',
          contentUrl: '/encoding/encodingId2',
          fileFormat: 'image/jpeg',
          contentSize: 240249
        }
      ]
    };

    const multiPart = {
      '@type': 'Image',
      hasPart: [
        {
          '@type': 'Image',
          alternateName: 'A',
          encoding: [
            {
              '@id': 'scienceai:encodingIdA1',
              '@type': 'ImageObject',
              name: 'img.png',
              contentUrl: '/encoding/encodingIdA1',
              fileFormat: 'image/png',
              contentSize: 10246
            },
            {
              '@id': 'scienceai:encodingIdA2',
              '@type': 'ImageObject',
              name: 'img.jpg',
              contentUrl: '/encoding/encodingIdA2',
              fileFormat: 'image/jpeg',
              contentSize: 10222
            }
          ]
        },
        {
          '@type': 'Image',
          alternateName: 'B',
          encoding: [
            {
              '@id': 'scienceai:encodingIdB1',
              '@type': 'ImageObject',
              name: 'img.png',
              contentUrl: '/encoding/encodingIdB1',
              fileFormat: 'image/png',
              contentSize: 240249
            }
          ]
        }
      ]
    };

    return (
      <div className="example">
        <ResourceDownloadMenu resource={image} portal={true} />
        <ResourceDownloadMenu resource={multiPart} portal={false} />
      </div>
    );
  }
}
