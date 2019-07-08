import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { arrayify, getNodeMap, getId } from '@scipe/jsonld';
import { DEFAULT_PEER_REVIEW_TYPES } from '@scipe/librarian';
import { getViewIdentityPermissionMatrix } from '../utils/graph';
import Tooltip from './tooltip';

export default class PeerReviewBadge extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    workflowSpecification: PropTypes.object
  };

  static defaultProps = {
    workflowSpecification: {}
  };

  render() {
    // TODO return null if workflow has no ReviewAction ?
    const { id, className, workflowSpecification } = this.props;

    // partial embed of the ViewIdentityPermission
    const createGraphAction = arrayify(
      workflowSpecification.potentialAction
    )[0];
    const nodes = arrayify(
      createGraphAction &&
        createGraphAction.result &&
        createGraphAction.result['@graph']
    );

    const graphNodes = nodes.filter(
      node => node['@type'] === 'Graph' && node.version == null
    );

    const rootGraph = graphNodes.find(
      graphNode => !nodes.some(node => getId(node.result) === getId(graphNode))
    );
    const nodeMap = getNodeMap(nodes);

    const permissions = arrayify(
      rootGraph && rootGraph.hasDigitalDocumentPermission
    )
      .map(id => {
        const permission = nodeMap[id];
        if (
          permission &&
          permission.permissionType === 'ViewIdentityPermission'
        ) {
          return Object.assign({}, permission, {
            grantee: arrayify(permission.grantee).map(id => nodeMap[id] || id),
            permissionScope: arrayify(permission.permissionScope).map(
              id => nodeMap[id] || id
            )
          });
        }
      })
      .filter(Boolean);

    const permissionsMatrix = getViewIdentityPermissionMatrix(permissions);

    const peerReviewType =
      Object.keys(DEFAULT_PEER_REVIEW_TYPES).find(peerReviewType => {
        return isEqual(
          permissionsMatrix,
          getViewIdentityPermissionMatrix(
            DEFAULT_PEER_REVIEW_TYPES[peerReviewType].permissions
          )
        );
      }) || 'custom';

    const label = DEFAULT_PEER_REVIEW_TYPES[peerReviewType].name;

    return (
      <div className={classNames(className, 'peer-review-badge')} id={id}>
        <span className="peer-review-badge__text">
          <Tooltip displayText={label}>{label}</Tooltip>
        </span>
      </div>
    );
  }
}
