import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { flatten, getNodeMap } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';

import ExpansionPanel from '../expansion-panel';
import ExpansionPanelPreview from '../expansion-panel-preview';
import ExpansionPanelGroup from '../expansion-panel-group';
import BemTags from '../../utils/bem-tags';
import RankingBell from '../ranking-bell';
import RatingDots from '../rating-dots';
import GraphOverview from '../graph-overview';
import { getResourceInfo } from '../../utils/graph';

import data from '../../../test/fixtures/graph';

import * as reactChildrenUtils from '../../utils/react-children-utils';

import RichSnippetImpactImage from './rich-snippet-impact-image';
import RichSnippetImageGallery from './rich-snippet-image-gallery';

import RichSnippetAbstract from './rich-snippet-abstract';
import RichSnippetImpactAbstract from './rich-snippet-impact-abstract';
import RichSnippetAuthor from './rich-snippet-author';
import RichSnippetReviewer from './rich-snippet-reviewer';
import RichSnippetChordal from './rich-snippet-chordal';

const bem = BemTags('rich-snippet');

// pseudo random percentage from string - without low-lyers
function shortHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + c */
  }
  hash = parseInt(hash.toString().substr(0, 2));
  hash = Math.abs(hash) + 40;
  hash = hash > 100 ? 100 : hash;
  return hash;
}

export default class RichSnippet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightedResource: undefined,
      graph: undefined,
      nodeMap: undefined,
      resourceInfo: undefined,
      snippetMode: props.snippetMode
    };
    this.children = {};
    this.handleHighlightResource = this.handleHighlightResource.bind(this);
  }

  componentDidMount() {
    flatten(data, (err, flattened) => {
      if (err) throw err;
      const graph = flattened;
      const nodeMap = getNodeMap(graph);
      const resourceInfo = getResourceInfo(graph, nodeMap);
      this.setState({ graph, nodeMap, resourceInfo });
    });
    // this.children = this.parseChildren(this.props.children);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.snippetMode !== nextProps.snippetMode)
      this.setState({ snippetMode: nextProps.snippetMode });
    // if (this.props.children !== nextProps.children)
    //   this.children = this.parseChildren(nextProps.children);
  }

  handleHighlightResource(resourceId) {
    this.setState({ highlightedResource: resourceId });
  }

  renderJournalName() {
    if (this.props.journal) {
      return (
        <a href="#" className={bem`__journal-name`}>
          {this.props.journal}
          {this.props.snippetMode === 'scholar' ? (
            <RankingBell size={13} percentile={shortHash(this.props.journal)} />
          ) : (
            <Iconoclass size="16px" iconName="star" />
          )}
        </a>
      );
    }
  }

  renderAllStats() {
    //const bem = BemTags('rich-snippet');
    if (this.props.snippetMode === 'scholar') {
      return (
        <div className={bem`__all-stats --scholar`}>
          <a href="#" className={bem`stat --cited-by`}>
            Cited By {this.props.citedBy}{' '}
            <RankingBell size={13} percentile={shortHash(this.props.citedBy)} />
          </a>

          {this.props.impactFactor && (
            <a href="#" className={bem`stat --impact-factor`}>
              h5-index: {this.props.impactFactor}
            </a>
          )}
        </div>
      );
    } else {
      return (
        <div className={bem`__all-stats --impact`}>
          <span className={bem`stat --top-rated`}>
            <Iconoclass iconName="topRated" />
          </span>
          <a href="#" className={bem`stat --cited-by`}>
            Scholarly Media <Iconoclass iconName="trendingUp" />
          </a>
          <a href="#" className={bem`stat --cited-by`}>
            News Media <Iconoclass iconName="trendingFlat" />
          </a>
          <a href="#" className={bem`stat --cited-by`}>
            Social Media <Iconoclass iconName="trendingUp" />
          </a>
        </div>
      );
    }
  }

  renderAbstract() {
    //const bem = BemTags('rich-snippet');
    let abstractType =
      this.state.snippetMode === 'scholar'
        ? RichSnippetAbstract
        : RichSnippetImpactAbstract;

    return (
      <div className={bem`__abstract-preview --${this.state.snippetMode}`}>
        {reactChildrenUtils.getAllOfType(this.props.children, abstractType)}
      </div>
    );
  }

  renderAuthors(snippetMode) {
    //const bem = BemTags('rich-snippet');
    let newProps = { _snippetMode: snippetMode };
    return (
      <div className={bem`__authors`}>
        {reactChildrenUtils.cloneAllOfType(
          this.props.children,
          RichSnippetAuthor,
          newProps
        )}
      </div>
    );
  }

  renderReviewers(snippetMode) {
    //const bem = BemTags('rich-snippet');
    let newProps = { _snippetMode: snippetMode, key: 'rich-snippet-reviewer' };
    return (
      <div className={bem`__reviewers`}>
        {this.props.reviewType ? (
          <span className={bem`__label --reviewers`}>
            {this.props.reviewType}
          </span>
        ) : (
          <span className={bem`__label --reviewers`}>Reviewers</span>
        )}
        {reactChildrenUtils.cloneAllOfType(
          this.props.children,
          RichSnippetReviewer,
          newProps
        )}
      </div>
    );
  }

  renderBasicSnippet() {
    //const bem = BemTags('rich-snippet');
    let { children } = this.props;

    return (
      <div className={bem`__basic-layout`}>
        <a href={this.props.url} className={bem`__title`}>
          {this.props.title}
        </a>
        <div className={bem`__body`}>
          {this.state.snippetMode === 'impact'
            ? reactChildrenUtils.getAllOfType(children, RichSnippetImpactImage)
            : reactChildrenUtils.getAllOfType(children, RichSnippetChordal)}
          <div className={bem`__body-text`}>
            {this.props.url && (
              <div className={bem`__url`}>{this.props.url}</div>
            )}
            {this.renderAuthors(this.state.snippetMode)}
            <div className={bem`__journal-info`}>
              {this.props.journal && (
                <a href="#" className={bem`__journal-name`}>
                  {this.props.journal}
                  <RankingBell
                    size={13}
                    percentile={shortHash(this.props.journal)}
                  />
                </a>
              )}
              {this.props.date && (
                <span className={bem`__date`}>{this.props.date}</span>
              )}

              {this.renderReviewers(this.state.snippetMode)}
            </div>
            <span className={bem`__abstract-preview`}>
              {this.renderAbstract()}
            </span>
            <div className={bem`__stats`}>
              {this.props.citedBy && (
                <a href="#" className={bem`stat --cited-by`}>
                  Cited By {this.props.citedBy}
                  <RankingBell
                    size={13}
                    percentile={shortHash(this.props.citedBy)}
                  />
                </a>
              )}
              <a href="#">Related Articles</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderSmallSnippet() {
    //const bem = BemTags('rich-snippet');
    return (
      <div className={bem`__small-feature-layout`}>
        <div className={bem`__contents`}>
          <div className={bem`__contents-header`}>
            {this.state.snippetMode === 'scholar'
              ? reactChildrenUtils.getAllOfType(
                  this.props.children,
                  RichSnippetChordal
                )
              : reactChildrenUtils.getAllOfType(
                  this.props.children,
                  RichSnippetImpactImage
                )}
            {this.renderAbstract()}
          </div>
          <a href={this.props.url} className={bem`__title`}>
            {this.props.title}
          </a>
          <div className={bem`__url`}>{this.props.url}</div>
          {this.renderAuthors(this.state.snippetMode)}
          <div className={bem`__journal-info`}>
            {this.props.journal && (
              <a href="#" className={bem`__journal-name`}>
                {this.props.journal}
                <RankingBell
                  size={13}
                  percentile={shortHash(this.props.journal)}
                />
              </a>
            )}
            {this.props.date && (
              <span className={bem`__date`}>{this.props.date}</span>
            )}

            {this.renderReviewers(this.state.snippetMode)}
          </div>
        </div>
        {this.renderAllStats()}
      </div>
    );
  }

  renderBigSnippet() {
    //const bem = BemTags('rich-snippet');
    const { graph, nodeMap, resourceInfo } = this.state;
    //console.log('this.props.topCitations: ', this.props.topCitations);

    return (
      <div className={bem`__big-feature-layout`}>
        {reactChildrenUtils.cloneAllOfType(
          this.props.children,
          RichSnippetImageGallery,
          { _snippetMode: this.state.snippetMode }
        )}
        <div className={bem`__contents`}>
          <div className={bem`__contents-header`} />
          <a href={this.props.url} className={bem`__title`}>
            {this.props.title}
          </a>
          <div className={bem`__url`}>{this.props.url}</div>
          {this.renderAuthors(this.state.snippetMode)}
          <div className={bem`__journal-info`}>
            {this.state.snippetMode === 'impact' && (
              <div className={bem`__amp`}>
                <div className={bem`__amp-icon`}>
                  <Iconoclass
                    iconName="smartAction"
                    round={false}
                    size="1.4rem"
                  />
                </div>
                <span>AMP</span>
              </div>
            )}
            {this.renderJournalName()}
            {this.props.date && (
              <span className={bem`__date`}>{this.props.date}</span>
            )}
            {this.renderReviewers(this.state.snippetMode)}
          </div>
        </div>
        <ExpansionPanelGroup>
          <ExpansionPanel
            defaultExpanded={true}
            className={bem`panel --abstract`}
          >
            <ExpansionPanelPreview>
              <h3 className={bem`__section-title`}>
                {this.state.snippetMode === 'scholar'
                  ? 'Abstract'
                  : 'Impact Statement'}
              </h3>
              {this.renderAbstract()}
            </ExpansionPanelPreview>
            {this.renderAbstract()}
          </ExpansionPanel>

          <ExpansionPanel className={bem`__panel --citations`}>
            <ExpansionPanelPreview className={bem`__panel-preview --citations`}>
              <h3 className={bem`__section-title`}>
                {this.props.snippetMode === 'scholar'
                  ? 'Citations'
                  : 'Influence'}
              </h3>
              {this.renderAllStats()}
            </ExpansionPanelPreview>
            <div className={bem`__citations-content`}>
              <div className={bem`__citations-table__`}>
                <div className={bem`__header`}>
                  <ul className={bem`__row`}>
                    <li className={bem`__cell`}>Top Articles</li>
                    <li className={bem`__cell`}>Citations</li>
                    <li className={bem`__cell`}>Journal</li>
                  </ul>
                </div>
                {this.props.topCitations &&
                  this.props.topCitations.map((paper, i) => (
                    <ul className={bem`__row`} key={i}>
                      <li className={bem`__cell`}>{paper.title}</li>
                      <li className={bem`__cell`}>{paper.count}</li>
                      <li className={bem`__cell`}>{paper.journal}</li>
                    </ul>
                  ))}
              </div>
            </div>
          </ExpansionPanel>
          <ExpansionPanel className={bem`panel --resources`}>
            <ExpansionPanelPreview>
              <h3 className={bem`section-title`}>Resources</h3>

              {this.props.snippetMode === 'impact' && (
                <span className={bem`stat --top-rated`}>
                  <Iconoclass iconName="topRated" />
                </span>
              )}
              <a href="#" className={bem`stat`}>
                1 Manuscript
              </a>
              <a href="#" className={bem`stat`}>
                6 Images
              </a>
              <a href="#" className={bem`stat`}>
                4 Figures
              </a>
              {this.props.snippetMode === 'scholar' && (
                <RatingDots
                  resource={{
                    '@id': '_:id',
                    '@type': 'Dataset'
                  }}
                />
              )}
            </ExpansionPanelPreview>
            <GraphOverview
              graph={graph}
              nodeMap={nodeMap}
              resourceInfo={resourceInfo}
              onHighlightResource={this.handleHighlightResource}
              highlightedResource={this.state.highlightedResource}
            />
          </ExpansionPanel>
        </ExpansionPanelGroup>
      </div>
    );
  }

  render() {
    //const bem = BemTags();
    let { id } = this.props;
    return (
      <div className={bem`rich-snippet`} id={id}>
        {this.props.snippetType === 'basic' && this.renderBasicSnippet()}
        {this.props.snippetType === 'small' && this.renderSmallSnippet()}
        {this.props.snippetType === 'big' && this.renderBigSnippet()}
      </div>
    );
  }
}

RichSnippet.defaultProps = {
  snippetType: 'basic',
  snippetMode: 'scholar',
  graphData: {}
};

RichSnippet.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  children: PropTypes.any,
  citation: PropTypes.string,
  journal: PropTypes.string,
  journalUrl: PropTypes.string,
  reviewers: PropTypes.array,
  date: PropTypes.string,
  blindModel: PropTypes.string,
  snippetType: PropTypes.string,
  snippetMode: PropTypes.string,
  citedBy: PropTypes.number,
  topCitations: PropTypes.array,
  reviewType: PropTypes.string,
  impactFactor: PropTypes.number,
  id: PropTypes.string,
  graphData: PropTypes.object
};
