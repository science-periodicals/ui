import React from 'react';
import { PaperTimeInput, MenuItem } from '../../src/';

export default class PaperTimeInputExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: new Date('2019-04-11T18:16:34.535Z')
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(time) {
    console.log(time);
    this.setState({ time });
  }

  handleSubmit(time) {
    console.log('submit', time);
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <PaperTimeInput
            value={this.state.time}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
            name="time"
            label="Time"
          >
            <MenuItem value="09:00">
              <span style={{ color: 'grey' }}>09:00 AM </span> Morning
            </MenuItem>
            <MenuItem value="12:00">
              <span style={{ color: 'grey' }}>12:00 PM </span> Afternoon
            </MenuItem>
            <MenuItem value="18:00">
              <span style={{ color: 'grey' }}>06:00 PM </span> Evening
            </MenuItem>
          </PaperTimeInput>
          <PaperTimeInput
            value={this.state.time}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
            name="time"
            label="Time"
            portal={true}
          >
            <MenuItem value="09:00">
              <span style={{ color: 'grey' }}>09:00 AM </span> Morning
            </MenuItem>
            <MenuItem value="12:00">
              <span style={{ color: 'grey' }}>12:00 PM </span> Afternoon
            </MenuItem>
            <MenuItem value="18:00">
              <span style={{ color: 'grey' }}>06:00 PM </span> Evening
            </MenuItem>
          </PaperTimeInput>
        </div>
      </div>
    );
  }
}
