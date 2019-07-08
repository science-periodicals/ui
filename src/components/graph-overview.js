import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import { getId, arrayify } from '@scipe/jsonld';
import { schema } from '@scipe/librarian';
import {
  getCssType,
  getRequirements,
  getDependents,
  getParentResource,
  findResource,
  getResourceParts
} from '../utils/graph';
import RatingDots from './rating-dots';
import LinkBar from './link-bar';
import DateFromNow from './date-from-now';
import Hyperlink from './hyperlink';
import { Span } from './elements';

const LABELS = {
  Dataset: 'Data',
  DataCatalog: 'Data',
  DataDownload: 'Data',
  ImageObject: 'Image',
  AudioObject: 'Audio',
  VideoObject: 'Video',
  FormulaObject: 'Formula',
  WPSideBar: 'Text Box',
  SoftwareSourceCode: 'Code',
  SoftwareSourceCodeObject: 'Code',
  TableObject: 'Table',
  DocumentObject: 'Article',
  Article: 'Article',
  ScholarlyArticle: 'Article'
};

export default class GraphOverview extends Component {
  static propTypes = {
    graph: PropTypes.object,
    nodeMap: PropTypes.object,
    resourceInfo: PropTypes.shape({
      resourceIds: PropTypes.arrayOf(PropTypes.string),
      resourceTree: PropTypes.arrayOf(
        PropTypes.shape({
          '@id': PropTypes.string,
          hasPart: PropTypes.arrayOf(PropTypes.object)
        })
      )
    }),
    renderLink: PropTypes.func,
    highlightedResource: PropTypes.string,
    onHighlightResource: PropTypes.func
  };

  static defaultProps = {
    onHighlightResource: noop,
    renderLink: function renderLink(graph, node) {
      return (
        <Hyperlink page="submission" graph={graph} node={node}>
          <Span>{node.alternateName || node.name || getId(node)}</Span>
        </Hyperlink>
      );
    },
    graph: {},
    nodeMap: {},
    resourceInfo: {
      resourceIds: [],
      resourceTree: []
    }
  };

  constructor(props) {
    super(props);

    const { resourceIds, resourceTree } = props.resourceInfo;
    let hiddenChildren;
    if (resourceTree.length === 1) {
      hiddenChildren = resourceIds.filter(rId => {
        return (
          !resourceTree.some(r => r['@id'] === rId) && // only child is not collapse
          !arrayify(resourceTree[0].hasPart).some(r => r['@id'] === rId)
        ); // neither are his children
      });
    } else {
      hiddenChildren = resourceIds.filter(
        rId => !resourceTree.some(r => r['@id'] === rId)
      ); // if it's not available at the top level => nested => hidden
    }

    this.state = {
      links: [],
      hiddenChildren
    };

    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.drawLinkBar = this.drawLinkBar.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      nodeMap: nextNodeMap,
      resourceInfo: {
        resourceIds: nextResourceIds,
        resourceTree: nextResourceTree
      }
    } = nextProps;
    const {
      nodeMap,
      resourceInfo: { resourceIds }
    } = this.props;

    const addedResourceIds = nextResourceIds.filter(rId => {
      return !(rId in nodeMap); // was not here
    });

    let addedResourceStartingHidden;
    if (nextResourceTree.length === 1) {
      addedResourceStartingHidden = addedResourceIds.filter(rId => {
        return (
          !nextResourceTree.some(r => r['@id'] === rId) && // only child is not collapse
          !arrayify(nextResourceTree[0].hasPart).some(r => r['@id'] === rId)
        ); // neither are his children
      });
    } else {
      addedResourceStartingHidden = addedResourceIds.filter(
        rId => !nextResourceTree.some(r => r['@id'] === rId)
      ); // if it's not available at the top level => nested => hidden
    }

    const deletedResources = new Set(
      resourceIds.filter(rId => !(rId in nextNodeMap))
    );

    this.setState({
      hiddenChildren: this.state.hiddenChildren
        .filter(rId => !deletedResources.has(rId))
        .concat(addedResourceStartingHidden)
    });
  }

  drawLinkBar() {
    // we use an interval to re render and follow children toggling events..
    const {
      highlightedResource: sourceId,
      nodeMap,
      resourceInfo: { resourceIds }
    } = this.props;

    const links = [];

    // who depends on sourceId ?
    let dependents = getDependents(sourceId, resourceIds, nodeMap);
    // if dependents are hidden, add first visible parent
    const visibleDependents = new Set();
    dependents.forEach(dependent => {
      if (~this.state.hiddenChildren.indexOf(dependent)) {
        let p = nodeMap[dependent];
        while ((p = getParentResource(getId(p), resourceIds, nodeMap))) {
          if (!~this.state.hiddenChildren.indexOf(getId(p))) {
            visibleDependents.add(getId(p));
            break;
          }
        }
      } else {
        visibleDependents.add(dependent);
      }
    });

    Array.from(visibleDependents).forEach(sinkId => {
      if (
        /^node:/.test(sinkId) &&
        !(
          ~this.state.hiddenChildren.indexOf(sinkId) ||
          ~this.state.hiddenChildren.indexOf(sourceId)
        )
      ) {
        const link = this.createLink(sourceId, sinkId, 'dependent');
        if (link && !links.some(_link => _link.id === link.id)) {
          links.push(link);
        }
      }
    });

    // what requires sourceId
    let requirements = getRequirements(sourceId, nodeMap);
    const ss = {};
    Object.keys(requirements).forEach(sinkId => {
      Array.from(requirements[sinkId]).forEach(sourceId => {
        if (sourceId in ss) {
          ss[sourceId].add(sinkId);
        } else {
          ss[sourceId] = new Set([sinkId]);
        }
      });
    });
    Object.keys(ss).forEach(sourceId => {
      let visibleSourceId = sourceId;
      if (~this.state.hiddenChildren.indexOf(sourceId)) {
        let p = nodeMap[sourceId];
        while ((p = getParentResource(getId(p), resourceIds, nodeMap))) {
          if (!~this.state.hiddenChildren.indexOf(getId(p))) {
            visibleSourceId = getId(p);
            break;
          }
        }
      }
      Array.from(ss[sourceId]).forEach(sinkId => {
        if (
          /^node:/.test(sinkId) &&
          !(
            ~this.state.hiddenChildren.indexOf(sinkId) ||
            ~this.state.hiddenChildren.indexOf(visibleSourceId)
          )
        ) {
          const link = this.createLink(visibleSourceId, sinkId, 'requirement');
          if (link && !links.some(_link => _link.id === link.id)) {
            links.push(link);
          }
        }
      });
    });

    this.setState({ links }, () => {
      if (this.redraw) {
        this.rafId = window.requestAnimationFrame(this.drawLinkBar);
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.highlightedResource && !this.props.highlightedResource) {
      this.setState({ links: [] });
      cancelAnimationFrame(this.rafId);
    } else if (
      this.props.highlightedResource &&
      (this.props.highlightedResource !== prevProps.highlightedResource ||
        this.state.hiddenChildren !== prevState.hiddenChildren)
    ) {
      cancelAnimationFrame(this.rafId);
      this.drawLinkBar();
    }
  }

  createLink(sourceId, sinkId, type) {
    const { nodeMap } = this.props;
    const $sink = findDOMNode(this.refs[sinkId]);
    const $source = findDOMNode(this.refs[sourceId]);

    if ($source && $sink) {
      const sourceType = getCssType(nodeMap[sourceId]);
      const sinkType = getCssType(nodeMap[sinkId]);

      const sourceOffset = $source.offsetTop;
      const sinkOffset = $sink.offsetTop;

      const offsets = [sourceOffset, sinkOffset].sort((a, b) => a - b);
      const height = offsets[1] - offsets[0];
      const top = offsets[0];

      return {
        id: `${sourceId}-${sinkId}-${type}`,
        type,
        sourceId,
        sinkId,
        sourceOffset,
        sinkOffset,
        sourceType,
        sinkType,
        top,
        height
      };
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId);
  }

  handleMouseOver(resourceId, e) {
    this.redraw = false;
    e.stopPropagation();
    this.props.onHighlightResource(resourceId);
  }

  handleMouseLeave(e) {
    this.redraw = false;
    this.props.onHighlightResource(null);
  }

  handleToggle(resourceId, showChildren, e) {
    this.redraw = true;

    const {
      resourceInfo: { resourceTree }
    } = this.props;
    const resource = findResource(resourceId, resourceTree);
    if (!resource) return;
    const childIds = getResourceParts(resource).map(getId);
    if (!childIds.length) return;

    // note that we use the function signature of setState as we want to enqueue an atomic update that consults the previous value of state+props before setting any values. (reason is handleToggle may be called by multiple child on the same tick)
    if (showChildren) {
      this.setState((prevState, currProps) => {
        return {
          hiddenChildren: prevState.hiddenChildren.filter(
            rId => !arrayify(resource.hasPart).some(r => r['@id'] === rId)
          )
        };
      });
    } else {
      this.setState((prevState, currProps) => {
        return {
          hiddenChildren: prevState.hiddenChildren.concat(
            childIds.filter(rId => !~prevState.hiddenChildren.indexOf(rId))
          )
        };
      });
    }
  }

  renderLinkBar() {
    if (this.state.links.length) {
      return (
        <div className="link-bar__container">
          {this.state.links.map(link => <LinkBar key={link.id} link={link} />)}
        </div>
      );
    } else {
      return null;
    }
  }

  renderType(node) {
    const { label, comment } = schema.get(node['@type']) || {};

    const typeUrl = schema.expand(node['@type']);
    if (typeUrl !== node['@type']) {
      return (
        <a
          className="graph-overview__link"
          href={typeUrl}
          title={comment}
          target="_blank"
        >
          {LABELS[node['@type']] || label || node['@type']}
        </a>
      );
    } else {
      return <span title={comment}>{label || node['@type']}</span>;
    }
  }

  renderResource(node, nodeMap) {
    const { graph } = this.props;
    const cssType = getCssType(node);
    const dateModified = node.dateModified || node.dateCreated;

    const isExpanded =
      node.hasPart &&
      !node.hasPart.some(p => ~this.state.hiddenChildren.indexOf(p));

    return (
      <div className="graph-overview__row">
        <div className="graph-overview__dot">
          <div className="graph-overview__dot__shape">
            <div className="graph-overview__dot__circle">
              <svg viewBox="0, 0, 24, 24" width={24} height={24}>
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  className={`circle color-${cssType}`}
                />
              </svg>
            </div>
          </div>
        </div>

        <span className="graph-overview__name">
          {this.props.renderLink(graph, node)}
        </span>

        <div className="graph-overview__type">{this.renderType(node)}</div>
        <div className="graph-overview__hidden-column graph-overview__date">
          {dateModified && <DateFromNow>{dateModified}</DateFromNow>}
        </div>
        <div className="graph-overview__rating">
          <RatingDots
            resource={
              Object.assign({}, node, {
                license:
                  (node.license && nodeMap[node.license]) || node.license,
                encoding:
                  node.encoding &&
                  node.encoding
                    .filter(encodingId => nodeMap[encodingId])
                    .map(encodingId => nodeMap[encodingId])
              }) /* TODO move into selector (see rating-dots.js in publisher) */
            }
          />
        </div>
        <div className="graph-overview__expand">
          {node.hasPart && node.hasPart.length ? (
            <Iconoclass
              iconName="expandLess"
              customClassName={`expand-button ${
                isExpanded ? 'expand-button--less' : 'expand-button--more'
              }`}
              iconSize={24}
              color="grey"
              behavior="button"
              onClick={this.handleToggle.bind(this, node['@id'], !isExpanded)}
            />
          ) : null}
        </div>
      </div>
    );
  }

  render() {
    const {
      nodeMap,
      resourceInfo: { resourceIds, resourceTree }
    } = this.props;
    const { hiddenChildren } = this.state;

    if (!resourceTree.length) return null;

    return (
      <nav className="graph-overview">
        <div className="graph-overview__body">
          <ul
            className="graph-overview__list graph-overview__list--level-0 "
            onMouseLeave={this.handleMouseLeave}
          >
            {resourceTree.filter(r => nodeMap[r['@id']]).map(r => {
              const rId = r['@id'];
              const part = nodeMap[rId];
              const isCollapsed =
                r.hasPart &&
                r.hasPart.some(p => ~hiddenChildren.indexOf(p['@id']));
              return (
                <li
                  className="graph-overview__list-item"
                  key={rId}
                  ref={rId}
                  onMouseOver={this.handleMouseOver.bind(this, rId)}
                >
                  {this.renderResource(part, nodeMap)}
                  {r.hasPart && (
                    <ul
                      style={{
                        maxHeight: isCollapsed
                          ? 0
                          : 32 * (resourceIds.length + 1)
                      }}
                      className={classNames(
                        'graph-overview__list',
                        'graph-overview__list--level-1',
                        { 'graph-overview__list--collapsed': isCollapsed }
                      )}
                    >
                      {r.hasPart.filter(r => nodeMap[r['@id']]).map(r => {
                        const rId = r['@id'];
                        const part = nodeMap[rId];
                        const isCollapsed =
                          r.hasPart &&
                          r.hasPart.some(
                            p => ~hiddenChildren.indexOf(p['@id'])
                          );
                        return (
                          <li
                            className="graph-overview__list-item"
                            key={rId}
                            ref={rId}
                            onMouseOver={this.handleMouseOver.bind(this, rId)}
                          >
                            {this.renderResource(part, nodeMap)}
                            {r.hasPart && (
                              <ul
                                style={{
                                  maxHeight: isCollapsed
                                    ? 0
                                    : 32 * (r.hasPart.length + 1)
                                }}
                                className={classNames(
                                  'graph-overview__list',
                                  'graph-overview__list--level-2',
                                  {
                                    'graph-overview__list--collapsed': isCollapsed
                                  }
                                )}
                              >
                                {r.hasPart
                                  .filter(r => nodeMap[r['@id']])
                                  .map(r => {
                                    const rId = r['@id'];
                                    const part = nodeMap[rId];
                                    return (
                                      <li
                                        className="graph-overview__list-item"
                                        key={rId}
                                        ref={rId}
                                        onMouseOver={this.handleMouseOver.bind(
                                          this,
                                          rId
                                        )}
                                      >
                                        {this.renderResource(part, nodeMap)}
                                      </li>
                                    );
                                  })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          {this.renderLinkBar()}
        </div>
      </nav>
    );
  }
}
