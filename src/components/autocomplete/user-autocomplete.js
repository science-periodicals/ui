import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import reEmail from 'regex-email';
import { getId, unprefix } from '@scipe/jsonld';
import debounce from 'lodash/debounce';
import { escapeLucene, formatSearchTerm } from '@scipe/librarian';
import querystring from 'querystring';
import getAgentName from '../../utils/get-agent-name';
import PaperAutocomplete from '../paper-autocomplete';
import UserBadge from '../user-badge';

const INDEXES = ['name', 'email', 'givenName', 'familyName'];

export default class UserAutocomplete extends Component {
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    roleName: PropTypes.string,
    blacklist: PropTypes.array,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    label: 'user',
    blacklist: [],
    readOnly: false,
    onSubmit: noop,
    onChange: noop
  };

  constructor(props) {
    super(props);

    this.debouncedFetch = debounce(this.fetch.bind(this), 500);
    this.state = {
      value: '',
      error: '',
      options: []
    };

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
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
      value: '',
      error: '',
      options: []
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

  fetch(inputValue) {
    inputValue = (inputValue || '').trim();
    if (!inputValue) {
      return;
    }
    if (this.xhr) {
      this.xhr.abort();
    }
    const tokens = inputValue.split(/\s+/);
    let query = [];
    tokens.forEach(token => {
      query.push(`(@id:${escapeLucene('user:' + token)})^4`);
      query.push(`(@id:${escapeLucene('user:' + token)}~)^2`);
    });
    INDEXES.forEach(index => {
      query.push(`${index}:${formatSearchTerm(inputValue)}`);
    });
    tokens.forEach(token => {
      INDEXES.forEach(index => {
        query.push(`${index}:${formatSearchTerm(token)}`);
        query.push(`${index}:${escapeLucene(token)}*`);
      });
    });
    query = query.join(' OR ');
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
          .filter(user => {
            const id = getId(user) || user.email;
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
      '/user/?' +
        querystring.stringify({
          query: query,
          limit: 20,
          includeFields: JSON.stringify([
            '@id',
            'name',
            'email',
            'givenName',
            'familyName'
          ])
        })
    );
    this.xhr.setRequestHeader('Accept', 'application/json');
    this.xhr.send();
  }

  handleChange(e, value) {
    if (value !== this.state.value) {
      this.debouncedFetch(value);
    }
    let error;
    const _value = (value || '').trim();
    const isEmail = reEmail.test(value);
    let item = this.state.options.find(option => {
      return (
        _value === unprefix(getId(option)) ||
        (isEmail &&
          option.email &&
          _value === option.email.replace('^mailto:', ''))
      );
    });
    const isSubmitable = !!(item || isEmail);
    if (this.state.error) {
      if (isSubmitable) {
        error = '';
      } else {
        error = this.state.error;
      }
    }
    if (isSubmitable && !item) {
      item = { email: `mailto:${_value.replace('^mailto:', '')}` };
    }
    this.props.onChange(value, item);
    this.setState({ value, error });
  }

  handleSubmit(value, item) {
    value = (value || '').trim();
    const isEmail = reEmail.test(value);
    item =
      item ||
      this.state.options.find(option => {
        return (
          value === unprefix(getId(option)) ||
          (isEmail &&
            option.email &&
            value === option.email.replace('^mailto:', ''))
        );
      });
    if (item) {
      this.props.onSubmit(value, item);
      this.setState({ error: '' });
    } else {
      if (!isEmail) {
        this.setState({
          error: 'search for a registered user or enter a valid email'
        });
      } else {
        this.props.onSubmit(value, {
          email: `mailto:${value.replace('^mailto:', '')}`
        });
      }
    }
  }

  renderItem(item, isHighlighted, style) {
    const { roleName } = this.props;
    const username = unprefix(item['@id']);
    const name = getAgentName(item);
    return (
      <li
        key={item['@id']}
        className={isHighlighted ? 'highlighted' : ''}
        style={{ lineHeight: '24px' }}
      >
        <UserBadge userId={item['@id']} size={24} roleName={roleName} />
        <b style={{ marginRight: '1em' }}>{username}</b>
        {name !== username ? name : ''}
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
    const { type, value, onChange, error, ...others } = this.props;
    return (
      <PaperAutocomplete
        ref="autocomplete"
        items={this.state.options}
        getItemValue={item => unprefix(getId(item))}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        allowUnlistedInput={true}
        inputProps={{
          autoComplete: 'off',
          error: this.state.error,
          ...others
        }}
      />
    );
  }
}
