import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';
import {
  CSS_SHORT,
  CSS_TALL,
  CSS_MOBILE,
  CSS_SMALL_DESKTOP
} from '../../constants';
import { withAppLayout } from './app-layout';
class _AppLayoutRight extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    stickyOnDesktop: PropTypes.bool,
    stickyOnMobile: PropTypes.bool,
    backgroundOnDesktop: PropTypes.bool,
    children: PropTypes.node,
    /* context provider */
    headerHeight: PropTypes.number,
    subHeaderHeight: PropTypes.number,
    bannerHeight: PropTypes.number,
    screenWidth: PropTypes.string,
    hasWidgetPanel: PropTypes.bool
  };

  static defaultProps = {
    expanded: true,
    stickyOnDesktop: true,
    stickyOnMobile: false,
    backgroundOnDesktop: true,
    headerHeight: 56,
    subHeaderHeight: 0
  };

  render() {
    const bem = BemTags('app-layout');
    const {
      backgroundOnDesktop,
      stickyOnDesktop,
      stickyOnMobile,
      headerHeight,
      subHeaderHeight,
      bannerHeight,
      screenWidth,
      hasWidgetPanel
    } = this.props;
    // only pad top on desktop mode. on small screen right panel overlays content
    // console.log('CSS_SMALL_DESKTOP', CSS_SMALL_DESKTOP, _screenWidth);

    let style = {};
    if (screenWidth < CSS_SMALL_DESKTOP) {
      // on small screens either stick or hide the right margin, unless the widget panel is in use
      if (!stickyOnMobile && !hasWidgetPanel) {
        style = { outline: '1px solid red' };
      } else {
        style = {
          position: 'fixed',
          paddingTop: `${headerHeight + subHeaderHeight}px`
        };
      }
    } else {
      // on desktop, push the margin below the headers and banners
      style = {
        paddingTop: `${Math.max(
          headerHeight + subHeaderHeight,
          bannerHeight
        )}px`
      };
    }
    return (
      <div
        className={bem`__right
          --${
            backgroundOnDesktop
              ? 'backgroundOnDesktop'
              : 'noBackgroundOnDesktop'
          }
          ${stickyOnDesktop ? '--stickyOnDesktop' : ''}
          ${stickyOnMobile ? '--stickyOnMobile' : ''}
          `}
        style={style}
      >
        {this.props.children}
      </div>
    );
  }
}

export default withAppLayout(_AppLayoutRight);
