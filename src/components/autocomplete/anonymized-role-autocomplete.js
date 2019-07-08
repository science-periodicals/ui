import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import Fuse from 'fuse.js';
import noop from 'lodash/noop';
import { getId, unprefix, arrayify } from '@scipe/jsonld';
import { xhr, getAgent } from '@scipe/librarian';
import querystring from 'querystring';
import PaperAutocomplete from '../paper-autocomplete';

/**
 * Search for anonymized roles
 *  -> fetch list once from server + to client side search with Fuse based on
 * `knowsAbout` and `@id` (to have a fallback when there are no subjects)
 */
export default class AnonymizedRoleAutocomplete extends Component {
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    graphId: PropTypes.string.isRequired,
    roleName: PropTypes.oneOf(['reviewer', 'editor', 'producer']).isRequired, // the `roleName` that we are searching for
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    label: 'search',
    readOnly: false,
    onSubmit: noop,
    onChange: noop
  };

  constructor(props) {
    super(props);

    this.state = {
      value: '',
      error: '',
      items: [],
      roles: []
    };
    this.fuse = null;
    this.autocompleteRef = React.createRef();
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.roleName !== this.props.roleName ||
      prevProps.graphId !== this.props.graphId
    ) {
      this.setState(
        {
          value: '',
          error: '',
          items: [],
          roles: []
        },
        () => {
          this.fuse = null;
          this.fetch();
        }
      );
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  reset() {
    this.setState({
      value: '',
      error: '',
      items: [],
      roles: []
    });
    this.autocompleteRef.current.resetValue();

    findDOMNode(this.autocompleteRef.current)
      .querySelector('input')
      .blur();
  }

  focus() {
    findDOMNode(this.autocompleteRef.current)
      .querySelector('input')
      .focus();
  }

  fetch() {
    const { graphId, roleName } = this.props;

    if (this.xhr) {
      this.xhr.abort();
    }

    const r = xhr({
      url:
        '/role/?' +
        querystring.stringify({
          anonymize: true,
          graph: unprefix(graphId),
          roleName
        }),
      method: 'GET',
      json: true
    });
    this.xhr = r.xhr;

    r.then(({ body }) => {
      const roles = body.itemListElement.map(
        itemListElement => itemListElement.item
      );
      if (this._isMounted) {
        delete this.xhr;
        this.fuse = new Fuse(roles, {
          keys: [`${roleName}.knowsAbout.name`, '@id']
        });
        this.setState({ items: roles, roles });
      }
    }).catch(error => {
      if (this._isMounted) {
        delete this.xhr;
        this.setState({
          error: `Could not fetch anonymized ${roleName} ${error.message}`
        });
      }
    });
  }

  handleChange = (e, value, itemValueDoesMatch) => {
    const item = this.state.items.find(item => {
      return value === unprefix(getId(item));
    });

    this.props.onChange(value, item);
    this.setState({
      items: value ? this.fuse.search(value) : this.state.roles
    });
  };

  handleSubmit = (value, item) => {
    if (item) {
      this.props.onSubmit(value, item);
    }
  };

  renderItem = (item, isHighlighted, style) => {
    const user = getAgent(item);

    return (
      <li
        key={getId(item)}
        className={isHighlighted ? 'highlighted' : ''}
        style={{ lineHeight: '24px' }}
      >
        <div className="anonymized-role-autocomplete__results">
          <b>{unprefix(getId(item).split('?')[0])}</b>

          {!!(user && user.knowsAbout) && (
            <div>
              <ul className="anonymized-role-autocomplete__subjects">
                {arrayify(user.knowsAbout).map(subject => (
                  <li
                    className="anonymized-role-autocomplete__subject"
                    key={getId(subject)}
                  >
                    {subject.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
    const { type, value, onChange, ...others } = this.props;
    const { items, error } = this.state;

    return (
      <PaperAutocomplete
        ref={this.autocompleteRef}
        items={items}
        getItemValue={item => unprefix(getId(item))}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        allowUnlistedInput={true}
        inputProps={{
          disabled: !this.fuse,
          autoComplete: 'off',
          error: error,
          ...others
        }}
      />
    );
  }
}
