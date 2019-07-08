import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import BemTags from '../utils/bem-tags';

export default class StepperItem extends Component {
  static defaultProps = {
    completed: false,
    disabled: false,
    editable: true,
    active: false,
    progressMode: 'none',
    button: false,
    onClick: noop,
    statusIconName: undefined
  };

  static propTypes = {
    completed: PropTypes.bool,
    disabled: PropTypes.bool,
    editable: PropTypes.bool,
    waiting: PropTypes.bool,
    children: PropTypes.node,
    title: PropTypes.string,
    button: PropTypes.bool,
    icon: PropTypes.string,
    statusIconName: PropTypes.string,
    progressMode: PropTypes.oneOf([
      'up',
      'down',
      'spinUp',
      'spinDown',
      'bounce',
      'none'
    ]),
    onClick: PropTypes.func
  };

  render() {
    let { children, completed, disabled } = this.props;

    const bem = BemTags('stepper');

    return (
      <div
        className={bem`step-content --${
          completed ? 'complete' : 'incomplete'
        } --${disabled ? 'disabled' : 'enabled'}`}
      >
        {children}
      </div>
    );
  }
}
