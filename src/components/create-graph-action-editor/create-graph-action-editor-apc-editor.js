import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { createId } from '@scipe/librarian';
import { getId } from '@scipe/jsonld';
import PaperInput from '../paper-input';
import { StyleFormGroup } from './create-graph-action-editor-modal';
import withOnSubmit from '../../hoc/with-on-submit';

const ControledPaperInput = withOnSubmit(PaperInput);

export default class CreateGraphActionEditorApcEditor extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    action: PropTypes.object,
    nodeMap: PropTypes.object,
    onChange: PropTypes.func,
    roleName: PropTypes.string
  };

  static defaultProps = {
    action: {},
    nodeMap: {},
    onChange: noop
  };

  handleSubmit = e => {
    const { action, nodeMap, onChange } = this.props;

    let nextAction;
    const nextPriceSpecification = Object.assign(
      {
        '@id': createId('blank')['@id'],
        '@type': 'PriceSpecification',
        priceCurrency: 'USD'
      },
      nodeMap[getId(action.priceSpecification)],
      {
        price: parseInt(e.target.value, 10)
      }
    );

    nextAction = Object.assign({}, action, {
      priceSpecification: getId(nextPriceSpecification)
    });

    onChange(
      Object.assign({}, nodeMap, {
        [getId(nextAction)]: nextAction,
        [getId(nextPriceSpecification)]: nextPriceSpecification
      })
    );
  };

  render() {
    const { action, nodeMap, disabled } = this.props;

    const priceSpecification = nodeMap[getId(action.priceSpecification)] || {};
    const price = priceSpecification.price || 0;

    return (
      <StyleFormGroup>
        <fieldset>
          <ControledPaperInput
            type="number"
            label="price (USD)"
            name="price"
            min={0}
            step={1}
            value={price}
            disabled={disabled}
            onSubmit={this.handleSubmit}
          />
        </fieldset>
      </StyleFormGroup>
    );
  }
}
