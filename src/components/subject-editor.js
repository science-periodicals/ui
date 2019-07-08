import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import { SemanticTags, provideSubtree } from './semantic-tags';
import SemanticTagsAutocomplete from './autocomplete/semantic-tags-autocomplete';

class SubjectEditor extends React.PureComponent {
  static propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    entity: PropTypes.object.isRequired, // profile, resource, periodical or role used for the provideSubtree HoC
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    ontology: PropTypes.string,
    semanticTagsMap: PropTypes.object.isRequired,
    subtree: PropTypes.array.isRequired,
    onAdd: PropTypes.func,
    onDelete: PropTypes.func,
    onResize: PropTypes.func
  };

  static defaultProps = {
    label: 'Add subject',
    ontology: 'subjects',
    readOnly: false,
    onAdd: noop,
    onDelete: noop,
    onResize: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      addingSemanticTagId: null, // we use that to create a global lock on tags, only one tag can be added at the time
      addedSemanticTagId: null
    };
    this.height = 0;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTagsResize = this.handleTagsResize.bind(this);
    this.handleSubmitScoped = this.handleSubmitScoped.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
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

  handleTagsResize() {
    if (this.$root) {
      this.props.onResize(this.$root.offsetHeight, this.height);
      this.height = this.$root.offsetHeight;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.state.addingSemanticTagId &&
      this.state.addingSemanticTagId in nextProps.semanticTagsMap
    ) {
      // adding succeeded, clear lock
      clearTimeout(this.timeoutId);
      this.setState({
        addingSemanticTagId: null,
        addedSemanticTagId: this.state.addingSemanticTagId
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  handleSubmitScoped(subject) {
    this.setState({ addingSemanticTagId: getId(subject) });
    // we _always_ remove the adding lock after a timeout
    this.timeoutId = setTimeout(() => {
      this.setState({ addingSemanticTagId: null });
    }, 5000);
    this.props.onAdd(subject);
  }

  handleSubmit(subject) {
    if (subject) {
      this.handleSubmitScoped(subject);
      // TODO remove once <PaperAutocomplete /> is a controled component
      this.autocomplete.reset();
    }
  }

  handleDelete(ids) {
    // TODO lock and timeout for delete too
    this.props.onDelete(ids);
  }

  render() {
    const {
      id,
      semanticTagsMap,
      subtree,
      readOnly,
      disabled,
      ontology,
      label
    } = this.props;
    const { addingSemanticTagId, addedSemanticTagId } = this.state;

    return (
      <div
        id={id}
        className="subject-editor"
        ref={el => {
          this.$root = el;
        }}
      >
        <SemanticTags
          ontology={ontology}
          subtree={subtree}
          onResize={this.handleTagsResize}
          semanticTagsMap={semanticTagsMap}
          onSubmit={this.handleSubmitScoped}
          onDelete={this.handleDelete}
          disabled={disabled}
          readOnly={readOnly}
          addingSemanticTagId={addingSemanticTagId}
          addedSemanticTagId={addedSemanticTagId}
        />
        {!readOnly && (
          <SemanticTagsAutocomplete
            ref={el => {
              this.autocomplete = el;
            }}
            label={label}
            ontology={ontology}
            onSubmit={this.handleSubmit}
            disabled={disabled || !!addingSemanticTagId}
            readOnly={readOnly}
          />
        )}
      </div>
    );
  }
}

export default provideSubtree(SubjectEditor, (props, nextProps) => {
  return getId(props.entity) !== getId(nextProps.entity);
});
