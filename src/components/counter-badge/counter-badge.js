import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class CounterBadge extends React.PureComponent {
  render() {
    const { children, count, className } = this.props;

    return (
      <div className={classNames('counter-badge', className)}>
        <div className="counter-badge__contents">{children}</div>
        <div className="counter-badge__counter">{count}</div>
      </div>
    );
  }
}

CounterBadge.propTypes = {
  children: PropTypes.any,
  count: PropTypes.number,
  className: PropTypes.string
};
