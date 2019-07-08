import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class PaperTextarea extends React.Component {
  constructor(props) {
    super(props);
    this._value = props.value || props.defaultValue || '';
    this.state = {
      touched: false,
      dirty: !!this._value,
      focused: false
    };
    [
      'handleBlurCapture',
      'handleChange',
      'handleFocus',
      'handleKeyDown',
      'recalculateSize'
    ].forEach(meth => (this[meth] = this[meth].bind(this)));
    this.$el = null;
    this.height = 0;
  }

  componentDidMount() {
    this.height = this.recalculateSize();
    window.addEventListener('resize', this.recalculateSize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value != null) this._value = nextProps.value;
    this.setState({ dirty: !!this._value });
  }

  componentDidUpdate() {
    this.height = this.recalculateSize();
    let textarea = this.$el;
    if (this.shouldDisplayError()) textarea.setCustomValidity(this.props.error);
    else textarea.setCustomValidity('');
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateSize);
  }

  getValue() {
    return this.$el.value;
  }

  focus() {
    this.$el.focus();
  }

  blur() {
    this.$el.blur();
  }

  cancel() {
    this.$el.value = '';
    this.setState({ dirty: false });
  }

  handleBlurCapture(e) {
    if (this.props.onBlurCapture) this.props.onBlurCapture(e);
    this.setState({ dirty: !!this._value, focused: false });
  }

  handleChange(e) {
    this._value = e.target.value;
    let prevHeight = this.height;
    let height = (this.height = this.recalculateSize());
    if (this.props.onChange) this.props.onChange(e);
    if (this.props.onResize && prevHeight !== height)
      this.props.onResize(height, prevHeight);
    this.setState({ dirty: !!this._value });
  }

  handleFocus(e) {
    if (this.props.onFocus) this.props.onFocus(e);
    this.setState({ touched: true, focused: true });
  }

  handleKeyDown(e) {
    if (this.props.onKeyDown) this.props.onKeyDown(e);
    if (!this.state.touched) this.setState({ touched: true });
  }

  recalculateSize() {
    let diff = 0;
    let $textarea = this.$el;
    $textarea.style.height = 'auto';
    const height = $textarea.scrollHeight - diff;
    if (height > 0) {
      $textarea.style.height = $textarea.scrollHeight - diff + 'px';
    }
    return $textarea.scrollHeight - diff;
  }

  shouldDisplayError() {
    return (
      this.props.error &&
      ((this.state.touched && this.state.dirty) || this.props.mustDisplayError)
    );
  }

  render() {
    let {
      id,
      floatLabel,
      className,
      label,
      error,
      name,
      placeholder,
      required,
      rows,
      large,
      onResize,
      mustDisplayError,
      disabled,
      readOnly,
      ...textareaProps
    } = this.props;
    const containerProps = {};
    if (id) {
      containerProps.id = id;
    }

    const { dirty, touched, focused } = this.state;
    const containerClassNames = classnames({
      'paper-textarea': true,
      'float-label': !!floatLabel,
      'paper-textarea--read-only': this.props.readOnly,
      'paper-textarea--disabled': this.props.disabled,
      [className]: !!className,
      big: large
    });
    const textareaClassNames = classnames({
      dirty,
      touched
    });

    if (placeholder && !focused) placeholder = undefined;

    return (
      <div className="paper-textarea-container">
        <div {...containerProps} className={containerClassNames}>
          <textarea
            {...textareaProps}
            name={name}
            placeholder={placeholder}
            required={required}
            ref={el => (this.$el = el)}
            className={textareaClassNames}
            rows="1"
            onBlurCapture={this.handleBlurCapture}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onKeyDown={this.handleKeyDown}
            disabled={disabled || readOnly}
            readOnly={readOnly}
          />
          <label htmlFor={name} ref={el => (this.$label = el)}>
            {label}
          </label>
          <span className="border-line" />
          <span
            className={`error ${
              this.shouldDisplayError() ? 'error--active' : 'error--inactive'
            }`}
          >
            {this.shouldDisplayError() && error}
          </span>
        </div>
      </div>
    );
  }
}

PaperTextarea.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  defaultValue: PropTypes.string,
  error: PropTypes.string,
  floatLabel: PropTypes.bool,
  label: PropTypes.string.isRequired,
  mustDisplayError: PropTypes.bool,
  name: PropTypes.string.isRequired,
  rows: PropTypes.number, // currently not supported as it creates issue with the height computation... TODO fix
  onBlurCapture: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onResize: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  value: PropTypes.string,
  large: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool
};
PaperTextarea.defaultProps = {
  floatLabel: true,
  large: false,
  disabled: false,
  readOnly: false
};
