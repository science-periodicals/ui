import React, { Component } from 'react';
import { JournalAutocomplete } from '../../src/';

export default class JournalAutocompleteExample extends Component {
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
        <JournalAutocomplete
          ref={el => (this.autocomplete = el)}
          defaultValue="Critical Social Policy"
          username="uiuser"
          name="journal"
          label="Search by journal name, url, issn or doi"
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
