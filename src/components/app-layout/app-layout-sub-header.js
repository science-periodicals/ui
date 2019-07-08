import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AppLayoutContext } from './app-layout';
class _AppLayoutSubHeader extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    let { _passedRef, children, menubarHidden } = this.props;
    const style = { top: menubarHidden ? '0' : '5.6rem' };
    return (
      <div style={style} className="app-layout__sub-header" ref={_passedRef}>
        {children}
      </div>
    );
  }
}

_AppLayoutSubHeader.propTypes = {
  children: PropTypes.node,
  _passedRef: PropTypes.object,
  // AppLayoutContext props below:
  menubarHidden: PropTypes.bool
};

export default function AppLayoutSubHeader(props) {
  return (
    <AppLayoutContext.Consumer>
      {({ menubarHidden, headerHeight, handleHeaderHeightChange }) => {
        return (
          <_AppLayoutSubHeader
            {...props}
            menubarHidden={menubarHidden}
            headerHeight={headerHeight}
            onHeaderHeightChange={handleHeaderHeightChange}
          />
        );
      }}
    </AppLayoutContext.Consumer>
  );
}
