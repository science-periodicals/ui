import React from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';

export default class MenuHead extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const bem = BemTags();
    return <div className={bem`menu-head`}>{this.props.children}</div>;
  }
}

MenuHead.propTypes = {
  children: PropTypes.node
};
