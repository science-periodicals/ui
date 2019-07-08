import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { StaggeredMotion, spring } from 'react-motion';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../utils/bem-tags';
import OnClickOutWrapper from './on-clickout-wrapper';
import PaperActionButtonOption from './paper-action-button-option';
import { typesMatch } from '../utils/react-children-utils';

/***
 * This component emulates the Material Design 'Action Button'.
 * It optionally accepts paper-action-button-option children that will behave
 * as a MD 'speed-dial'. see link below for standard example:
 * https://material-ui.com/lab/speed-dial/
 **/

function presetSpring(val) {
  return spring(val, {
    stiffness: 400,
    damping: 27
  });
}

export default class PaperActionButton extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      active: false,
      fucusedListItemIndex: undefined
    };
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleClickChild = this.handleClickChild.bind(this);
    this.handleButtonKeyDown = this.handleButtonKeyDown.bind(this);
    this.handleListKeyDown = this.handleListKeyDown.bind(this);

    this.myRef = React.createRef();
    this.flyOutListRef = React.createRef();
  }

  handleButtonClick(e) {
    let haveChildren = this.props.children && this.props.children.length > 0;
    this.setState(({ active }) => ({
      active: !active && haveChildren,
      fucusedListItemIndex: undefined
    }));
    this.props.onClick(e);
  }

  handleClickOutside() {
    if (this.state.active) {
      this.setState({ active: false, focusedListItemIndex: undefined });
    }
  }

  handleClickChild(e) {
    if (this.state.active) {
      this.setState({ active: false, focusedListItemIndex: undefined });
    }
  }

  handleButtonKeyDown(e) {
    if (e.keyCode === 32) {
      e.preventDefault(); // Let's stop this event.
      e.stopPropagation(); // Really this time.
      this.handleButtonClick(e);
    }
  }

  handleListKeyDown(e) {
    const { focusedListItemIndex } = this.state;
    if (e.key === 'ArrowUp') {
      // select previous item or loop to bottom
      if (focusedListItemIndex > 0) {
        this.setState({
          focusedListItemIndex: focusedListItemIndex - 1
        });
      } else if (focusedListItemIndex === undefined) {
        this.setState({
          focusedListItemIndex: this.flyOutListRef.current.children.length - 1
        });
      } else if (focusedListItemIndex === 0) {
        if (this.flyOutListRef.current) {
          this.setState({
            focusedListItemIndex: this.flyOutListRef.current.children.length - 1
          });
        }
      }

      e.preventDefault(); // Let's stop this event.
      e.stopPropagation(); // Really this time.
    } else if (e.key === 'ArrowDown') {
      // select next item or loop to top
      if (focusedListItemIndex === undefined) {
        this.setState({ focusedListItemIndex: 0 });
      } else {
        if (
          this.flyOutListRef.current &&
          this.flyOutListRef.current.children.length - 1 > focusedListItemIndex
        ) {
          this.setState({
            focusedListItemIndex: focusedListItemIndex + 1
          });
        } else if (this.flyOutListRef.current) {
          this.setState({
            focusedListItemIndex: 0
          });
        }
      }

      e.preventDefault(); // Let's stop this event.
      e.stopPropagation(); // Really this time.
    } else if (e.key === 'Tab') {
      this.setState({ active: false, focusedListItemIndex: undefined });
      e.preventDefault(); // Let's stop this event.
      e.stopPropagation(); // Really this time.
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // manage focus state after dropdown is rendered

    if (!prevState.active && this.state.active) {
      // just opened -- focus the dropdown so we can capture key events on the el

      if (this.flyOutListRef.current) {
        this.flyOutListRef.current.focus();
      }
    } else if (
      prevState.active &&
      this.state.active &&
      prevState.focusedListItemIndex !== this.state.focusedListItemIndex
    ) {
      // menu is alaready open, but focus position changed

      if (this.state.focusedListItemIndex !== undefined) {
        this.flyOutListRef.current.children[
          this.state.focusedListItemIndex
        ].focus();
      }
    } else if (prevState.active && !this.state.active) {
      // menu closed, unfocus children and return it to the primary button
      if (this.myRef.current) {
        this.myRef.current.focus();
      }
    }
  }

  render() {
    const bem = BemTags();

    const {
      className,
      disabled,
      color,
      large,
      children,
      spinOnActive,
      iconName,
      readOnly
    } = this.props;

    let buttonStyle = {};
    if (color) buttonStyle.backgroundColor = color;

    return (
      <OnClickOutWrapper handleClickOutside={this.handleClickOutside}>
        <div
          className={classNames(
            className,
            bem`paper-action-button --${large ? 'large' : 'small'} ${
              readOnly ? '--read-only' : ''
            } ${disabled ? '--disabled' : ''} ${
              this.state.active ? '--active' : '--inactive'
            }`
          )}
        >
          <button
            className={bem`button --${
              this.state.active ? 'active' : 'inactive'
            } --${spinOnActive ? 'spin' : 'no-spin'}`}
            disabled={disabled}
            onClick={this.handleButtonClick}
            onMouseUp={() => {
              if (this.myRef.current) {
                this.myRef.current.blur();
              }
            }}
            onKeyPress={this.handleButtonKeyDown}
            ref={this.myRef}
            style={buttonStyle}
          >
            {/* safari has bug with display: flex on buttons so use wrapper */}
            <div className={bem`icon-container`}>
              <Iconoclass iconName={iconName} className={bem`icon`} />
            </div>
          </button>
          {children && (
            <StaggeredMotion
              defaultStyles={children.map(() => ({
                scale: 0,
                opacity: 0
              }))}
              styles={prevInterpolatedStyles =>
                prevInterpolatedStyles.map((_, i) => {
                  let scale = 0;
                  if (this.state.active) {
                    scale = i === 0 ? 1 : prevInterpolatedStyles[i - 1].scale;
                  }
                  return {
                    scale: presetSpring(scale),
                    opacity: presetSpring(scale)
                  };
                })
              }
            >
              {interpolatingStyles => {
                let animationStyles = interpolatingStyles.reduceRight(
                  (prev, curr) => {
                    prev.push(curr);
                    return prev;
                  },
                  []
                );
                return (
                  <div
                    className="paper-action-button__option-list"
                    ref={this.flyOutListRef}
                    onKeyDown={this.handleListKeyDown}
                    tabIndex="-1"
                  >
                    {React.Children.map(children, (child, i) => {
                      let scale = animationStyles[i].scale;
                      if (typesMatch(child, PaperActionButtonOption)) {
                        return React.cloneElement(child, {
                          __badgeStyle: { transform: `scale(${scale})` },
                          __labelStyle: { transform: `scale(${scale})` },
                          __onClick: this.handleClickChild,
                          __disabled: !this.state.active || disabled || readOnly
                        });
                      }
                    })}
                  </div>
                );
              }}
            </StaggeredMotion>
          )}

          <div className={bem`shadow`} />
        </div>
      </OnClickOutWrapper>
    );
  }
}

PaperActionButton.defaultProps = {
  onClick: noop,
  iconName: 'add',
  spinOnActive: true,
  large: true
};

PaperActionButton.propTypes = {
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.any,
  iconName: PropTypes.string,
  color: PropTypes.string,
  spinOnActive: PropTypes.bool,
  large: PropTypes.bool,
  readOnly: PropTypes.bool
};
