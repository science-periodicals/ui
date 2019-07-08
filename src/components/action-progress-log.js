import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProgressEvents from './progress-events';
import ExpansionPanel from './expansion-panel';
import ExpansionPanelPreview from './expansion-panel-preview';
import DateFromNow from './date-from-now';

const type2title = {
  UploadAction: 'File Upload',
  ImageProcessingAction: 'Image processing',
  AudioVideoProcessingAction: 'Audio Video processing',
  DocumentProcessingAction: 'Document processing',
  UpdateAction: 'Data update',
  TypesettingAction: 'Typesetting'
};

const actionStatus2className = {
  ActiveActionStatus: 'active',
  CompletedActionStatus: 'completed',
  FailedActionStatus: 'failed',
  PotentialActionStatus: 'potential'
};

export default class ActionProgressLog extends Component {
  static propTypes = {
    action: PropTypes.object.isRequired,
    events: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    events: []
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.action !== this.props.action) {
      if (this.body) {
        this.body.scrollTop = this.body.scrollHeight;
      }
    }

    if (
      this.props.action.actionStatus === 'CompletedActionStatus' &&
      prevProps.action.actionStatus !== 'CompletedActionStatus'
    ) {
      this.panel.close();
    }
  }

  render() {
    const { action, events } = this.props;

    return (
      <section
        className={
          'action-progress-log action-progress-log--' +
          actionStatus2className[action.actionStatus]
        }
      >
        <ExpansionPanel
          ref={el => {
            this.panel = el;
          }}
          expanded={action.actionStatus !== 'CompletedActionStatus'}
        >
          <ExpansionPanelPreview>
            {/* TODO show global progress indicator with spinner here ? */}
            <span>{type2title[action['@type']] || action['@type']}</span>
          </ExpansionPanelPreview>
          <div
            className="action-progress-log__body"
            ref={el => {
              this.body = el;
            }}
          >
            {events.length ? (
              <ProgressEvents events={events} action={action} />
            ) : null}
            {action.actionStatus === 'CanceledActionStatus' ? (
              <span>
                canceled{' '}
                {!!action.endTime && (
                  <DateFromNow>{action.endTime}</DateFromNow>
                )}
              </span>
            ) : null}
            {action.error ? <span>{action.error.description}</span> : null}
          </div>
        </ExpansionPanel>
      </section>
    );
  }
}
