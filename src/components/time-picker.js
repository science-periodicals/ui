import React from 'react';
import PropTypes from 'prop-types';
import padStart from 'lodash/padStart';

export default class TimePicker extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      date: props.value || props.defaultValue || new Date()
    };
    [
      'handleHoursChange',
      'handleMinutesChange',
      'handleHoursKeyDown',
      'handleMinutesKeyDown'
    ].forEach(meth => (this[meth] = this[meth].bind(this)));
  }

  handleHoursChange(ev) {
    let hours;
    let goToMins = false;
    if (ev.target) {
      // came from onChange event
      let inputStr = ev.target.value.trim();
      hours = inputStr == null || inputStr == '' ? 0 : parseInt(inputStr, 10);
      hours = isNaN(hours) ? 0 : hours;
      goToMins = ev.target.value.length > 2;
    } else {
      // came from handleKeyDown
      hours = ev;
    }

    if (hours < 0) hours = 0;
    else if (hours > 23) hours = 23;
    let d = new Date(this.state.date.getTime());
    d.setHours(hours);
    this.setState({ date: d });
    this.props.onChange(d);
    if (goToMins) {
      this.minInput.focus();
      this.minInput.select();
    }
  }

  handleMinutesChange(ev) {
    let minutes;

    if (ev.target) {
      let inputStr = ev.target.value.trim();
      minutes = inputStr == null || inputStr == '' ? 0 : parseInt(inputStr, 10);
      minutes = isNaN(minutes) ? 0 : minutes;
      let minutesStr = minutes.toString();
      minutes =
        minutesStr.length > 2
          ? parseInt(minutesStr.substring(0, 2), 10)
          : minutes;
    } else {
      minutes = ev;
    }

    if (minutes < 0) minutes = 0;
    else if (minutes > 59) minutes = 59;
    let d = new Date(this.state.date.getTime());
    d.setMinutes(minutes);
    this.setState({ date: d });
    this.props.onChange(d);
  }

  handleHoursKeyDown({ key }) {
    if (key === 'ArrowUp')
      this.handleHoursChange(this.state.date.getHours() + 1);
    if (key === 'ArrowDown')
      this.handleHoursChange(this.state.date.getHours() - 1);
  }

  handleMinutesKeyDown({ key }) {
    if (key === 'ArrowUp')
      this.handleMinutesChange(this.state.date.getMinutes() + 5);
    if (key === 'ArrowDown')
      this.handleMinutesChange(this.state.date.getMinutes() - 5);
  }

  render() {
    let { date } = this.state,
      { disabled = false } = this.props;
    return (
      <div className="time-picker">
        <input
          type="text"
          value={padStart(date.getHours(), 2, '0')}
          onChange={this.handleHoursChange}
          onKeyDown={this.handleHoursKeyDown}
          disabled={disabled}
          className="time-picker__hours"
          ref={input => {
            this.hourInput = input;
          }}
          onClick={() => this.hourInput.select()}
        />
        :
        <input
          type="text"
          value={padStart(date.getMinutes(), 2, '0')}
          onChange={this.handleMinutesChange}
          onKeyDown={this.handleMinutesKeyDown}
          disabled={disabled}
          className="time-picker__minutes"
          ref={input => {
            this.minInput = input;
          }}
          onClick={() => this.minInput.select()}
          maxLength={3}
        />
        <div className="time-picker__focus-line" />
      </div>
    );
  }
}

const { object, func, bool } = PropTypes;
TimePicker.propTypes = {
  value: object,
  defaultValue: object,
  onChange: func.isRequired,
  disabled: bool
};
