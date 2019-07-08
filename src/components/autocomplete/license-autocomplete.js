import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import isUrl from 'is-url';
import Fuse from 'fuse.js';
import spdx from 'spdx-license-list';
import PaperAutocomplete from '../paper-autocomplete';
import BemTags from '../../utils/bem-tags';

const bem = BemTags('license-autocomplete');

const items = Object.keys(spdx).map(id => {
  return Object.assign(
    {
      '@id': `spdx:${id}`,
      isCreativeCommons: /^CC/.test(id),
      alternateName: id
    },
    spdx[id]
  );
});
const fuse = new Fuse(items, {
  keys: [
    { name: 'name', weight: 0.3 },
    { name: 'alternateName', weight: 0.6 },
    { name: 'url', weight: 0.1 }
  ]
});

export default class LicenseAutocomplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      options: items,
      error: null
    };

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  reset() {
    this.setState({
      value: '',
      error: null,
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

  handleChange(e, value, itemValueDoesMatch) {
    const item = this.state.options.find(option => {
      return value === option.alternateName || value === option.url;
    });
    this.props.onChange(value, item);
    if (!isUrl(value)) {
      this.refs.autocomplete.setHighlightedIndex(0);
    }
    this.setState({
      value,
      options: value ? fuse.search(value) : items,
      error: !(item || isUrl(value) || itemValueDoesMatch)
        ? 'enter a valid url or select a license'
        : null
    });
  }

  handleSubmit(value, item) {
    if (item) {
      this.props.onSubmit(value, item);
    } else if (isUrl(value)) {
      this.props.onSubmit(value, { url: value });
    }
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item['@id']}
        className={`license-autocompletelist-item ${
          isHighlighted ? 'highlighted' : 'unhighlighted'
        }`}
        style={{ lineHeight: '24px' }}
      >
        <span className={bem`names`}>
          <b className={bem`name`} style={{ marginRight: '1em' }}>
            {item.alternateName}
          </b>
          <span className={bem`name`}>
            {item.name !== item.alternateName ? item.name : ''}
          </span>
        </span>
        {item.osiApproved ? (
          <span className={bem`badge`}>OSI approved</span>
        ) : (
          <span className={bem`badge-spacer`} />
        )}
        {item.isCreativeCommons ? (
          <span className={bem`badge`}>Creative Commons</span>
        ) : (
          <span className={bem`badge-spacer`} />
        )}
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
    const { onChange, ...others } = this.props;
    const { error } = this.state;

    return (
      <PaperAutocomplete
        className="license-autocomplete"
        ref="autocomplete"
        items={this.state.options}
        getItemValue={item => item.alternateName}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        allowUnlistedInput={true}
        error={error}
        inputProps={{
          error,
          ...others
        }}
      />
    );
  }
}

LicenseAutocomplete.defaultProps = {
  label: 'License',
  blacklist: [],
  readOnly: false,
  onSubmit: noop,
  onChange: noop
};

LicenseAutocomplete.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  roleName: PropTypes.string,
  blacklist: PropTypes.array,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool
};
