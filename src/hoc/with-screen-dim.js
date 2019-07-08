import React from 'react';
import {
  CSS_SHORT,
  CSS_TALL,
  CSS_MOBILE,
  CSS_SMALL_TABLET,
  CSS_TABLET,
  CSS_SMALL_DESKTOP,
  CSS_LARGE_DESKTOP,
  CSS_XLARGE_DESKTOP,
  CSS_XXLARGE_DESKTOP
} from '../constants';

/**
 * !! IMPORTANT keep in sync with layout-vars.css
 */

const minWidths = {
  [CSS_SMALL_TABLET]: 421,
  [CSS_TABLET]: 769,
  [CSS_SMALL_DESKTOP]: 1025,
  [CSS_LARGE_DESKTOP]: 1281,
  [CSS_XLARGE_DESKTOP]: 1825,
  [CSS_XXLARGE_DESKTOP]: 2561
};

const minHeights = {
  [CSS_TALL]: 801
};

export default function withScreenDim(ComposedComponent) {
  return class WithScreenWidth extends React.Component {
    constructor(props) {
      super(props);

      this.state = { screenWidth: CSS_MOBILE, screenHeight: CSS_SHORT };

      this.handleMql = this.handleMql.bind(this);
    }

    componentDidMount() {
      this.mql = {};

      [minWidths, minHeights].forEach((spec, i) => {
        Object.keys(spec).forEach(key => {
          this.mql[key] =
            window.matchMedia &&
            window.matchMedia(
              `screen and (min-${i === 0 ? 'width' : 'height'}: ${spec[key]}px)`
            );

          if (this.mql[key]) {
            this.mql[key].addListener(this.handleMql);
          }
        });
      });

      this.handleMql();
    }

    componentWillUnmount() {
      Object.keys(this.mql).forEach(key => {
        if (this.mql[key]) {
          this.mql[key].removeListener(this.handleMql);
        }
      });
    }

    handleMql() {
      const [screenWidth = CSS_MOBILE, screenHeight = CSS_SHORT] = [
        minWidths,
        minHeights
      ].map(spec => {
        const sortedDims = Object.keys(spec).sort((a, b) => {
          return spec[b] - spec[a];
        });

        for (const dim of sortedDims) {
          if (this.mql[dim].matches) {
            return dim;
          }
        }
      });

      if (screenWidth !== this.state.screenWidth) {
        this.setState({ screenWidth });
      }
      if (screenHeight !== this.state.screenHeight) {
        this.setState({ screenHeight });
      }
    }

    render() {
      return <ComposedComponent {...this.props} {...this.state} />;
    }
  };
}
