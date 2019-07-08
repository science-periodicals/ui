import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';

export default function WithAttr(ComposedComponent) {
  class Customized extends React.PureComponent {
    setAttr() {
      const $root = findDOMNode(this);

      for (let attrName in this.props.attributes) {
        if (!$root.getAttribute(attrName)) {
          $root.setAttribute(attrName, this.props.attributes[attrName]);
        }
      }
    }

    componentDidMount() {
      this.setAttr();
    }

    componentDidUpdate() {
      this.setAttr();
    }

    render() {
      return <ComposedComponent {...this.props} />;
    }
  }

  Customized.propTypes = {
    attributes: PropTypes.object
  };

  return Customized;
}
