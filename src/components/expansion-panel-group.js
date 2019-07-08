import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import BemTags from '../utils/bem-tags';
import classNames from 'classnames';

export default class ExpansionPanelGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeChild: props.activeChild
    };
  }

  handleChange(isExpanded, index) {
    this.setState({
      activeChild: isExpanded === true ? index : -1
    });
    this.props.onChange(isExpanded, index);
  }

  render() {
    const bem = BemTags();
    return (
      <div
        className={classNames(this.props.className, bem`expansion-panel-flow`)}
      >
        {React.Children.map(this.props.children, (child, i) => {
          const myProps = {
            onChange: isExpanded => this.handleChange(isExpanded, i),
            expanded: this.state.activeChild === i
          };
          return React.cloneElement(child, myProps);
        })}
      </div>
    );
  }
}

ExpansionPanelGroup.defaultProps = {
  onChange: noop,
  activeChild: -1
};

ExpansionPanelGroup.propTypes = {
  children: PropTypes.node,
  onChange: PropTypes.func,
  className: PropTypes.string,
  activeChild: PropTypes.number
};
