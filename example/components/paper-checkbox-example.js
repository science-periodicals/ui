import React from 'react';
import { PaperCheckbox } from '../../src/';

export default class PaperCheckboxButtonExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      disabledChecked: false,
      lightChecked: false
    };
  }

  handleOnClick() {
    console.log('handleOnClick');
    this.setState({
      checked: !this.state.checked
    });
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <PaperCheckbox
            id="active"
            checked={this.state.checked}
            onClick={() => this.setState({ checked: !this.state.checked })}
          >
            active
          </PaperCheckbox>
          <PaperCheckbox
            id="disabled"
            checked={this.state.disabledChecked}
            onClick={() =>
              this.setState({ disabledChecked: !this.state.disabledChecked })
            }
            disabled={true}
          >
            disabled
          </PaperCheckbox>
          <PaperCheckbox
            id="disabled"
            checked={true}
            onClick={() =>
              this.setState({ disabledChecked: !this.state.disabledChecked })
            }
            disabled={true}
          >
            disabled checked
          </PaperCheckbox>
          <PaperCheckbox
            id="readonly"
            checked={true}
            onClick={() =>
              this.setState({ disabledChecked: !this.state.disabledChecked })
            }
            readOnly={true}
          >
            readonly checked
          </PaperCheckbox>
        </div>
        <div className="example__row">
          <PaperCheckbox
            id="light"
            theme="light"
            checked={this.state.lightChecked}
            onClick={() =>
              this.setState({ lightChecked: !this.state.lightChecked })
            }
          >
            Light Theme
          </PaperCheckbox>
          <PaperCheckbox
            id="light"
            theme="light"
            checked={true}
            disabled={true}
          >
            Light Disabled Checked
          </PaperCheckbox>
          <PaperCheckbox
            id="light"
            theme="light"
            checked={false}
            disabled={true}
          >
            Light Disabled Unchecked
          </PaperCheckbox>
        </div>
        <div className="example__row">
          <PaperCheckbox
            id="light"
            theme="light"
            checked={true}
            readOnly={true}
          >
            Light Readonly Checked
          </PaperCheckbox>
          <PaperCheckbox
            id="light"
            theme="light"
            checked={false}
            readOnly={true}
          >
            Light Readonly Unchecked
          </PaperCheckbox>
        </div>
      </div>
    );
  }
}
