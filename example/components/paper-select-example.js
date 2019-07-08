import React, { Component } from 'react';
import { PaperSelect } from '../../src/';

export default class PaperSelectExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      normal: 'option2',
      portal: 'option2'
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    console.log(
      'handleChange',
      e.target.name,
      e.target.value,
      e.target.selectedIndex,
      e.target.selectedOptions
    );
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <PaperSelect
            label="Non-Float Label"
            className="example__paper-select"
            onChange={e =>
              console.log('Paper Select: ', e.nativeEvent.target.selectedIndex)
            }
            floatLabel={false}
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>

          <PaperSelect
            label="Float Label w Value"
            className="example__paper-select"
            defaultValue="option2"
            onChange={e =>
              console.log('Paper Select: ', e.nativeEvent.target.selectedIndex)
            }
            portal={false}
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>

          <PaperSelect
            label="Required Float Label w Value"
            className="example__paper-select"
            defaultValue="option2"
            required={true}
            onChange={e =>
              console.log('Paper Select: ', e.nativeEvent.target.selectedIndex)
            }
            portal={false}
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>
        </div>

        <div className="example__row">
          <PaperSelect
            label="No portal controled"
            className="example__paper-select"
            name="normal"
            value={this.state.normal}
            onChange={this.handleChange}
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>

          <PaperSelect
            label="Portal"
            className="example__paper-select"
            defaultValue="option2"
            onChange={e =>
              console.log('Paper Select: ', e.nativeEvent.target.selectedIndex)
            }
            portal={true}
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>
        </div>

        <div className="example__row">
          <PaperSelect
            label="Portal With long label"
            className="example__paper-select"
            portal={true}
            onChange={e =>
              console.log(
                'TW Paper Select: ',
                e.nativeEvent.target.selectedIndex
              )
            }
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>

          <PaperSelect
            label="Multiple"
            className="example__paper-select"
            multiple={true}
            onChange={e =>
              console.log(
                'TW Paper Select: ',
                e.nativeEvent.target.selectedIndex,
                e.nativeEvent.target.selectedOptions
              )
            }
          >
            <option selected={true} value="option1">
              option A
            </option>
            <option selected={true} value="option2">
              option B
            </option>
            <option value="option3">option three</option>
          </PaperSelect>

          <PaperSelect
            label="Portal controled"
            className="example__paper-select"
            portal={true}
            name="portal"
            value={this.state.portal}
            onChange={this.handleChange}
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>
        </div>

        <div className="example__row">
          <PaperSelect
            label="Disabled"
            className="example__paper-select"
            portal={true}
            disabled={true}
            onChange={e =>
              console.log(
                'TW Paper Select: ',
                e.nativeEvent.target.selectedIndex
              )
            }
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>
          <PaperSelect
            label="Disabled"
            className="example__paper-select"
            portal={true}
            disabled={true}
            value="option2"
            onChange={e =>
              console.log(
                'TW Paper Select: ',
                e.nativeEvent.target.selectedIndex
              )
            }
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>
          <PaperSelect
            label="Read Only Label"
            className="example__paper-select"
            portal={true}
            readOnly={true}
            value="option2"
          >
            <option value="option1">option A</option>
            <option value="option2">option B</option>
            <option value="option3">option three</option>
          </PaperSelect>
        </div>
        <div className="example__row">
          <select size="3">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>

          <select>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3 longer</option>
          </select>

          <select multiple>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3 longer</option>
          </select>
        </div>
      </div>
    );
  }
}
