import React, { Component } from 'react';
import omit from 'lodash/omit';
import {
  SemanticTags as _SemanticTags,
  SemanticTagsAutocomplete,
  provideSubtree
} from '../../src/';

const SemanticTags = provideSubtree(_SemanticTags);

export default class SemanticTagsExample extends Component {
  constructor(props) {
    super(props);
    this.state = { tags: {} };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitScoped = this.handleSubmitScoped.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize(height, prevHeight) {
    console.log('resize: ', height, prevHeight);
  }

  handleDelete(ids) {
    this.setState({ tags: omit(this.state.tags, ids) });
  }

  handleSubmit(tag) {
    if (tag) {
      console.log(tag);
      this.handleSubmitScoped(tag);
      this.autocomplete.reset();
    }
  }

  handleSubmitScoped(tag) {
    this.setState({
      tags: Object.assign({}, this.state.tags, { [tag['@id']]: tag })
    });
  }

  render() {
    const { tags } = this.state;
    return (
      <div className="example">
        <SemanticTags
          semanticTagsMap={tags}
          onSubmit={this.handleSubmitScoped}
          onDelete={this.handleDelete}
          onResize={this.handleResize}
        />
        <SemanticTagsAutocomplete
          ref={el => (this.autocomplete = el)}
          label="Add Subject"
          onSubmit={this.handleSubmit}
        />
      </div>
    );
  }
}
