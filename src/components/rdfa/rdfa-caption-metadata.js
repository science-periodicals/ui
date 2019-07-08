import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import classNames from 'classnames';
import isPlainObject from 'lodash/isPlainObject';
import isUrl from 'is-url';
import groupBy from 'lodash/groupBy';
import { getId, arrayify, unprefix, prefix } from '@scipe/jsonld';
import { schema, getAgent, getAgentId } from '@scipe/librarian';
import RdfaPersonOrOrganization from './rdfa-person-or-organization';
import RdfaCite from './rdfa-cite';
import RdfaCopyright from './rdfa-copyright';
import RdfaLicense from './rdfa-license';
import BemTags from '../../utils/bem-tags';
import { getDisplayName } from '../../utils/graph';
import RdfaContributorNotes from './rdfa-contributor-notes';

export default class RdfaCaptionMetadata extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    object: PropTypes.object, // a resource. Note that isBasedOn, exampleOfWork etc must be hydrated
    graphId: PropTypes.string,
    isBlinded: PropTypes.bool,
    blindingData: PropTypes.object, // required if isBlinded is true
    displayParts: PropTypes.bool,
    displayAuthors: PropTypes.bool,
    displayContributors: PropTypes.bool,
    displayLicenses: PropTypes.bool,
    displayCopyright: PropTypes.bool,
    displaySources: PropTypes.bool,

    mainEntity: PropTypes.object, // required for contributor notes

    theme: PropTypes.oneOf(['list', 'inline', 'print-list', 'print-inline']),
    isPrinting: PropTypes.bool
  };

  static defaultProps = {
    displayParts: true,
    displayAuthors: true,
    displayContributors: true,
    displayLicenses: true,
    displayCopyright: true,
    displaySources: true,
    theme: 'list'
  };

  renderLicense(bem) {
    const { object, isPrinting } = this.props;
    const licenses = arrayify(object.license);
    if (!licenses.length) {
      return null;
    }

    return (
      <li className={bem`__list-item --licenses`}>
        <span className={bem`__label`}>{`${pluralize(
          'License',
          licenses.length
        )}: `}</span>
        <ul className={bem`__sub-list --licenses`}>
          {licenses.map(license => (
            <RdfaLicense
              key={getId(license) || JSON.stringify(license)}
              object={license}
              isPrinting={isPrinting}
            />
          ))}
        </ul>
      </li>
    );
  }

  renderCopyright(bem) {
    const { object } = this.props;
    if (
      object.copyrightYear == null &&
      !arrayify(object.copyrightHolder).some(
        holder => holder.name || holder.givenName || holder.familyName
      )
    ) {
      return null;
    }

    return (
      <li>
        <span>Copyright: </span>
        <RdfaCopyright object={object} />
      </li>
    );
  }

  renderContributor(bem, predicate, label) {
    const { object, blindingData, isBlinded, mainEntity } = this.props;
    const key = unprefix(predicate);

    const roles = arrayify(object[key]).filter(role => {
      const unroled = getAgent(role);
      return unroled.name || unroled.familyName || unroled.givenName;
    });

    if (!roles.length) {
      return null;
    }

    return (
      <li className={bem`__list-item --authors`}>
        <span>{`${pluralize(label, roles.length)}: `}</span>
        <ul className={bem`__sub-list --authors @__inline-list`}>
          {roles.map(role => {
            const unroled = getAgent(role);

            return (
              <li
                key={
                  getId(unroled) ||
                  getAgentId(unroled) ||
                  JSON.stringify(unroled)
                }
              >
                <RdfaPersonOrOrganization
                  object={unroled}
                  predicate={predicate}
                  blindedName={
                    isBlinded
                      ? getDisplayName(blindingData, unroled, {
                          roleName: 'author',
                          alwaysPrefix: true
                        })
                      : undefined
                  }
                />

                <RdfaContributorNotes object={role} mainEntity={mainEntity} />
              </li>
            );
          })}
        </ul>
      </li>
    );
  }

  renderSources(bem) {
    const { object } = this.props;

    const type2prefix = {
      Dataset: 'Data',
      Table: 'Data',
      SoftwareSourceCode: 'Code',
      Image: 'Figure',
      Photograph: 'Photograph',
      Painting: 'Painting',
      VisualArtwork: 'Artwork',
      Audio: 'Audio',
      Video: 'Video'
    };

    const prop2term = {
      isBasedOn: 'from',
      exampleOfWork: 'reproduced from',
      provider: 'Courtesy of'
    };

    const keys = Object.keys(prop2term)
      .sort()
      .filter(key =>
        arrayify(object[key]).some(source => {
          if (key === 'provider') {
            return source.name || source.givenName || source.familyName;
          }

          return getId(source) || isUrl(source);
        })
      );

    if (!keys.length) return null;

    return (
      <li className={bem`__list-item`}>
        <ul className={bem`__sub-list --sources`}>
          {keys.map(key => {
            // group by types
            const sources = arrayify(object[key]);
            const grouped = groupBy(
              sources,
              source =>
                type2prefix[
                  key === 'provider' ? object['@type'] : source['@type']
                ] || 'Source'
            );
            const term = prop2term[key];

            return Object.keys(grouped)
              .sort()
              .map(groupKey => {
                const label = `${groupKey} ${term}`;
                return (
                  <li key={label}>
                    <span>{`${label}: `}</span>
                    <ul className={bem`@__inline-list`}>
                      {grouped[groupKey].map(source => {
                        return (
                          <li key={getId(source) || JSON.stringify(source)}>
                            {key === 'provider' ? (
                              <RdfaPersonOrOrganization
                                predicate={prefix(key)}
                                object={source}
                              />
                            ) : (
                              <RdfaCite
                                predicate={prefix(key)}
                                object={source}
                              />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              });
          })}
        </ul>
      </li>
    );
  }

  render() {
    let {
      id,
      className,
      theme,
      object,
      isBlinded,
      displayParts,
      displayAuthors,
      displayContributors,
      displayLicenses,
      displayCopyright,
      displaySources
    } = this.props;

    const bem = BemTags('@sa');
    // be sure to call bem first before the sub render;
    className = classNames(
      bem`rdfa-caption-metadata`,
      className,
      `rdfa-caption-metadata--${theme}`
    );

    const license = displayLicenses && this.renderLicense(bem);
    const copyright =
      !isBlinded && displayCopyright && this.renderCopyright(bem);
    const authors =
      displayAuthors && this.renderContributor(bem, 'schema:author', 'Author');
    const contributors =
      displayContributors &&
      this.renderContributor(bem, 'schema:contributor', 'Contributor');
    const sources = displaySources && this.renderSources(bem);

    if (!license && !copyright && !authors && !contributors && !sources) {
      return null;
    }

    return (
      <div
        id={id}
        className={className}
        resource={getId(object)}
        typeof={prefix(object['@type'])}
      >
        <ul className={bem`__master-list`}>
          {authors}
          {contributors}
          {license}
          {displayCopyright && copyright}
          {sources}
        </ul>

        {schema.is(object, 'Image') && displayParts
          ? arrayify(object.hasPart)
              .filter(part => isPlainObject(part))
              .map(part => (
                <div
                  key={getId(part) || JSON.stringify(part)}
                  property="schema:hasPart"
                  resource={getId(part)}
                >
                  <RdfaCaptionMetadata object={part} theme={theme} />
                </div>
              ))
          : null}
      </div>
    );
  }
}
