import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { schema } from '@scipe/librarian';
import PersonOrOrganizationFormFragment from '../forms/person-or-organization-form-fragment';
import OrganizationEditor from './organization-editor';

export default class PersonOrOrganizationEditor extends React.Component {
  static propTypes = {
    node: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onClose: PropTypes.func,
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func, // (node, key, value, {force: true})
    onDelete: PropTypes.func // (parentNode, parentKey, value)
  };

  static defaultProps = {
    node: {},
    onCreate: noop,
    onUpdate: noop,
    onDelete: noop
  };

  render() {
    const { node, ...others } = this.props;

    if (typeof node === 'string') return null;

    return (
      <div className="person-or-organization-editor">
        {schema.is(node, 'Person') ? (
          <PersonOrOrganizationFormFragment {...others} node={node} />
        ) : (
          <OrganizationEditor
            {...others}
            node={node}
            allowPersonTypeSelection={true}
          />
        )}
      </div>
    );
  }
}
