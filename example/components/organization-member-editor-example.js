import React, { Component } from 'react';
import { getAgent, getAgentId } from '@scipe/librarian';
import { OrganizationMemberEditor, OrganizationInviteEditor } from '../../src/';

const organization = {
  '@context': 'https://science.ai',
  '@id': 'org:monster-inc',
  '@type': 'Organization',
  name: 'Monster inc',
  member: [
    {
      '@type': 'Role',
      roleName: 'member',
      member:
        'user:userwithaverylongusernamethatmaybreaktheuiifwedontautoabridgeit'
    },
    {
      '@type': 'Role',
      roleName: 'member',
      member: 'user:peter'
    },
    {
      '@type': 'Role',
      roleName: 'member',
      member: 'user:lea'
    }
  ]
};

class OrganizationMemberEditorExample extends Component {
  handleAction(action) {
    console.warn(action);
  }

  handleClose(e) {
    console.warn('CLOSE');
  }

  handleDelete(action) {
    console.warn('DELETE', action);
  }

  render() {
    const user = getAgent(organization.member[0]);
    const agentIds = Array.from(
      new Set(organization.member.map(m => getAgentId(m)))
    );

    return (
      <div className="example">
        <h2>Administrators</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
          {agentIds.map((agentId, i) => (
            <li key={agentId} style={{ padding: '1.6rem' }}>
              <OrganizationMemberEditor
                user={user}
                organization={organization}
                editedUserId={agentId}
                isProgressing={i === 1}
                onAction={this.handleAction}
              />
            </li>
          ))}
        </ul>

        <h2>Invites</h2>

        <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap' }}>
          <li style={{ padding: '1.6rem' }}>
            <OrganizationInviteEditor
              user={user}
              organization={organization}
              inviteAction={{
                '@type': 'InviteAction',
                actionStatus: 'ActiveActionStatus',
                startTime: new Date().toISOString(),
                recipient: {
                  '@type': 'ContributorRole',
                  recipient: {
                    email:
                      'mailto:verylongemailthatwiloverflowifautoabridgeisnothere@science.ai'
                  }
                }
              }}
              onDelete={this.handleDelete}
              isProgressing={false}
              onAction={this.handleAction}
            />
          </li>
          <li style={{ padding: '1.6rem' }}>
            <OrganizationInviteEditor
              user={user}
              organization={organization}
              inviteAction={{
                '@type': 'InviteAction',
                actionStatus: 'ActiveActionStatus',
                startTime: new Date().toISOString(),
                recipient: {
                  '@type': 'ContributorRole',
                  recipient: {
                    '@id': 'user:ted',
                    email: 'mailto:ted@science.ai'
                  }
                }
              }}
              onDelete={this.handleDelete}
              isProgressing={false}
              onAction={this.handleAction}
            />
          </li>
          <li style={{ padding: '1.6rem' }}>
            <OrganizationInviteEditor
              user={user}
              organization={organization}
              inviteAction={{
                '@type': 'InviteAction',
                actionStatus: 'ActiveActionStatus',
                startTime: new Date().toISOString(),
                recipient: {
                  '@type': 'ContributorRole',
                  recipient: {
                    email: 'mailto:ted@science.ai'
                  }
                }
              }}
              isNewInviteAction={true}
              onAction={this.handleAction}
              onClose={this.handleClose}
            />
          </li>
        </ul>
      </div>
    );
  }
}

export default OrganizationMemberEditorExample;
