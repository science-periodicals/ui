import React, { Component } from 'react';
import { UserAutocomplete } from '../../src/';

export default class UserAutocompleteExample extends Component {
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
      <div className="example">
        <UserAutocomplete
          ref={el => (this.autocomplete = el)}
          name="user"
          label="Search by username, full name or email address"
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
