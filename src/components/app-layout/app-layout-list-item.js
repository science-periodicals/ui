import React from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';

export default function AppLayoutListItem(props) {
  return <div className="app-layout__list-item">{props.children}</div>;
}

AppLayoutListItem.propTypes = {
  children: PropTypes.any
};
