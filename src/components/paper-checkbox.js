import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import uuid from 'uuid';

export default class PaperCheckbox extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    checked: PropTypes.bool,
    children: PropTypes.any,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.func, // classical API
    onChange: PropTypes.func, // more convenient API
    name: PropTypes.string, // needed for the more convenient API
    theme: PropTypes.oneOf(['light']) // legacy: TODO drop support and cleanup CSS
  };

  static defaultProps = {
    onClick: noop
  };

  constructor(props) {
    super(props);
    this._id = props.id == null ? uuid.v4() : props.id;
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const { name, checked } = this.props;

    if (this.props.onChange) {
      this.props.onChange({
        preventDefault: noop,
        target: {
          name,
          value: !checked,
          checked: !checked
        }
      });
    }
    this.props.onClick(e);
  }

  render() {
    let {
      children,
      className,
      theme,
      readOnly,
      checked,
      disabled,
      ...props
    } = this.props;
    // theme = readOnly ? 'light' : theme;

    return (
      <div
        className={classNames(
          'paper-checkbox',
          className,
          { 'paper-checkbox--read-only': readOnly },
          theme
        )}
      >
        <FocusElement
          {...props}
          disabled={disabled}
          className="checkbox-container"
          role="checkbox"
          aria-checked={!!checked}
          aria-disabled={!!disabled}
          tabIndex={
            disabled || readOnly ? '-1' : '0'
          } /*disabled elements should not get focus */
          onClick={disabled || readOnly ? undefined : this.handleClick}
          onKeyDown={e => {
            if (e.keyCode === 32 && !disabled && !readOnly) {
              this.handleClick(e);
              e.preventDefault(); // Let's stop this event.
              e.stopPropagation(); // Really this time.
            }
          }}
        >
          <div className="checkbox">
            <div className="checkmark" />
          </div>
        </FocusElement>

        {children && (
          <label
            htmlFor={this._id}
            className="checkbox-label"
            aria-disabled={!!disabled}
            onClick={disabled || readOnly ? undefined : this.handleClick}
          >
            {children}
          </label>
        )}
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
  onKeyDown,
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
          // item receives focus between keyDown and KeyUp so we need to use
          // onKeyUp to capture focus-in
          setShowFocus(isFocused);
        }
      }}
      onKeyDown={e => {
        onKeyDown && onKeyDown(e);
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
  onKeyDown: PropTypes.func,
  disabled: PropTypes.bool
};

FocusElement.defaultProps = {
  elType: 'div'
};
