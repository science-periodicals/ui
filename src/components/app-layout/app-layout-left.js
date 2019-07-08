import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  CSS_SHORT,
  CSS_TALL,
  CSS_MOBILE,
  CSS_SMALL_DESKTOP
} from '../../constants';
import BemTags from '../../utils/bem-tags';
import { AppLayoutContext } from './app-layout';
import { withAppLayout } from './app-layout';

class _AppLayoutLeft extends Component {
  static propTypes = {
    stickyOnDesktop: PropTypes.bool,
    backgroundOnDesktop: PropTypes.bool,
    children: PropTypes.node,
    /* context Provider */
    headerHeight: PropTypes.number,
    subHeaderHeight: PropTypes.number,
    leftExpanded: PropTypes.bool,
    bannerHeight: PropTypes.number,
    screenWidth: PropTypes.string
  };

  static defaultProps = {
    expanded: true,
    stickyOnDesktop: true,
    backgroundOnDesktop: true,
    headerHeight: 56,
    subHeaderHeight: 0,
    bannerHeight: 0
  };

  render() {
    const bem = BemTags('app-layout');
    const {
      backgroundOnDesktop,
      stickyOnDesktop,
      headerHeight,
      subHeaderHeight,
      bannerHeight,
      screenWidth,
      leftExpanded
    } = this.props;

    // only pad top on desktop mode. on small screen left panel overlays content
    const style =
      screenWidth >= CSS_SMALL_DESKTOP
        ? {
            paddingTop: `${Math.max(
              headerHeight + subHeaderHeight,
              bannerHeight
            )}px`
          }
        : {};
    return (
      <div
        className={bem`__left
          --${
            backgroundOnDesktop
              ? 'backgroundOnDesktop'
              : 'noBackgroundOnDesktop'
          }
          --${stickyOnDesktop ? 'stickyOnDesktop' : 'notStickyOnDesktop'}`}
        style={style}
        aria-hidden={leftExpanded ? 'false' : 'true'}
      >
        {this.props.children}
      </div>
    );
  }
}

export default withAppLayout(_AppLayoutLeft);

// export default function AppLayoutLeft(props) {
//   return (
//     <AppLayoutContext.Consumer>
//       {({
//         menubarHidden,
//         headerHeight,
//         subHeaderHeight,
//         bannerHeight,
//         screenWidth,
//         handleHeaderHeightChange,
//         registerWidgetPanel,
//         virtualRight
//       }) => {
//         return (
//           <_AppLayoutLeft
//             {...props}
//             menubarHidden={menubarHidden}
//             headerHeight={headerHeight}
//             subHeaderHeight={subHeaderHeight}
//             bannerHeight={bannerHeight}
//             screenWidth={screenWidth}
//             handleHeaderHeightChange={handleHeaderHeightChange}
//             registerWidgetPanel={registerWidgetPanel}
//             virtualRight={virtualRight}
//           />
//         );
//       }}
//     </AppLayoutContext.Consumer>
//   );
// }
