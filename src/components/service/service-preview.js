import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { textify } from '@scipe/jsonld';
import { getEligibleOffer } from '@scipe/librarian';
import OrganizationBadge from '../organization-badge';
import AutoAbridge from '../auto-abridge';
import ServiceTypeBadge from './service-type-badge';
import { getProcessingTimeData } from '../../utils/service-utils';
import Price from '../price';

export default class ServicePreview extends React.Component {
  static propTypes = {
    service: PropTypes.object,
    compact: PropTypes.bool,
    customerType: PropTypes.oneOf(['Enduser', 'RevisionAuthor'])
  };

  static defaultProps = {
    customerType: 'Enduser'
  };

  render() {
    const { service, compact, customerType } = this.props;
    if (!service) return null;

    const processingTimeData = getProcessingTimeData(service);
    const offer = getEligibleOffer(service, customerType);
    const priceSpecification = offer && offer.priceSpecification;

    return (
      <div className="service-preview">
        <OrganizationBadge
          organization={service.provider}
          className="service-preview__org-badge"
        />
        <AutoAbridge ellipsis={true} className="service-preview__name">
          {textify(service.name)}
        </AutoAbridge>
        <ServiceTypeBadge serviceType={service.serviceType} />

        {!compact && (
          <Fragment>
            {!!processingTimeData && (
              <AutoAbridge ellipsis={true} className="service-preview__time">
                ~ {processingTimeData}
              </AutoAbridge>
            )}

            {!!priceSpecification && (
              <AutoAbridge ellipsis={true} className="service-preview__price">
                <Price
                  customerType={customerType}
                  priceSpecification={priceSpecification}
                  numberOfUnit={1}
                  fallback="variable price"
                  labelIfZero="Free"
                />
              </AutoAbridge>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}
