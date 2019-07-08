import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';

function Version({ type, className, children, badge = false }) {
  let iconName;
  if (type === 'prev') {
    iconName = 'versionPast';
  } else if (type == 'next') {
    iconName = 'versionFuture';
  } else {
    iconName = 'version';
  }

  return (
    <span
      className={classNames('version', className, {
        'version--badge': !!badge
      })}
    >
      <div className="version__icon-container">
        <Iconoclass
          className="version__icon"
          iconName={iconName}
          size="1.3em"
        />
      </div>
      <span className="version__contents">{children}</span>
    </span>
  );
}

Version.propTypes = {
  children: PropTypes.any,
  type: PropTypes.oneOf(['prev', 'next', 'current', 'version']),
  badge: PropTypes.bool,
  className: PropTypes.string
};

export default Version;
