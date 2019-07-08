import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';

const bem = BemTags('app-layout');

export default class AppLayoutFooter extends Component {
  render() {
    return (
      <div className={bem`__footer ${this.props.sticky ? '--sticky' : ''}`}>
        {this.props.children}
      </div>
    );
  }
}

AppLayoutFooter.defaultProps = {
  sticky: false
};

AppLayoutFooter.propTypes = {
  children: PropTypes.node,
  sticky: PropTypes.bool
};
