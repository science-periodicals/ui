import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class PaperRadioButton extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleClick(ev) {
    const { onClick } = this.props;
    if (onClick) onClick(ev);
    this.handleChange();
  }

  handleKeyDown(ev) {
    if (ev.keyCode === 32) {
      const { onClick } = this.props;
      if (onClick) onClick(ev);
      this.handleChange();
    }
  }

  handleChange() {
    const { onChange, value, checked } = this.props;
    if (onChange) onChange(value, !checked);
  }

  render() {
    let { children, theme, checked, disabled, id, className } = this.props;
    //let classes = `paper-radio-button${theme ? ` ${theme}` : ''}`;
    return (
      <div className={classNames('paper-radio-button', theme, className)}>
        <FocusElement
          id={id}
          className="radio-button-container"
          role="radio"
          aria-checked={!!checked}
          aria-disabled={!!disabled}
          tabIndex={disabled ? '-1' : '0'}
          onClick={!disabled ? this.handleClick : undefined}
          onKeyDown={!disabled ? this.handleKeyDown : undefined}
          disabled={disabled}
        >
          <div className="radio-button">
            <div className="checkmark" />
          </div>
        </FocusElement>

        {children && (
          <label
            htmlFor={id}
            className="radio-button-label"
            aria-disabled={!!disabled}
            onClick={!disabled ? this.handleClick : undefined}
          >
            {children}
          </label>
        )}
      </div>
    );
  }
}

PaperRadioButton.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
  theme: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  id: PropTypes.string,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  className: PropTypes.string
};

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
