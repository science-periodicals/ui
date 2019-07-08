import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import onClickOutside from 'react-onclickoutside';

class _onClickOutWrapper extends PureComponent {
  constructor(...args) {
    super(...args);
  }

  handleClickOutside(e) {
    this.props.handleClickOutside(e);
  }

  render() {
    let { children, elementType: TagName, id, className } = this.props;
    return (
      <TagName id={id} className={className}>
        {children}
      </TagName>
    );
  }
}

_onClickOutWrapper.defaultProps = {
  handleClickOutside: noop,
  elementType: 'div'
};

_onClickOutWrapper.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  handleClickOutside: PropTypes.func,
  elementType: PropTypes.string
};

export default onClickOutside(_onClickOutWrapper);
