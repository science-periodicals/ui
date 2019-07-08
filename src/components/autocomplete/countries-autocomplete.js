import React from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import countryList from 'country-list';
import noop from 'lodash/noop';
import PaperAutocomplete from '../paper-autocomplete';
import BemTags from '../../utils/bem-tags';

const countries = countryList();
const data = countries.getData();
const bem = BemTags('countries-autocomplete');
const fuse = new Fuse(data, {
  keys: [{ name: 'code', weight: 0.3 }, { name: 'name', weight: 0.6 }]
});

export default class CountriesAutocomplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initialValue: this.getInitialValue(props),
      options: data,
      error: null
    };
    this.autocomplete = null;

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validator = this.validator.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.autocomplete &&
      this.props.initialValue !== nextProps.initialValue
    ) {
      this.autocomplete.resetValue(this.getInitialValue(nextProps));
    }
  }

  getInitialValue(props) {
    let { initialValue } = props || this.props;
    if (!initialValue) return '';
    return countries.getName(initialValue) || initialValue;
  }

  reset() {
    this.setState({
      initialValue: this.getInitialValue(),
      error: null,
      options: data
    });
    if (this.autocomplete) {
      this.autocomplete.resetValue(this.getInitialValue());
      this.autocomplete.blur();
    }
  }

  focus() {
    if (this.autocomplete) {
      this.autocomplete.focus();
    }
  }

  handleChange(e, value, itemValueDoesMatch) {
    const item = this.state.options.find(
      option => value === option.code || value === option.name
    );
    this.props.onChange(value, item);
    this.setState({
      options: value ? fuse.search(value) : data,
      error: !(item || itemValueDoesMatch) ? 'select a valid country' : null
    });
  }

  handleSubmit(value, item) {
    if (item) this.props.onSubmit(value, item);
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item.code}
        className={`${isHighlighted ? 'highlighted' : 'unhighlighted'}`}
        style={{ lineHeight: '24px' }}
      >
        <span className={bem`names`}>
          <b className={bem`name`} style={{ marginRight: '1em' }}>
            {item.code}
          </b>
          <span className={bem`name`}>{item.name}</span>
        </span>
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

  validator(filteredItems, props, state) {
    return filteredItems.some(item => {
      let value = (state.value || '').toLowerCase();
      return (
        item.name.toLowerCase().indexOf(value) === 0 ||
        item.code.toLowerCase().indexOf(value) === 0
      );
    });
  }

  render() {
    let { onChange, ...others } = this.props,
      { error } = this.state;
    return (
      <PaperAutocomplete
        ref={n => (this.autocomplete = n)}
        items={this.state.options}
        getItemValue={item => item.name}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        validator={this.validator}
        allowUnlistedInput={false}
        error={error}
        defaultValue={this.getInitialValue()}
        inputProps={{
          error,
          ...others
        }}
      />
    );
  }
}

CountriesAutocomplete.defaultProps = {
  label: 'Country',
  readOnly: false,
  onSubmit: noop,
  onChange: noop
};

CountriesAutocomplete.propTypes = {
  name: PropTypes.string,
  initialValue: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool
};
