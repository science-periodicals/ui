import React from 'react';
import { Price } from '../../src/';

export default class PriceExample extends React.Component {
  render() {
    return (
      <div className="example">
        <div className="example__block">
          <h3>PriceSpecification</h3>
          <Price
            priceSpecification={{
              '@type': 'PriceSpecification',
              price: 90,
              priceCurrency: 'USD',
              valueAddedTaxIncluded: false,
              platformFeesIncluded: false
            }}
          />
        </div>

        <div className="example__block">
          <h3>UnitPriceSpecification</h3>
          <Price
            priceSpecification={{
              '@type': 'UnitPriceSpecification',
              price: 10,
              priceCurrency: 'USD',
              unitText: 'submission',
              valueAddedTaxIncluded: false,
              platformFeesIncluded: false
            }}
          />
        </div>

        <div className="example__block">
          <h3>CompoundPriceSpecification</h3>
          <Price
            priceSpecification={{
              '@type': 'CompoundPriceSpecification',
              priceComponent: [
                {
                  name: 'main entity',
                  '@type': 'UnitPriceSpecification',
                  price: 1,
                  priceCurrency: 'USD',
                  billingIncrement: 1,
                  unitText: 'main entity',
                  valueAddedTaxIncluded: false,
                  platformFeesIncluded: false
                },
                {
                  name: 'parts',
                  '@type': 'UnitPriceSpecification',
                  price: 0.1,
                  priceCurrency: 'USD',
                  billingIncrement: 1,
                  unitText: 'Creative Work listed as part of the main entity',
                  valueAddedTaxIncluded: false,
                  platformFeesIncluded: false
                }
              ]
            }}
          />
        </div>
      </div>
    );
  }
}
