import React from 'react';
import { TimePicker } from '../../src/';

export default class TimePickerExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: new Date('1977-03-15T01:05:42.000')
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({ value });
  }

  render() {
    let { value } = this.state;
    return (
      <div className="example">
        <TimePicker value={value} onChange={this.handleChange} />
        <code>
          {value.toISOString()}
        </code>
      </div>
    );
  }
}
