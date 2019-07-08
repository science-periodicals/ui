import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';
import { Link } from 'react-router-dom';

const MenuItem = ({
  icon, // legacy
  iconName,
  children,
  href,
  target,
  download,
  to,
  onClick,
  onClickCapture,
  divider,
  disabled,
  fixedHeight,
  className
}) => {
  let body = [];
  let el;

  const ref = React.createRef();

  if (icon || iconName) {
    if (iconName || typeof icon === 'string') {
      icon = { iconName: iconName || icon, size: '18px' };
    }
    body.push(
      <div className="menu__item-icon" key="icon">
        <Iconoclass {...icon} />
      </div>
    );
  }
  body.push(
    <div className="menu__item-text" key="label">
      {children}
    </div>
  );

  const handleKeyDown = e => {
    if (e.keyCode === 32) {
      // keyCode 32 == Space key
      // space key should behave the same as a mouseclick
      // for href children we need to invoke the native click() function.
      if (onClick) {
        onClick(e);
      }
      if (onClickCapture) {
        onClickCapture(e);
      }
      if ((href || to) && el) {
        ref.current.firstChild.click();
      }
    }
  };

  // we manage focus at the LI level, so we want to make sure the children don't
  // take focus.
  const tabIndex = '-1';

  if (disabled) {
    el = React.createElement('div', {}, body);
  } else if (to) {
    el = React.createElement(
      Link,
      { to, onClick, onClickCapture, tabIndex },
      body
    );
  } else if (href) {
    el = React.createElement(
      'a',
      { href, target, download, onClick, onClickCapture, tabIndex },
      body
    );
  } else if (onClick || onClickCapture) {
    el = React.createElement('button', { onClick, onClickCapture, tabIndex }, [
      React.createElement('span', { key: 'span' }, body)
    ]);
  } else {
    el = React.createElement('div', {}, body);
  }

  return (
    <li
      className={classNames(className, 'menu__item', {
        'menu__item--divider': divider,
        'menu__item--disabled': disabled,
        'menu__item--fixed-height': fixedHeight
      })}
      tabIndex="-1"
      onKeyDown={handleKeyDown}
      ref={ref}
    >
      {children && el}
    </li>
  );
};

MenuItem.defaultProps = {
  fixedHeight: true
};

MenuItem.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  iconName: PropTypes.string,
  children: PropTypes.node,
  href: PropTypes.string,
  target: PropTypes.string,
  download: PropTypes.string,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onClick: PropTypes.func,
  onClickCapture: PropTypes.func,
  divider: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  className: PropTypes.string,
  fixedHeight: PropTypes.bool
};

export default MenuItem;

export const MenuItemLabel = ({ className, children }) => {
  return (
    <li className={classNames(className, 'menu__item-label')}>{children}</li>
  );
};

MenuItemLabel.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export const MenuItemDivider = ({ className }) => {
  return <li className={classNames(className, 'menu__item-divider')} />;
};

MenuItemDivider.propTypes = {
  className: PropTypes.string
};

export const MenuCardItem = ({ divider, className, children }) => {
  return (
    <li
      className={classNames(className, 'menu__card-item', {
        'menu__card-item--divider': divider,
        'menu__card-item--non-divider': !divider
      })}
    >
      {children}
    </li>
  );
};

MenuCardItem.defaultProps = {
  divider: false,
  className: ''
};

MenuCardItem.propTypes = {
  divider: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node
};
