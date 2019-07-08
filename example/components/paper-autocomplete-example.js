import React from 'react';
import countryList from 'country-list';
import Fuse from 'fuse.js';

import { PaperAutocomplete } from '../../src/';

const countries = countryList().getData();

export default class PaperAutocompleteExample extends React.Component {
  render() {
    return (
      <div className="example">
        <div className="example__row">
          <CountryAutocomplete />
        </div>
        <div className="example__row">
          <CountryAutocomplete
            inputProps={{ readOnly: true }}
            initialValue={'Read Only Value'}
          />
        </div>
      </div>
    );
  }
}

export class CountryAutocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      options: countries,
      error: null
    };

    this.fuse = new Fuse(countries, { keys: ['name'] });

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  reset() {
    this.setState({
      value: '',
      error: null,
      options: countries
    });
    this.refs.autocomplete.reset();
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item.code}
        className={`${isHighlighted ? 'highlighted' : 'unhighlighted'}`}
        style={{ lineHeight: '32px' }}
      >
        {item.name}
      </li>
    );
  }

  renderMenu(items, value, style) {
    return (
      <ol className="paper-autocomplete__results">
        {items.length ? items : null}
      </ol>
    );
  }

  handleChange(e, value, itemValueDoesMatch) {
    const item = this.state.options.find(option => {
      return value === option.alternateName || value === option.url;
    });
    this.setState({
      value,
      options: value ? this.fuse.search(value) : countries
    });
  }

  handleSubmit(value, item) {
    console.log(value, item);
    this.reset();
  }

  render() {
    let { value, suggestion, suggestions } = this.state;
    let inputProps = this.props.inputProps || {};
    inputProps['name'] = 'country';
    inputProps['label'] = 'country';
    return (
      <PaperAutocomplete
        ref="autocomplete"
        items={this.state.options}
        getItemValue={item => item.name}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        allowUnlistedInput={false}
        floatLabel={this.props.floatLabel || true}
        inputProps={inputProps}
        {...this.props}
      />
    );
  }
}
