import React, { Component } from 'react';
import { WorkflowParticipants, WorkflowAction } from '../../src/';

import { Acl } from '@scipe/librarian';

const READ_ONLY = false;

class WorkflowActionExample extends Component {
  constructor(props) {
    super(props);
    this.handleAction = this.handleAction.bind(this);
  }

  handleAction(action, payload) {
    console.log(action, payload);
  }

  render() {
    const description =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut condimentum finibus leo. Donec in sapien at turpis consequat placerat. Aenean tempus volutpat neque sed accumsan. Etiam ipsum mi, tristique ac risus in, volutpat luctus augue. Maecenas mollis congue ornare. Suspendisse eget neque sed metus vestibulum auctor. Integer pretium arcu lectus, vitae feugiat augue luctus ac. Quisque vitae cursus erat. Aenean quis metus non mauris consequat mollis in vitae ipsum. Sed vehicula, eros eget convallis varius, justo risus venenatis metus, eget consequat nunc leo nec augue. Sed vitae luctus est, quis consectetur diam. Praesent fermentum blandit est in aliquam.';

    const inviteActions = [
      {
        '@type': 'InviteAction',
        actionStatus: 'PotentialActionStatus',
        agent: 'user:edith',
        recipient: {
          '@type': 'ContributorRole',
          recipient: 'user:tiffany',
          roleName: 'editor',
          name: 'editor-in-chief'
        }
      },
      {
        '@type': 'InviteAction',
        actionStatus: 'ActiveActionStatus',
        agent: 'user:edith',
        recipient: {
          '@type': 'ContributorRole',
          recipient: 'user:jon',
          roleName: 'editor'
        }
      }
    ];

    const graph = {
      '@id': 'scienceai:graphId@graph',
      hasDigitalDocumentPermission: [
        {
          '@type': 'DigitalDocumentPermission',
          permissionType: 'AdminPermission',
          grantee: [
            {
              '@type': 'Audience',
              audienceType: 'author'
            },
            {
              '@type': 'Audience',
              audienceType: 'reviewer'
            },
            {
              '@type': 'Audience',
              audienceType: 'producer'
            },
            {
              '@type': 'Audience',
              audienceType: 'editor'
            }
          ]
        },
        {
          '@type': 'DigitalDocumentPermission',
          permissionType: 'ViewIdentityPermission',
          grantee: {
            '@type': 'Audience',
            audienceType: 'author'
          },
          permissionScope: [
            {
              '@type': 'Audience',
              audienceType: 'author'
            },
            {
              '@type': 'Audience',
              audienceType: 'producer'
            },
            {
              '@type': 'Audience',
              audienceType: 'editor'
            }
          ]
        }
      ],
      author: [
        {
          '@id': 'role:authorPeter',
          roleName: 'author',
          author: 'user:peter'
        }
      ],
      contributor: [
        {
          '@id': 'role:reviewerAnton',
          roleName: 'reviewer',
          contributor: 'user:anton'
        }
      ],
      editor: [
        {
          '@id': 'role:editorEdith',
          roleName: 'editor',
          name: 'editorial office',
          editor: 'user:edith'
        },
        {
          '@id': 'role:editorLea',
          roleName: 'editor',
          editor: 'user:lea'
        }
      ]
    };

    const acl = new Acl(graph);

    return (
      <div
        className="example"
        style={{
          maxWidth: '450px',
          margin: '100px auto',
          marginBottom: '500px'
        }}
      >
        <ul style={{ listStyle: 'none' }}>
          <li>
            <WorkflowParticipants
              user="user:peter"
              graph={graph}
              workflowSpecification={{
                '@type': 'WorfklowSpecification',
                potentialAction: {
                  '@type': 'CreateGraphAction',
                  result: {
                    '@graph': [
                      {
                        '@type': 'Graph'
                      },
                      {
                        '@id': 'workflow:workflowId',
                        '@type': 'AssessAction',
                        agent: '_:agent'
                      },
                      { '@id': '_:agent', roleName: 'editor' }
                    ]
                  }
                }
              }}
              acl={acl}
              inviteActions={inviteActions}
              roleName="editor"
              onAction={this.handleAction}
            />
          </li>

          {/* Need assignment (warning + flashing) */}
          <li>
            <WorkflowAction
              user="user:peter"
              readOnly={READ_ONLY}
              roleName="editor"
              portal={true}
              graph={graph}
              action={{
                identifier: '1.1',
                agent: {
                  '@type': 'ContributorRole',
                  roleName: 'editor',
                  name: 'administrative assistant'
                },
                '@type': 'Action',
                name: 'No assignee',
                description,
                startTime: new Date().toISOString()
              }}
              stage={{}}
              heartbeat={true}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>

          {/* Assignable */}
          <li>
            <WorkflowAction
              user="user:peter"
              readOnly={READ_ONLY}
              roleName="editor"
              portal={true}
              graph={graph}
              action={{
                identifier: '1.2',
                agent: {
                  '@type': 'ContributorRole',
                  roleName: 'editor'
                },
                '@type': 'Action',
                name: 'Assignable',
                description,
                startTime: new Date().toISOString()
              }}
              stage={{}}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>

          {/* Review (duplicatable) */}
          <li>
            <WorkflowAction
              user="user:anton"
              readOnly={READ_ONLY}
              graph={graph}
              action={{
                '@type': 'ReviewAction',
                identifier: '1.3',
                actionStatus: 'ActiveActionStatus',
                minInstances: 3,
                maxInstances: 5,
                startTime: new Date().toISOString(),
                expectedDuration: 'P2D',
                name: 'Review (deletable)',
                description,
                agent: {
                  '@id': 'role:editorEdith',
                  roleName: 'editor',
                  name: 'editor in chief',
                  agent: 'user:edith'
                },
                participant: {
                  '@id': 'role:x@editorLea',
                  roleName: 'assigner',
                  participant: 'user:lea'
                }
              }}
              stage={{}}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>

          {/* Review (completed) */}
          <li>
            <WorkflowAction
              user="user:anton"
              readOnly={READ_ONLY}
              graph={graph}
              action={{
                '@type': 'ReviewAction',
                identifier: '1.4',
                actionStatus: 'CompletedActionStatus',
                minInstances: 1,
                maxInstances: 3,
                startTime: new Date().toISOString(),
                expectedDuration: 'P2D',
                name: 'Review (completed)',
                description,
                agent: {
                  '@id': 'role:editorEdith',
                  roleName: 'editor',
                  name: 'editor in chief',
                  agent: 'user:edith'
                },
                participant: {
                  '@id': 'role:x@editorLea',
                  roleName: 'assigner',
                  participant: 'user:lea'
                }
              }}
              stage={{}}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>

          {/* Review (endorsed) */}
          <li>
            <WorkflowAction
              user="user:anton"
              readOnly={READ_ONLY}
              graph={graph}
              action={{
                '@type': 'ReviewAction',
                identifier: '1.5',
                actionStatus: 'CompletedActionStatus',
                minInstances: 1,
                maxInstances: 3,
                startTime: new Date().toISOString(),
                expectedDuration: 'P2D',
                name: 'Review (endorsed)',
                description,
                requiresCompletionOf: 'action:endorseActionId',
                agent: {
                  '@id': 'role:editorEdith',
                  roleName: 'editor',
                  name: 'editor in chief',
                  agent: 'user:edith'
                },
                participant: {
                  '@id': 'role:x@editorLea',
                  roleName: 'assigner',
                  participant: 'user:lea'
                }
              }}
              stage={{
                '@type': 'StartWorkflowStageAction',
                result: [
                  {
                    '@type': 'ReviewAction',
                    actionStatus: 'CompletedActionStatus',
                    minInstances: 1,
                    maxInstances: 3,
                    startTime: new Date().toISOString(),
                    expectedDuration: 'P2D',
                    name: 'Review (endorsed)',
                    description,
                    requiresCompletionOf: 'action:endorseActionId',
                    agent: {
                      '@id': 'role:editorEdith',
                      roleName: 'editor',
                      name: 'editor in chief',
                      agent: 'user:edith'
                    },
                    participant: {
                      '@id': 'role:x@editorLea',
                      roleName: 'assigner',
                      participant: 'user:lea'
                    },
                    potentialAction: {
                      '@id': 'action:endorseActionId',
                      '@type': 'EndorseAction',
                      agent: {
                        '@type': 'ContributorRole',
                        recipient: 'user:tiffany',
                        roleName: 'editor',
                        name: 'editor-in-chief'
                      },
                      actionStatus: 'CompletedActionStatus'
                    }
                  }
                ]
              }}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>

          {/* Blocked (including endorsement) */}
          <li>
            <WorkflowAction
              user="user:peter"
              readOnly={READ_ONLY}
              graph={graph}
              canCommunicate={true}
              action={{
                '@id': 'action:assessActionId',
                '@type': 'AssessAction',
                identifier: '1.6',
                agent: {
                  roleName: 'editor',
                  agent: 'user:edith'
                },
                participant: {
                  '@id': 'role:x@editorLea',
                  roleName: 'assigner',
                  participant: 'user:lea'
                },
                name: 'Blocked',
                description,
                requiresCompletionOf: [
                  'action:reviewActionId',
                  'action:declareActionId',
                  'action:payActionId',
                  'action:endorseActionId'
                ],
                resultOf: 'action:stageId'
              }}
              stage={{
                '@type': 'StartWorkflowStageAction',
                result: [
                  {
                    '@id': 'action:assessActionId',
                    '@type': 'AssessAction',
                    agent: {
                      roleName: 'editor',
                      agent: 'user:edith'
                    },
                    participant: {
                      '@id': 'role:x@editorLea',
                      roleName: 'assigner',
                      participant: 'user:lea'
                    },
                    name: 'Blocked',
                    description,
                    requiresCompletionOf: [
                      'action:reviewActionId',
                      'action:declareActionId',
                      'action:payActionId',
                      'action:endorseActionId'
                    ],
                    resultOf: 'action:stageId',
                    potentialAction: {
                      '@id': 'action:endorseActionId',
                      '@type': 'EndorseAction',
                      actionStatus: 'ActiveActionStatus',
                      resultOf: 'action:stageId'
                    }
                  },
                  {
                    '@id': 'action:reviewActionId',
                    '@type': 'ReviewAction',
                    actionStatus: 'ActiveActionStatus',
                    resultOf: 'action:stageId',
                    requiresCompletionOf: 'action:endorseActionId'
                  },
                  {
                    '@id': 'action:declareActionId',
                    '@type': 'DeclareAction',
                    actionStatus: 'ActiveActionStatus',
                    resultOf: 'action:stageId'
                  },
                  {
                    '@id': 'action:payActionId',
                    '@type': 'PayAction',
                    actionStatus: 'CompletedActionStatus',
                    resultOf: 'action:stageId'
                  }
                ]
              }}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>

          {/* EndorseAction (active) */}
          <li>
            <WorkflowAction
              user="user:anton"
              readOnly={READ_ONLY}
              graph={graph}
              action={{
                '@type': 'EndorseAction',
                identifier: '1.3e',
                actionStatus: 'ActiveActionStatus',
                startTime: new Date().toISOString(),
                expectedDuration: 'P1D',
                name: 'Endorse review',
                object: 'action:reviewActionId',
                agent: {
                  '@id': 'role:editorEdith',
                  roleName: 'editor',
                  name: 'editor in chief',
                  agent: 'user:edith'
                },
                participant: {
                  '@id': 'role:x@editorLea',
                  roleName: 'assigner',
                  participant: 'user:lea'
                }
              }}
              stage={{
                '@type': 'StartWorkflowStageAction',
                result: [
                  {
                    '@id': 'action:reviewActionId',
                    '@type': 'ReviewAction',
                    actionStatus: 'ActiveActionStatus',
                    resultOf: 'scienceai:stageId',
                    requiresCompletionOf: 'action:endorseActionId',
                    potentialAction: {
                      '@id': 'action:endorseActionId',
                      '@type': 'EndorseAction'
                    }
                  }
                ]
              }}
              acl={acl}
              onAction={this.handleAction}
            />
          </li>
        </ul>
      </div>
    );
  }
}

export default WorkflowActionExample;
