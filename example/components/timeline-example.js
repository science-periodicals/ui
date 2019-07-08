import React from 'react';
import { getId } from '@scipe/jsonld';
import { Timeline, PaperButton, ControlPanel } from '../../src/';
import uuid from 'uuid';

// TODO make simplify example and add UI control to accept or reject and see the animations...

const now = '2019-04-11T18:16:34.535Z';

function daysFromNow(n) {
  return new Date(
    new Date(now).getTime() + n * (1000 * 60 * 60 * 24)
  ).toISOString();
}

const STAGE1 = -20;
const STAGE2a = -10;
const STAGE2b = -8;
const ASSESS_ACTION_ID = `_:${uuid.v4()}`;
const PUBLISHED = 3;
const REJECTED = 3;

const actions = [
  // STAGE 1
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'StartWorkflowStageAction',
    actionStatus: 'CompletedActionStatus',
    name: 'Submission Stage',
    startTime: daysFromNow(STAGE1),
    endTime: daysFromNow(STAGE1)
  },
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'DeclareAction',
    actionStatus: 'CompletedActionStatus',
    name: 'Answer question',
    startTime: daysFromNow(STAGE1),
    expectedDuration: 'P3D',
    endTime: daysFromNow(STAGE1 + 2)
  },
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'CreateReleaseAction',
    actionStatus: 'CompletedActionStatus',
    startTime: daysFromNow(STAGE1),
    expectedDuration: 'P3D',
    endTime: daysFromNow(STAGE1 + 4)
  },
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'AssessAction',
    actionStatus: 'CompletedActionStatus',
    startTime: daysFromNow(STAGE1),
    expectedDuration: 'P3D',
    endTime: daysFromNow(STAGE1 + 6)
  },

  // STAGE 2
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'StartWorkflowStageAction',
    actionStatus: 'CompletedActionStatus',
    name: 'Review Stage',
    startTime: daysFromNow(STAGE2a),
    expectedDuration: 'P3D',
    endTime: daysFromNow(STAGE2a)
  },
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'CreateReleaseAction',
    actionStatus: 'CompletedActionStatus',
    startTime: daysFromNow(STAGE2a),
    expectedDuration: 'P3D',
    endTime: daysFromNow(STAGE2b)
  },
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'ReviewAction',
    actionStatus: 'ActiveActionStatus',
    startTime: daysFromNow(STAGE2b),
    expectedDuration: 'P3D'
  },
  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'ReviewAction',
    actionStatus: 'CanceledActionStatus',
    startTime: daysFromNow(STAGE2b),
    expectedDuration: 'P3D'
  },

  {
    '@id': ASSESS_ACTION_ID,
    '@type': 'AssessAction',
    actionStatus: 'CompletedActionStatus',
    startTime: daysFromNow(STAGE2b)
  },

  {
    '@id': `_:${uuid.v4()}`,
    '@type': 'PublishAction',
    actionStatus: 'ActiveActionStatus',
    name: 'Publish',
    startTime: daysFromNow(STAGE2b),
    expectedDuration: 'P10D'
  }
];

const graph = {
  '@id': `_:${uuid.v4()}`,
  '@type': 'Graph',
  dateCreated: daysFromNow(STAGE1)
};

export default class TimelineExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      graph: Object.assign({}, graph),
      actions: actions.slice()
    };
  }

  handleAccept = () => {
    this.setState({
      status: 'accepted',
      graph: Object.assign({}, graph, {
        datePublished: daysFromNow(PUBLISHED)
      }),
      actions: actions.map(action => {
        if (getId(action) === getId(ASSESS_ACTION_ID)) {
          Object.assign({}, action, {
            actionStatus: 'CompletedActionStatus',
            endTime: daysFromNow(STAGE2b + 1),
            result: {
              '@type': 'AcceptAction',
              actionStatus: 'CompletedActionStatus'
            }
          });
        }
        return action;
      })
    });
  };

  handleReject = () => {
    this.setState({
      status: 'rejected',
      graph: Object.assign({}, graph, {
        dateRejected: daysFromNow(REJECTED)
      }),
      actions: actions.map(action => {
        if (getId(action) === getId(ASSESS_ACTION_ID)) {
          Object.assign({}, action, {
            actionStatus: 'CompletedActionStatus',
            endTime: daysFromNow(STAGE2b + 1),
            result: {
              '@type': 'RejectAction',
              actionStatus: 'CompletedActionStatus'
            }
          });
        }
        return action;
      })
    });
  };

  handleReset = () => {
    this.setState({
      status: null,
      graph: Object.assign({}, graph),
      actions: actions.slice()
    });
  };

  render() {
    const { graph, actions, status } = this.state;

    return (
      <div className="example">
        <div style={{ width: '296px', background: 'whitesmoke' }}>
          <section>
            <h2>Timeline</h2>
            <Timeline
              graph={graph}
              actions={actions}
              alwaysShowText={true}
              now={now}
            />

            <ControlPanel>
              <PaperButton
                onClick={this.handleAccept}
                disabled={status === 'accepted'}
              >
                Accept
              </PaperButton>
              <PaperButton
                onClick={this.handleReject}
                disabled={status === 'rejected'}
              >
                Reject
              </PaperButton>
              <PaperButton onClick={this.handleReset} disabled={!status}>
                Reset
              </PaperButton>
            </ControlPanel>
          </section>

          <section>
            <h2>Empty (no props)</h2>
            <Timeline />
          </section>
        </div>
      </div>
    );
  }
}
