import React from 'react';
import { SVGAnnotable } from '../../src/';

export default class SVGAnnotableExample extends React.Component {
  constructor() {
    super();
    this.state = {
      selectors: []
    };
    ['handleNewSelector', 'handleDelete'].forEach(
      meth => (this[meth] = this[meth].bind(this))
    );
  }
  handleNewSelector(sel) {
    let selectors = this.state.selectors.concat(sel);
    this.setState({ selectors });
  }
  handleDelete(sel) {
    let selectors = this.state.selectors.filter(s => s !== sel);
    this.setState({ selectors });
  }
  render() {
    return (
      <div className="example">
        <SVGAnnotable
          selectors={this.state.selectors}
          onSelectorAdded={this.handleNewSelector}
          onSelectorRemoved={this.handleDelete}
        >
          <img src="/components/hopless.png" alt="The Hopless Monster" />
        </SVGAnnotable>
        <p>
          This is a copy of the above, but with the image resized & distorted so
          that we can test paths scaling:
        </p>
        <SVGAnnotable selectors={this.state.selectors} readonly>
          <img
            src="/components/hopless.png"
            alt="The Hopless Monster"
            width="400"
            height="100"
          />
        </SVGAnnotable>
      </div>
    );
  }
}
