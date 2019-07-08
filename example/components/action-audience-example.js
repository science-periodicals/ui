import React from 'react';
import { Acl, createId } from '@scipe/librarian';
import { ActionAudience } from '../../src/';

const graphId = createId('graph')['@id'];

export default class ActionAudienceExample extends React.Component {
  constructor(props) {
    super(props);

    const action = {
      '@type': 'CommentAction',
      participant: [
        {
          '@id': 'role:leah',
          '@type': 'ContributorRole',
          roleName: 'editor',
          participant: 'user:leah'
        },
        {
          '@id': createId('audience', 'author', graphId)['@id'],
          '@type': 'Audience',
          audienceType: 'author'
        }
      ]
    };

    const authorizeActions = [
      {
        '@type': 'AuthorizeAction',
        actionStatus: 'PotentialActionStatus',
        completeOn: 'OnObjectObjectWorkflowStageEnd',
        recipient: {
          audienceType: 'reviewer'
        }
      }
    ];

    this.state = {
      action,
      authorizeActions
    };
  }

  handleAction = (action, item) => {
    this.setState({ action });
    console.log(action, item);
  };

  handleAuthorizeActions = authorizeActions => {
    this.setState({ authorizeActions });
    console.log(authorizeActions);
  };

  render() {
    const { action, authorizeActions } = this.state;

    const graph = {
      '@id': graphId,
      '@type': 'Graph',
      hasDigitalDocumentPermission: [
        {
          '@type': 'DigitalDocumentPermission',
          permissionType: 'AdminPermission',
          grantee: 'user:peter'
        },
        {
          '@type': 'DigitalDocumentPermission',
          permissionType: 'ViewIdentityPermission',
          grantee: {
            '@type': 'Audience',
            audienceType: 'editor'
          },
          permissionScope: {
            '@type': 'Audience',
            audienceType: 'editor'
          }
        }
      ],
      editor: [
        {
          '@id': 'role:peter',
          '@type': 'ContributorRole',
          editor: 'user:peter',
          roleName: 'editor',
          name: 'editor in chief'
        },
        {
          '@id': 'role:leah',
          '@type': 'ContributorRole',
          editor: 'user:leah',
          roleName: 'editor'
        }
      ]
    };

    const acl = new Acl(graph);
    const blindingData = acl.getBlindingData('user:peter');

    return (
      <div className="example">
        <section>
          <ActionAudience
            action={action}
            audienceProp="participant"
            user="user:peter"
            blindingData={blindingData}
            onAction={this.handleAction}
            onAuthorizeActions={this.handleAuthorizeActions}
            potentialAudiences={[
              {
                '@id': 'role:leah',
                '@type': 'ContributorRole',
                roleName: 'editor',
                participant: 'user:leah'
              },
              { '@type': 'Audience', audienceType: 'author' },
              { '@type': 'Audience', audienceType: 'editor' }
            ]}
            authorizeActions={authorizeActions}
            potentialAuthorizeActions={[
              {
                '@type': 'AuthorizeAction',
                actionStatus: 'PotentialActionStatus',
                completeOn: 'OnObjectObjectWorkflowStageEnd',
                recipient: {
                  audienceType: 'reviewer'
                }
              },
              {
                '@type': 'AuthorizeAction',
                actionStatus: 'PotentialActionStatus',
                completeOn: 'OnObjectObjectStagedActionStatus',
                recipient: {
                  audienceType: 'producer'
                }
              }
            ]}
          />
        </section>

        <section>
          readonly
          <ActionAudience
            action={action}
            readOnly={true}
            audienceProp="participant"
            user="user:peter"
            blindingData={blindingData}
            authorizeActions={authorizeActions}
          />
        </section>
      </div>
    );
  }
}
