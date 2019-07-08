/* eslint-disable no-console */

import React, { Component } from 'react';
import { CountriesAutocomplete } from '../../src/';

export default class CountriesAutocompleteExample extends Component {
  constructor(props) {
    super(props);
    this.state = { item: { code: 'XX', name: '<none>' } };
    ['handleSubmit', 'handleChange'].forEach(
      meth => (this[meth] = this[meth].bind(this))
    );
  }

  handleChange(value, item) {
    console.log('change', value, item);
  }

  handleSubmit(value, item) {
    if (item) {
      this.setState({ item });
      console.log('submit', value, item);
    }
  }

  render() {
    return (
      <div className="example">
        <CountriesAutocomplete
          ref={el => (this.autocomplete = el)}
          name="country"
          label="Search countries"
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        />
        <p>
          Selected: <strong>{this.state.item.code}</strong>{' '}
          {this.state.item.name}
        </p>
      </div>
    );
  }
}
