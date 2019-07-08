import React, { Component } from 'react';
import { ProgrammingLanguageAutocomplete } from '../../src/';

export default class ProgrammingLanguageAutocompleteExample extends Component {
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
        <ProgrammingLanguageAutocomplete
          ref={el => (this.autocomplete = el)}
          name="programmingLanguage"
          label="Search programming language"
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
