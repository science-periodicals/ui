import React, { Component, useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import BemTags from '../utils/bem-tags';

export default class PaperSwitch extends Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    checked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.any /* ie Iconoclass */
  };

  static defaultProps = {
    onClick: noop
  };

  handleClick = e => {
    this.props.onClick(!this.props.checked, e);
  };

  render() {
    const { id, className, checked, disabled, children } = this.props;

    const bem = BemTags();
    return (
      <div
        className={classNames(
          className,
          bem`paper-switch --${checked ? 'on' : 'off'} --${
            disabled ? 'disabled' : 'enabled'
          }`
        )}
      >
        <FocusElement
          id={id}
          className={bem`button`}
          onClick={disabled ? undefined : this.handleClick}
          role="checkbox"
          aria-checked={!!checked}
          aria-disabled={!!disabled}
          tabIndex={disabled ? '-1' : '0'}
          disabled={disabled}
          onKeyDown={e => {
            if (e.keyCode === 32) {
              e.stopPropagation();
              e.preventDefault();
              this.handleClick(e);
            }
          }}
        >
          {children}
        </FocusElement>
      </div>
    );
  }
}

const FocusElement = ({
  elType,
  className,
  id,
  children,
  onFocus,
  onBlur,
  onKeyUp,
  disabled,
  ...props
}) => {
  const Type = elType;
  const [isFocused, setIsFocused] = useState(false);
  const [showFocus, setShowFocus] = useState(false);

  return (
    <Type
      id={id}
      className={`${className} ${showFocus ? className + '--focused' : ''}`}
      {...props}
      onFocus={e => {
        if (!disabled) {
          setIsFocused(true);
          onFocus && onFocus(e);
        }
      }}
      onBlur={e => {
        if (!disabled) {
          setIsFocused(false);
          setShowFocus(false);
          onBlur && onBlur(e);
        }
      }}
      onKeyUp={e => {
        if (!disabled && e.key === 'Tab') {
          setShowFocus(isFocused);
        }
        onKeyUp && onKeyUp(e);
      }}
    >
      {children}
    </Type>
  );
};

FocusElement.propTypes = {
  elType: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.any,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
  disabled: PropTypes.bool
};

FocusElement.defaultProps = {
  elType: 'div'
};
