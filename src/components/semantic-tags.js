import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import SemanticTag from './semantic-tag';

export class SemanticTags extends Component {
  static propTypes = {
    id: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    ontology: PropTypes.oneOf(['subjects']),
    semanticTagsMap: PropTypes.object,
    subtree: PropTypes.array,
    addingSemanticTagId: PropTypes.string,
    addedSemanticTagId: PropTypes.string,
    onSubmit: PropTypes.func,
    onDelete: PropTypes.func,
    onResize: PropTypes.func
  };

  static defaultProps = {
    onResize: noop,
    ontology: 'subjects'
  };

  constructor(props) {
    super(props);
    this.handleTagResize = this.handleTagResize.bind(this);
    this.height = 0;
  }

  handleTagResize() {
    if (this.$root) {
      this.height = this.$root.offsetHeight;
      this.props.onResize(this.$root.offsetHeight, this.height);
      this.height = this.$root.offsetHeight;
    }
  }

  componentDidMount() {
    if (this.$root) {
      this.height = this.$root.offsetHeight;
      this.props.onResize(this.$root.offsetHeight, this.height);
      this.height = this.$root.offsetHeight;
    }
  }

  componentDidUpdate() {
    if (this.$root) {
      this.props.onResize(this.$root.offsetHeight, this.height);
      this.height = this.$root.offsetHeight;
    }
  }

  // recursively render semantic tags tree
  renderSemanticTagsTree(semanticTagsMap, subtree, level) {
    const {
      readOnly,
      disabled,
      addingSemanticTagId,
      addedSemanticTagId,
      onSubmit,
      onDelete,
      ontology
    } = this.props;

    return subtree.map(leaf => {
      return (
        <SemanticTag
          key={leaf['@id']}
          onResize={this.handleTagResize}
          semanticTag={leaf}
          level={Math.min(level, 3)}
          readOnly={readOnly}
          disabled={disabled}
          ontology={ontology}
          addingSemanticTagId={addingSemanticTagId}
          addedSemanticTagId={addedSemanticTagId}
          onSubmit={onSubmit}
          onDelete={onDelete}
        >
          {'children' in leaf
            ? this.renderSemanticTagsTree(
                semanticTagsMap,
                leaf.children,
                level + 1
              )
            : null}
        </SemanticTag>
      );
    });
  }

  renderSemanticTags() {
    const {
      semanticTagsMap,
      readOnly,
      disabled,
      subtree,
      addingSemanticTagId,
      addedSemanticTagId,
      onSubmit,
      onDelete,
      ontology
    } = this.props;
    if (subtree) {
      return this.renderSemanticTagsTree(semanticTagsMap, subtree, 0);
    } else {
      return Object.keys(semanticTagsMap).map(semanticTagId => (
        <SemanticTag
          key={semanticTagId}
          onToggledAdd={this.handleToggleAdd}
          onResize={this.handleTagResize}
          readOnly={readOnly}
          disabled={disabled}
          ontology={ontology}
          semanticTag={semanticTagsMap[semanticTagId]}
          addingSemanticTagId={addingSemanticTagId}
          addedSemanticTagId={addedSemanticTagId}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      ));
    }
  }

  render() {
    const { id } = this.props;
    if (!Object.keys(this.props.semanticTagsMap).length) return null;

    return (
      <div
        id={id}
        className="semantic-tags"
        ref={el => {
          this.$root = el;
        }}
      >
        {this.renderSemanticTags()}
      </div>
    );
  }
}

/**
 * Make sure that the `ComposedComponent`  always has access to both
 * semanticTagsMap and subtree (and that they are both synced)
 * TODO return null for subtree if xhr error
 */
export function provideSubtree(
  ComposedComponent,
  reset = function(props, nextProps) {
    return true;
  }
) {
  return class SubtreeProvider extends Component {
    static propTypes = {
      semanticTagsMap: PropTypes.object.isRequired,
      ontology: PropTypes.string
    };

    static defaultProps = {
      ontology:
        (ComposedComponent.defaultProps &&
          ComposedComponent.defaultProps.ontology) ||
        'subjects'
    };

    constructor(props) {
      super(props);
      this.state = {
        semanticTagsMap: {},
        subtree: [],
        loading: true
      };
    }

    componentDidMount() {
      this._isMounted = true;
      this.fetchSubtree(this.props.semanticTagsMap);
    }

    componentWillUnmount() {
      this._isMounted = false;
      if (this.xhr && this.xhr.abort) {
        this.xhr.abort();
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.semanticTagsMap !== this.props.semanticTagsMap) {
        if (reset(this.props, nextProps)) {
          this.setState({
            semanticTagsMap: {},
            subtree: [],
            loading: true
          });
        } else {
          this.setState({
            loading: true
          });
        }
        this.fetchSubtree(nextProps.semanticTagsMap);
      }
    }

    fetchSubtree(semanticTagsMap) {
      if (!this._isMounted) return;
      if (this.xhr) {
        this.xhr.abort();
        delete this.xhr;
      }

      const ids = Object.keys(semanticTagsMap);
      if (!ids.length) {
        return this.setState({
          semanticTagsMap: {},
          subtree: [],
          loading: false
        });
      }

      this.xhr = new XMLHttpRequest();
      this.xhr.onload = e => {
        delete this.xhr;
        if (e.target.status >= 400) {
          console.error(JSON.parse(e.target.responseText).error);
        } else {
          const body = JSON.parse(e.target.responseText);

          this.setState({
            semanticTagsMap,
            subtree: sortSubtree(body[0]),
            loading: false
          });
        }
      };
      this.xhr.onabort = e => {
        delete this.xhr;
      };
      this.xhr.onerror = e => {
        console.error('xhr errored');
        delete this.xhr;
      };

      this.xhr.open('POST', `/ontologist/subtree/${this.props.ontology}`);
      this.xhr.setRequestHeader('Content-Type', 'application/json');
      this.xhr.send(
        JSON.stringify([
          {
            options: {
              embed: true,
              dedup: true
            },
            ids: ids
          }
        ])
      );
    }

    render() {
      // Note that semantics tags from state will overide the one from
      // the props ensuring that semantic tags and subtree are always
      // synced
      return <ComposedComponent {...this.props} {...this.state} />;
    }
  };
}

function sortSubtree(subtree) {
  subtree.sort((a, b) => {
    return a[name || '@id'].localeCompare(b[name || '@id']);
  });

  subtree.forEach(node => {
    if (node.children) {
      sortSubtree(node.children);
    }
  });

  return subtree;
}
