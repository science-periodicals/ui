import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getId, arrayify, prefix } from '@scipe/jsonld';
import { schema } from '@scipe/librarian';
import { Div } from '../elements';
import { getFunderTree } from '../../utils/graph';
import RdfaPersonOrOrganization from './rdfa-person-or-organization';
import RdfaFundingSource from './rdfa-funding-source';
import RdfaCite from './rdfa-cite';
import BemTags from '../../utils/bem-tags';

export default class RdfaFundingTable extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    object: PropTypes.object, // a Graph (hydrated unless a funderTree prop is also passed, in particular the @graph part must contain the hydrated resource)
    funderTree: PropTypes.arrayOf(
      PropTypes.shape({
        funder: PropTypes.object,
        roles: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.object, // SponsorRole
            roleProp: PropTypes.oneOf(['sponsor', 'funder']),
            targets: PropTypes.arrayOf(PropTypes.object) // list of resources, person or org
          })
        )
      })
    )
  };

  renderFunder(bem, funder) {
    return <RdfaPersonOrOrganization object={funder} />;
  }

  renderRole(bem, role) {
    // This mostly renders the funding source but also takes care of the RDFa linking for the role
    let { roleOffer } = role;
    roleOffer = arrayify(roleOffer)[0]; // For now we only keep first entry if it's a list: right now roleOffer can be a @set we should change that in document worker and the ontology

    return (
      <div
        resource={getId(role)}
        typeof={prefix(role['@type'])}
        className={bem`__role`}
      >
        <RdfaFundingSource predicate={prefix('roleOffer')} object={roleOffer} />
      </div>
    );
  }

  renderNote(bem, role) {
    const { description } = role;
    if (!description) return null;
    return <Div className={bem`__note`}>{description}</Div>;
  }

  renderTarget(target) {
    const { object } = this.props;

    if (schema.is(target, 'Person') || schema.is(target, 'Organization')) {
      return <RdfaPersonOrOrganization object={target} />;
    } else {
      const isMainEntity =
        getId(object.mainEntity) && getId(object.mainEntity) === getId(target);
      return (
        <RdfaCite
          graphId={getId(object)}
          object={target}
          onlyLinkExternalUrl={!!isMainEntity}
          nameOverwrite={isMainEntity ? 'Research project' : undefined}
        />
      );
    }
  }

  renderTargets(bem, funder, role, roleProp, targets) {
    // this is where we do most of the RDFa linking...
    return (
      <ul className={bem`__list`}>
        {arrayify(targets).map(target => (
          <li key={getId(target)} className={bem`__list-item`}>
            {this.renderTarget(target)}
            <link
              about={getId(target)}
              rel={prefix(roleProp)}
              href={getId(role)}
            />
            <link
              about={getId(role)}
              rel={prefix(roleProp)}
              href={getId(funder)}
            />
          </li>
        ))}
      </ul>
    );
  }

  render() {
    let { id, className, object, funderTree } = this.props;
    funderTree = funderTree || getFunderTree(object);
    const hasNotes = funderTree.some(entry =>
      arrayify(entry.roles).some(
        ({ value: role = {} } = {}) => role.description
      )
    );

    const bem = BemTags();
    // See https://www.w3.org/WAI/tutorials/tables/irregular/#table-with-headers-spanning-multiple-rows-or-columns for markup best practice
    return (
      <div id={id} className={bem`rdfa-funding-table` + classNames(className)}>
        <table className={bem`__table`}>
          <thead className={bem`__table-head`}>
            <tr className={bem`____table-row`}>
              <th scope="col" className={bem`__table-cell --header`}>
                Source
              </th>
              <th scope="col" className={bem`__table-cell --header`}>
                Award
              </th>
              <th scope="col" className={bem`__table-cell --header`}>
                Target
              </th>
              {hasNotes && (
                <th scope="col" className={bem`__table-cell --header`}>
                  Comment
                </th>
              )}
            </tr>
          </thead>
          {funderTree.map(({ funder, roles }) => (
            <tbody
              key={getId(funder) || JSON.stringify(funder)}
              className={bem`__table-body`}
            >
              {roles.map(({ value: role = {}, roleProp, targets }, i) => (
                <tr
                  key={getId(role) || JSON.stringify(role)}
                  className={bem`__table-row`}
                >
                  {i === 0 && (
                    <th
                      rowSpan={roles.length}
                      scope="rowgroup"
                      className={bem`__table-cell --header`}
                    >
                      {this.renderFunder(bem, funder)}
                    </th>
                  )}
                  <th scope="row" className={bem`__table-cell --header`}>
                    {this.renderRole(bem, role)}
                  </th>
                  <td className={bem`__table-cell`}>
                    {this.renderTargets(bem, funder, role, roleProp, targets)}
                  </td>
                  {hasNotes && (
                    <td className={bem`__table-cell`}>
                      {this.renderNote(bem, role)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    );
  }
}
