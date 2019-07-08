import React, { Component } from 'react';
import PropTypes from 'prop-types';

const ENTER_KEY_CODE = 13;

export default function withOnSubmit(ComposedComponent) {
  return class WithOnSubmit extends Component {
    static propTypes = {
      value: PropTypes.any,
      onSubmit: PropTypes.func,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      onKeyDown: PropTypes.func,
      error: PropTypes.string
    };

    constructor(props) {
      super(props);
      this.state = {
        value: props.value,
        lastValue: props.value
      };
    }

    static getDerivedStateFromProps(props, state) {
      if (props.value !== state.lastValue) {
        return { value: props.value, lastValue: props.value };
      }
      return null;
    }

    handleChange(e) {
      if (
        this.props.onSubmit &&
        e.target.tagName === 'SELECT' &&
        this.props.value !== e.target.value
      ) {
        this.props.onSubmit(e);
      }
      this.setState({ value: e.target.value });

      if (this.props.onChange) {
        this.props.onChange(e);
      }
    }

    handleBlur(e) {
      if (
        this.props.onSubmit &&
        (this.props.error || this.props.value !== e.target.value) // if there is an error we allow to resubmit the same value (so that the error can be cleared)
      ) {
        this.props.onSubmit(e);
      }

      if (this.props.onBlur) {
        this.props.onBlur(e);
      }
    }

    handleKeyDown(e) {
      if (e.keyCode === ENTER_KEY_CODE) {
        // TEXTAREA resize when enter is pressed
        if (
          this.props.onSubmit &&
          e.target.tagName === 'INPUT' &&
          this.props.value !== e.target.value
        ) {
          this.props.onSubmit(e);
        }
      }

      if (this.props.onKeyDown) {
        this.props.onKeyDown(e);
      }
    }

    render() {
      return (
        <ComposedComponent
          {...this.props}
          value={this.state.value}
          onChange={this.handleChange.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
        />
      );
    }
  };
}
