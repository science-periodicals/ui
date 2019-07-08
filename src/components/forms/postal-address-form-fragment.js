import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import withOnSubmit from '../../hoc/with-on-submit';
import { createId } from '@scipe/librarian';
import { getId, getValue, createValue } from '@scipe/jsonld';
import PaperInput from '../paper-input';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';

const ControlledPaperInput = withOnSubmit(PaperInput);

export default class PostalAddressFormFragment extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    isDetailed: PropTypes.bool,
    parentNode: PropTypes.object,
    name: PropTypes.string,
    node: PropTypes.object, // hydrated, if `node` is undefined, the component will call `onCreate` instead of `onUpdate`
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func, // (node, key, value, {force: true})
    onDelete: PropTypes.func // (parentNode, parentKey, value)
  };

  static defaultProps = {
    isDetailed: false,
    parentNode: {},
    node: {},
    onCreate: noop,
    onUpdate: noop,
    onDelete: noop
  };

  handleSubmit = e => {
    const { node, name, parentNode } = this.props;

    if (!getId(node)) {
      this.props.onCreate(getId(parentNode), name, {
        '@id': createId('blank')['@id'],
        '@type': 'PostalAddress',
        [e.target.name]: createValue(e.target.value)
      });
    } else {
      if (
        (e.target.value == null || e.target.value == '') &&
        Object.keys(node).every(key => {
          return (
            key === '@id' ||
            key === '@type' ||
            key === '@context' ||
            key === e.target.name ||
            node[key] == null ||
            node[key] == ''
          );
        })
      ) {
        this.props.onDelete(getId(parentNode), name, parentNode[name]);
      } else {
        this.props.onUpdate(node, e.target.name, createValue(e.target.value), {
          name
        });
      }
    }
  };

  render() {
    const { node, isDetailed, readOnly, disabled } = this.props;

    return (
      <Fragment>
        <LayoutWrapRows>
          {isDetailed && (
            <LayoutWrapItem flexBasis="200px">
              <ControlledPaperInput
                name="streeAddress"
                label="street address"
                readOnly={readOnly}
                disabled={disabled}
                autoComplete="off"
                value={getValue(node.streeAddress) || ''}
                onSubmit={this.handleSubmit}
              />
            </LayoutWrapItem>
          )}
          {isDetailed && (
            <LayoutWrapItem flexBasis="200px">
              <ControlledPaperInput
                name="postalCode"
                label="postal code"
                readOnly={readOnly}
                disabled={disabled}
                autoComplete="off"
                value={getValue(node.postalCode) || ''}
                onSubmit={this.handleSubmit}
              />
            </LayoutWrapItem>
          )}
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="addressLocality"
              label="locality"
              readOnly={readOnly}
              disabled={disabled}
              autoComplete="off"
              value={getValue(node.addressLocality) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="addressRegion"
              label="region"
              readOnly={readOnly}
              disabled={disabled}
              autoComplete="off"
              value={getValue(node.addressRegion) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="addressCountry"
              label="country"
              readOnly={readOnly}
              disabled={disabled}
              autoComplete="off"
              value={getValue(node.addressCountry) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
        </LayoutWrapRows>
      </Fragment>
    );
  }
}
