import React from 'react';
import PropTypes from 'prop-types';
import { arrayify, textify, getId, getNodeMap } from '@scipe/jsonld';
import Value from './value';

export default class AuthorGuidelines extends React.Component {
  static propTypes = {
    publicationType: PropTypes.object
  };

  static defaultProps = {
    publicationType: {}
  };

  render() {
    const {
      publicationType: { objectSpecification = {} }
    } = this.props;

    const nodeMap = getNodeMap(objectSpecification);
    const graph = arrayify(objectSpecification['@graph']).find(
      node => node['@type'] === 'Graph'
    );
    const mainEntity = nodeMap[getId(graph && graph.mainEntity)];
    const webPageElementIds = arrayify(mainEntity && mainEntity.hasPart).filter(
      nodeId => {
        const node = nodeMap[nodeId];
        return node && node['@type'] === 'WebPageElement';
      }
    );

    if (!webPageElementIds.length) {
      return null;
    }

    return (
      <div className="author-guidelines">
        <h3>Manuscript structure</h3>

        <ul className="author-guidelines__section-list">
          {webPageElementIds.map(webPageElementId => {
            const webPageElement = nodeMap[webPageElementId] || {};
            const additionalType = nodeMap[webPageElement.additionalType];
            return (
              <li
                key={getId(webPageElement) || getId(additionalType)}
                className="author-guidelines__section-list-item"
              >
                <header className="author-guidelines__section-name">
                  {textify(additionalType.name)}
                </header>
                <Value>{additionalType.description}</Value>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
