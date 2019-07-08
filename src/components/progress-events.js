import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import Spinner from './spinner';
import { TransitionGroup, Transition } from 'react-transition-group';

export default class ProgressEvents extends Component {
  static propTypes = {
    events: PropTypes.arrayOf(PropTypes.object).isRequired,
    action: PropTypes.shape({
      actionStatus: PropTypes.string.isRequired
    }).isRequired,
    depth: PropTypes.arrayOf(PropTypes.number)
  };

  static defaultProps = {
    depth: []
  };

  renderStatus(event) {
    const {
      action,
      action: { actionStatus }
    } = this.props;
    let status;

    if (actionStatus === 'FailedActionStatus') {
      status = <Iconoclass iconName="statusError" iconSize={16} />;
    } else if (actionStatus === 'CanceledActionStatus') {
      status = <Iconoclass iconName="statusWarning" iconSize={16} />;
    } else if (event.endDate) {
      status = <Iconoclass iconName="check" iconSize={16} />;
    } else {
      if (event.progress != null && event.progress.value != null) {
        status = (
          <Spinner
            progressMode={'up'}
            size={16}
            showPercentage={false}
            progress={Math.ceil(event.progress.value)}
            heartbeat={true}
          />
        );
      } else if (action['@type'] === 'TypesettingAction') {
        // potentially long lasting event => we don't spin
        status = <Iconoclass iconName="hourglassOutline" iconSize={16} />;
      } else {
        status = <Spinner progressMode={'spinUp'} size={16} />;
      }
    }
    return status;
  }

  render() {
    const { events, action, depth } = this.props;

    // TODO only show progress if non 0 or non 100 (or more)
    return (
      <TransitionGroup component="ul" className="progress-events">
        {events.map((event, i) => {
          const nextDepth = depth.concat(i + 1);
          return (
            <Transition timeout={500} classNames="fade" key={event['@id']}>
              {status => (
                <li
                  className={`progress-events__event progress-events__event--${status}`}
                >
                  <span className="progress-events__number">
                    {nextDepth.join('.')}
                  </span>
                  <span className="progress-events__description">
                    {event.description}{' '}
                    {event.progress &&
                    event.progress.value != null &&
                    event.progress.value > 0 &&
                    event.progress.value < 100
                      ? ` (${Math.ceil(event.progress.value)}%)`
                      : ''}
                  </span>{' '}
                  <div className="progress-events__status">
                    {this.renderStatus(event)}
                  </div>
                  {event.subEvent ? (
                    <ProgressEvents
                      events={event.subEvent}
                      action={action}
                      depth={nextDepth}
                    />
                  ) : null}
                </li>
              )}
            </Transition>
          );
        })}
      </TransitionGroup>
    );
  }
}
