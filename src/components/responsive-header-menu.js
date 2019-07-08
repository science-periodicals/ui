import React from 'react';

import PropTypes from 'prop-types';

export default function ResponsiveHeaderMenu({ children }) {
  console.log('ResponsiveHeaderMenu');
  return <div className="header__responsive-child-menu">{children}</div>;
}

ResponsiveHeaderMenu.propTypes = {
  children: PropTypes.node
};
