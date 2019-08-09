import { getId } from '@scipe/jsonld';
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
    // - active
    // - staged
    // - completed
    // - after stage completed status
    // to represent the time varying audience (`z`)
    // Based on the category (`cat`) we spread `action`
    // into a multiple of 4 (number of status)
  });

  return paths;
}

/**
 * We use the nearest-rank method:
 * see https://en.wikipedia.org/wiki/Percentile#The_Nearest_Rank_method
 */
function getPercentileIndex(p, sortedList) {
  return p === 0 ? 0 : Math.ceil(sortedList.length * (p / 100)) - 1;
}
