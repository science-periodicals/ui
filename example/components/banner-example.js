import React from 'react';
import { Banner } from '../../src/';

export default function BannerExample(props) {
  return (
    <div className="example">
      <Banner
        type="large"
        cssVariables={[
          {
            '@type': 'CssVariable',
            name: '--large-banner-background-image',
            encoding: {
              thumbnail: {
                fileFormat: 'image/jpeg',
                contentUrl: '/images/saturnrings_web_crop1_bw.jpg'
              }
            }
          },
          {
            '@type': 'CssVariable',
            name: '--large-banner-text-color',
            value: 'red'
          },
          {
            '@type': 'CssVariable',
            name: '--large-banner-text-shadow-color',
            value: 'rgba(255, 255, 255, 0.5)'
          }
        ]}
        onLoad={() => {
          console.log('loaded');
        }}
      >
        <h1>Large Name</h1>
        <p>Large description</p>
      </Banner>
    </div>
  );
}
