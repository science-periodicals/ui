import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId, arrayify } from '@scipe/jsonld';
import ServicePicker from '../service/service-picker';
import { StyleFormGroup } from './create-graph-action-editor-modal';

export default class CreateGraphActionEditorServiceEditor extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    action: PropTypes.object,
    nodeMap: PropTypes.object,
    onChange: PropTypes.func,
    roleName: PropTypes.string,
    potentialServices: PropTypes.arrayOf(PropTypes.object),
    serviceProp: PropTypes.oneOf(['addOnService', 'potentialService'])
      .isRequired
  };

  static defaultProps = {
    action: {},
    nodeMap: {},
    onChange: noop
  };

  handleSelect = (serviceId, checked) => {
    const {
      action,
      nodeMap,
      onChange,
      potentialServices,
      serviceProp
    } = this.props;

    let nextAction;

    if (checked) {
      nextAction = Object.assign({}, action, {
        [serviceProp]: arrayify(action[serviceProp])
          .filter(
            service =>
              getId(service) !== getId(serviceId) &&
              // make sure to purge services that have been archived and are no longer part of `serviceProp`
              potentialServices.some(
                potentialService => getId(potentialService) === getId(service)
              )
          )
          .concat(getId(serviceId))
      });
    } else {
      nextAction = Object.assign({}, action, {
        [serviceProp]: arrayify(action[serviceProp]).filter(
          service =>
            getId(service) !== getId(serviceId) &&
            // make sure to purge services that have been archived and are no longer part of `serviceProp`
            potentialServices.some(
              potentialService => getId(potentialService) === getId(service)
            )
        )
      });
      if (!nextAction[serviceProp].length) {
        delete nextAction[serviceProp];
      }
    }

    onChange(
      Object.assign({}, nodeMap, {
        [getId(nextAction)]: nextAction
      })
    );
  };

  render() {
    const { potentialServices, action, serviceProp, disabled } = this.props;

    return (
      <StyleFormGroup>
        <fieldset>
          <ServicePicker
            multi={true}
            disabled={disabled}
            onSelect={this.handleSelect}
            services={arrayify(action[serviceProp])}
            potentialServices={potentialServices}
          />
        </fieldset>
      </StyleFormGroup>
    );
  }
}
