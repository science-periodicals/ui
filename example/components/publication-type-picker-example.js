import React, { Component } from 'react';
import { PublicationTypePicker } from '../../src/';

export default class PublicationTypePickerExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: publicationTypes[0]['@id']
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    console.log(value);
    this.setState({ value });
  }

  render() {
    const { value } = this.state;
    return (
      <div className="example">
        <PublicationTypePicker
          value={value}
          periodical={{ url: 'http://example.com' }}
          publicationTypes={publicationTypes}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

var publicationTypes = [
  {
    '@id': 'type:1',
    '@type': 'publicationType',
    name: 'Research Article',
    description:
      'Authors wishing to submit suggestions or synopses for articles in any of these categories should first read the relevant part of the guide to authors on the website of the journal to which they wish to submit',
    guidelines: {
      '@id': '_:id',
      '@type': 'AuthorGuidelines'
    }
  },
  {
    '@id': 'type:2',
    '@type': 'publicationType',
    name: 'Technical Report',
    description: 'description'
  }
];
