import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import debounce from 'lodash/debounce';
import querystring from 'querystring';
import createError from '@scipe/create-error';
import parallel from 'async/parallel';
import once from 'once';
import PaperAutocomplete from '../paper-autocomplete';

export default class SemanticTagsAutocomplete extends Component {
  constructor(props) {
    super(props);

    this.ontologyXHR = null;
    this.searchXHR = null;
    this.debouncedFetch = debounce(this.fetch.bind(this), 300);
    this.state = {
      options: [],
      history: [],
      direction: undefined,
      loading: false,
      error: ''
    };
    this.cache = {};
  }

  init() {
    this.setState({
      options: [],
      history: [],
      direction: undefined,
      loading: false,
      error: ''
    });
    this.refs.autocomplete.resetValue();
    this.fetch(
      {
        search: this.props.scope && this.props.scope.name,
        ontology: this.props.scope ? 'scope' : 'root'
      },
      (err, res) => {
        if (err) {
          this.setState({
            loading: false,
            error: err.code === -1 ? '' : err.message || err.code
          });
        } else {
          this.setState({
            loading: false,
            options: res.ontology.concat(res.search),
            error: ''
          });
        }
      }
    );
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.scope && nextProps.scope['@id']) !==
      (this.props.scope && this.props.scope['@id'])
    ) {
      this.init();
    }
  }

  componentWillUnmount() {
    this.debouncedFetch.cancel();
    if (this.ontologyXHR) this.ontologyXHR.abort();
    if (this.searchXHR) this.searchXHR.abort();
  }

  fetch({ search, ontology, parents }, callback) {
    parallel(
      {
        ontology: cb => {
          cb = once(cb);

          if (!ontology) return cb(null, []);

          if (this.ontologyXHR) this.ontologyXHR.abort();

          if (ontology === 'root') {
            cb(null, [
              {
                '@id': this.props.ontology,
                name: this.props.ontology
              }
            ]);
          } else if (ontology === 'scope') {
            cb(null, [this.props.scope]);
          } else {
            const cacheKey = parents ? `${ontology}-parents` : ontology;
            if (this.cache[cacheKey]) {
              return cb(null, this.cache[cacheKey]);
            }

            this.ontologyXHR = new XMLHttpRequest();
            this.ontologyXHR.onload = e => {
              delete this.ontologyXHR;
              if (e.target.status >= 400) {
                return cb(createError(e.target.status, e.target.responseText));
              }

              // for prepopulated list, sort results alphabetically
              // Note that we don't filter the blacklisted item here as
              // they may be usefull for ontology navigation
              const options = JSON.parse(e.target.responseText)
                .filter(option => option['@id'] && option.name)
                .sort(
                  (a, b) =>
                    a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
                );

              this.cache[cacheKey] = options;
              cb(null, options);
            };

            this.ontologyXHR.onabort = e => {
              cb(createError(-1, 'ontology xhr aborted'));
              delete this.ontologyXHR;
            };
            this.ontologyXHR.onerror = e => {
              cb(createError(0, 'service not available'));
              delete this.ontologyXHR;
            };

            const qs = querystring.stringify({
              scope: ontology !== this.props.ontology ? ontology : undefined,
              parents: parents,
              ontology: this.props.ontology
            });

            this.ontologyXHR.open(
              'GET',
              `/ontologist/autocomplete/prepopulate?${qs}`
            );
            this.ontologyXHR.send();
          }
        },

        search: cb => {
          search = (search || '').trim();

          cb = once(cb);
          if (!search) {
            return cb(null, []);
          }

          if (this.searchXHR) this.searchXHR.abort();

          if (this.cache[search]) {
            return cb(null, this.cache[search]);
          }

          this.searchXHR = new XMLHttpRequest();
          this.searchXHR.onload = e => {
            if (e.target.status >= 400) {
              return cb(createError(e.target.status, e.target.responseText));
            }

            const options = JSON.parse(e.target.responseText).filter(option => {
              return (
                option['@id'] &&
                option.name &&
                !~this.props.blacklist.indexOf(option['@id'])
              );
            });

            if (this.props.scope && this.props.scope.name === search) {
              this.cache[search] = options;
            }
            cb(null, options);
          };
          this.searchXHR.onabort = e => {
            cb(createError(-1, 'search xhr aborted'));
            delete this.searchXHR;
          };
          this.searchXHR.onerror = e => {
            cb(createError(0, 'service not available'));
            delete this.searchXHR;
          };

          const qs = querystring.stringify({
            q: search,
            limit: 25,
            ontology: this.props.ontology
          });
          this.searchXHR.open('GET', `/ontologist/autocomplete?${qs}`);
          this.searchXHR.send();
        }
      },
      callback
    );
  }

  /**
   * @param direction - either `mostSpecificConcept` (right) or `broadestConcept` (left)
   */
  treeNav(direction, item) {
    if (
      !item ||
      (direction === 'mostSpecificConcept' && item[direction]) ||
      (direction === 'broadestConcept' && item['@id'] === this.props.ontology)
    ) {
      return;
    }

    this.setState({ loading: true });

    this.debouncedFetch(
      {
        ontology:
          direction === 'broadestConcept' && item.broadestConcept
            ? 'root'
            : item['@id'],
        parents: direction === 'broadestConcept'
      },
      (err, res) => {
        if (err) {
          this.setState({
            loading: false,
            error: err.code === -1 ? '' : err.message || err.code
          });
        } else {
          let nextHistory;
          if (this.state.direction === direction) {
            nextHistory = this.state.history.concat(item);
          } else {
            nextHistory = [item];
          }

          this.setState(
            {
              loading: false,
              error: '',
              options: res.ontology.concat(res.search),
              history: nextHistory,
              direction: direction
            },
            () => {
              this.refs.autocomplete.setHighlightedIndex(0);
            }
          );
        }
      }
    );
  }

  handleSubmit(value, item) {
    this.init();
    this.props.onSubmit(
      item && item['@id'] !== this.props.ontology ? item : undefined
    );
  }

  reset() {
    this.init();
    findDOMNode(this.refs.autocomplete)
      .querySelector('input')
      .blur();
  }

  focus() {
    findDOMNode(this.refs.autocomplete)
      .querySelector('input')
      .focus();
  }

  handleChange(e, value = '') {
    this.debouncedFetch.cancel();
    if (this.ontologyXHR) this.ontologyXHR.abort();
    if (this.searchXHR) this.searchXHR.abort();

    if (value.trim()) {
      this.setState(
        {
          loading: true,
          options: [],
          history: [],
          direction: undefined,
          loading: true,
          error: ''
        },
        () => {
          this.debouncedFetch(
            {
              search: value
            },
            (err, res) => {
              this.setState(
                {
                  loading: false,
                  error: '',
                  options: res.search
                },
                () => {
                  this.refs.autocomplete.setHighlightedIndex(0);
                }
              );
            }
          );
        }
      );
    } else {
      this.init();
    }
  }

  handleNav(direction, item, e) {
    e.preventDefault();
    e.stopPropagation();
    this.treeNav(direction, item);
    // refocus on input field and set paper-autocomplete ignoreBlur to false
    // so that menu can still be closed with paper-autocomplete onBlur
    findDOMNode(this.refs.autocomplete)
      .querySelector('input')
      .focus();
    this.refs.autocomplete.setIgnoreBlur(false);
  }

  renderMenu(elements, value, style, items) {
    let itemsFromOntology, itemsFromSearch, crumbs;
    if (!this.state.error) {
      itemsFromOntology = elements.filter((element, i) => !items[i].fromSearch);
      itemsFromSearch = elements.filter((element, i) => items[i].fromSearch);

      // navigation history crumbs
      if (this.state.direction === 'mostSpecificConcept') {
        crumbs = this.state.history.map(item => item.name).join('	› ');
      } else if (this.state.direction === 'broadestConcept') {
        crumbs = this.state.history
          .map(item => item.name)
          .reverse()
          .join('	‹ ');
      }
    }

    // TODO replace icon-autocomplete-loading--16px by spinner component
    return (
      <div className="paper-autocomplete__results">
        {crumbs ? (
          <div
            className={`nav-crumbs ${
              this.state.direction === 'mostSpecificConcept'
                ? 'deeper'
                : 'shallower'
            }`}
          >
            {crumbs}
          </div>
        ) : null}

        {itemsFromOntology &&
        (itemsFromOntology.length || (!value && this.state.loading)) ? (
          <div>
            <div className="results-info">
              Ontology Results
              {this.state.loading ? (
                <div className="icon-autocomplete-loading--16px" />
              ) : null}
            </div>
            <ol>{itemsFromOntology}</ol>
          </div>
        ) : null}

        {itemsFromSearch &&
        (itemsFromSearch.length ||
          !(itemsFromOntology && itemsFromOntology.length)) ? (
          <div>
            <div className="results-info">
              {!this.state.loading && itemsFromSearch.length === 0
                ? `No search results for\u00a0"${value ||
                    (this.props.scope && this.props.scope.name)}"`
                : `Search results for\u00a0"${value ||
                    (this.props.scope && this.props.scope.name)}"`}
              {this.state.loading ? (
                <div className="icon-autocomplete-loading--16px" />
              ) : null}
            </div>
            <ol>{itemsFromSearch}</ol>
          </div>
        ) : null}
      </div>
    );
  }

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={`${item.fromSearch ? 's' : 'o'}-${item['@id']}`}
        className={
          'semantic-tag-autocomplete__list-item' +
          (isHighlighted ? ' highlighted' : '')
        }
        style={style}
      >
        <header>
          {item['@id'] !== this.props.ontology && (
            <Iconoclass
              className="expandShallower"
              title="view parents"
              iconName="arrowOpenLeft"
              onClick={
                !item.broadestConcept &&
                this.handleNav.bind(this, 'broadestConcept', item)
              }
            />
          )}
          <dfn>{item.name}</dfn>

          {!item.mostSpecificConcept && (
            <Iconoclass
              className="expandDeeper"
              title="view children"
              iconName="arrowOpenRight"
              onClick={
                !item.mostSpecificConcept &&
                this.handleNav.bind(this, 'mostSpecificConcept', item)
              }
            />
          )}
        </header>
        {item.matchSpans && item.matchSpans.length ? (
          <p
            className="matches"
            dangerouslySetInnerHTML={{
              __html: '(' + item.matchSpans.join(', ') + ')'
            }}
          />
        ) : null}
        <p className="description" title={item.description}>
          {item.description}
        </p>
      </li>
    );
  }

  render() {
    return (
      <div className="semantic-tags-autocomplete" id={this.props.id}>
        <PaperAutocomplete
          ref="autocomplete"
          items={this.state.options}
          getItemValue={item => item.name}
          onSelect={this.handleSubmit.bind(this)}
          onSubmit={this.handleSubmit.bind(this)}
          submitOnBlur={true}
          onChange={this.handleChange.bind(this)}
          renderItem={this.renderItem.bind(this)}
          renderMenu={this.renderMenu.bind(this)}
          navRight={this.treeNav.bind(this, 'mostSpecificConcept')}
          navLeft={this.treeNav.bind(this, 'broadestConcept')}
          customAutocomplete={true}
          inputProps={{
            name: this.props.name,
            label: this.props.label,
            floatLabel: true,
            readOnly: this.props.readOnly,
            disabled: this.props.disabled,
            error: this.state.error
          }}
        />
      </div>
    );
  }
}

SemanticTagsAutocomplete.defaultProps = {
  name: 'search',
  label: 'search',
  blacklist: [],
  ontology: 'subjects',
  onSubmit: noop
};

SemanticTagsAutocomplete.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  scope: PropTypes.object,
  blacklist: PropTypes.array,
  onSubmit: PropTypes.func,
  ontology: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool
};
