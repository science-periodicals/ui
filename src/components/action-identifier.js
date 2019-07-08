import React from 'react';
import PropTypes from 'prop-types';

export default class ActionIdentifier extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired
  };

  render() {
    const { children } = this.props;

    return (
      <span className="action-identifier">
        <span className="action-identifier__symbol">﹟</span>
        <span className="action-identifier__id">{children}</span>
      </span>
    );
  }
}
