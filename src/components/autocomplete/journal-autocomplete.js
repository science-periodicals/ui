import React, { Component } from 'react';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import { escapeLucene, formatSearchTerm } from '@scipe/librarian';
import PaperAutocomplete from '../paper-autocomplete';
import JournalBadge from '../journal-badge';

export default class JournalAutocomplete extends Component {
  static propTypes = {
    defaultQuery: PropTypes.string, // used when there is no search value
    defaultValue: PropTypes.string,
    andQuery: PropTypes.string, // extra condition to the query
    name: PropTypes.string,
    label: PropTypes.string,
    blacklist: PropTypes.array,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    defaultQuery: '*:*',
    label: 'journal',
    blacklist: [],
    readOnly: false,
    onSubmit: noop,
    onChange: noop
  };

  constructor(props) {
    super(props);

    this.debouncedFetch = debounce(this.fetch.bind(this), 500);
    this.state = {
      value: props.defaultValue || '',
      options: []
    };

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch(this.props.defaultValue);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.debouncedFetch.cancel();
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  reset() {
    this.setState({
      value: this.props.defaultValue || '',
      options: []
    });
    this.autocomplete &&
      this.autocomplete.resetValue &&
      this.autocomplete.resetValue();
    this.autocomplete && this.autocomplete.blur && this.autocomplete.blur();
  }

  focus() {
    this.autocomplete && this.autocomplete.focus && this.autocomplete.focus();
  }

  fetch(inputValue) {
    const { defaultQuery, andQuery } = this.props;

    if (this.xhr) {
      this.xhr.abort();
    }

    inputValue =
      typeof inputValue === 'string' ? inputValue.trim() : inputValue;

    let query;
    if (inputValue) {
      query = [];
      const tokens = inputValue.split(/\s+/);
      const indexes = ['name', 'alternateName', 'url', 'issn', 'doi'];
      indexes.forEach(index => {
        query.push(`${index}:${formatSearchTerm(inputValue)}`);
      });
      tokens.forEach(token => {
        query.push(`hostname:${escapeLucene(token)}`);
        query.push(`hostname:${escapeLucene(token)}.sci.pe`);
        query.push(`hostname:${escapeLucene(token)}~`);
        indexes.forEach(index => {
          query.push(`${index}:${formatSearchTerm(token)}`);
          query.push(`${index}:${escapeLucene(token)}*`);
        });
      });
      query = query.join(' OR ');
    } else {
      query = defaultQuery;
    }

    if (andQuery) {
      query = `(${query}) AND (${andQuery})`;
    }

    this.xhr = new XMLHttpRequest();
    this.xhr.onload = e => {
      if (e.target.status >= 400) {
        console.error(e.target.responseText);
        this.setState({ error: 'service unavailable' });
      } else {
        let body;
        try {
          body = JSON.parse(e.target.responseText);
        } catch (e) {
          this.setState({ error: 'service unavailable' });
          return;
        }
        const options = body.itemListElement
          .map(el => el.item)
          .filter(item => {
            const id = getId(item);
            return !id || !this.props.blacklist.includes(id);
          });
        if (this._isMounted) {
          this.setState({
            options
          });
        }
      }
      delete this.xhr;
    };
    this.xhr.onabort = e => {
      delete this.xhr;
    };
    this.xhr.onerror = e => {
      console.error('xhr errored');
      this.setState({ error: 'service unavailable' });
      delete this.xhr;
    };
    this.xhr.open(
      'GET',
      '/periodical/?' +
        querystring.stringify({
          query: query,
          limit: 50,
          includeFields: JSON.stringify(['@id', 'name', 'alternateName', 'url'])
        })
    );
    this.xhr.setRequestHeader('Accept', 'application/json');
    this.xhr.send();
  }

  handleChange(e, value) {
    if (value !== this.state.value) {
      this.debouncedFetch(value);
    }
    this.props.onChange(value);
    this.setState({ value });
  }

  handleSubmit(value, item) {
    this.props.onSubmit(value, item);
  }

  renderItem(item, isHighlighted, style) {
    const displayName =
      item.name || item.alternateName || item.issn || item.url;

    return (
      <li
        key={item['@id']}
        className={isHighlighted ? 'highlighted' : ''}
        style={{
          lineHeight: '24px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        <JournalBadge journal={item} size={24} />
        <b
          style={{
            marginRight: '1em',
            lineHeight: '1.25em',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'block',
            overflow: 'hidden'
          }}
        >
          {displayName}
        </b>
        <div
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          {item.url}
        </div>
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
    const {
      defaultValue,
      type,
      value,
      onChange,
      onSubmit,
      ...others
    } = this.props;
    return (
      <PaperAutocomplete
        ref={el => {
          this.autocomplete = el;
        }}
        defaultValue={defaultValue}
        items={this.state.options}
        getItemValue={item =>
          item.name || item.alternateName || item.issn || item.url
        }
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        inputProps={others}
      />
    );
  }
}
