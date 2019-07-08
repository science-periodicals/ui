import React from 'react';
import PropTypes from 'prop-types';

export default function withDomSpy(ComposedComponent) {
  return class DomSpied extends React.PureComponent {
    static propTypes = {
      onUpdate: PropTypes.func.isRequired
    };

    componentDidMount() {
      if (this.$root) {
        this.props.onUpdate(this.$root);
      }
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.$root) {
        this.props.onUpdate(this.$root);
      }
    }

    setRef = $el => {
      this.$root = $el;
    };

    render() {
      return (
        <div ref={this.setRef}>
          <ComposedComponent {...this.props} />
        </div>
      );
    }
  };
}
