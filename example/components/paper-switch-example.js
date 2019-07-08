import React from 'react';
import Iconoclass from '@scipe/iconoclass';
import { PaperSwitch } from '../../src/';

export default class PaperRadioButtonExample extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.state = {
      checked: false,
      option: 'A'
    };
  }

  handleOnClick(isChecked, e) {
    console.log('handleOnClick', isChecked);
    this.setState({
      checked: !this.state.checked
    });
  }

  handleOnChange(value) {
    console.log(`handleOnChange: value=${value}`);
    this.setState({
      option: value
    });
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <PaperSwitch
            id="123"
            checked={this.state.checked}
            onClick={this.handleOnClick}
            value="the value"
          >
            <Iconoclass
              iconName="personRound"
              size="15px"
              color="rgba(0,0,0,.6)"
            />
          </PaperSwitch>
          <PaperSwitch
            id="123"
            checked={true}
            onClick={this.handleOnClick}
            value="the value"
            disabled={true}
          />
          <PaperSwitch
            id="123"
            checked={false}
            onClick={this.handleOnClick}
            value="the value"
            disabled={true}
          />
        </div>
        <div className="example__row" style={{ height: '500px' }} />
      </div>
    );
  }
}
