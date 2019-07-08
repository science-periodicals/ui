import React, { Component } from 'react';
import { flatten, getNodeMap } from '@scipe/jsonld';
import { GraphOverview, getResourceInfo } from '../../src';
import data from '../../test/fixtures/graph';

export default class GraphOverviewExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightedResource: undefined,
      graph: undefined,
      nodeMap: undefined,
      resourceInfo: undefined
    };
    this.handleHighlightResource = this.handleHighlightResource.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    flatten(data, (err, flattened) => {
      if (err) throw err;
      const graph = flattened;
      const nodeMap = getNodeMap(graph);
      const resourceInfo = getResourceInfo(graph, nodeMap);
      if (this._isMounted) {
        this.setState({ graph, nodeMap, resourceInfo });
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleHighlightResource(resourceId) {
    this.setState({ highlightedResource: resourceId });
  }

  render() {
    const { graph, nodeMap, resourceInfo } = this.state;
    return (
      <div className="example">
        <GraphOverview
          graph={graph}
          nodeMap={nodeMap}
          resourceInfo={resourceInfo}
          onHighlightResource={this.handleHighlightResource}
          highlightedResource={this.state.highlightedResource}
        />
      </div>
    );
  }
}
