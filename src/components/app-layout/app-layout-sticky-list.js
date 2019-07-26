import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppLayoutContext } from './app-layout';
import AppLayoutStickyListItem from './app-layout-sticky-list-item';
import * as reactChildrenUtils from '../../utils/react-children-utils';
import classNames from 'classnames';

class _AppLayoutStickyList extends Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,

    /* context */
    menubarHidden: PropTypes.bool,
    headerHeight: PropTypes.number,
    subHeaderHeight: PropTypes.number,
    onHeaderHeightChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.handleStick = this.handleStick.bind(this);
    this.handleUnstick = this.handleUnstick.bind(this);

    this.state = {
      stickingListItem: false
    };

    this.stickingItemHeight = 0;
  }

  /**
   * Each sticky item must have a unique id because of the order of stick /
   * unstick cannot be gauranteed during scroll. ie. In some cases it possible for
   * one component to unstick after the next has already stuck. maintaining an id
   * lets app-layout determine which banner height to listen to.
   */
  handleStick(heightOffset, id) {
    if (!id) {
      // it seems that this can be called by app-layout-sticky-list-item before it's id prop is set
      return;
    }
    // console.log('handleStick', id);
    if (!this.state.stickingListItem) {
      this.setState({ stickingListItem: true });
    }
    this.stickingItemHeight = heightOffset;
    this.props.onHeaderHeightChange(heightOffset, id);
  }

  handleUnstick(heightOffset, id) {
    // heightOffset is the height of the stickable element when in its non-sticking
    // state. We're not using it now, but having the information could be useful
    // in future.
    if (!id) {
      return;
    }
    if (this.state.stickingListItem) {
      this.setState({ stickingListItem: false });
      this.props.onHeaderHeightChange(0, id);
    }
  }

  render() {
    const {
      children,
      headerHeight,
      subHeaderHeight,
      className,
      menubarHidden
    } = this.props;
    return (
      <div
        ref={this.containerRef}
        style={{
          paddingTop:
            '0' /*`${
            this.state.stickingListItem ? this.stickingItemHeight : 0
        }px`*/ /* uncomment this line if you want to hide the sticking headers banner */
        }}
        className={classNames(className, 'app-layout__sticky-list', {
          'app-layout__sticky-list--sticking': this.state.stickingListItem
        })}
      >
        {reactChildrenUtils.cloneAllOfType(children, AppLayoutStickyListItem, {
          containerRef: this.containerRef,
          key: `stickyListItemx`,
          onStick: this.handleStick,
          onUnstick: this.handleUnstick,
          headerHeight: headerHeight,
          subHeaderHeight: subHeaderHeight,
          menubarHidden: menubarHidden
        })}

        {reactChildrenUtils.getAllNotOfType(children, AppLayoutStickyListItem)}
      </div>
    );
  }
}

export default function AppLayoutStickyList(props) {
  return (
    <AppLayoutContext.Consumer>
      {({
        menubarHidden,
        headerHeight,
        subHeaderHeight,
        handleHeaderHeightChange
      }) => {
        return (
          <_AppLayoutStickyList
            {...props}
            menubarHidden={menubarHidden}
            headerHeight={headerHeight}
            subHeaderHeight={subHeaderHeight}
            onHeaderHeightChange={handleHeaderHeightChange}
          />
        );
      }}
    </AppLayoutContext.Consumer>
  );
}
