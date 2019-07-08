/* eslint no-alert: 0 */

import React from 'react';
import { ColorPicker } from '../../src/';

export default class ColorPickerExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: '#f47373',
      accentColor: '#1ee9a4',
      bwColor: '#000',
      journalName: 'Hash String Test'
    };
  }
  handleInputRef(inputRef) {
    this.inputRef = inputRef;
  }

  handleInputChange(e) {
    let name = this.inputRef.value;
    console.log('change: ', name);
    this.setState({ journalName: name });
  }

  handleBadgeColorChange(color) {
    console.log('handleBadgeColorChange', color);
  }
  render() {
    return (
      <div className="example">
        <div className="example__row">
          <input
            type="text"
            onChange={e => this.handleInputChange(e)}
            ref={me => this.handleInputRef(me)}
            value={this.state.journalName}
          />
        </div>
        <div className="example__row">
          <ColorPicker
            onChange={(c, e) => {
              console.log('onchange', c, e);
            }}
            id="color0"
            color={this.state.color}
            className="custom-class"
            label="Badge Color A"
            paletteHashSeed={this.state.journalName}
          />
          <ColorPicker
            id="color1"
            complimentColor={this.state.color}
            label="Compliment Color"
            color={this.state.color}
          />
          <ColorPicker
            id="color2"
            disabled
            label="Disabled"
            color={this.state.color}
          />
        </div>

        <div className="example__row">
          <ColorPicker
            id="color3"
            swatchSize={24}
            complimentColor={this.state.color}
            label="Accent Color"
            color={this.state.accentColor}
            onChange={color => {
              this.setState({ accentColor: color });
            }}
            palette={['#42A5F5']}
          />
          <ColorPicker
            id="color4"
            swatchSize={24}
            readOnly
            label="Read Only"
            color={this.state.accentColor}
          />
          <ColorPicker
            id="color5"
            swatchSize={24}
            disabled
            label="Disabled"
            color={this.state.accentColor}
          />
        </div>

        <div className="example__row">
          <ColorPicker
            id="color6"
            swatchSize={24}
            label="Limited Color"
            showAlpha={false}
            palette={['#000', '#FFF']}
            color={this.state.bwColor}
            allowCustom={false}
            onChange={color => {
              this.setState({ bwColor: color });
            }}
          />
          <ColorPicker
            id="color7"
            swatchSize={24}
            readOnly
            label="Read Only"
            color={this.state.bwColor}
          />
          <ColorPicker
            id="color8"
            swatchSize={24}
            disabled
            label="Disabled"
            color={this.state.bwColor}
          />
        </div>
      </div>
    );
  }
}
