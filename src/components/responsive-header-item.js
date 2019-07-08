import React from 'react';

import PropTypes from 'prop-types';

export default function ResponsiveHeaderItem({ children }) {
  return (
    <div className="header__responsive-child-item">
      {children}
    </div>
  );
}

ResponsiveHeaderItem.propTypes = {
  children: PropTypes.node
};
