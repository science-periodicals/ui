import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isUrl from 'is-url';
import { getScopeId, getAgent } from '@scipe/librarian';
import { getId, arrayify, textify, prefix } from '@scipe/jsonld';
import { Span, Cite } from '../elements';
import RdfaDate from './rdfa-date';
import RdfaPersonOrOrganization from './rdfa-person-or-organization';

// TODO add support for point citation

/**
 * render a short citation from a resource e.g
 *  - Figure 1 (if `resourceOf`)
 *  - Bogich et. al (2015)
 *  - name || alternateName
 *  - url (if no name)
 *  - fallback
 */
export default class RdfaCite extends React.Component {
  renderBody() {
    const { object, graphId, fallback, nameOverwrite } = this.props;

    if (nameOverwrite) {
      return <Span>{nameOverwrite}</Span>;
    }

    //  - Figure 1 (if `resourceOf`)
    if (
      object.resourceOf &&
      getScopeId(object.resourceOf) === getScopeId(graphId)
    ) {
      if (object.alternateName || object.name) {
        const key = object.alternateName ? 'alternateName' : 'name';
        return <Cite property={`schema:${key}`}>{object[key]}</Cite>;
      }
    }

    const authors = arrayify(object.author);

    //  - Bogich et al. (2015)
    if (
      object.datePublished &&
      authors.length &&
      authors.every(role => {
        const author = getAgent(role);
        return author.familyName;
      })
    ) {
      let names;

      if (authors.length === 1) {
        names = (
          <RdfaPersonOrOrganization
            object={authors[0]}
            predicate="schema:author"
            preferFamilyName={true}
            link={false}
          />
        );
      } else if (authors.length === 2) {
        names = (
          <span>
            <RdfaPersonOrOrganization
              object={authors[0]}
              predicate="schema:author"
              preferFamilyName={true}
              link={false}
            />
            and{' '}
            <RdfaPersonOrOrganization
              object={authors[1]}
              predicate="schema:author"
              preferFamilyName={true}
              link={false}
            />
          </span>
        );
      } else {
        names = (
          <span>
            <RdfaPersonOrOrganization
              object={authors[0]}
              predicate="schema:author"
              preferFamilyName={true}
              link={false}
            />{' '}
            et al.
          </span>
        );
      }

      return (
        <span>
          {names} (
          <RdfaDate
            predicate="schema:datePublished"
            object={object.datePublished}
            format="Y"
          />
          )
        </span>
      );
    }

    // alternateName or name
    if (object.alternateName || object.name) {
      const key = object.alternateName ? 'alternateName' : 'name';
      return <Cite property={`schema:${key}`}>{object[key]}</Cite>;
    }

    //  - url
    if (isUrl(object.url) || isUrl(getId(object))) {
      const url = object.url || getId(object);
      // we are already within a link so just the value here
      return <Span property="schema:url">{url}</Span>;
    }

    // - fallback
    return <span>{fallback}</span>;
  }

  render() {
    const {
      id,
      className,
      object,
      predicate,
      onClick,
      onlyLinkExternalUrl
    } = this.props;

    if (!object) return null;

    const url = object.url || getId(object);

    return React.createElement(
      onlyLinkExternalUrl && !isUrl(url) ? 'span' : 'a',
      {
        id,
        className: classNames('rdfa-cite', 'value', className),
        property: predicate,
        href: isUrl(url)
          ? url
          : onlyLinkExternalUrl
          ? undefined
          : `#${getId(object)}`,
        onClick: onClick,
        resource: getId(object),
        typeof: prefix(object['@type']),
        title: object.description ? textify(object.description) : undefined
      },
      this.renderBody()
    );
  }
}

RdfaCite.defaultProps = {
  fallback: 'source'
};
RdfaCite.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  predicate: PropTypes.string,
  object: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // a resource (hydrated)
  graphId: PropTypes.string,
  fallback: PropTypes.string,
  onClick: PropTypes.func,
  onlyLinkExternalUrl: PropTypes.bool,
  nameOverwrite: PropTypes.string // the opposite of fallback, overwrites the displayed name for the resource. Typically used for funding table
};
