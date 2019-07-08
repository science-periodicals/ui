import React from 'react';
import PropTypes from 'prop-types';
import isUrl from 'is-url';
import { getId, arrayify, getValue, prefix } from '@scipe/jsonld';
import { getAgent } from '@scipe/librarian';
import classNames from 'classnames';
import Value from '../value';

// TODO `preferFamilyName` prop for RdfaCite

export default function RdfaPerson({
  id,
  className,
  predicate,
  object,
  preferFamilyName,
  blindedName,
  link = true
}) {
  if (!object) return null;

  // remove Role (if any);
  object = getAgent(object);

  if (
    !object ||
    !(object.name || object.givenName || object.familyName || blindedName)
  ) {
    return null;
  }

  const url = arrayify(object.url)
    .concat(arrayify(getId(object)), arrayify(object.sameAs))
    .find(uri => isUrl(uri));

  const familyNameOnly = preferFamilyName && object.familyName;

  const name = (
    <span className="rdfa-person__names">
      {!familyNameOnly && object.name && (
        <Value tagName="span" property="schema:name">
          {object.name}
        </Value>
      )}
      {!familyNameOnly && object.givenName && (
        <Value tagName="span" property="schema:givenName">
          {object.givenName}
        </Value>
      )}
      {!familyNameOnly &&
        arrayify(object.additionalName)
          .filter(additionalName => additionalName)
          .map(additionalName => (
            <Value
              key={getValue(additionalName)}
              tagName="span"
              property="schema:additionalName"
            >
              {additionalName}
            </Value>
          ))}
      {object.familyName && (
        <Value tagName="span" property="schema:familyName">
          {object.familyName}
        </Value>
      )}
    </span>
  );

  return (
    <span
      id={id}
      className={classNames('rdfa-person', className)}
      property={predicate}
      typeof={prefix(object['@type'])}
      resource={getId(object)}
    >
      {blindedName ? (
        <span>{blindedName}</span>
      ) : (
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
      )}
    </span>
  );
}

RdfaPerson.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.object,
  predicate: PropTypes.string,
  preferFamilyName: PropTypes.bool,
  blindedName: PropTypes.string,
  link: PropTypes.bool // used to avoid nested <a> if used within an <a> already
};
