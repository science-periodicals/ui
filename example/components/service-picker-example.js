import React from 'react';
import { ServicePicker } from '../../src/';

export default class ServicePickerExample extends React.Component {
  handleSelect(serviceId, nextChecked) {
    console.log(serviceId, nextChecked);
  }

  render() {
    // spi  pricing is $1.50 per 20K characters for the first 20K characters and $1.20 per 1K characters thereafter

    const potentialServices = [
      {
        '@id': 'service:spi',
        '@type': 'Service',
        url: 'http://example.com/service',
        name: 'Smart typesetting',
        description:
          'Convert your MS word documents into DOCX Standard Scientific Style (DS3)',
        provider: {
          '@id': 'org:spi',
          '@type': 'Organization',
          url: 'https://www.spi-global.com',
          name: 'SPi Global'
        },
        availableChannel: {
          '@type': 'ServiceChannel',
          processingTime: 'P1D'
        },
        serviceType: 'typesetting',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingCount: 132,
          ratingValue: 3.2,
          worstRating: 1,
          bestRating: 5
        },
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            referenceQuantity: {
              '@type': 'QuantitativeValue',
              value: 50,
              unitText: 'page'
            },
            price: 10,
            priceCurrency: 'USD'
          }
        }
      },

      {
        '@id': 'service:bogich',
        '@type': 'Service',
        name:
          'Fast typesetting with a long name to trigger auto abridge almost certainly at least for reasonable screen width',
        description:
          'Convert your MS word documents into DOCX Standard Scientific Style (DS3)',
        provider: {
          '@id': 'org:bogich-inc',
          '@type': 'Organization',
          name: 'Bogich Inc'
        },
        availableChannel: {
          '@type': 'ServiceChannel',
          processingTime: 'P1D'
        },
        serviceType: 'typesetting',
        offers: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'CompoundPriceSpecification',
            priceComponent: [
              {
                name: 'First 20000 characters',
                '@type': 'UnitPriceSpecification',
                eligibleQuantity: {
                  minValue: 0,
                  maxValue: 20000,
                  unitText: 'character'
                },
                referenceQuantity: {
                  '@type': 'QuantitativeValue',
                  value: 20000,
                  unitText: 'character'
                },
                price: 1.5,
                priceCurrency: 'USD'
              },
              {
                name: 'beyond',
                '@type': 'UnitPriceSpecification',
                eligibleQuantity: {
                  minValue: 20000,
                  unitText: 'character'
                },
                referenceQuantity: {
                  '@type': 'QuantitativeValue',
                  value: 1000,
                  unitText: 'character'
                },
                price: 1.2,
                priceCurrency: 'USD'
              }
            ]
          }
        }
      }
    ];

    return (
      <div className="example">
        <ServicePicker
          multi
          onSelect={this.handleSelect}
          potentialServices={potentialServices}
          services={potentialServices.slice(0, 1)}
        />
      </div>
    );
  }
}
