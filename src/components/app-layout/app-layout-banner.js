import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import BemTags from '../../utils/bem-tags';

export default class AppLayoutBanner extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const bem = BemTags('app-layout');
    // note: we want the menu to overlap the banner area so that when the menu hides, the banner bg is visible behind.
    // adjusting the top padding or margin will cause race condition with the scroll monitor in app-layout.

    let { _passedRef, children } = this.props;

    return (
      <div className={bem`__banner`} ref={_passedRef}>
        {children}
      </div>
    );
  }
}

AppLayoutBanner.propTypes = {
  children: PropTypes.node,
  _passedRef: PropTypes.object
};
