import React, { Component } from 'react';
import { LicenseAutocomplete } from '../../src/';

export default class LicenseAutocompleteExample extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(value, item) {
    console.log('submit', value, item);
    if (item) {
      this.autocomplete.reset();
    }
  }

  render() {
    return (
      <div className="example">
        <LicenseAutocomplete
          ref={el => (this.autocomplete = el)}
          name="license"
          label="Search license language or enter URL"
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
