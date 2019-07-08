import React from 'react';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import { getId, textify } from '@scipe/jsonld';
import {
  createId,
  escapeLucene,
  formatSearchTerm,
  getScopeId
} from '@scipe/librarian';
import PaperAutocomplete from '../paper-autocomplete';

export default class JournalArticleAutocomplete extends React.Component {
  static propTypes = {
    defaultValue: PropTypes.string,
    journalId: PropTypes.string.isRequired,
    name: PropTypes.string,
    label: PropTypes.string,
    blacklist: PropTypes.array, // must be a list of scopes (to avoid version mismatch)
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    label: 'search articles',
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

  componentDidUpdate(prevProps) {
    if (this.props.blacklist !== prevProps.blacklist) {
      this.fetch(this.state.value);
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
    this.fetch(this.props.defaultValue);
  }

  focus() {
    this.autocomplete && this.autocomplete.focus && this.autocomplete.focus();
  }

  fetch(inputValue) {
    const { journalId } = this.props;

    if (this.xhr) {
      this.xhr.abort();
    }

    const defaultQuery = `(journalId:${escapeLucene(
      journalId
    )} AND status:published) NOT version:null`;

    inputValue =
      typeof inputValue === 'string' ? inputValue.trim() : inputValue;

    let query;
    if (inputValue) {
      // TODO includes mainEntity name etc. + restrict to published article only
      const indexes = [
        'name',
        'alternateName',
        'entityName',
        'entityAlternateName',
        'slug'
      ];

      query = [];
      const tokens = inputValue.split(/\s+/);
      indexes.forEach(index => {
        query.push(`${index}:${formatSearchTerm(inputValue)}`);
      });

      tokens.forEach(token => {
        query.push(`scopeId:${escapeLucene(createId('graph', token)['@id'])}`);
        indexes.forEach(index => {
          query.push(`${index}:${formatSearchTerm(token)}`);
          query.push(`${index}:${escapeLucene(token)}*`);
        });
      });
      query = `(${defaultQuery}) AND (${query.join(' OR ')})`;
    } else {
      query = defaultQuery;
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
        const options = body.itemListElement.map(el => el.item).filter(item => {
          const id = getId(item);
          return !id || !this.props.blacklist.includes(getScopeId(id));
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
      '/graph/?' +
        querystring.stringify({
          query: query,
          limit: 50,
          includeFields: JSON.stringify([
            '@id',
            'name',
            'alternateName',
            'slug',
            'datePublished'
          ])
        })
    );
    this.xhr.setRequestHeader('Accept', 'application/json');
    this.xhr.send();
  }

  handleChange = (e, value) => {
    if (value !== this.state.value) {
      this.debouncedFetch(value);
    }
    this.props.onChange(value);
    this.setState({ value });
  };

  handleSubmit = (value, item) => {
    this.props.onSubmit(value, item);
  };

  renderItem = (item, isHighlighted, style) => {
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
          {textify(item.name || item.alternateName || '')}
        </b>
        <div
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        >
          {item.slug}
        </div>
      </li>
    );
  };

  renderMenu = (items, value, style) => {
    return (
      <ol className="paper-autocomplete__results">
        {items.length ? items : null}
      </ol>
    );
  };

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
          getScopeId(item) ||
          item.slug ||
          textify(item.name) ||
          item.alternateName ||
          item.url
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
