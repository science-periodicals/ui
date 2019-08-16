import { arrayify, unrole } from '@scipe/jsonld';
import { getStageActions, compareActions } from '@scipe/librarian';

/**
 * Util to get the `paths` prop of `<WorkflowBadge />`
 */
export function getWorkflowBadgePaths(
  stages = [] // all the `StartWorkflowStageAction` of a `Graph`
) {
  const actions = stages
    .reduce((actions, stage) => {
      actions.push(
        ...getStageActions(stage).filter(
          action =>
            action['@type'] === 'CreateReleaseAction' ||
            action['@type'] === 'TypesettingAction' ||
            action['@type'] === 'PayAction' ||
            action['@type'] === 'ReviewAction' ||
            action['@type'] === 'AssessAction' ||
            action['@type'] === 'ProduceAction' ||
            action['@type'] === 'PublishAction'
        )
      );

      return actions;
    }, [])
    .filter(action => action.startTime && action.endTime)
    .sort((a, b) => {
      // sort by duration
      const da =
        new Date(a.endTime).getTime() - new Date(a.startTime).getTime();
      const db =
        new Date(b.endTime).getTime() - new Date(b.startTime).getTime();

      return da - db;
    });

  // we categorize the actions based on their duration grouping together
  // actions falling within the same percentile
  const i33 = getPercentileIndex(33);
  const i66 = getPercentileIndex(66);

  const cActions = actions
    .map((action, i) => {
      let cat;
      if (i <= i33) {
        cat = 1;
      } else if (i <= i66) {
        cat = 2;
      } else {
        cat = 3;
      }

      return {
        cat,
        action
      };
    })
    .sort((a, b) => {
      // sort by startTime
      if (a.starTime !== b.starTime) {
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      }
      return compareActions(a, b);
    });

  const paths = [];

  let x = 0;
  cActions.forEach(({ action, cat }) => {
    // we subdivide each action into:
    //
    // 1. active
    // 2. staged
    // 3. completed
    // 4. after stage is completed status
    //
    // to represent the time varying audience (`z`)
    // Based on the category (`cat`) we spread `action`
    // into a multiple of 4 (number of status).
    //
    // We encode the visible audience for each status with a list of 4 boolean
    // for (in order) [Authors, Editors, Reviewers, Producers]

    const activeAudiences = arrayify(action.participant).reduce(
      (audiences, role) => {
        if (role['@type'] === 'AudienceRole' && role.startTime) {
          const roleStartTime = new Date(role.startTime).getTime();
          if (
            (!action.stagedTime &&
              roleStartTime < new Date(role.endTime).getTime()) ||
            (action.stagedTime &&
              roleStartTime < new Date(role.stagedTime).getTime())
          ) {
            const participant = unrole(role, 'participant');
            if (participant && participant.audienceType) {
              audiences[getAudienceIndex(participant.audienceType)] = true;
            }
          }
        }

        return audiences;
      },
      [false, false, false, false]
    );

    const stagedAudiences = arrayify(action.participant).reduce(
      (audiences, role) => {
        if (
          role['@type'] === 'AudienceRole' &&
          role.startTime &&
          action.stagedTime
        ) {
          const roleStartTime = new Date(role.startTime).getTime();
          if (
            roleStartTime >= new Date(action.stagedTime).getTime() &&
            roleStartTime < new Date(action.endTime).getTime()
          ) {
            const participant = unrole(role, 'participant');
            if (participant && participant.audienceType) {
              audiences[getAudienceIndex(participant.audienceType)] = true;
            }
          }
        }

        return audiences;
      },
      activeAudiences.slice()
    );

    const completedAudiences = arrayify(action.participant).reduce(
      (audiences, role) => {
        if (
          role['@type'] === 'AudienceRole' &&
          role.startTime &&
          action.endTime
        ) {
          const roleStartTime = new Date(role.startTime).getTime();
          if (roleStartTime === new Date(action.endTime).getTime()) {
            const participant = unrole(role, 'participant');
            if (participant && participant.audienceType) {
              audiences[getAudienceIndex(participant.audienceType)] = true;
            }
          }
        }

        return audiences;
      },
      stagedAudiences.slice()
    );

    const stageCompletedAudiences = arrayify(action.participant).reduce(
      (audiences, role) => {
        if (
          role['@type'] === 'AudienceRole' &&
          role.startTime &&
          action.endTime
        ) {
          const roleStartTime = new Date(role.startTime).getTime();
          if (roleStartTime > new Date(action.endTime).getTime()) {
            const participant = unrole(role, 'participant');
            if (participant && participant.audienceType) {
              audiences[getAudienceIndex(participant.audienceType)] = true;
            }
          }
        }

        return audiences;
      },
      completedAudiences.slice()
    );

    const isPublicAfter = arrayify(action.participant).some(
      (audiences, role) => {
        if (role['@type'] === 'AudienceRole') {
          const participant = unrole(role, 'participant');
          if (participant && participant.audienceType === 'public') {
            return true;
          }
        }
        return false;
      }
    );

    const isPublicDuring = false; // this is currently only true for pre-print and post publication reviews

    const y = getAudienceIndex(action.agent.roleName);
    [
      activeAudiences,
      stagedAudiences,
      completedAudiences,
      stageCompletedAudiences
    ].forEach(z => {
      for (let i = 0; i < cat; i++) {
        paths.push({
          x: x++,
          y,
          z,
          isPublicDuring,
          isPublicAfter
        });
      }
    });
  });

  return paths;
}

function getAudienceIndex(audienceType) {
  switch (audienceType) {
    case 'author':
      return 0;
    case 'editor':
      return 1;
    case 'reviewer':
      return 2;
    case 'producer':
      return 3;
  }
}

/**
 * We use the nearest-rank method:
 * see https://en.wikipedia.org/wiki/Percentile#The_Nearest_Rank_method
 */
function getPercentileIndex(p, sortedList) {
  return p === 0 ? 0 : Math.ceil(sortedList.length * (p / 100)) - 1;
}
