import React from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';

const StatusBadge = ({
  children,
  className,
  size = 14,
  ...iconoClassProps
}) => {
  return (
    <div className="status-badge" style={{ marginRight: `${size / 2}px` }}>
      {children}
      <div
        className="status-badge__icon-container"
        style={{
          width: `${size + 2}px`,
          height: `${size + 2}px`,
          right: `${(size / 2) * -1}px`
        }}
      >
        <Iconoclass
          size={`${size}px`}
          {...iconoClassProps}
          round={true}
          className="status-badge__icon"
        />
      </div>
    </div>
  );
};

StatusBadge.propTypes = {
  children: PropTypes.any,
  size: PropTypes.number,
  className: PropTypes.string
};

export default StatusBadge;
