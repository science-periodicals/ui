import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import withOnSubmit from '../../hoc/with-on-submit';
import { getValue, createValue } from '@scipe/jsonld';
import PaperInput from '../paper-input';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';

const ControlledPaperInput = withOnSubmit(PaperInput);

export default class PersonFormFragment extends React.Component {
  static propTypes = {
    hasSelectableType: PropTypes.bool,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    node: PropTypes.object, // hydrated
    onUpdate: PropTypes.func // (node, key, value, {force: true})
  };

  static defaultProps = {
    node: {},
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
    const { node, readOnly, disabled } = this.props;

    return (
      <Fragment>
        <LayoutWrapRows>
          {/* TODO based on the name auto complete the other fields (index nodes by name and type in CouchDB) */}
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="name"
              label="display name"
              autoComplete="off"
              readOnly={readOnly}
              disabled={disabled}
              value={getValue(node.name) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
        </LayoutWrapRows>

        <LayoutWrapRows>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="givenName"
              label="given name"
              autoComplete="off"
              readOnly={readOnly}
              disabled={disabled}
              value={getValue(node.givenName) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="familyName"
              label="family name"
              autoComplete="off"
              readOnly={readOnly}
              disabled={disabled}
              value={getValue(node.familyName) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
          <LayoutWrapItem flexBasis="200px">
            <ControlledPaperInput
              name="additionalName"
              label="middle name"
              autoComplete="off"
              readOnly={readOnly}
              disabled={disabled}
              value={getValue(node.additionalName) || ''}
              onSubmit={this.handleSubmit}
            />
          </LayoutWrapItem>
        </LayoutWrapRows>

        <LayoutWrapRows>
          <LayoutWrapItem flexBasis="200px">
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
          </LayoutWrapItem>
        </LayoutWrapRows>
      </Fragment>
    );
  }
}
