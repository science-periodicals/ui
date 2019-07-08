import React, { useState } from 'react';
import ReactPortal from '../react-portal';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import onClickOutside from 'react-onclickoutside';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../../utils/bem-tags';
import * as reactChildrenUtils from '../../utils/react-children-utils';
import MenuHead from './menu-head';

// TODO `disabled` (pass it to iconoclass)

class Menu extends React.Component {
  static propTypes = {
    submenu: PropTypes.bool, // used to allow autocomplete to unfold
    align: PropTypes.oneOf(['left', 'right', 'center']),
    showPointer: PropTypes.bool,
    title: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.any]),
    iconName: PropTypes.string,
    iconSize: PropTypes.number,
    size: PropTypes.string,
    children: PropTypes.node,
    noPosition: PropTypes.bool,
    portal: PropTypes.bool,
    portalProps: PropTypes.object,
    maxHeight: PropTypes.string,
    className: PropTypes.string,
    closeOnClick: PropTypes.bool,
    disabled: PropTypes.bool,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    /* ususally we want to return focus to the menu head button for keyboard
    control. however if menu spawns new child like modal, we may want that to
    recieve the focus */
    focusOnClose: PropTypes.bool
  };

  static defaultProps = {
    isOpen: false,
    align: 'left',
    showPointer: true,
    portal: false,
    portalProps: {},
    iconSize: 24,
    closeOnClick: true,
    disabled: false,
    onOpen: noop,
    onClose: noop,
    focusOnClose: true
  };

  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.state = {
      isOpen: false,
      arrowOffset: 0,
      focusedListItemIndex: undefined
    };
    this.handleClickItem = this.handleClickItem.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleSafePosition = this.handleSafePosition.bind(this);
    this.handleListKeyDown = this.handleListKeyDown.bind(this);

    this.handleTabCaptureFocus = this.handleTabCaptureFocus.bind(this);

    this.renderList = this.renderList.bind(this);

    this.headRef = React.createRef();
    this.dropDownRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    window.removeEventListener('resize', this.handleResize);
  }

  // Click handler for the menu head button.
  // note that focus will be transfered to the dropdown list in
  // componentDidUpdate below.
  handleOnClick(ev) {
    if (this.state.isOpen && !this.props.disabled) {
      this.setState({
        isOpen: false,
        focusedListItemIndex: undefined
      });
      if (this.props.onClose) {
        this.props.onClose();
      }
    } else if (!this.state.isOpen && !this.props.disabled) {
      this.setState({
        isOpen: true,
        focusedListItemIndex: undefined
      });
      if (this.props.onOpen) {
        this.props.onOpen();
      }
    }

    // ev.stopPropagation();
  }

  handleClickOutside(e) {
    if (this.state.isOpen)
      this.setState({ isOpen: false, focusedListItemIndex: undefined });
  }

  handleClickItem(e) {
    /* IE Edge has prolem with download links if the menu unloads before the download confirmation menu appears so add a timout.
       We also need to make sure that menuItem events have a chance to hook before removing them from the DOM
    */
    if (this.props.closeOnClick) {
      this.timeoutId = setTimeout(() => {
        this.setState({ isOpen: false });
        if (this.headRef.current && this.props.focusOnClose) {
          this.headRef.current.focus();
        }
        if (this.props.onClose) {
          this.props.onClose();
        }
      }, 1);
    }
  }

  handleResize() {
    //close menu during window resize to escape from safe position feedback loops.
    if (this.state.isOpen === true)
      this.setState({ isOpen: false, focusedListItemIndex: undefined });
  }

  handleSafePosition(leftOffset, widthOffset) {
    if (leftOffset != this.state.arrowOffset) {
      this.setState({ arrowOffset: leftOffset });
    }
  }

  focus() {
    if (this.headRef.current) {
      this.headRef.current.focus();
    }
  }

  close() {
    this.setState({ isOpen: false, focusedListItemIndex: undefined });
  }

  open() {
    this.setState({ isOpen: true, focusedListItemIndex: undefined });
  }

  componentDidUpdate(prevProps, prevState) {
    // manage focus state after dropdown is rendered

    if (!prevState.isOpen && this.state.isOpen) {
      // just opened -- focus the dropdown so we can capture key events on the el
      if (this.dropDownRef.current) {
        this.dropDownRef.current.focus();
      }
    } else if (
      prevState.isOpen &&
      this.state.isOpen &&
      prevState.focusedListItemIndex !== this.state.focusedListItemIndex
    ) {
      // menu is alaready open, but focus position changed
      if (this.state.focusedListItemIndex !== undefined) {
        this.dropDownRef.current.children[
          this.state.focusedListItemIndex
        ].focus();
      }
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
          focusedListItemIndex: 0
        });
      } else if (focusedListItemIndex === 0) {
        if (this.dropDownRef.current) {
          this.setState({
            focusedListItemIndex: this.dropDownRef.current.children.length - 1
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
          this.dropDownRef.current &&
          this.dropDownRef.current.children.length - 1 > focusedListItemIndex
        ) {
          this.setState({
            focusedListItemIndex: focusedListItemIndex + 1
          });
        } else if (this.dropDownRef.current) {
          this.setState({
            focusedListItemIndex: 0
          });
        }
      }

      e.preventDefault(); // Let's stop this event.
      e.stopPropagation(); // Really this time.
    } else if (e.keyCode === 32) {
      if (this.props.closeOnClick) {
        // capture space key as if it is a click
        this.handleClickItem(e);
      }

      e.preventDefault(); // Let's stop this event.
      e.stopPropagation(); // Really this time.
    }
  }

  /*
    There is an extra div ("tab-capture") with tabindex=0 as the last element 
    inside of list-container.
    When it get's focus we know that the user has tabbed past the end of the 
    list contents and we should close the menu. 
  */
  handleTabCaptureFocus(e) {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false,
        focusedListItemIndex: undefined
      });
      // refocus the header button after tab-out of dropdown
      // this ensures that the portal returns focus to originator dom element.
      if (this.headRef.current && this.props.focusOnClose) {
        this.headRef.current.focus();
      }
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }

  renderList() {
    let { iconSize, children, showPointer, align, submenu } = this.props;
    const { isOpen } = this.state;

    const bem = BemTags('menu');

    let pointerContainerStyle = {};

    if (align === 'right') {
      pointerContainerStyle.right = `${this.state.arrowOffset +
        iconSize / 2 -
        7}px`;
      pointerContainerStyle.left = 'auto';
    } else if (align === 'left') {
      pointerContainerStyle.left = `${this.state.arrowOffset * -1 +
        iconSize / 2 -
        7}px`;
      pointerContainerStyle.right = 'auto';
    }

    let ULContainerStyle = {
      marginTop: iconSize >= 24 ? `${iconSize - 16}px` : '8px'
    };
    let ULStyle = {
      maxHeight: `${this.props.maxHeight ? this.props.maxHeight : 'none'}`
    };

    return (
      <div
        className={bem`list-container ${
          isOpen ? '--expanded' : '--collapsed'
        } --${showPointer ? 'pointer' : 'no-pointer'} --${this.props.align}`}
        style={ULContainerStyle}
      >
        <ul
          className={bem`list${submenu ? '' : ' --no-submenu'}`}
          onClick={this.handleClickItem}
          style={ULStyle}
          ref={this.dropDownRef}
          tabIndex="-1"
          onKeyDown={this.handleListKeyDown}
        >
          {reactChildrenUtils.getAllNotOfType(children, MenuHead)}
        </ul>
        {showPointer ? (
          <div
            className={bem`__pointer-container`}
            style={pointerContainerStyle}
          >
            <div className={bem`__pointer`}>
              <div className={bem`__pointer__background`} />
            </div>
          </div>
        ) : (
          ''
        )}
        <div
          className={bem`__tab-capture`}
          onFocus={this.handleTabCaptureFocus}
          tabIndex="0"
        />
      </div>
    );
  }

  render() {
    const {
      icon,
      iconName,
      size,
      iconSize,
      title,
      noPosition,
      portal,
      portalProps,
      align,
      className,
      children,
      disabled
    } = this.props;

    const { isOpen } = this.state;

    const bem = BemTags('menu');

    return (
      <div
        className={`menu-container ${
          noPosition ? 'menu-container--no-position' : ''
        } ${className ? className : ''}`}
      >
        <div
          role="menu"
          aria-haspopup="true"
          aria-expanded={isOpen ? 'true' : 'false'}
          className={bem`--${align} --${isOpen ? 'expanded' : 'collapsed'} ${
            disabled ? '--disabled' : ''
          }`}
        >
          <FocusElement
            onClick={this.handleOnClick}
            disabled={disabled}
            className={bem`header-container`}
            role="button"
            tabIndex={disabled ? '-1' : '0'}
            ref={this.headRef}
            onKeyDown={e => {
              if (e.keyCode === 32) {
                e.preventDefault(); // Let's stop this event.
                e.stopPropagation(); // Really this time.
                this.handleOnClick(e);
              }
            }}
          >
            {reactChildrenUtils.firstOfType(children, MenuHead) || (
              <div className={bem`__header`}>
                {!!title && (
                  <span className={bem`__header-title`}>{title}</span>
                )}
                <div className={bem`__header-icon`}>
                  {iconName || typeof icon === 'string' || icon == null ? (
                    <Iconoclass
                      iconSize={iconSize}
                      iconName={iconName || icon || 'moreVert'}
                      behavior="button"
                    />
                  ) : (
                    <div>{icon}</div>
                  )}
                </div>
              </div>
            )}
          </FocusElement>
          {portal && isOpen && (
            <ReactPortal
              {...portalProps}
              safePosition={true}
              onSafePosition={this.handleSafePosition}
              portalClass={classNames(
                'ignore-react-onclickoutside',
                'menu__portal',
                className ? `${className.trim()}__portal` : undefined
              )}
            >
              {this.renderList()}
            </ReactPortal>
          )}
          {!portal && isOpen && this.renderList()}
        </div>
      </div>
    );
  }
}

const _Menu = onClickOutside(Menu);
_Menu.defaultProps = Object.assign({}, _Menu.defaultProps, {
  stopPropagation: false,
  preventDefault: false
});
export default _Menu;

const FocusElement = React.forwardRef(
  (
    {
      elType,
      className,
      id,
      children,
      onFocus,
      onBlur,
      onKeyUp,
      disabled,
      ...props
    },
    ref
  ) => {
    const Type = elType;
    const [isFocused, setIsFocused] = useState(false);
    const [showFocus, setShowFocus] = useState(false);

    return (
      <Type
        id={id}
        ref={ref}
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
  }
);

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

FocusElement.displayName = 'FocusElement';
