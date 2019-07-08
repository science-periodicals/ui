import React from 'react';
import PropTypes from 'prop-types';
import romanize from 'romanize';
import classNames from 'classnames';
import { getId, arrayify, prefix } from '@scipe/jsonld';
import { A } from '../elements';

// TODO RDFa

export default class RdfaContributorNotes extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    object: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // Hydrated `ContributorRole`
    mainEntity: PropTypes.object.isRequired // Hydrated main entity so that we can compute the affiliation index
  };

  render() {
    const { id, className, object: role, mainEntity, ...others } = this.props;

    const affiliationMap = getOrderedAffiliationMap(mainEntity);
    const contributorNotes = getOrderedContributorNotes(role);

    return (
      <ul
        id={id}
        className={classNames(
          'rdfa-contributor-notes',
          'sa__inline-list sa__inline-list--sup',
          className
        )}
        {...others}
      >
        {arrayify(role.roleAffiliation)
          .filter(affiliation => affiliationMap.has(getId(affiliation)))
          .map(affiliation => (
            <li key={getId(affiliation)}>
              <sup>
                <A
                  id={
                    `${getId(role)}-${getId(
                      affiliation
                    )}` /* Needed for the back link */
                  }
                  href={`#${getId(affiliation)}`}
                  property={prefix('roleAffiliation')}
                  resource={getId(affiliation)}
                >
                  {affiliationMap.get(getId(affiliation)).label}
                </A>
              </sup>
            </li>
          ))}

        {arrayify(contributorNotes).map(({ propery, note, noteIdentifier }) => (
          <li key={getId(arrayify(note)[0])}>
            <sup>
              <A
                id={`fn${noteIdentifier}.0` /* Needed for the back link */}
                data-role-id={getId(role) /* Needed for shell in app-suite */}
                href={`#${getId(arrayify(note)[0])}`}
                property={prefix(propery)}
                resource={getId(arrayify(note)[0])}
              >
                {noteIdentifier}
              </A>
            </sup>
          </li>
        ))}
      </ul>
    );
  }
}

function getOrderedAffiliationMap(
  resource = {}, // hydrated
  start = 1
) {
  const map = new Map();
  // We create a Map (as it preserve order) and be sure to have good insertion
  // ordered so that it can be iterated by insertion order
  let i = start;
  arrayify(resource.author)
    .concat(arrayify(resource.contributor))
    .forEach(role => {
      const affiliations = arrayify(role.roleAffiliation);
      affiliations.forEach(affiliation => {
        const affiliationId = getId(affiliation);
        if (affiliationId) {
          if (!map.has(affiliationId)) {
            map.set(affiliationId, {
              label: romanize(i++).toLowerCase(),
              affiliation
            });
          }
        }
      });
    });

  return map;
}

function getOrderedContributorNotes(
  role // hydrated
) {
  const notes = [];
  if (role.roleContactPointNoteIdentifier != null && role.roleContactPoint) {
    notes.push({
      propery: 'roleContactPoint',
      noteIdentifier: role.roleContactPointNoteIdentifier,
      note: role.roleContactPoint
    });
  }

  if (role.roleAction) {
    arrayify(role.roleAction).forEach(roleAction => {
      if (roleAction.noteIdentifier != null) {
        notes.push({
          propery: 'roleAction',
          noteIdentifier: roleAction.noteIdentifier,
          note: roleAction
        });
      }
    });
  }

  return notes.sort((a, b) => a.identifier - b.identifier);
}
