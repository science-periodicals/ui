import React from 'react';

import PropTypes from 'prop-types';

export default function HeaderSearchLeft({ children }) {
  return (
    <div className="header-search__left-children">
      {children}
    </div>
  );
}

HeaderSearchLeft.propTypes = {
  children: PropTypes.node
};
