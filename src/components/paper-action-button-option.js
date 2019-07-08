import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import contrast from 'contrast';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../utils/bem-tags';
import { throws } from 'assert';

export default class PaperActionButtonOption extends React.Component {
  static propTypes = {
    __badgeStyle: PropTypes.object,
    color: PropTypes.string,
    iconName: PropTypes.string.isRequired,
    __labelStyle: PropTypes.object,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    __disabled:
      PropTypes.bool /* allow paper-action button to disable child when in collapsed state for accessability */
  };

  static defaultProps = {
    onClick: noop,
    __onClick: noop,
    iconName: 'add'
  };

  constructor(...args) {
    super(...args);
    this.handleClick = this.handleClick.bind(this);

    this.ref = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleClick(e) {
    let { onClick, __onClick } = this.props;
    __onClick(e);
    onClick(e);
  }

  handleKeyDown(e) {
    let { disabled, __disabled } = this.props;

    if (disabled || __disabled) {
      return;
    }

    if (e.keyCode === 32) {
      // keyCode 32 == Space key
      // space key should behave the same as a mouseclick
      this.handleClick(e);
    }
  }

  render() {
    const bem = BemTags('paper-action-button');
    let {
      label,
      color,
      __badgeStyle,
      __labelStyle,
      __onClick,
      onClick,
      iconName,
      disabled,
      __disabled,
      ...props
    } = this.props;
    let bgColorShade = color ? contrast(color) : 'light';

    return (
      <div
        className={bem`option`}
        {...props}
        tabIndex="-1"
        ref={this.ref}
        onKeyDown={this.handleKeyDown}
      >
        <label style={__labelStyle} className={bem`label`}>
          {label}
        </label>
        <button
          className={bem`option-button --${
            bgColorShade === 'light' ? 'light' : 'dark'
          }`}
          style={{ backgroundColor: color, ...__badgeStyle }}
          onClick={this.handleClick}
          onMouseUp={() => this.myRef.blur()}
          tabIndex="-1"
          ref={myRef => {
            this.myRef = myRef;
          }}
          disabled={__disabled || disabled}
        >
          <Iconoclass
            iconName={iconName}
            color="black"
            style={{
              margin: iconName === 'journal' ? '2px 0 0 0' : '3px 0 0 0'
            }}
          />
        </button>
      </div>
    );
  }
}
