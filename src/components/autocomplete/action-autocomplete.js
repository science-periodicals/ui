import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import Fuse from 'fuse.js';
import noop from 'lodash/noop';
import { getIconNameFromSchema } from '../../utils/graph';
import PaperAutocomplete from '../paper-autocomplete';

export default class ActionAutocomplete extends Component {
  static defaultProps = {
    label: 'Add Action',
    readOnly: false,
    onSubmit: noop,
    onChange: noop
  };

  static propTypes = {
    items: PropTypes.array.isRequired,
    name: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string,
    roleName: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      items: props.items
    };
    this.fuse = new Fuse(props.items, { keys: ['name'] });
    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.props.items) {
      this.setState({
        items: nextProps.items
      });
      this.fuse = new Fuse(nextProps.items, { keys: ['name'] });
    }
  }

  focus() {
    this.autocomplete.focus();
  }

  blur() {
    this.autocomplete.blur();
  }

  reset() {
    const { items } = this.props;
    this.setState({
      items
    });
    this.autocomplete.reset();
  }

  handleChange(e, value, itemValueDoesMatch) {
    const item = this.state.items.find(item => {
      return value === item.name;
    });
    this.props.onChange(value, item);
    this.setState({
      items: value ? this.fuse.search(value) : this.props.items
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
        key={item['@type']}
        className={isHighlighted ? 'highlighted' : ''}
        style={{ lineHeight: '24px' }}
      >
        <Iconoclass
          iconName={getIconNameFromSchema(item)}
          className="paper-autocomplete__result-item-icon"
          style={{ marginRight: '0.8rem' }}
          iconSize={16}
        />
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
    const { items } = this.state;
    return (
      <PaperAutocomplete
        className="action-autocomplete"
        ref={el => {
          this.autocomplete = el;
        }}
        items={items}
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
