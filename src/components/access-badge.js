import React from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import classNames from 'classnames';
import { checkOpenAccess } from '../utils/graph';
import Tooltip from './tooltip';

export default class AccessBadge extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    // can pass a graph or a workflow specification
    graph: PropTypes.object, // a release
    workflowSpecification: PropTypes.object,
    size: PropTypes.string
  };

  static defaultProps = {
    size: '24px'
  };

  render() {
    const { id, className, workflowSpecification, graph, size } = this.props;

    const isOpenAccess = checkOpenAccess(graph || workflowSpecification);

    return (
      <span className={classNames('access-badge', className)}>
        <Tooltip
          id={id}
          displayText={isOpenAccess ? 'Open Access' : 'Closed Access'}
        >
          <Iconoclass
            iconName={isOpenAccess ? 'accessOpen' : 'accessClosed'}
            size={size}
            round={true}
          />
        </Tooltip>
      </span>
    );
  }
}
