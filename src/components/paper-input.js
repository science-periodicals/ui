import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class PaperInput extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    defaultValue: PropTypes.string,
    error: PropTypes.string,
    floatLabel: PropTypes.bool,
    label: PropTypes.string.isRequired,
    large: PropTypes.bool,
    mustDisplayError: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onBlurCapture: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    autoFocus: PropTypes.bool,
    autoComplete: PropTypes.string,
    required: PropTypes.bool,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    pattern: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    'data-test-now': PropTypes.string
  };

  static defaultProps = {
    floatLabel: true,
    type: 'text'
  };

  constructor(props) {
    super(props);
    this._value =
      props.value != null
        ? props.value
        : props.defaultValue != null
        ? props.defaultValue
        : '';
    this.state = {
      touched: false,
      dirty: isDirty(this._value),
      focused: false
    };
    this.input = null;
    [
      'handleBlurCapture',
      'handleChange',
      'handleFocus',
      'handleKeyDown',
      'handleInputRef'
    ].forEach(meth => (this[meth] = this[meth].bind(this)));
  }

  componentWillReceiveProps(nextProps) {
    if (isDirty(nextProps.value)) {
      this._value = nextProps.value;
    }
    this.setState({
      dirty: isDirty(this._value)
    });
  }

  componentDidUpdate() {
    if (this.input) {
      this.input.setCustomValidity(
        this.shouldDisplayError() ? this.props.error : ''
      );
    }
  }

  getValue() {
    return this.input && this.input.value;
  }

  // convenience method to be called by a container component
  cancel() {
    if (this.input) {
      this.input.value = '';
    }
    this._value = '';
    this.setState({ dirty: false });
  }

  handleBlurCapture(e) {
    if (this.props.onBlurCapture) this.props.onBlurCapture(e);
    this.setState({ dirty: isDirty(this._value), focused: false });
  }

  handleChange(e) {
    this._value = e.target.value;
    if (this.props.onChange) this.props.onChange(e);
    this.setState({ dirty: isDirty(this._value) });
  }

  handleFocus(e) {
    if (this.props.onFocus) this.props.onFocus(e);
    this.setState({ touched: true, focused: true });
  }

  handleKeyDown(e) {
    if (this.props.onKeyDown) this.props.onKeyDown(e);
    if (!this.state.touched) this.setState({ touched: true });
  }

  handleInputRef(ref) {
    this.input = ref;
  }

  getInputRef() {
    return this.input;
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  shouldDisplayError() {
    return (
      this.props.error &&
      ((this.state.touched && this.state.dirty) || this.props.mustDisplayError)
    );
  }

  render() {
    const {
      floatLabel,
      className,
      label,
      error,
      large,
      name,
      autoFocus,
      onClick,
      value,
      placeholder,
      type,
      required,
      defaultValue,
      disabled,
      readOnly,
      autoComplete,
      id,
      min,
      max,
      step,
      pattern
    } = this.props;

    const inputProps = {
      name,
      autoComplete,
      autoFocus,
      onClick,
      value,
      placeholder,
      type,
      required,
      defaultValue,
      readOnly,
      min,
      max,
      step,
      pattern,
      'data-test-now': this.props['data-test-now']
    };

    Object.keys(this.props).forEach(p => {
      if (p.startsWith('on') && p !== 'onResize') {
        //pass down all the event handlers
        inputProps[p] = this.props[p];
      }
    });

    const containerProps = {};
    if (id) {
      containerProps.id = id;
    }

    const { dirty, touched, focused } = this.state;
    const containerClassNames = classnames({
      'paper-input': true,
      'float-label': !!floatLabel,
      'paper-input--read-only': this.props.readOnly,
      big: large,
      [className]: !!className
    });
    const inputClassNames = classnames({ dirty, touched });

    if (inputProps.placeholder && !focused) {
      delete inputProps.placeholder;
    }

    return (
      <div {...containerProps} className={containerClassNames}>
        <input
          {...inputProps}
          ref={this.handleInputRef}
          className={inputClassNames}
          onBlurCapture={this.handleBlurCapture}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          disabled={disabled || readOnly}
        />
        <label htmlFor={inputProps.name}>{label}</label>
        <span className="border-line" />
        {this.shouldDisplayError() && <span className="error">{error}</span>}
      </div>
    );
  }
}

function isDirty(value) {
  // !! 0 => dirty
  return value != null && value !== '';
}
