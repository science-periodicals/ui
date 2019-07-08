import React, { Component } from 'react';
import { Acl } from '@scipe/librarian';
import { getAgent, getAgentId } from 'schema.org/utils';
import {
  PeriodicalContributorEditor,
  PeriodicalInviteEditor,
  PeriodicalApplicationHandler
} from '../../src/';
import periodical from '../../test/fixtures/periodical.json';

const inviteAction = {
  '@type': 'InviteAction',
  actionStatus: 'ActiveActionStatus',
  startTime: new Date().toISOString(),
  recipient: {
    '@type': 'ContributorRole',
    roleName: 'editor',
    recipient: {
      email: 'mailto:longemailthatcanoverflow@science.ai'
    }
  }
};

const newInviteAction = Object.assign({}, inviteAction, {
  actionStatus: 'PotentialActionStatus',
  recipient: Object.assign({}, inviteAction.recipient, {
    about: {
      '@id': 'subjects:biological-sciences',
      name: 'Biological sciences'
    }
  })
});

class PeriodicalContributorEditorExample extends Component {
  constructor(props) {
    super(props);
    this.state = { newInviteAction };
    this.handleChange = this.handleChange.bind(this);
  }

  handleAction(action) {
    console.log('ACTION');
    console.log(action);
  }

  handleChange(action) {
    console.log('CHANGE');
    console.log(action);
    this.setState({ newInviteAction: action });
  }

  handleClose(e) {
    console.log('CLOSE');
  }

  handleDelete(action) {
    console.log('DELETE', action);
  }

  render() {
    const { newInviteAction } = this.state;
    const user = getAgent(periodical.editor[0]);
    const admin = getAgent(periodical.editor[2]);
    const agentIds = Array.from(
      new Set(
        periodical.editor
          .concat(periodical.reviewer)
          .map(contrib => getAgentId(contrib))
      )
    );

    return (
      <div className="example">
        <h2>Staff</h2>

        <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
          {agentIds.map((agentId, i) => (
            <li key={agentId} style={{ padding: '1.6rem' }}>
              <PeriodicalContributorEditor
                user={admin}
                acl={new Acl(periodical)}
                periodical={periodical}
                editedUserId={agentId}
                isProgressing={false}
                onAction={this.handleAction}
              />
            </li>
          ))}
        </ul>

        <h2>Invitees</h2>

        <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
          <li style={{ padding: '1.6rem' }}>
            <PeriodicalInviteEditor
              user={admin}
              periodical={periodical}
              acl={new Acl(periodical)}
              inviteAction={inviteAction}
              isProgressing={false}
              onAction={this.handleAction}
              onChange={this.handleChange}
              onDelete={this.handleDelete}
            />
          </li>
          {/* Invite reviewer */}
          <li style={{ padding: '1.6rem' }}>
            <PeriodicalInviteEditor
              user={admin}
              periodical={periodical}
              acl={new Acl(periodical)}
              inviteAction={{
                '@type': 'InviteAction',
                actionStatus: 'ActiveActionStatus',
                startTime: new Date().toISOString(),
                recipient: {
                  '@type': 'ContributorRole',
                  roleName: 'reviewer',
                  recipient: 'user:rebecca'
                }
              }}
              onAction={this.handleAction}
              onChange={this.handleChange}
              onClose={this.handleClose}
              onDelete={this.handleDelete}
            />
          </li>
          <li style={{ padding: '1.6rem' }}>
            <PeriodicalInviteEditor
              user={admin}
              periodical={periodical}
              acl={new Acl(periodical)}
              inviteAction={newInviteAction}
              isNewInviteAction={true}
              onAction={this.handleAction}
              onChange={this.handleChange}
              onClose={this.handleClose}
              onDelete={this.handleDelete}
            />
          </li>
        </ul>

        <h2>Applicants</h2>

        <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
          <li style={{ padding: '1.6rem' }}>
            <PeriodicalApplicationHandler
              user={admin}
              periodical={periodical}
              acl={new Acl(periodical)}
              applyAction={{
                '@id': 'action:applyAction1',
                '@type': 'ApplyAction',
                actionStatus: 'ActiveActionStatus',
                agent: {
                  '@type': 'ContributorRole',
                  roleName: 'reviewer',
                  agent: 'user:longusernamethatmayoverflowifnotproperlyhandled'
                }
              }}
              isProgressing={false}
              onAction={this.handleAction}
            />
          </li>
          <li style={{ padding: '1.6rem' }}>
            <PeriodicalApplicationHandler
              user={admin}
              periodical={periodical}
              acl={new Acl(periodical)}
              applyAction={{
                '@id': 'action:applyAction2',
                '@type': 'ApplyAction',
                actionStatus: 'ActiveActionStatus',
                agent: {
                  '@type': 'ContributorRole',
                  roleName: 'editor',
                  agent: 'user:leticia'
                }
              }}
              isProgressing={false}
              onAction={this.handleAction}
            />
          </li>
        </ul>
      </div>
    );
  }
}

export default PeriodicalContributorEditorExample;
