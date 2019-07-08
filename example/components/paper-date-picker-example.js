import React from 'react';
import moment from 'moment';
import { PaperDatePicker } from '../../src/';

export default class PaperDatePickerExample extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedDay: new Date('2019-04-11T18:16:34.535Z')
    };
    this.handleDayClick = this.handleDayClick.bind(this);
    this.isDaySelected = this.isDaySelected.bind(this);
  }

  handleDayClick(day) {
    this.setState({ selectedDay: day });
  }

  isDaySelected(day) {
    moment(this.state.selectedDay).isSame(day, 'day');
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          Note: the initialMonth prop is set to a date in the past to prevent
          false positives in backstop testing
        </div>
        <div className="example__row">
          <PaperDatePicker
            initialMonth={new Date('2019-1-1')}
            onDayClick={this.handleDayClick}
            selectedDays={this.isDaySelected}
            className="className-test"
          />
        </div>
      </div>
    );
  }
}
