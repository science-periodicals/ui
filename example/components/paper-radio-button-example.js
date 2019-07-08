import React from 'react';
import { PaperRadioButton } from '../../src/';

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

  handleOnClick() {
    console.log('handleOnClick');
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
        <div>
          <PaperRadioButton
            id="option-a"
            checked={this.state.option === 'A'}
            onChange={this.handleOnChange}
            value="A"
          >
            A
          </PaperRadioButton>
          <br />
          <PaperRadioButton
            id="option-b"
            checked={this.state.option === 'B'}
            onChange={this.handleOnChange}
            value="B"
          >
            B
          </PaperRadioButton>
          <br />
          <PaperRadioButton
            id="option-c"
            checked={this.state.option === 'C'}
            onChange={this.handleOnChange}
            value="C"
          >
            C
          </PaperRadioButton>
        </div>

        <div style={{ marginTop: '50px' }}>
          <PaperRadioButton
            id="1234"
            checked={this.state.checked}
            onClick={this.handleOnClick}
            disabled={true}
          >
            Radio children (disabled)
          </PaperRadioButton>
        </div>
      </div>
    );
  }
}
