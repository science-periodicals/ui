import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import { arrayify } from '@scipe/jsonld';
import PaperAutocomplete from '../paper-autocomplete';

export default class RoleTitleAutocomplete extends Component {
  static propTypes = {
    scope: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.string,
    periodical: PropTypes.object,
    disabled: PropTypes.bool
  };

  static defaultProps = {
    scope: ['editor', 'producer']
  };

  constructor(props) {
    super(props);
    const options = this.getOptions(props.periodical);
    this.state = {
      value: props.value,
      options,
      error: null
    };

    this.fuse = new Fuse(options, { keys: ['name'] });

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
      this.autocomplete.resetValue(nextProps.value);
    }
  }

  getOptions(periodical) {
    periodical = this.props.periodical || periodical;
    const { scope } = this.props;
    return Array.from(
      new Set(
        arrayify(scope)
          .reduce((merged, p) => {
            return merged.concat(arrayify(periodical[p]));
          }, [])
          .map(role => role.name)
          .filter(name => name && name !== 'journal front desk')
      )
    ).map(name => ({ name }));
  }

  resetValue(value) {
    this.autocomplete.resetValue(value);
  }

  blur() {
    this.autocomplete.blur();
  }

  reset() {
    const { value } = this.props;
    this.setState({
      value: value,
      error: null,
      options: this.getOptions()
    });
    this.autocomplete.resetValue(value);
    this.autocomplete.blur();
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item.name}
        className={`${isHighlighted ? 'highlighted' : 'unhighlighted'}`}
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

  handleChange(e, value, itemValueDoesMatch) {
    if (this.props.onChange) {
      this.props.onChange(value, itemValueDoesMatch);
    }
    const item = this.state.options.find(option => {
      return value === option.name;
    });
    this.setState({
      value,
      options: value ? this.fuse.search(value) : this.getOptions()
    });
  }

  handleSubmit(value, item) {
    this.props.onSubmit(value, item);
  }

  render() {
    const { value, options } = this.state;
    const { disabled } = this.props;
    return (
      <PaperAutocomplete
        ref={el => {
          this.autocomplete = el;
        }}
        defaultValue={value}
        items={options}
        getItemValue={item => item.name}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        submitOnBlur={true}
        allowUnlistedInput={true}
        inputProps={{
          name: 'name',
          label: 'title',
          disabled: disabled
        }}
      />
    );
  }
}
