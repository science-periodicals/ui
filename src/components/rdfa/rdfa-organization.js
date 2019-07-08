import React from 'react';
import PropTypes from 'prop-types';
import isUrl from 'is-url';
import { getAgent } from '@scipe/librarian';
import { getId, arrayify, prefix } from '@scipe/jsonld';
import classNames from 'classnames';
import { Span } from '../elements';

export default class RdfaOrganization extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    recursive: PropTypes.bool,
    className: PropTypes.string,
    object: PropTypes.object,
    predicate: PropTypes.string,
    location: PropTypes.bool,
    blindedName: PropTypes.string,
    link: PropTypes.bool, // used to avoid nested <a> if used within an <a> already
    children: PropTypes.any // used as a fallback
  };

  static defaultProps = {
    recursive: true,
    link: true,
    location: true
  };

  renderLocation(location) {
    location = location.address || location; // support for legacy document-worker stuff where location was a Place with an Address

    const { addressLocality, addressRegion, addressCountry } = location;
    if (!addressLocality && !addressRegion && !addressCountry) {
      return null;
    }

    return (
      <span resource={getId(location)} typeof={prefix(location['@type'])}>
        {!!addressLocality && (
          <Span property={prefix('addressLocality')}>{addressLocality}</Span>
        )}
        {!!addressLocality && !!(addressRegion || addressCountry) && ', '}
        {!!addressRegion && (
          <Span property={prefix('addressRegion')}>{addressRegion}</Span>
        )}
        {!!addressRegion && !!addressCountry && ', '}
        {!!addressCountry && (
          <Span property={prefix('addressCountry')}>{addressCountry}</Span>
        )}
      </span>
    );
  }

  render() {
    let {
      id,
      className,
      recursive,
      predicate,
      object,
      link,
      location,
      blindedName,
      children
    } = this.props;
    if (!object) return null;
    // remove Role (if any);
    object = getAgent(object);
    if (!object) return null;

    if (blindedName) {
      return (
        <span
          id={id}
          className={classNames('rdfa-organization', className)}
          property={predicate}
          typeof={prefix(object['@type'])}
          resource={getId(object)}
        >
          {blindedName}
        </span>
      );
    }

    const url = arrayify(object.url)
      .concat(arrayify(getId(object)), arrayify(object.sameAs))
      .find(uri => isUrl(uri));

    if (object.name) {
      const name = <Span property="schema:name">{object.name}</Span>;
      return (
        <span
          id={id}
          className={classNames('rdfa-organization', className)}
          property={predicate}
          typeof={prefix(object['@type'])}
          resource={getId(object)}
        >
          <span resource={getId(object)}>
            {url && link ? (
              <a
                className="value"
                property="schema:url"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
              </a>
            ) : (
              name
            )}
          </span>
          {recursive && object.parentOrganization && <span> ‹ </span>}
          {recursive && (
            <RdfaOrganization
              predicate={prefix('parentOrganization')}
              object={object.parentOrganization}
              link={link}
              location={location}
            />
          )}
          {location && !object.parentOrganization && !!object.location && (
            <span
              property={prefix('location')}
              resource={getId(object.location.address || object.location)}
            >
              <span> — </span>
              {this.renderLocation(object.location)}
            </span>
          )}
        </span>
      );
    }

    return children || null;
  }
}
