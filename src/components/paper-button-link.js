import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Hyperlink from './hyperlink';
import classNames from 'classnames';

export default class PaperButtonLink extends PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    raised: PropTypes.bool,
    capsule: PropTypes.bool
  };

  static defaultProps = {
    raised: false,
    capsule: false
  };

  componentDidCatch(err, info) {
    console.error(err, info);
  }

  render() {
    const { className, children, raised, capsule, ...otherProps } = this.props;
    return (
      <Hyperlink
        className={classNames('paper-button-link', className, {
          'paper-button-link--flat': !raised,
          'paper-button-link--raised': raised,
          'paper-button-link--capsule': capsule
        })}
        {...otherProps}
      >
        {children}
      </Hyperlink>
    );
  }
}
