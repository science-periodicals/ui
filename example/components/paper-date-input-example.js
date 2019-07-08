import React from 'react';
import moment from 'moment';
import { PaperDateInput } from '../../src/';

export default class PaperDateInputExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date('2019-04-11T18:16:34.535Z')
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(date) {
    console.log('change: ', date);
    this.setState({ date });
  }

  handleSubmit(date) {
    console.log('submit', date);
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <PaperDateInput
            value={this.state.date}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
            selectedDays={day => moment(this.state.date).isSame(day, 'day')}
            name="time"
            label="Time"
            portal={true}
          />
          <PaperDateInput
            value={this.state.date}
            selectedDays={day => moment(this.state.date).isSame(day, 'day')}
            name="time"
            label="Time"
            portal={true}
          />
        </div>
      </div>
    );
  }
}
