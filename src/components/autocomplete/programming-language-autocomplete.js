import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import Fuse from 'fuse.js';
import data from 'list-of-programming-languages';
import PaperAutocomplete from '../paper-autocomplete';

const items = data.itemListElement.map(itemListElement => itemListElement.item);
const fuse = new Fuse(items, { keys: ['name'] });

export default class ProgrammingLanguageAutocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      options: items
    };

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  reset() {
    this.setState({
      value: '',
      options: items
    });
    this.refs.autocomplete.resetValue();
    findDOMNode(this.refs.autocomplete)
      .querySelector('input')
      .blur();
  }

  focus() {
    findDOMNode(this.refs.autocomplete)
      .querySelector('input')
      .focus();
  }

  handleChange(e, value) {
    const item = this.state.options.find(option => {
      return value === option.name;
    });
    this.props.onChange(value, item);
    this.refs.autocomplete.setHighlightedIndex(0);
    this.setState({
      value,
      options: value ? fuse.search(value) : items
    });
  }

  handleSubmit(value, item) {
    if (item) {
      this.props.onSubmit(value, item);
    }
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item['@id']}
        className={isHighlighted ? 'highlighted' : ''}
        style={{ lineHeight: '24px' }}
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

  render() {
    const { type, value, onChange, ...others } = this.props;

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
        inputProps={others}
      />
    );
  }
}

ProgrammingLanguageAutocomplete.defaultProps = {
  label: 'Programming language',
  blacklist: [],
  readOnly: false,
  onSubmit: noop,
  onChange: noop
};

ProgrammingLanguageAutocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  roleName: PropTypes.string,
  blacklist: PropTypes.array,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool
};
