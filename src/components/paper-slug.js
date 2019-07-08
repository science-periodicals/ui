import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import slug from 'slug';
import PaperInput from './paper-input';

// TODO validate that slug is already taken online ? just issue a GET request to '/' and if statusCode != 404 => taken

export default class PaperSlug extends Component {
  static propTypes = {
    slugify: PropTypes.bool,
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func
  };

  static defaultProps = {
    slugify: true,
    onChange: noop
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: props.slugify
        ? slug(props.value || '', { lower: false })
        : props.value || '',
      hasError:
        slug(props.value || '', { lower: false }) !== (props.value || '')
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      const slugified = slug(nextProps.value || '', { lower: false });
      const nextValue = nextProps.slugify ? slugified : nextProps.value || '';

      this.setState({
        value: nextValue,
        hasError: nextProps.slugify ? false : slugified !== nextValue
      });
    }
  }

  handleChange(e) {
    const value = e.target.value || '';
    let slugified = slug(value, { lower: false });

    if (this.props.slugify) {
      const trimmed = value.trim();
      if (trimmed && value !== trimmed) {
        slugified = trimmed.replace(/-$/g, '') + '-';
        e.target.value = slugified;
      }
    }

    const hasError = this.props.slugify ? false : slugified !== value;
    const nextValue = this.props.slugify ? slugified : value;

    this.setState({
      value: nextValue,
      hasError
    });
    this.props.onChange(e, nextValue, hasError);
  }

  render() {
    const { hasError, value } = this.state;
    return (
      <PaperInput
        {...this.props}
        autocomplete="off"
        value={value}
        error={hasError ? 'Only alphanumerics and dash.' : ''}
        onChange={this.handleChange}
      />
    );
  }
}
