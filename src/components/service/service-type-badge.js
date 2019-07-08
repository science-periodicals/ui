import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from '../tooltip';
import AutoAbridge from '../auto-abridge';

export default class ServiceTypeBadge extends React.PureComponent {
  render() {
    const { id, className, serviceType } = this.props;

    return (
      <div className={classNames(className, 'service-type-badge')} id={id}>
        <AutoAbridge ellipsis={true} className="service-type-badge__text">
          <Tooltip displayText={serviceType}>{serviceType}</Tooltip>
        </AutoAbridge>
      </div>
    );
  }
}

ServiceTypeBadge.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  serviceType: PropTypes.string
};
