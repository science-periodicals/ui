import assert from 'assert';
import { getWorkflowBadgePaths } from '../src';

describe('workflow badge', function() {
  it('should compute the path from a list of StartWorkflowStageAction', () => {
    const stages = [
      {
        '@type': 'StartWorkflowStageAction',
        result: [
          {
            '@id': 'action:createReleaseActionId',
            '@type': 'CreateReleaseAction',
            startTime: new Date('2018-01-01').toISOString(),
            endTime: new Date('2018-01-02').toISOString(),
            agent: {
              '@type': 'ContributorRole',
              roleName: 'author',
              agent: 'user:userId'
            },
            participant: [
              // active audience
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-01').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'author'
                }
              },

              // audience on completed
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-02').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'reviewer'
                }
              },

              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-02').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'editor'
                }
              },

              // audience on stage completed
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-03').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'producer'
                }
              },

              // public after
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-04').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'public'
                }
              }
            ]
          },

          {
            '@id': 'action:assessActionId',
            '@type': 'AssessAction',
            startTime: new Date('2018-01-05').toISOString(),
            stagedTime: new Date('2018-01-06').toISOString(),
            endTime: new Date('2018-01-07').toISOString(),
            agent: {
              '@type': 'ContributorRole',
              roleName: 'editor',
              agent: 'user:userId'
            },
            participant: [
              // active audience
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-05').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'editor'
                }
              },

              // staged audience
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-06').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'author'
                }
              },

              // completed audience
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-07').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'reviewer'
                }
              },

              // audience on stage completed
              {
                '@type': 'AudienceRole',
                startDate: new Date('2018-01-08').toISOString(),
                participant: {
                  '@type': 'Audience',
                  audienceType: 'producer'
                }
              }
            ]
          }
        ]
      }
    ];

    const paths = getWorkflowBadgePaths(stages, { nCat: 1 });

    assert.deepEqual(paths, [
      {
        id: 'action:createReleaseActionId',
        x: 0,
        y: 0,
        z: [true, false, false, false],
        isPublicDuring: false,
        isPublicAfter: true
      },
      {
        id: 'action:createReleaseActionId',
        x: 1,
        y: 0,
        z: [true, false, false, false],
        isPublicDuring: false,
        isPublicAfter: true
      },
      {
        id: 'action:createReleaseActionId',
        x: 2,
        y: 0,
        z: [true, true, true, false],
        isPublicDuring: false,
        isPublicAfter: true
      },
      {
        id: 'action:createReleaseActionId',
        x: 3,
        y: 0,
        z: [true, true, true, true],
        isPublicDuring: false,
        isPublicAfter: true
      },
      {
        id: 'action:assessActionId',
        x: 4,
        y: 1,
        z: [false, true, false, false],
        isPublicDuring: false,
        isPublicAfter: false
      },
      {
        id: 'action:assessActionId',
        x: 5,
        y: 1,
        z: [true, true, false, false],
        isPublicDuring: false,
        isPublicAfter: false
      },
      {
        id: 'action:assessActionId',
        x: 6,
        y: 1,
        z: [true, true, true, false],
        isPublicDuring: false,
        isPublicAfter: false
      },
      {
        id: 'action:assessActionId',
        x: 7,
        y: 1,
        z: [true, true, true, true],
        isPublicDuring: false,
        isPublicAfter: false
      }
    ]);
  });
});
