import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

export default class TabsItem extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired, // used by `Tabs` (parent component)
    disabled: PropTypes.bool, // used by `Tabs` (parent component)
    onClick: PropTypes.func, // will be called by `Tabs` (parent component)
    children: PropTypes.node
  };

  static defaultProps = {
    disabled: false,
    onClick: noop
  };

  render() {
    const { children } = this.props;
    return <div className="tabs__tab-content">{children}</div>;
  }
}
