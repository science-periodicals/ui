import { arrayify, unrole, getId } from '@scipe/jsonld';
import { getStageActions, compareActions } from '@scipe/librarian';

/**
 * Util to get the `paths` prop of `<WorkflowBadge />`
 */
export function getWorkflowBadgePaths(
  stages = [], // all the `StartWorkflowStageAction` of a `Graph`
  { nCat = 1 } = {}
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
    .filter(
      action =>
        action.startTime &&
        action.endTime &&
        action.actionStatus === 'CompletedActionStatus' // need to exclude the failed or canceled actions and this needs to work during preview mode when workflow may not have been completed yet
    )
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

  const percentilesIndexes = Array.from({ length: nCat }, (_, i) => {
    return ((i + 1) / nCat) * 100;
  }).map(p => getPercentileIndex(p, actions));

  const cActions = actions
    .map((action, i) => {
      let cat = 1;
      while (i > percentilesIndexes[cat - 1]) {
        cat++;
      }

      return {
        cat,
        action
      };
    })
    .sort((a, b) => {
      // sort by startTime
      if (a.action.starTime !== b.action.starTime) {
        return (
          new Date(a.action.startTime).getTime() -
          new Date(b.action.startTime).getTime()
        );
      }
      return compareActions(a.action, b.action);
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
        if (role['@type'] === 'AudienceRole' && role.startDate) {
          const roleStartDate = new Date(role.startDate).getTime();
          if (
            (!action.stagedTime &&
              roleStartDate < new Date(action.endTime).getTime()) ||
            (action.stagedTime &&
              roleStartDate < new Date(action.stagedTime).getTime())
          ) {
            const participant = unrole(role, 'participant');
            if (
              participant &&
              participant.audienceType &&
              participant.audienceType !== 'public'
            ) {
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
          role.startDate &&
          action.stagedTime
        ) {
          const roleStartDate = new Date(role.startDate).getTime();
          if (
            roleStartDate >= new Date(action.stagedTime).getTime() &&
            roleStartDate < new Date(action.endTime).getTime()
          ) {
            const participant = unrole(role, 'participant');
            if (
              participant &&
              participant.audienceType &&
              participant.audienceType !== 'public'
            ) {
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
          role.startDate &&
          action.endTime
        ) {
          const roleStartDate = new Date(role.startDate).getTime();
          if (roleStartDate === new Date(action.endTime).getTime()) {
            const participant = unrole(role, 'participant');
            if (
              participant &&
              participant.audienceType &&
              participant.audienceType !== 'public'
            ) {
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
          role.startDate &&
          action.endTime
        ) {
          const roleStartDate = new Date(role.startDate).getTime();
          if (roleStartDate > new Date(action.endTime).getTime()) {
            const participant = unrole(role, 'participant');
            if (
              participant &&
              participant.audienceType &&
              participant.audienceType !== 'public'
            ) {
              audiences[getAudienceIndex(participant.audienceType)] = true;
            }
          }
        }

        return audiences;
      },
      completedAudiences.slice()
    );

    const isPublicAfter = arrayify(action.participant).some(role => {
      if (role['@type'] === 'AudienceRole') {
        const participant = unrole(role, 'participant');
        if (participant && participant.audienceType === 'public') {
          return true;
        }
      }
      return false;
    });

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
          id: getId(action),
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
