import React from 'react';

import PropTypes from 'prop-types';

export default function HeaderSearchRight({ children }) {
  return (
    <div className="header-search__right-children">
      {children}
    </div>
  );
}

HeaderSearchRight.propTypes = {
  children: PropTypes.node
};
