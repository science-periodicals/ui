import React from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import noop from 'lodash/noop';
import PaperAutocomplete from '../paper-autocomplete';

export default class OrganizationAutocomplete extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    items: PropTypes.array,
    initialValue: PropTypes.object,
    label: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    label: 'Organization',
    readOnly: false,
    onSubmit: noop,
    onChange: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      items: props.items || [],
      initialValue: this.getInitialValue(props)
    };
    this.fuse = new Fuse(props.items || [], {
      keys: [{ name: 'name' }]
    });

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.autocomplete &&
      this.props.initialValue !== nextProps.initialValue
    ) {
      this.autocomplete.resetValue(this.getInitialValue(nextProps));
    }
    if (this.props.items !== nextProps.items) {
      this.setState({ items: nextProps.items });
    }
  }

  getInitialValue(props) {
    let { initialValue } = props || this.props;
    if (!initialValue) return '';
    return initialValue.name;
  }

  reset() {
    this.setState({
      initialValue: this.getInitialValue(),
      error: null
    });
    if (this.autocomplete) {
      this.autocomplete.resetValue(this.getInitialValue());
      this.autocomplete.blur();
    }
  }

  focus() {
    if (this.autocomplete) this.autocomplete.focus();
  }

  handleChange(e, value, itemValueDoesMatch) {
    let item = this.state.items.find(item => value === item.name);
    this.props.onChange(value, item);
    this.setState({
      items: value ? this.fuse.search(value) : this.state.items,
      error: !(item || itemValueDoesMatch)
        ? 'select a valid organization'
        : null
    });
  }

  handleSubmit(value, item) {
    if (item) this.props.onSubmit(value, item);
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item['@id']}
        className={`organization-autocompletelist-item ${
          isHighlighted ? 'highlighted' : 'unhighlighted'
        }`}
        style={{ lineHeight: '24px' }}
      >
        <span className="organization-autocomplete__names">
          <span className="organization-autocomplete__name">{item.name}</span>
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

  render() {
    let { onChange, ...others } = this.props,
      { error } = this.state;
    return (
      <PaperAutocomplete
        className="organization-autocomplete"
        ref={n => (this.autocomplete = n)}
        items={this.state.items}
        getItemValue={item => item.name}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
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
