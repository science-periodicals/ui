import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId, arrayify } from '@scipe/jsonld';
import Service from './service';
import ServicePreview from './service-preview';
import ExpansionPanel from '../expansion-panel';
import ExpansionPanelPreview from '../expansion-panel-preview';
import ExpansionPanelGroup from '../expansion-panel-group';
import PaperCheckbox from '../paper-checkbox';
import PaperRadioButton from '../paper-radio-button';

export default class ServicePicker extends React.Component {
  static propTypes = {
    multi: PropTypes.bool,
    onSelect: PropTypes.func,
    compactPreviews: PropTypes.bool,
    customerType: PropTypes.oneOf(['Enduser', 'RevisionAuthor']),
    // specify `services` or `service` based on `multi`
    service: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // selected service
    services: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    ), // selected services
    potentialServices: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    customerType: 'Enduser',
    multi: false,
    potentialServices: [],
    onSelect: noop
  };

  handleClick(serviceId, nextChecked) {
    this.props.onSelect(serviceId, nextChecked);
  }

  render() {
    const {
      service,
      services,
      potentialServices,
      multi,
      compactPreviews,
      customerType
    } = this.props;

    const checked = arrayify(services || service)
      .filter(Boolean)
      .reduce((checked, service) => {
        const serviceId = getId(service);
        if (serviceId) {
          checked.add(serviceId);
        }
        return checked;
      }, new Set());

    // Note for now we only support Typesetting service so if multi is false, we can use a Radio (only one choice is possible.
    // TODO if (!multi) only allow to pick 1 service per serviceType

    return (
      <div className="service-picker">
        <ExpansionPanelGroup>
          {potentialServices.map((service, i) => (
            <ExpansionPanel key={getId(service)}>
              <ExpansionPanelPreview className="service-picker__preview">
                {multi ? (
                  <PaperCheckbox
                    id={`radio-${getId(service)}`}
                    checked={checked.has(getId(service))}
                    className="service-picker__control"
                    onClick={this.handleClick.bind(
                      this,
                      getId(service),
                      !checked.has(getId(service))
                    )}
                  />
                ) : (
                  <PaperRadioButton
                    id={`radio-${getId(service)}`}
                    checked={checked.has(getId(service))}
                    className="service-picker__control"
                    onClick={this.handleClick.bind(
                      this,
                      getId(service),
                      !checked.has(getId(service))
                    )}
                  />
                )}
                <ServicePreview
                  service={service}
                  compact={compactPreviews}
                  customerType={customerType}
                />
              </ExpansionPanelPreview>

              <Service service={service} customerType={customerType} />
            </ExpansionPanel>
          ))}
        </ExpansionPanelGroup>
      </div>
    );
  }
}
