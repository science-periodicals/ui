import React from 'react';
import { ProgressiveImage } from '../../src/';

export default function ProgressiveImageExample(props) {
  const imageEncoding = {
    '@context': 'https://science.ai',
    '@id': 'scienceai:image',
    '@type': 'Image',
    caption: 'image caption',
    encoding: {
      '@id': 'scienceai:image-encoding-id',
      '@type': 'ImageObject',
      name: 'img.png',
      fileFormat: 'image/png',
      contentUrl: './images/2562.png',
      contentSize: 1222,
      width: 2562,
      height: 1281,
      encodesCreativeWork: 'scienceai:image',
      contentChecksum: {
        '@type': 'Checksum',
        checksumAlgorithm: 'sha-256',
        checksumValue: 'mebiZJhOlR372Iy7C3w6a1Igc45//wlo='
      },
      thumbnail: [
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 1824,
          height: 912,
          contentUrl: './images/1824.png'
        },
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 1280,
          height: 640,
          contentUrl: './images/1280.png'
        },
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 1024,
          height: 512,
          contentUrl: './images/1024.png'
        },
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 768,
          height: 384,
          contentUrl: './images/768.png'
        },
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 640,
          height: 320,
          contentUrl: './images/640.png'
        },
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 420,
          height: 210,
          contentUrl: './images/420.png'
        },
        {
          '@type': 'ImageObject',
          fileFormat: 'image/png',
          exifData: '...',
          width: 32,
          height: 16,
          contentUrl: './images/32.png'
        }
      ]
    }
  };

  const smallSizeBreaks = {
    smallDesktop: {
      vw: 1024,
      widthPerc: 50
    },
    largeDesktop: {
      vw: 1280,
      widthPerc: 50
    },
    xlargeDesktop: {
      vw: 1824,
      widthPerc: 50
    },
    xxlargeDesktop: {
      vw: 2560,
      widthPerc: 50
    }
  };

  return (
    <div className="example">
      <div className="example__row">
        <div style={{ maxWidth: '100%', width: '100%' }}>
          <ProgressiveImage resource={imageEncoding} />
        </div>
      </div>

      <div className="example__row">
        <ProgressiveImage
          resource={imageEncoding}
          breakPoints={smallSizeBreaks}
        />
        <ProgressiveImage
          resource={imageEncoding}
          breakPoints={smallSizeBreaks}
        />
      </div>
    </div>
  );
}
