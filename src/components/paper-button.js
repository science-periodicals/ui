import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';

const PaperButton = props => {
  const {
    children,
    onClick,
    disabled,
    className,
    type,
    raised,
    capsule,
    name,
    onFocus,
    onBlur,
    onKeyUp
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [showFocus, setShowFocus] = useState(false);

  return (
    <button
      className={classNames('paper-button', className, {
        'paper-button--flat': !raised,
        'paper-button--raised': raised,
        'paper-button--capsule': capsule,
        'paper-button--focused': showFocus
      })}
      data-testid={props['data-testid']}
      name={name}
      onClick={!disabled ? onClick : undefined}
      disabled={!!disabled}
      type={type}
      onFocus={e => {
        setIsFocused(true);
        onFocus(e);
      }}
      onBlur={e => {
        if (!disabled) {
          setIsFocused(false);
          setShowFocus(false);
          onBlur(e);
        }
      }}
      onKeyUp={e => {
        if (!disabled && e.key === 'Tab') {
          setShowFocus(isFocused);
        }
        onKeyUp(e);
      }}
    >
      {/* Safari Doesn't support flex display on button so use wrapper */}
      <div className="paper-button__contents">{children}</div>
    </button>
  );
};

PaperButton.propTypes = {
  'data-testid': PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['submit', 'reset', 'button', 'menu']),
  raised: PropTypes.bool,
  capsule: PropTypes.bool,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func
};

PaperButton.defaultProps = {
  onClick: noop,
  raised: false,
  onFocus: noop,
  onBlur: noop,
  onKeyUp: noop
};

export default PaperButton;
