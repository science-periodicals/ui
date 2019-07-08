import React from 'react';
import PropTypes from 'prop-types';
import { getId, unprefix } from '@scipe/jsonld';
import { getEligibleOffer } from '@scipe/librarian';
import { Div, H3, Span } from '../elements';
import RatingStars from '../rating-stars';
import OrganizationBadge from '../organization-badge';
import ServiceTypeBadge from './service-type-badge';
import { getProcessingTimeData } from '../../utils/service-utils';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';
import Price from '../price';
import Value from '../value';

export default class Service extends React.Component {
  static propTypes = {
    service: PropTypes.object, // Must be hydrated with `provider` embedded
    customerType: PropTypes.oneOf(['Enduser', 'RevisionAuthor'])
  };

  static defaultProps = {
    customerType: 'Enduser'
  };

  render() {
    const { service, customerType } = this.props;

    const processingTimeData = getProcessingTimeData(service);
    const offer = getEligibleOffer(service, customerType);
    const priceSpecification = offer && offer.priceSpecification;

    const ratingCount =
      service.aggregateRating && service.aggregateRating.ratingCount;

    return (
      <div className="service">
        <header className="service__header">
          <OrganizationBadge
            organization={service.provider}
            className="service__header__org-badge"
          />
          <H3 className="service__header__name">{service.name}</H3>
          <ServiceTypeBadge
            serviceType={service.serviceType}
            className="service__header__service-badge"
          />
        </header>
        <Div className="service__text">{service.description}</Div>
        <dl className="service__data">
          <LayoutWrapRows className="service__row">
            {!!service.provider && (
              <LayoutWrapItem className="service__data__datum">
                <dt className="service__data__label">Provider</dt>
                <dd className="service__data__info">
                  {service.provider.url ? (
                    <Value tagName="a" href={service.provider.url}>
                      {service.provider.name ||
                        unprefix(getId(service.provider))}
                    </Value>
                  ) : (
                    <Span>
                      {service.provider.name ||
                        service.provider.alternateName ||
                        unprefix(getId(service.provider))}
                    </Span>
                  )}
                </dd>
              </LayoutWrapItem>
            )}
            {!!service.url && (
              <LayoutWrapItem className="service__data__datum">
                <dt className="service__data__label service__data__label--website">
                  Website
                </dt>
                <dd className="service__data__info">
                  <a href={service.url}>{service.url}</a>
                </dd>
              </LayoutWrapItem>
            )}
          </LayoutWrapRows>
          <LayoutWrapRows className="service__row">
            {!!service.aggregateRating && (
              <LayoutWrapItem className="service__data__datum" flexBasis="50%">
                <dt className="service__data__label">Rating</dt>
                <dd className="service__data__info service__data__info--rating">
                  {service.aggregateRating.ratingValue}
                  <RatingStars rating={service.aggregateRating} />
                  {ratingCount && <span>({ratingCount})</span>}
                </dd>
              </LayoutWrapItem>
            )}
            {!!processingTimeData && (
              <LayoutWrapItem className="service__data__datum" flexBasis="25%">
                <dt className="service__data__label">Turnaround</dt>
                <dd className="service__data__info">{processingTimeData}</dd>
              </LayoutWrapItem>
            )}

            {!!priceSpecification && (
              <LayoutWrapItem className="service__data__datum" flexBasis="25%">
                <dt className="service__data__label">Price</dt>
                <dd className="service__data__info">
                  <Price
                    priceSpecification={priceSpecification}
                    labelIfZero="Free"
                    fallback="variable"
                  />
                </dd>
              </LayoutWrapItem>
            )}
          </LayoutWrapRows>
        </dl>
      </div>
    );
  }
}
