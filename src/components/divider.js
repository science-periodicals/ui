import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function Divider({
  size,
  marginTop,
  marginBottom,
  className,
  id,
  type
}) {
  let border = typeof thickness === 'number' ? `${size}px` : size;

  return (
    <div
      className={classNames(`divider divider--${type}`, className)}
      id={id}
      style={{
        borderBottomWidth: border,
        marginTop: marginTop,
        marginBottom: marginBottom
      }}
    />
  );
}

Divider.defaultProps = {
  size: '1px',
  type: 'regular',
  marginTop: 0,
  marginBottom: 0
};

Divider.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  marginBottom: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.oneOf(['regular', 'major', 'minor'])
};
