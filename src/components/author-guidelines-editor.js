import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { createId } from '@scipe/librarian';
import { getId, arrayify, getNodeMap } from '@scipe/jsonld';
import PublicationElementTypeEditor from './publication-element-type-editor';
import Divider from './divider';
import PaperActionButton from './paper-action-button';

export default class AuthorGuidelinesEditor extends React.Component {
  static propTypes = {
    objectSpecification: PropTypes.shape({
      '@graph': PropTypes.arrayOf(PropTypes.object)
    }),
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool
  };

  static defaultProps = {
    objectSpecification: {},
    onChange: noop
  };

  static getDerivedStateFromProps(props, state) {
    if (state.lastObjectSpecification !== props.objectSpecification) {
      return {
        webPageElementIds: getWebpageElementIds(props.objectSpecification),
        lastObjectSpecification: props.objectSpecification
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      webPageElementIds: getWebpageElementIds(props.objectSpecification),
      lastObjectSpecification: props.objectSpecification
    };
  }

  handleChange = nextPublicationElementType => {
    const { onChange, objectSpecification } = this.props;

    const nextObjectSpecification = {
      '@graph': arrayify(objectSpecification['@graph']).map(node => {
        if (getId(node) === getId(nextPublicationElementType)) {
          return nextPublicationElementType;
        }
        return node;
      })
    };

    onChange(nextObjectSpecification);
  };

  handleAdd = () => {
    const { onChange, objectSpecification } = this.props;

    const newPublicationElementType = {
      '@id': createId('blank')['@id'],
      '@type': 'PublicationElementType'
    };

    const newWebPageElement = {
      '@id': createId('blank')['@id'],
      '@type': 'WebPageElement',
      additionalType: getId(newPublicationElementType)
    };

    const nodeMap = getNodeMap(objectSpecification);
    const graph = arrayify(objectSpecification['@graph']).find(
      node => node['@type'] === 'Graph'
    );
    if (graph) {
      const mainEntity = nodeMap[getId(graph.mainEntity)];
      if (mainEntity) {
        const nextMainEntity = Object.assign({}, mainEntity, {
          hasPart: arrayify(mainEntity.hasPart).concat(getId(newWebPageElement))
        });

        const nextObjectSpecification = {
          '@graph': arrayify(objectSpecification['@graph'])
            .map(node => {
              if (getId(node) === getId(nextMainEntity)) {
                return nextMainEntity;
              }
              return node;
            })
            .concat(newWebPageElement, newPublicationElementType)
        };

        onChange(nextObjectSpecification);
      }
    }
  };

  handleDelete = webPageElementId => {
    const { objectSpecification, onChange } = this.props;
    const { webPageElementIds } = this.state;

    const nextWebPageElementsIds = webPageElementIds.filter(
      id => id !== webPageElementId
    );

    this.setState({
      webPageElementsIds: nextWebPageElementsIds
    });

    const deletedNode = arrayify(objectSpecification['@graph']).find(
      node => getId(node) === webPageElementId
    );
    if (deletedNode) {
      const nodeMap = getNodeMap(objectSpecification);
      const graph = arrayify(objectSpecification['@graph']).find(
        node => node['@type'] === 'Graph'
      );
      const mainEntity = nodeMap[getId(graph.mainEntity)];
      const nextMainEntity = Object.assign({}, mainEntity, {
        hasPart: arrayify(mainEntity.hasPart).filter(
          id => id !== webPageElementId
        )
      });
      if (!nextMainEntity.hasPart.length) {
        delete nextMainEntity.hasPart;
      }

      const nextGraph = arrayify(objectSpecification['@graph'])
        .filter(node => {
          return (
            getId(node) !== getId(deletedNode) &&
            getId(node) !== getId(deletedNode.additionalType)
          );
        })
        .map(node => {
          if (getId(node) === getId(nextMainEntity)) {
            return nextMainEntity;
          }
          return node;
        });

      onChange({ '@graph': nextGraph });
    }
  };

  handleOrder = (webPageElementId, hoverWebPageElementId, dropped) => {
    const { onChange, objectSpecification } = this.props;
    const { webPageElementIds } = this.state;

    const nextWebPageElementIds = webPageElementIds.slice();
    const index = webPageElementIds.findIndex(id => id === webPageElementId);
    const hoverIndex = webPageElementIds.findIndex(
      id => id === hoverWebPageElementId
    );

    nextWebPageElementIds[index] = hoverWebPageElementId;
    nextWebPageElementIds[hoverIndex] = webPageElementId;

    this.setState({
      webPageElementIds: nextWebPageElementIds
    });

    if (dropped) {
      const nodeMap = getNodeMap(objectSpecification);
      const graph = arrayify(objectSpecification['@graph']).find(
        node => node['@type'] === 'Graph'
      );
      if (graph) {
        const mainEntity = nodeMap[getId(graph.mainEntity)];
        if (mainEntity) {
          const nextMainEntity = Object.assign({}, mainEntity, {
            hasPart: arrayify(mainEntity.hasPart)
              .filter(id => !webPageElementIds.some(_id => id === _id))
              .concat(webPageElementIds)
          });

          const nextObjectSpecification = {
            '@graph': arrayify(objectSpecification['@graph']).map(node => {
              if (getId(node) === getId(nextMainEntity)) {
                return nextMainEntity;
              }
              return node;
            })
          };

          onChange(nextObjectSpecification);
        }
      }
    }
  };

  render() {
    const { webPageElementIds } = this.state;
    const { objectSpecification, readOnly, disabled } = this.props;

    const nodeMap = getNodeMap(objectSpecification);

    return (
      <div className="author-guidelines-editor">
        <div className="author-guidelines-editor__sections">
          <ol className="author-guidelines-editor__sections-list">
            {webPageElementIds.map((webPageElementId, i) => (
              <li key={webPageElementId}>
                <div className="author-guidelines-editor__sections-list-item">
                  <PublicationElementTypeEditor
                    nodeMap={nodeMap}
                    webPageElementId={webPageElementId}
                    webPageElementIds={webPageElementIds}
                    readOnly={readOnly}
                    disabled={disabled}
                    onChange={this.handleChange}
                    onDelete={this.handleDelete}
                    onOrder={this.handleOrder}
                  />
                </div>
                {i !== webPageElementIds.length - 1 ? <Divider /> : null}
              </li>
            ))}
          </ol>
        </div>

        {!readOnly && (
          <div className="author-guidelines-editor__add">
            <PaperActionButton
              iconName="add"
              large={false}
              disabled={disabled}
              readOnly={readOnly}
              onClick={this.handleAdd}
            />
          </div>
        )}
      </div>
    );
  }
}

function getWebpageElementIds(objectSpecification) {
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

  return webPageElementIds;
}
