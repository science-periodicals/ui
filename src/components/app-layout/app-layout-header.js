import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BemTags from '../../utils/bem-tags';
import { CSS_SHORT, CSS_TALL } from '../../constants';

export default class AppLayoutHeader extends Component {
  static propTypes = {
    children: PropTypes.node,
    hidden: PropTypes.bool
  };

  render() {
    const bem = BemTags('app-layout');
    let { children, hidden } = this.props;

    const style = {
      top: hidden ? `-56px` : '0',
      position: 'fixed'
    };

    return (
      <div className={bem`__header`} style={style}>
        {children}
      </div>
    );
  }
}
