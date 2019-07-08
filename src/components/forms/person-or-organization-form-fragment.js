import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { schema } from '@scipe/librarian';
import PaperSelect from '../paper-select';
import PersonFormFragment from './person-form-fragment';
import OrganizationFormFragment from './organization-form-fragment';
import { getDisplayOrganizationClasses } from '../../utils/graph';

export default class PersonOrOrganizationFormFragment extends React.Component {
  static propTypes = {
    node: PropTypes.object, // hydrated
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func // (node, key, value, {force: true})
  };

  static defaultProps = {
    node: {},
    onCreate: noop,
    onUpdate: noop
  };

  handleChange = e => {
    const { node } = this.props;

    this.props.onUpdate(node, e.target.name, e.target.value, {
      force:
        (schema.is(node, 'Person') &&
          schema.is(e.target.value, 'Organization')) ||
        (schema.is(node, 'Organization') && schema.is(e.target.value, 'Person'))
    });
  };

  render() {
    const { node, readOnly, disabled, ...others } = this.props;

    return (
      <Fragment>
        <PaperSelect
          label="type"
          readOnly={readOnly}
          disabled={disabled}
          name="@type"
          value={node['@type']}
          onChange={this.handleChange}
        >
          <option value="Person">Person</option>
          {getDisplayOrganizationClasses().map(({ type, label }) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </PaperSelect>

        {schema.is(node, 'Person') ? (
          <PersonFormFragment
            {...others}
            readOnly={readOnly}
            disabled={disabled}
            node={node}
          />
        ) : (
          <OrganizationFormFragment
            {...others}
            readOnly={readOnly}
            disabled={disabled}
            node={node}
            isRoot={true}
            hasSelectableType={false}
          />
        )}
      </Fragment>
    );
  }
}
