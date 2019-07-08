import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import withOnSubmit from '../../hoc/with-on-submit';
import { getValue, createValue } from '@scipe/jsonld';
import PaperSelect from '../paper-select';
import PaperInput from '../paper-input';
import PostalAddressFormFragment from './postal-address-form-fragment';
import { getDisplayOrganizationClasses } from '../../utils/graph';

const ControlledPaperInput = withOnSubmit(PaperInput);

export default class OrganizationFormFragment extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    isDeletable: PropTypes.bool,
    hasSelectableType: PropTypes.bool,
    parentNode: PropTypes.object,
    name: PropTypes.string,
    node: PropTypes.object, // hydrated
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func, // (node, key, value, {force: true})
    onDelete: PropTypes.func // (parentNode, parentKey, value)
  };

  static defaultProps = {
    isDeletable: false,
    hasSelectableType: true,
    parentNode: {},
    node: {},
    onCreate: noop,
    onUpdate: noop
  };

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    const { node } = this.props;

    this.props.onUpdate(node, e.target.name, createValue(e.target.value));
  }

  render() {
    const {
      node,
      readOnly,
      disabled,
      hasSelectableType,
      ...others
    } = this.props;

    return (
      <Fragment>
        {hasSelectableType && (
          <PaperSelect
            label="type"
            name="@type"
            value={node['@type']}
            onChange={this.handleSubmit}
          >
            {getDisplayOrganizationClasses().map(({ type, label }) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </PaperSelect>
        )}

        {/* TODO based on the name auto complete the other fields (index nodes by name and type in CouchDB) */}
        <ControlledPaperInput
          name="name"
          label="name"
          autoComplete="off"
          readOnly={readOnly}
          disabled={disabled}
          value={getValue(node.name) || ''}
          onSubmit={this.handleSubmit}
        />

        <ControlledPaperInput
          name="alternateName"
          label="short name / acronym"
          autoComplete="off"
          readOnly={readOnly}
          disabled={disabled}
          value={getValue(node.alternateName) || ''}
          onSubmit={this.handleSubmit}
        />

        <ControlledPaperInput
          name="url"
          label="url"
          type="url"
          autoComplete="off"
          readOnly={readOnly}
          disabled={disabled}
          value={getValue(node.url) || ''}
          onSubmit={this.handleSubmit}
        />

        <PostalAddressFormFragment
          {...others}
          readOnly={readOnly}
          disabled={disabled}
          parentNode={node}
          name="location"
          node={node.location}
        />
      </Fragment>
    );
  }
}
