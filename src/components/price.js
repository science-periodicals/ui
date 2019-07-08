import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { arrayify } from '@scipe/jsonld';

export default class Price extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    priceSpecification: PropTypes.shape({
      '@type': PropTypes.oneOf([
        'PriceSpecification',
        'UnitPriceSpecification',
        'CompoundPriceSpecification'
      ])
    }).isRequired,
    requestedPrice: PropTypes.oneOfType([
      PropTypes.number, //if specified it will overwrite `price`
      PropTypes.object // in case of `CompoundPriceSpecification` an object must be specifified with the key corresponding to the `name` of each `PriceComponent`
    ]),
    numberOfUnit: PropTypes.oneOfType([
      PropTypes.number, // if specified, an unit price will be converted to a price by multiplying unit price per `numberOfUnit`
      PropTypes.object // in case of `CompoundPriceSpecification` an object must be specifified with the key corresponding to the `name` of each `PriceComponent`
    ]),
    fallback: PropTypes.string,
    labelIfZero: PropTypes.string
  };

  static defaultProps = {
    fallback: 'variable price'
  };

  renderPrice() {
    const {
      requestedPrice,
      priceSpecification,
      fallback,
      numberOfUnit,
      labelIfZero
    } = this.props;

    switch (priceSpecification['@type']) {
      case 'PriceSpecification':
        if (priceSpecification.price != null) {
          if (labelIfZero && priceSpecification.price === 0) {
            return labelIfZero;
          }

          const price =
            requestedPrice != null ? requestedPrice : priceSpecification.price;

          const prefix = getPricePrefix(priceSpecification);
          return `${prefix}${price.toString()}`;
        }

        return fallback;

      case 'UnitPriceSpecification':
        if (priceSpecification.price != null) {
          if (labelIfZero && priceSpecification.price === 0) {
            return labelIfZero;
          }

          const price =
            requestedPrice != null ? requestedPrice : priceSpecification.price;

          const prefix = getPricePrefix(priceSpecification);

          if (priceSpecification.unitText) {
            if (numberOfUnit != null) {
              const totalPrice = price * numberOfUnit;
              return `${prefix}${totalPrice.toString()}`;
            }

            return `${prefix}${price.toString()} / ${
              priceSpecification.unitText
            }`;
          }

          return `${prefix}${price.toString()}`;
        }

        return fallback;

      case 'CompoundPriceSpecification':
        if (
          labelIfZero &&
          arrayify(priceSpecification.priceComponent).every(
            unitPriceSpecification => unitPriceSpecification.price === 0
          )
        ) {
          return labelIfZero;
        }

        if (
          arrayify(priceSpecification.priceComponent).every(
            unitPriceSpecification =>
              unitPriceSpecification.name &&
              unitPriceSpecification.price != null
          )
        ) {
          return (
            <ul className="sa__inline-list sa__inline-list--semicolon">
              {arrayify(priceSpecification.priceComponent).map(
                unitPriceSpecification => {
                  const prefix = getPricePrefix(unitPriceSpecification);

                  const price =
                    typeof requestedPrice === 'object' &&
                    unitPriceSpecification.name in requestedPrice
                      ? requestedPrice[unitPriceSpecification.name]
                      : unitPriceSpecification.price;

                  let priceText;

                  if (unitPriceSpecification.unitText) {
                    if (
                      typeof numberOfUnit === 'object' &&
                      unitPriceSpecification.name in numberOfUnit
                    ) {
                      const totalPrice =
                        price * numberOfUnit[unitPriceSpecification.name];
                      priceText = `${totalPrice.toString()}`;
                    }

                    priceText = `${price.toString()} / ${
                      unitPriceSpecification.unitText
                    }`;
                  } else {
                    priceText = price.toString();
                  }

                  return (
                    <li key={unitPriceSpecification.name}>
                      <b>{unitPriceSpecification.name}</b>: {prefix}
                      {priceText}
                    </li>
                  );
                }
              )}
            </ul>
          );
        }

        return fallback;

      default:
        return fallback;
    }
  }

  render() {
    const { id, className } = this.props;

    return (
      <span id={id} className={classNames(className, 'price')}>
        {this.renderPrice()}
      </span>
    );
  }
}

function getPricePrefix(priceSpecification = {}) {
  if (
    priceSpecification.priceCurrency &&
    priceSpecification.priceCurrency.toLowerCase() === 'usd'
  ) {
    return '$';
  }

  return '';
}
