import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import isUrl from 'is-url';
import flatten from 'lodash/flatten';
import { getId, arrayify, unprefix, prefix } from '@scipe/jsonld';
import { getAgent, schema } from '@scipe/librarian';
import classNames from 'classnames';
import Value from '../value';
import RdfaPersonOrOrganization from './rdfa-person-or-organization';
import RdfaDate from './rdfa-date';
import Iconoclass from '@scipe/iconoclass';

export default class RdfaCitation extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    format: PropTypes.oneOf(['accessible', 'chicago']),
    className: PropTypes.string,
    etal: PropTypes.bool,
    predicate: PropTypes.string,
    object: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // string can happen during document worker reconciliation
    displayDoi: PropTypes.bool,
    displayIsbn: PropTypes.bool,
    isPrinting: PropTypes.bool
  };

  static defaultProps = {
    format: 'accessible',
    displayDoi: true,
    displayIsbn: true,
    isPrinting: false
  };

  renderTitle() {
    let {
      object,
      object: { name, url: uri }
    } = this.props;
    const url = uri || getId(object);

    if (name) {
      const cite = (
        <Value tagName="cite" property="schema:name">
          {name}
        </Value>
      );

      return (
        <div className="rdfa-citation__title">
          {isUrl(url) ? (
            <a property="schema:url" href={url}>
              {cite}
            </a>
          ) : (
            cite
          )}
        </div>
      );
    }
    return null;
  }

  renderContributors() {
    const { object = {}, etal } = this.props;
    const contributorArray = arrayify(object.author).concat(
      arrayify(object.contributor)
    );

    if (
      !contributorArray.some(value => {
        const agent = getAgent(value);
        return agent && (agent.name || agent.familyName || agent.givenName);
      })
    ) {
      return null;
    }
    return (
      <RdfaContributors
        object={object}
        predicate={['schema:author', 'schema:contributor']}
        etal={etal}
      />
    );
  }

  renderPublisher() {
    const { object = {} } = this.props;
    if (!(object.publisher && object.publisher.name)) {
      return null;
    }
    return (
      <RdfaPublisher object={object.publisher} predicate="schema:publisher" />
    );
  }

  renderIsPartOf() {
    const { object = {} } = this.props;
    if (schema.is(object, 'Dataset')) {
      if (!object.includedInDataCatalog || !object.includedInDataCatalog.name) {
        return null;
      }
      return (
        <RdfaDataCatalog
          object={object.includedInDataCatalog}
          predicate="schema:includedInDataCatalog"
        />
      );
    } else {
      if (
        !object.isPartOf ||
        !(
          object.isPartOf.name ||
          object.isPartOf.issueNumber != null ||
          object.isPartOf.volumeNumber != null
        )
      ) {
        return null;
      }

      return (
        <RdfaIsPartOf object={object.isPartOf} predicate="schema:isPartOf" />
      );
    }
  }

  renderDatePublished(appendPrefix) {
    const { object = {} } = this.props;
    if (!object.datePublished) return null;

    return (
      <RdfaDate
        predicate="schema:datePublished"
        object={object.datePublished}
        appendPrefix={appendPrefix}
      />
    );
  }

  renderPagination() {
    const { object = {} } = this.props;
    if (
      !(object.pagination || object.pageStart != null || object.pageEnd != null)
    ) {
      return null;
    }
    return <RdfaPagination object={object} appendPrefix={false} />;
  }

  renderAccessed(appendPrefix) {
    const { object = {} } = this.props;
    const action = arrayify(object.potentialAction).find(
      action =>
        action['@type'] === 'ViewAction' &&
        action.actionStatus === 'CompletedActionStatus' &&
        (action.startTime || action.endTime)
    );

    if (!action) return null;
    return (
      <span
        property="schema:potentialAction"
        typeof={prefix(action['@type'])}
        resource={getId(action)}
      >
        {appendPrefix && (
          <span property="schema:actionStatus" content="CompletedActionStatus">
            (accessed
          </span>
        )}
        <RdfaDate
          predicate={`schema:${action.endTime ? 'endTime' : 'startTime'}`}
          object={action.endTime || action.startTime}
          appendPrefix={appendPrefix}
        />
        {appendPrefix && <span>)</span>}
      </span>
    );
  }

  renderDoi() {
    const { object = {} } = this.props;
    if (!arrayify(object.doi).length) return null;
    return <RdfaDoi object={object.doi} />;
  }

  renderIsbn() {
    const { object = {} } = this.props;
    if (!arrayify(object.isbn).length) return null;
    return <RdfaIsbn object={object.isbn} />;
  }

  renderFallback() {
    const { object = {} } = this.props;
    const uri = object.url || getId(object);
    if (isUrl(uri)) {
      return (
        <span>
          <a property="schema:url" href={uri}>
            {uri}
          </a>
          .
        </span>
      );
    }
    return <span>No citation data available.</span>;
  }

  render() {
    const {
      id,
      className,
      object: citation,
      predicate,
      format,
      displayDoi,
      displayIsbn,
      isPrinting
    } = this.props;
    if (!citation || typeof citation === 'string') return null;

    // if citeAs follow that and early return otherwise format...
    if (citation.citeAs) {
      return (
        <div
          id={id}
          role="doc-biblioentry"
          className={classNames(
            'rdfa-citation',
            className,
            `rdfa-citation--${format}`
          )}
          typeof={prefix(citation['@type'] || 'CreativeWork')}
          resource={getId(citation)}
        >
          <Value property="schema:citeAs">{citation.citeAs}</Value>
        </div>
      );
    }

    const title = this.renderTitle();
    const contributors = this.renderContributors();
    const publisher = this.renderPublisher();
    const isPartOf = this.renderIsPartOf();
    const datePublished = this.renderDatePublished(false);
    const pagination = this.renderPagination();
    const accessed = this.renderAccessed();
    const doi = this.renderDoi();
    const isbn = this.renderIsbn();

    let fallback = null;
    if (
      !title &&
      !contributors &&
      !publisher &&
      !isPartOf &&
      !datePublished &&
      !doi &&
      !isbn
    ) {
      fallback = this.renderFallback();
    }

    const contributorIconName = arrayify(citation.author)
      .concat(arrayify(citation.contributor))
      .some(role => schema.is(getAgent(role), 'Person'))
      ? 'person'
      : 'locationCity';

    const titleIconName = schema.is(citation, 'Dataset')
      ? 'fileData'
      : schema.is(citation, 'WebSite') ||
        schema.is(citation, 'WebPage') ||
        schema.is(citation, 'WebPageElement')
      ? 'link'
      : 'manuscript';

    // TODO a lot of the annoying code to add space comma etc can probably be handled in CSS with generated content ?
    // probably with flex order and adjacent sibling see https://stackoverflow.com/questions/1817792/is-there-a-previous-sibling-css-selector
    return (
      <div
        id={id}
        property={predicate}
        className={classNames(
          'rdfa-citation',
          className,
          `rdfa-citation--${format}`
        )}
        typeof={prefix(citation['@type'] || 'CreativeWork')}
        resource={getId(citation)}
      >
        {!!title && (
          <div className="rdfa-citation__row">
            <Iconoclass
              className="rdfa-citation__icon"
              iconName={titleIconName}
              size={isPrinting ? '8px' : '16px'}
            />
            {title}
          </div>
        )}

        {!!contributors && (
          <div className="rdfa-citation__row">
            <Iconoclass
              className="rdfa-citation__icon"
              iconName={contributorIconName}
              size={isPrinting ? '8px' : '16px'}
            />
            <span className="rdfa-citation__contributors">
              <span className="rdfa-citation__label rdfa-citation__label--contributors">
                {pluralize(
                  'Author',
                  arrayify(citation.author).concat(
                    arrayify(citation.contributor)
                  ).length
                )}
                :{' '}
              </span>
              {contributors}
            </span>
          </div>
        )}

        {(isPartOf ||
          pagination ||
          datePublished ||
          accessed ||
          publisher ||
          (doi && displayDoi) ||
          (isbn && displayIsbn)) && (
          <div className="rdfa-citation__row">
            <Iconoclass
              className="rdfa-citation__icon"
              iconName="journal"
              size={isPrinting ? '8px' : '16px'}
            />
            <div className="rdfa-citation__pub-info">
              {isPartOf && (
                <span className="rdfa-citation__publication">
                  <span className="rdfa-citation__label rdfa-citation__label--publication">
                    Publication:{`\u00A0`}
                  </span>
                  {isPartOf}
                  {'. '}
                </span>
              )}

              {pagination && (
                <span className="rdfa-citation__pages">
                  <span className="rdfa-citation__label rdfa-citation__label--pages">
                    Pages:{`\u00A0`}
                  </span>
                  {pagination}
                  {'. '}
                </span>
              )}

              {datePublished && (
                <span className="rdfa-citation__date">
                  <span className="rdfa-citation__label rdfa-citation__label--date">
                    published:{`\u00A0`}
                  </span>
                  {datePublished}
                  {'. '}
                </span>
              )}

              {accessed && (
                <span className="rdfa-citation__pages">
                  <span className="rdfa-citation__label rdfa-citation__label--accessed">
                    Accessed:{`\u00A0`}
                  </span>
                  {accessed}
                  {'. '}
                </span>
              )}

              {publisher && (
                <span className="rdfa-citation__publisher">
                  <span className="rdfa-citation__label rdfa-citation__label--publisher">
                    Publisher:{`\u00A0`}
                  </span>
                  {publisher}
                  {'. '}
                </span>
              )}

              {doi && displayDoi && (
                <span className="rdfa-citation__doi">
                  <span className="rdfa-citation__label rdfa-citation__label--doi">
                    <abbr title="Digital Object Identifier">
                      DOI:{`\u00A0`}
                    </abbr>
                  </span>
                  {doi}
                  <span>{`. `}</span>
                </span>
              )}
              {isbn && displayIsbn && (
                <span className="rdfa-citation__isbn">
                  <span className="rdfa-citation__label rdfa-citation__label--isbn">
                    <abbr title="International Standard Book Number">
                      ISBN:{`\u00A0`}
                    </abbr>
                  </span>
                  {isbn}
                  <span>{`. `}</span>
                </span>
              )}
              {fallback}
            </div>
          </div>
        )}
      </div>
    );
  }
}

function RdfaPublisher({
  id,
  className,
  predicate = 'schema:publisher',
  object: publisher
}) {
  if (!publisher || !publisher.name) return null;

  const url = publisher.url || getId(publisher);

  const name = (
    <Value tagName="span" property="schema:name">
      {publisher.name}
    </Value>
  );

  return (
    <span
      id={id}
      className={classNames('rdfa-publisher', className)}
      property={predicate}
      typeof={prefix(publisher['@type'])}
      resource={getId(publisher)}
    >
      {isUrl(url) ? (
        <a property="schema:url" href={url}>
          {name}
        </a>
      ) : (
        name
      )}
    </span>
  );
}

RdfaPublisher.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.object,
  predicate: PropTypes.string
};

function RdfaContributors({ id, className, predicate, object = {}, etal }) {
  // !! there can be duplicated entries in the author and contributor list
  // ultimately this need to be fixed in document worker but we protect the code here
  const keySet = new Set();

  const contributors = flatten(
    arrayify(predicate).map(predicate => {
      const value = object[unprefix(predicate)];
      return arrayify(value)
        .filter(value => value.name || value.familyName || value.givenName)
        .map((value, i) => {
          let key =
            getId(value) || JSON.stringify(value) || `${predicate}-${i}`;

          if (keySet.has(key)) {
            let n = 0;
            while (keySet.has(`${key}-${n}`)) {
              n++;
            }
            key = `${key}-${n}`;
          }
          keySet.add(key);
          return (
            <RdfaPersonOrOrganization
              key={key}
              predicate={predicate}
              object={value}
            />
          );
        });
    })
  );

  // TODO properly model et al. in schema.org
  if (etal) {
    contributors.push(<span key="etal">et al.</span>);
  }

  className = classNames('rdfa-contributors', className);

  if (contributors.length === 1) {
    return (
      <span id={id} className={className}>
        {contributors[0]}
      </span>
    );
  } else if (contributors.length === 2) {
    return (
      <span id={id} className={className}>
        {contributors[0]}
        <span> and </span>
        {contributors[1]}
      </span>
    );
  } else {
    // TODO truncate the et al and handle the comma in CSS
    return (
      <span id={id} className={className}>
        {contributors.map((author, i) => {
          if (i > 0) {
            return (
              <span key={author.key}>
                <span>, </span>
                {author}
              </span>
            );
          }
          return author;
        })}
      </span>
    );
  }
}
RdfaContributors.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  etal: PropTypes.bool,
  predicate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  object: PropTypes.object // an object containing the unprefixed predicate as keys
};

function RdfaIsPartOf({
  id,
  className,
  object,
  predicate = 'schema:isPartOf',
  // set when called recursively
  hasIssue,
  hasVolume,
  hasWebPage
}) {
  // Issue, Volume, Periodical
  // issue 2, volume X, of periodical
  // issue 2 of periodical
  // volume X of periodical
  // periodical
  if (!object || typeof object === 'string') return null;

  if (object['@type'] === 'PublicationIssue') {
    if (object.issueNumber != null) {
      const issueNumber = (
        <span className="rdfa-is-part-of__issue-number">
          <span>issue </span>
          <Value tagName="span" property="schema:issueNumber">
            {object.issueNumber}
          </Value>
        </span>
      );
      return (
        <span
          id={id}
          className={classNames('rdfa-is-part-of', className)}
          property={predicate}
          typeof={prefix(object['@type'])}
          resource={getId(object)}
        >
          {object.url ? <a href={object.url}>{issueNumber}</a> : issueNumber}
          <RdfaIsPartOf
            object={object.isPartOf}
            predicate="schema:isPartOf"
            hasIssue={true}
          />
        </span>
      );
    }
  }

  if (object['@type'] === 'PublicationVolume') {
    if (object.volumeNumber != null) {
      const volumeNumber = (
        <span>
          <span>volume </span>
          <Value tagName="span" property="schema:volumeNumber">
            {object.volumeNumber}
          </Value>
        </span>
      );
      return (
        <span id={id} className={classNames('rdfa-is-part-of', className)}>
          {hasIssue && <span>, </span>}
          <span
            property="schema:isPartOf"
            typeof={prefix(object['@type'])}
            resource={getId(object)}
          >
            {object.url ? (
              <a href={object.url}>{volumeNumber}</a>
            ) : (
              volumeNumber
            )}
            <RdfaIsPartOf
              object={object.isPartOf}
              predicate="schema:isPartOf"
              hasIssue={hasIssue}
              hasVolume={true}
            />
          </span>
        </span>
      );
    }
    object = object.isPartOf;
  }

  if (object['@type'] === 'Periodical') {
    if (object.name != null) {
      const name = (
        <Value tagName="span" property="schema:name">
          {object.name}
        </Value>
      );

      return (
        <span>
          {(hasIssue || hasVolume) && <span> of </span>}
          <span
            id={id}
            className={classNames('rdfa-is-part-of', className)}
            property="schema:isPartOf"
            typeof={prefix(object['@type'])}
            resource={getId(object)}
          >
            {object.url ? <a href={object.url}>{name}</a> : name}
            {object.issn && (
              <span>
                <span>
                  {' '}
                  (
                  <abbr title="International Standard Serial Number">ISSN</abbr>
                  :{' '}
                </span>
                <RdfaIssn object={object.issn} />
                <span>)</span>
              </span>
            )}
          </span>
        </span>
      );
    }
  }

  if (
    object['@type'] === 'WebPage' // a `DigitalDocument` can be part of a `WebPage`
  ) {
    if (object.name != null) {
      const name = (
        <Value tagName="span" property="schema:name">
          {object.name}
        </Value>
      );

      return (
        <span id={id} className={classNames('rdfa-is-part-of', className)}>
          {hasWebPage && <span>, </span>}
          <span
            property="schema:isPartOf"
            typeof={prefix(object['@type'])}
            resource={getId(object)}
          >
            {object.url ? <a href={object.url}>{name}</a> : name}
            <RdfaIsPartOf
              object={object.isPartOf}
              predicate="schema:isPartOf"
              hasIssue={hasIssue}
              hasWebPage={true}
            />
          </span>
        </span>
      );
    }
  }

  if (
    object['@type'] === 'WebSite' // a `WebPage` can be part of a `WebSite`
  ) {
    if (object.name != null) {
      const name = (
        <Value tagName="span" property="schema:name">
          {object.name}
        </Value>
      );

      return (
        <span id={id} className={classNames('rdfa-is-part-of', className)}>
          {hasWebPage && <span>, </span>}
          <span
            property="schema:isPartOf"
            typeof={prefix(object['@type'])}
            resource={getId(object)}
          >
            {object.url ? <a href={object.url}>{name}</a> : name}
          </span>
        </span>
      );
    }
  }

  return null;
}
RdfaIsPartOf.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // string can happen during document worker reconciliation
  predicate: PropTypes.string,
  // used for recursive calls
  hasIssue: PropTypes.bool,
  hasVolume: PropTypes.bool,
  hasWebPage: PropTypes.bool
};

function RdfaDataCatalog({ id, className, object, predicate }) {
  if (object.name) {
    const name = (
      <Value tagName="span" property="schema:name">
        {object.name}
      </Value>
    );

    const url = object.url || getId(object);

    return (
      <span
        id={id}
        className={classNames(
          'rdfa-person-or-organization rdfa-person-or-organization--organization',
          className
        )}
        property={predicate}
        typeof={prefix(object['@type'])}
        resource={getId(object)}
      >
        {isUrl(url) ? (
          <a property="schema:url" href={url}>
            {name}
          </a>
        ) : (
          name
        )}
      </span>
    );
  }
}
RdfaDataCatalog.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.object,
  predicate: PropTypes.string
};

function RdfaIssn({ id, className, predicate = 'schema:issn', object: issn }) {
  if (issn == null) {
    return null;
  }
  return (
    <span
      id={id}
      className={classNames('rdfa-issn', className)}
      property={predicate}
    >
      <a href={`https://www.worldcat.org/ISSN/${issn}`}>{issn}</a>
    </span>
  );
}
RdfaIssn.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      '@type': PropTypes.string,
      '@value': PropTypes.string
    })
  ]),
  predicate: PropTypes.string
};

function RdfaIsbn({ id, className, predicate = 'schema:isbn', object: isbn }) {
  if (isbn == null) {
    return null;
  }
  return (
    <span
      id={id}
      className={classNames('rdfa-isbn', className)}
      property={predicate}
    >
      <a href={`https://www.worldcat.org/ISBN/${isbn}`}>{isbn}</a>
    </span>
  );
}
RdfaIsbn.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      '@type': PropTypes.string,
      '@value': PropTypes.string
    })
  ]),
  predicate: PropTypes.string
};

function RdfaDoi({ id, className, predicate = 'sa:doi', object: doi }) {
  if (doi == null) {
    return null;
  }
  return (
    <span
      id={id}
      className={classNames('rdfa-doi', className)}
      property={predicate}
    >
      <a href={`http://doi.org/${doi}`}>{doi}</a>
    </span>
  );
}
RdfaDoi.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      '@type': PropTypes.string,
      '@value': PropTypes.string
    })
  ]),
  predicate: PropTypes.string
};

function RdfaPagination({ id, className, object, appendPrefix }) {
  if (!object) return;
  className = classNames('rdfa-pagination', className);

  if (object.pagination) {
    return (
      <span id={id} className={className}>
        {appendPrefix && <span> page </span>}
        <Value tagName="span" property="schema:pagination">
          {object.pagination}
        </Value>
      </span>
    );
  }

  if (object.pageStart != null || object.pageEnd != null) {
    const hasBoth = !!(object.pageStart != null && object.pageEnd != null);
    return (
      <span id={id} className={className}>
        {appendPrefix && <span>{` page${hasBoth ? 's' : ''} `}</span>}
        {object.pageStart != null && (
          <Value tagName="span" property="schema:pageStart">
            {object.pageStart}
          </Value>
        )}
        {hasBoth && <span>-</span>}
        {object.pageEnd != null && (
          <Value tagName="span" property="schema:pageEnd">
            {object.pageEnd}
          </Value>
        )}
      </span>
    );
  }

  return null;
}

RdfaPagination.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,

  appendPrefix: PropTypes.bool, // page or pages
  object: PropTypes.shape({
    pagination: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        '@type': PropTypes.string,
        '@value': PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      })
    ]),
    pageStart: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pageEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })
};
