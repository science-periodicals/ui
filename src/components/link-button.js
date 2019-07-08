import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function LinkButton({ className, children, ...others }) {
  return (
    <button className={classNames('link-button', className)} {...others}>
      {children}
    </button>
  );
}

LinkButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any
};
