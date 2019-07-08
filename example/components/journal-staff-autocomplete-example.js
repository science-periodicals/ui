/* eslint no-console: 0 */

import React, { Component } from 'react';
import { JournalStaffAutocomplete } from '../../src/';
import periodical from '../../test/fixtures/periodical';

export default class JournalStaffAutocompleteExample extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(value, item) {
    console.log('submit', value, item);
    if (value) {
      this.autocomplete.reset();
    }
  }

  render() {
    return (
      <div className="example" style={{ minHeight: '500px' }}>
        <JournalStaffAutocomplete
          ref={el => (this.autocomplete = el)}
          periodical={periodical}
          roleName="editor"
          name="user"
          label="Search by username or title"
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
