import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import BemTags from '../../utils/bem-tags';
import AppLayoutBanner from './app-layout-banner';
import AppLayoutHeader from './app-layout-header';
import AppLayoutSubHeader from './app-layout-sub-header';
import AppLayoutLeft from './app-layout-left';
import AppLayoutMiddle from './app-layout-middle';
import AppLayoutRight from './app-layout-right';
import AppLayoutFooter from './app-layout-footer';
import * as reactChildrenUtils from '../../utils/react-children-utils';
import withScreenDim from '../../hoc/with-screen-dim';
import { CSS_SHORT, CSS_TABLET, CSS_SMALL_DESKTOP } from '../../constants';

export const AppLayoutContext = React.createContext({
  menubarHidden: false,
  headerHeight: 56,
  subHeaderHeight: 0,
  bannerHeight: 0,
  screenWidth: CSS_SMALL_DESKTOP,
  hasWidgetPanel: false,
  handleHeaderHeightChange: noop,
  registerWidgetPanel: noop,
  virtualRight: false,
  leftExpanded: true
});

class _AppLayout extends Component {
  static propTypes = {
    children: PropTypes.node,
    leftExpanded: PropTypes.bool /* controlled state of the left panel. */,
    rightExpanded:
      PropTypes.bool /* default value of state.rightVisible. if inlineRightOnMobile is set, right panel will be hidden on mobile regardless of this settings */,
    screenWidth: PropTypes.string /* from withScreenDim HOC */,
    screenHeight: PropTypes.string /* from withScreenDim HOC */,
    virtualRight:
      PropTypes.bool /* flag if using virtual right spacer. ie. in publisher */,
    inlineRightOnMobile:
      PropTypes.bool /* flag to move right panel childen to middle on small screens */,
    className: PropTypes.string
  };

  static defaultProps = {
    leftExpanded: true,
    rightExpanded: false,
    inlineRightOnMobile: true
  };

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.watchScroll = this.watchScroll.bind(this);
    this.handleHeaderHeightChange = this.handleHeaderHeightChange.bind(this);
    this.registerWidgetPanel = this.registerWidgetPanel.bind(this);
    this.checkBannerVisibleHeight = this.checkBannerVisibleHeight.bind(this);

    this.state = {
      headerHeight: 56,
      subHeaderHeight: 0,
      bannerHeight: 0,
      screenWidth: props.screenWidth,
      rightVisible: props.rightExpanded,
      menubarHidden: false,
      handleHeaderHeightChange: this.handleHeaderHeightChange,
      registerWidgetPanel: this.registerWidgetPanel,
      hasWidgetPanel: false,
      virtualRight: props.virtualRight
    };

    this.bannerRef = React.createRef();
    this.subHeaderRef = React.createRef();

    this.RAFId = undefined;
    this.scrollDirection = 'down';
    this.newYOffset = 0;
    this.oldYOffset = 0;
    this.lastMenubarChangeOffset = 0;
    this.bannerHeights = {
      menubar: 56,
      banner: 0
    }; /* menubar must be calculated into the banner heights */

    /* used to watch height of the main content area */
    this.oldContentHeight = 0;
    this.newContentHeight = 0;
  }

  componentDidMount() {
    this._isMounted = true;
    window.addEventListener('load', this.handleScroll);
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
    this.handleScroll();
    const rightShouldBeVisible = this.shouldRightBeVisible();

    if (rightShouldBeVisible !== this.state.rightVisible) {
      this.setState({ rightVisible: rightShouldBeVisible });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('load', this.handleScroll);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    if (this.RAFId != null) {
      window.cancelAnimationFrame(this.RAFId);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // check if righExpanded prop changed and update state if needed
    let newState = {};
    if (this.props.rightExpanded !== this.state.rightVisible) {
      const rightShouldBeVisible = this.shouldRightBeVisible();

      if (rightShouldBeVisible !== this.state.rightVisible) {
        newState.rightVisible = rightShouldBeVisible;
      }
    }

    if (this.props.screenWidth !== this.state.screenWidth) {
      newState.screenWidth = this.props.screenWidth;
    }

    if (this.props.virtualRight !== this.state.virtualRight) {
      newState.virtualRight = this.props.virtualRight;
    }

    if (Object.keys(newState).length > 0) {
      this.setState(newState);
    }

    // TODO uncomment ?
    // @halmos I commented that out as it creates infinite loops in the journal pages (loading /about/editors?hostname=joghl.sci.pe from scratch for instance)
    //this.handleScroll();
    this.checkBannerVisibleHeight();
    this.measureSubHeaderHeight();
  }

  /**
   * check various props to determine if the right panel should be in expanded or collapsed state.
   */
  shouldRightBeVisible() {
    const {
      inlineRightOnMobile,
      screenWidth,
      virtualRight,
      rightExpanded
    } = this.props;

    if (!rightExpanded || virtualRight) {
      return false;
    }

    if (
      screenWidth < CSS_SMALL_DESKTOP &&
      inlineRightOnMobile &&
      !this.state.hasWidgetPanel
    ) {
      return false;
    }

    return true;
  }

  /* Called by children components that effect the header height */
  handleHeaderHeightChange(newHeight, key) {
    let headerHeight = this.state.headerHeight;
    let subHeaderHeight = this.state.subHeaderHeight;

    if (key === 'menubar') {
      headerHeight = newHeight;
      this.bannerHeights['menubar'] = newHeight;
    } else if (key === 'subheader') {
      subHeaderHeight = newHeight;
    } else if (newHeight == 0 && key in this.bannerHeights) {
      delete this.bannerHeights[key];
    } else {
      this.bannerHeights[key] = newHeight;
    }

    const heightsArr = Object.values(this.bannerHeights);
    const bannerHeight = heightsArr.length == 0 ? 0 : Math.max(...heightsArr);

    // the best way to debug the sticky header is to uncomment the line below and see which id is causing the problem
    //console.log(this.bannerHeights, headerHeight);

    if (
      this.state.headerHeight !== headerHeight ||
      this.state.subHeaderHeight !== subHeaderHeight ||
      this.state.bannerHeight !== bannerHeight
    ) {
      this.setState({
        headerHeight: headerHeight,
        subHeaderHeight: subHeaderHeight,
        bannerHeight: bannerHeight
      });
    }
  }

  /* when/if the widgetpanel loads it registers here for context provider. */
  registerWidgetPanel() {
    if (this.state.hasWidgetPanel == false) {
      this.setState({ hasWidgetPanel: true });
    }
  }

  /* handle scroll events: check if banner is visible and call handleHeaderHeightChange */
  handleScroll(event) {
    if (this.RAFId != null) {
      window.cancelAnimationFrame(this.RAFId);
    }

    this.RAFId = requestAnimationFrame(this.watchScroll);

    this.checkBannerVisibleHeight();
    this.measureSubHeaderHeight();
  }

  checkBannerVisibleHeight() {
    if (this.bannerRef.current) {
      const bannerRect = this.bannerRef.current.getBoundingClientRect();

      // check if partially visible

      if (/*bannerRect.top <= 0 && */ bannerRect.bottom >= 0) {
        const bannerHeight = bannerRect.bottom;
        this.handleHeaderHeightChange(bannerHeight, 'banner');
      } else {
        this.handleHeaderHeightChange(0, 'banner');
      }
    }
  }

  measureSubHeaderHeight() {
    if (this.subHeaderRef.current) {
      const subHeaderRect = this.subHeaderRef.current.getBoundingClientRect();
      this.handleHeaderHeightChange(subHeaderRect.height, 'subheader');
    } else {
      this.handleHeaderHeightChange(0, 'subheader');
    }
  }

  /* check if we need to hide the right panel */
  handleResize(event) {
    const rightShouldBeVisible = this.shouldRightBeVisible();

    if (rightShouldBeVisible !== this.state.rightVisible) {
      this.setState({ rightVisible: rightShouldBeVisible });
    }
  }

  /* used to detect the direction of scroll and determine if the menubar should be hidden or not*/
  watchScroll() {
    const { screenHeight } = this.props;

    if (this.RAFId != null) {
      window.cancelAnimationFrame(this.RAFId);
      this.RAFId = null;
    }
    if (!this._isMounted) {
      return;
    }
    this.oldYOffset = this.newYOffset ? this.newYOffset : window.scrollY;

    // note: safari can have negative scroll position when it bounces.
    this.newYOffset = Math.max(window.scrollY, 0);
    //this.newYOffset = window.scrollY;

    const yDeltaSinceLastMenubarChange =
      this.lastMenubarChangeOffset - this.newYOffset;

    const absYDelta = Math.abs(yDeltaSinceLastMenubarChange);
    /*
    check which way we are scrolling, but with added hysteresis.
    we measure the distance scrolled since the last time the menu hid or unhid
    to avoid hair-trigger menubar positioning.
    56 is the hysteresis value because it helps prevent hooking on changes to the height of the stickylist caused by showing/hiding
    the menubar that may produce a scroll event  .
    */
    const scrollDirection =
      absYDelta > 56 &&
      this.oldYOffset !== this.newYOffset &&
      this.newYOffset !==
        0 /* if scrolled to top, scroll direction should be down to show menubar */
        ? this.oldYOffset < this.newYOffset
          ? 'up'
          : 'down'
        : this.scrollDirection;

    this.scrollDirection = scrollDirection;

    const menubarShouldBeHidden =
      scrollDirection == 'up' && screenHeight == CSS_SHORT;

    // console.log({
    //   scrollDirection: this.scrollDirection,
    //   scrollY: window.scrollY,
    //   menubarShouldBeHidden: menubarShouldBeHidden
    // });

    if (this.state.menubarHidden !== menubarShouldBeHidden) {
      this.lastMenubarChangeOffset = this.newYOffset;
      const headerHeight = menubarShouldBeHidden ? 0 : 56;
      this.handleHeaderHeightChange(headerHeight, 'menubar');
      this.setState({ menubarHidden: menubarShouldBeHidden });
    }
  }

  render() {
    const { children, virtualRight, inlineRightOnMobile } = this.props;
    let { menubarHidden } = this.state;
    const bem = BemTags();

    // if inlineRightOnMobile, inline the right panel children into middle on small screens
    let allChildren = [];
    let shouldInlineRightChildren = false;
    if (
      inlineRightOnMobile &&
      !this.shouldRightBeVisible() &&
      !this.state.hasWidgetPanel
    ) {
      const right = reactChildrenUtils.firstOfType(children, AppLayoutRight);
      const middle = reactChildrenUtils.firstOfType(children, AppLayoutMiddle);
      // const rightChildren = React.Children.toArray(right.props.children);
      // const middleChildren = middle.props.children;
      //allChildren = rightChildren.concat(middleChildren);
      allChildren = (
        <Fragment>
          {right && (
            <div className="app-layout__mobile-inlined-right">
              {right.props.children}
            </div>
          )}
          {middle && <Fragment>{middle.props.children}</Fragment>}
        </Fragment>
      );
      shouldInlineRightChildren = true;
    }

    return (
      <AppLayoutContext.Provider value={this.state}>
        <div
          className={
            bem`app-layout
          --${this.props.leftExpanded ? 'left-expanded' : 'left-collapsed'}
          --${
            this.state.rightVisible || this.props.virtualRight
              ? 'right-expanded'
              : 'right-collapsed'
          }
          ${this.state.hasWidgetPanel ? '--widget-panel' : '--no-widget-panel'}
          ` + (this.props.className ? ` ${this.props.className}` : '')
          }
        >
          {reactChildrenUtils.cloneAllOfType(children, AppLayoutBanner, {
            _passedRef: this.bannerRef
          })}

          {reactChildrenUtils.cloneAllOfType(children, AppLayoutHeader, {
            hidden: menubarHidden
          })}
          {reactChildrenUtils.cloneAllOfType(children, AppLayoutSubHeader, {
            _passedRef: this.subHeaderRef
          })}
          {reactChildrenUtils.cloneAllOfType(children, AppLayoutLeft)}

          {shouldInlineRightChildren
            ? reactChildrenUtils.cloneAllOfType(
                children,
                AppLayoutMiddle,
                {},
                allChildren
              )
            : reactChildrenUtils.cloneAllOfType(children, AppLayoutMiddle)}

          {!virtualRight &&
            !shouldInlineRightChildren &&
            reactChildrenUtils.cloneAllOfType(children, AppLayoutRight)}

          {reactChildrenUtils.firstOfType(children, AppLayoutFooter)}
        </div>
      </AppLayoutContext.Provider>
    );
  }
}

export default withScreenDim(_AppLayout);

export function withAppLayout(Component) {
  let AppLayoutComponent = props => {
    return (
      <AppLayoutContext.Consumer>
        {({
          menubarHidden,
          headerHeight,
          subHeaderHeight,
          bannerHeight,
          screenWidth,
          handleHeaderHeightChange,
          registerWidgetPanel,
          virtualRight,
          hasWidgetPanel,
          leftExpanded
        }) => (
          <Component
            {...props}
            menubarHidden={menubarHidden}
            headerHeight={headerHeight}
            subHeaderHeight={subHeaderHeight}
            bannerHeight={bannerHeight}
            screenWidth={screenWidth}
            handleHeaderHeightChange={handleHeaderHeightChange}
            registerWidgetPanel={registerWidgetPanel}
            virtualRight={virtualRight}
            hasWidgetPanel={hasWidgetPanel}
            leftExpanded={leftExpanded}
          />
        )}
      </AppLayoutContext.Consumer>
    );
  };
  AppLayoutComponent.displayName =
    Component.displayName ||
    Component.name ||
    (Component.type && Component.type.displayName) ||
    Component.type;
  return AppLayoutComponent;
}
