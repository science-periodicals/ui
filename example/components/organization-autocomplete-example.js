import React from 'react';
import { OrganizationAutocomplete } from '../../src/';

let orgs = [
  { name: 'Taylor Swift & Francis Bacon' },
  { name: 'Wiley Coyote' },
  { name: 'Elsevier Déco' },
  { name: 'MacMillan & Cheese' },
  { name: 'THYME' }
];

export default class OrganizationAutocompleteExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = { item: { name: '<none>' } };
    ['handleSubmit', 'handleChange'].forEach(
      meth => (this[meth] = this[meth].bind(this))
    );
  }

  handleChange(value, item) {
    console.warn('change', value, item);
  }

  handleSubmit(value, item) {
    if (item) this.setState({ item });
  }

  render() {
    return (
      <div className="example">
        <OrganizationAutocomplete
          ref={el => (this.autocomplete = el)}
          items={orgs}
          name="org"
          label="Search organizations"
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        />
        <p>
          Selected: {this.state.item.name}
        </p>
      </div>
    );
  }
}
