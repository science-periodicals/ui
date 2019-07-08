import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getId, arrayify, prefix } from '@scipe/jsonld';
import isUrl from 'is-url';
import { Span } from '../elements';

export default class RdfaFundingSource extends React.Component {
  renderBody() {
    const { object } = this.props;

    const needParens = !!(
      (object.serialNumber || object.name) &&
      object.alternateName
    );

    return (
      <span resource={getId(object)}>
        {object.serialNumber && (
          <Span property="schema:serialNumber">{object.serialNumber}</Span>
        )}
        {object.serialNumber && (object.name || needParens) && ' — '}
        {object.name && <Span property="schema:name">{object.name}</Span>}

        {needParens && <span> (</span>}
        {object.alternateName && (
          <Span property="schema:alternateName">{object.alternateName}</Span>
        )}
        {needParens && <span>)</span>}
      </span>
    );
  }

  render() {
    const { id, className, object, predicate } = this.props;

    const url = arrayify(object.url)
      .concat(arrayify(getId(object)), arrayify(object.sameAs))
      .find(uri => isUrl(uri));

    return (
      <span
        id={id}
        className={classNames(className, 'rdfa-funding-source')}
        property={predicate}
        resource={getId(object)}
        typeof={prefix(object['@type'])}
      >
        {url ? (
          <a
            className="value"
            property="schema:url"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {this.renderBody()}
          </a>
        ) : (
          this.renderBody()
        )}
      </span>
    );
  }
}

RdfaFundingSource.defaultProps = {
  object: {}
};

RdfaFundingSource.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  predicate: PropTypes.string,
  object: PropTypes.object // a FundingSource
};
