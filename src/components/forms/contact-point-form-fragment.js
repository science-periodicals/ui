import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import CaptureSubmit from 'capture-submit';
import { createId } from '@scipe/librarian';
import { getId, unprefix } from '@scipe/jsonld';
import PaperInput from '../paper-input';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';

const ControlledPaperInput = CaptureSubmit(PaperInput);

export default class ContactPointFormFragment extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    const { node, name, parentNode } = this.props;

    const value =
      e.target.type === 'email'
        ? `mailto:${e.target.value}`
        : e.target.type === 'tel' ? `tel:${e.target.value}` : e.target.value;

    if (!getId(node)) {
      this.props.onCreate(getId(parentNode), name, {
        '@id': createId('blank')['@id'],
        '@type': 'ContactPoint',
        [e.target.name]: value
      });
    } else {
      this.props.onUpdate(node, e.target.name, value);
    }
  }

  render() {
    const { node } = this.props;

    return (
      <Fragment>
        <LayoutWrapRows>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="email"
              label="email"
              type="email"
              autoComplete="off"
              value={unprefix(node.email) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="telephone"
              label="telephone"
              type="tel"
              autoComplete="off"
              value={unprefix(node.telephone) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
        </LayoutWrapRows>
      </Fragment>
    );
  }
}

ContactPointFormFragment.defaultProps = {
  parentNode: {},
  node: {},
  onCreate: noop,
  onUpdate: noop
};

ContactPointFormFragment.propTypes = {
  parentNode: PropTypes.object,
  name: PropTypes.string,
  node: PropTypes.object, // hydrated, if `node` is undefined, the component will call `onCreate` instead of `onUpdate`
  onCreate: PropTypes.func, // (parentNode, parentKey, value)
  onUpdate: PropTypes.func // (node, key, value, {force: true})
};
