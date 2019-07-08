import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { arrayify, getId, getNodeMap } from '@scipe/jsonld';
import {
  getStageActions,
  inferStartTime,
  getStageId
} from '@scipe/librarian';
import DateFromNow from './date-from-now';

const WORKFLOW_ACTIONS = new Set([
  'CreateReleaseAction',
  'DeclareAction',
  'ReviewAction',
  'AssessAction',
  'PayAction',
  'TypesettingAction',
  'PublishAction'
]);

export default class Timeline extends React.Component {
  static propTypes = {
    maxDots: PropTypes.number,
    className: PropTypes.string,
    graph: PropTypes.object,
    actions: PropTypes.array, // list of action (including stages (`StartWorkflowStageAction`). Note: the stages will contain an embedded version of the actions. It can be repeated data but may be the only way to access the action in case the user doesn't have access to the individual actions
    hoveredActionIds: PropTypes.array,
    clickedActionIds: PropTypes.array,
    onHover: PropTypes.func,
    onHoverOut: PropTypes.func,
    onClick: PropTypes.func,
    alwaysShowText: PropTypes.bool,
    displayEndorseActions: PropTypes.bool,
    now: PropTypes.string // mostly usefull for testing to "freeze" the component
  };

  static defaultProps = {
    maxDots: 50,
    displayEndorseActions: false,
    graph: {},
    actions: [],
    onClick: noop,
    hoveredActionIds: [],
    clickedActionIds: []
  };

  constructor(props) {
    super(props);
    if (!props.onHover) {
      this.state = {
        hoveredActionIds: [],
        hoveredSyntheticAction: null
      };
    } else {
      this.state = {
        hoveredSyntheticAction: null
      };
    }
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  handleMouseEnter(actionIds, hoveredSyntheticAction) {
    if (this.props.onHover) {
      const { graph } = this.props;
      this.props.onHover(getId(graph), actionIds, hoveredSyntheticAction);
      this.setState({
        hoveredSyntheticAction: hoveredSyntheticAction
      });
    } else {
      this.setState({
        hoveredActionIds: actionIds,
        hoveredSyntheticAction: hoveredSyntheticAction
      });
    }
  }

  handleMouseLeave() {
    if (this.props.onHover) {
      // not a typo, we use onHover to detect that the component is controlled or not
      const { graph } = this.props;
      this.props.onHoverOut(getId(graph));
      this.setState({
        hoveredSyntheticAction: null
      });
    } else {
      this.setState({
        hoveredActionIds: [],
        hoveredSyntheticAction: null
      });
    }
  }

  handleClick(actionIds, e) {
    const { graph } = this.props;
    this.props.onClick(getId(graph), actionIds);
  }

  getDotPositionStyle(position) {
    const style = {};
    if (position > 50) {
      style.right = `${100 - position < 0 ? 0 : 100 - position}%`;
    } else {
      style.left = `${position < 0 ? 0 : position}%`;
    }
    return style;
  }

  getDescription(actions) {
    const { graph, now } = this.props;
    const { hoveredSyntheticAction } = this.state;

    let hoveredActionIds;
    if (this.props.onHover) {
      hoveredActionIds = this.props.hoveredActionIds;
    } else {
      hoveredActionIds = this.state.hoveredActionIds;
    }

    if (hoveredActionIds.length) {
      const hoveredActions = actions.filter(a =>
        hoveredActionIds.includes(getId(a))
      );

      const action2object = {
        CreateReleaseAction: 'Release',
        EndorseAction: 'Endorse',
        DeclareAction: 'Declaration',
        ReviewAction: 'Review',
        AssessAction: 'Assessment',
        PayAction: 'Payment',
        BuyAction: 'Purchase',
        TypesettingAction: 'Typesetting',
        PublishAction: 'Publication'
      };

      if (hoveredActions.length === 1) {
        const action = hoveredActions[0];
        let dateInfo;
        if (action.endTime) {
          if (action.actionStatus === 'CanceledActionStatus') {
            dateInfo = (
              <span>
                (canceled <DateFromNow now={now}>{action.endTime}</DateFromNow>)
              </span>
            );
          } else {
            dateInfo = (
              <span>
                (completed <DateFromNow now={now}>{action.endTime}</DateFromNow>
                )
              </span>
            );
          }
        } else if (action.startTime) {
          dateInfo = (
            <span>
              (due{' '}
              <DateFromNow now={now}>
                {moment(action.startTime).add(
                  moment.duration(action.expectedDuration)
                )}
              </DateFromNow>
              )
            </span>
          );
        } else {
          dateInfo = '';
        }
        return (
          <span>
            {action2object[action['@type']]} {dateInfo}
          </span>
        );
      } else {
        // we get the counts per category
        const byType = {
          completed: { count: 0, objects: new Set() },
          canceled: { count: 0, objects: new Set() },
          overdue: { count: 0, objects: new Set() },
          active: { count: 0, objects: new Set() }
        };
        hoveredActions.forEach(action => {
          if (action.actionStatus === 'CanceledActionStatus') {
            byType.canceled.count++;
            byType.canceled.objects.add(action2object[action['@type']]);
          } else if (action.endTime) {
            byType.completed.count++;
            byType.completed.objects.add(action2object[action['@type']]);
          } else {
            if (
              action.expectedDuration &&
              moment(action.startTime)
                .add(moment.duration(action.expectedDuration))
                .isBefore(moment(now))
            ) {
              byType.overdue.count++;
              byType.overdue.objects.add(action2object[action['@type']]);
            } else {
              byType.active.count++;
              byType.active.objects.add(action2object[action['@type']]);
            }
          }
        });

        const label = Object.keys(byType)
          .filter(type => byType[type].count)
          .map(type => {
            return `${byType[type].count} ${type} (${Array.from(
              byType[type].objects
            )
              .filter(x => x)
              .map(x => x.toLowerCase())
              .join(', ')})`;
          })
          .join(', ');
        return <span>{label}</span>;
      }
    } else if (hoveredSyntheticAction) {
      switch (hoveredSyntheticAction['@type']) {
        case 'StartWorkflowStageAction':
          return (
            <span>
              <strong>{hoveredSyntheticAction.name || 'Stage'}</strong> (started{' '}
              <DateFromNow now={now}>
                {hoveredSyntheticAction.startTime}
              </DateFromNow>
              )
            </span>
          );
        case 'PublishAction':
          return (
            <span>
              <strong>Published</strong>{' '}
              <DateFromNow now={now}>
                {hoveredSyntheticAction.publishedTime}
              </DateFromNow>
            </span>
          );
        case 'CreateGraphAction':
          if (hoveredSyntheticAction.expectedDuration) {
            return (
              <span>
                <strong>Due</strong>{' '}
                <DateFromNow now={now}>
                  {moment(
                    hoveredSyntheticAction.startTime || graph.dateCreated
                  ).add(
                    moment.duration(hoveredSyntheticAction.expectedDuration)
                  )}
                </DateFromNow>
              </span>
            );
          } else {
            return (
              <span>
                <strong>Submitted</strong>{' '}
                <DateFromNow now={now}>
                  {hoveredSyntheticAction.startTime}
                </DateFromNow>
              </span>
            );
          }
      }
    } else {
      if (graph.datePublished) {
        return (
          <span>
            <strong>Published</strong>{' '}
            <DateFromNow now={now}>{graph.datePublished}</DateFromNow>
          </span>
        );
      } else if (graph.dateRejected) {
        return (
          <span>
            <strong>Rejected</strong>{' '}
            <DateFromNow now={now}>{graph.dateRejected}</DateFromNow>
          </span>
        );
      } else {
        if (graph.dateCreated) {
          return (
            <span>
              <strong>Submitted</strong>{' '}
              <DateFromNow now={now}>{graph.dateCreated}</DateFromNow>
            </span>
          );
        }
      }
    }
  }

  render() {
    const {
      graph,
      actions,
      className,
      alwaysShowText,
      maxDots,
      displayEndorseActions
    } = this.props;

    const now = moment(this.props.now);

    const stages = actions.filter(
      action => action['@type'] === 'StartWorkflowStageAction'
    );

    // get the workflow actions
    const actionMap = getNodeMap(actions);
    // add any missing action present only in stages (in case use didn't get access to the individual actions)

    stages.forEach(stage => {
      const stageActions = getStageActions(stage);
      stageActions.forEach(action => {
        if (!(getId(action) in actionMap)) {
          actionMap[getId(action)] = action;
        }
      });
    });

    const workflowActions = Object.values(actionMap)
      .filter(action => {
        return displayEndorseActions
          ? WORKFLOW_ACTIONS.has(action['@type']) ||
              action['@type'] === 'EndorseAction'
          : WORKFLOW_ACTIONS.has(action['@type']);
      })
      .map(action => {
        // Infer startTime if missing
        if (!action.startTime) {
          const startTime = inferStartTime(
            action,
            actionMap[getStageId(action)]
          );
          if (startTime) {
            return Object.assign({}, action, { startTime });
          }
        }
        return action;
      })
      .filter(action => action.endTime || action.startTime)
      .sort((a, b) => {
        const dateA =
          a.endTime ||
          moment(a.startTime).add(moment.duration(a.expectedDuration));
        const dateB =
          b.endTime ||
          moment(b.startTime).add(moment.duration(b.expectedDuration));
        const diff = moment(dateA).diff(dateB);
        if (diff === 0) {
          if (a['@type'] !== b['@type']) {
            return a['@type'].localeCompare(b['@type']);
          } else {
            return getId(a).localeCompare(getId(b));
          }
        } else {
          return diff;
        }
      });

    const createGraphAction = workflowActions.find(
      action => action['@type'] === 'CreateGraphAction'
    );

    const publishAction = workflowActions.find(
      action => action['@type'] === 'PublishAction'
    );

    const isGraphRejected =
      !!graph.dateRejected ||
      workflowActions.some(action => {
        return (
          action['@type'] === 'AssessAction' &&
          action.actionStatus === 'CompletedActionStatus' &&
          arrayify(action.result).some(result => {
            return result['@type'] === 'RejectAction';
          })
        );
      });

    const isGraphPublished = !!graph.datePublished;

    // compute the begining and then end of the timeline (`timelineStart` and `timelineEnd`)
    const createdTime = graph.dateCreated && moment(graph.dateCreated);

    let timelineStart = createdTime || now.startOf('day');

    let timelineEnd;
    const lastRealizedAction =
      workflowActions.length && workflowActions[workflowActions.length - 1];
    const lastRealizedActionTime =
      lastRealizedAction &&
      ((lastRealizedAction.endTime && moment(lastRealizedAction.endTime)) ||
        (lastRealizedAction.startTime &&
          moment(lastRealizedAction.startTime).add(
            moment.duration(lastRealizedAction.expectedDuration)
          )));

    const publishedTime = graph.datePublished && moment(graph.datePublished);

    // only used datePublished time if the graph has been accepted (as it can be in the distant future wrt the workflow actions)
    if (lastRealizedActionTime && publishedTime) {
      timelineEnd = lastRealizedActionTime.isBefore(publishedTime)
        ? publishedTime
        : lastRealizedActionTime;
    } else if (lastRealizedActionTime) {
      timelineEnd = lastRealizedActionTime;
    } else {
      timelineEnd = moment(timelineStart).endOf('day'); // be sure to clone timelineStart as moment are mutable (calling moment on moment clone)
    }

    const isNowIncluded = now.isBetween(timelineStart, timelineEnd);

    let hoveredActionIds;
    if (this.props.onHover) {
      hoveredActionIds = this.props.hoveredActionIds;
    } else {
      hoveredActionIds = this.state.hoveredActionIds;
    }
    const clickedActionIds = this.props.clickedActionIds;

    // collect all the times
    const times = [
      { key: 'timelineStart', value: timelineStart },
      { key: 'timelineEnd', value: timelineEnd },
      {
        key: 'createdTime',
        value: moment(graph.dateCreated)
      }
    ];

    if (isNowIncluded) {
      times.push({ key: 'now', value: now });
    }
    if (isGraphPublished && publishedTime) {
      times.push({
        key: 'publishedTime',
        value: timelineEnd // timelineEnd and not publishedTime as publishedTime can be set in the past...
      });
    }

    workflowActions.forEach(action => {
      const time =
        action.endTime ||
        moment(action.startTime).add(moment.duration(action.expectedDuration));
      times.push({ key: getId(action), value: moment(time) });
    });

    stages.forEach(action => {
      times.push({
        key: getId(action),
        value: moment(action.startTime),
        stage: true
      });
    });

    // add positions

    // sort
    times.sort((a, b) => {
      return a.value.diff(b.value);
    });

    // we use a relative positioning algorithm
    // set position 0 to the first item
    // if next item is after current item by seconds, set it's position to previous position + 1
    // else if next item is after current item by minutes, set it's position to previous position + 2
    // etc...
    times.forEach((time, i) => {
      time.iso = time.value.toISOString();
      if (i === 0) {
        time.coefficient = 0;
        time.position = 0 + time.coefficient;
      } else {
        const prev = times[i - 1];
        const diff = time.value.diff(prev.value);
        if (diff === 0) {
          time.coefficient = time.stage ? (prev.position >= 0.5 ? -0.5 : 0) : 0; // make sure that stage always start before actions
        } else {
          if (diff <= 60 * 1000) {
            time.coefficient = 1;
          } else if (diff <= 60 * 60 * 1000) {
            time.coefficient = 2;
          } else if (diff <= 60 * 60 * 24 * 1000) {
            time.coefficient = 4;
          } else if (diff <= 60 * 60 * 24 * 7 * 1000) {
            time.coefficient = 6;
          } else {
            time.coefficient = 8;
          }
        }
        time.position = prev.position + time.coefficient;
      }
    });

    // renormalize so that everything fit between 0 and 100
    times.forEach(time => {
      time.normalizedPosition =
        ((time.position - times[0].position) /
          Math.max(times[times.length - 1].position - times[0].position, 1)) *
        100;
      // grouped position and bin index
      time.binIndex = Math.floor((time.normalizedPosition / 100) * maxDots);
      time.binnedPosition = (time.binIndex / maxDots) * 100;
    });

    const timesMap = times.reduce((map, time) => {
      map[time.key] = time;
      return map;
    }, {});

    // group actions
    const groupedActions = workflowActions.reduce((grouped, action) => {
      const key = timesMap[getId(action)].binIndex;
      if (!grouped[key]) {
        grouped[key] = [action];
      } else {
        grouped[key].push(action);
      }
      return grouped;
    }, {});

    return (
      <div
        className={classNames('timeline', className, {
          showText: alwaysShowText,
          published: isGraphPublished,
          rejected: isGraphRejected
        })}
      >
        <div className="timeline__description">
          <div className="timeline__description-title">
            {this.getDescription(workflowActions, stages)}
          </div>
        </div>

        <div className="timeline__actions">
          {/* 2 milestones: the date created and the due date of the whole project */}
          {graph.dateCreated ? (
            <div
              className="timeline__date-range-start"
              style={this.getDotPositionStyle(
                timesMap['createdTime'].normalizedPosition
              )}
              onMouseEnter={this.handleMouseEnter.bind(
                this,
                [],
                createGraphAction
              )}
              onMouseLeave={this.handleMouseLeave}
            />
          ) : null}

          {/* The present time (if fits in the timeline) */}
          {isNowIncluded ? (
            <div
              data-test-now={this.props.now ? 'false' : 'true'}
              className="timeline__now"
              style={this.getDotPositionStyle(
                timesMap['now'].normalizedPosition
              )}
            />
          ) : null}

          {/* The workflow action */}
          {Object.keys(groupedActions).map(key => {
            const actionGroup = groupedActions[key];
            return (
              <div
                key={key}
                className={classNames('timeline__action', {
                  'timeline__action--multiple': actionGroup.length > 1,
                  'timeline__action--complete': actionGroup.every(
                    a => a.actionStatus === 'CompletedActionStatus'
                  ),
                  'timeline__action--canceled': actionGroup.every(
                    a => a.actionStatus === 'CanceledActionStatus'
                  ),

                  'timeline__action--pending': actionGroup.some(
                    a =>
                      a.actionStatus !== 'CompletedActionStatus' &&
                      a.actionStatus !== 'FailedActionStatus'
                  ),

                  'timeline__action--overdue': actionGroup.some(a => {
                    return (
                      a.actionStatus !== 'CompletedActionStatus' &&
                      a.expectedDuration &&
                      moment(a.startTime)
                        .add(moment.duration(a.expectedDuration))
                        .isBefore(now)
                    );
                  }),
                  'timeline__action--release': actionGroup.some(
                    a =>
                      a['@type'] === 'CreateReleaseAction' &&
                      a.actionStatus === 'CompletedActionStatus'
                  ),
                  'timeline__action--highlight': actionGroup.some(a =>
                    hoveredActionIds.includes(getId(a))
                  ),
                  'timeline__action--selected': actionGroup.some(a =>
                    clickedActionIds.includes(getId(a))
                  )
                })}
                style={this.getDotPositionStyle(
                  timesMap[getId(actionGroup[0])].binnedPosition
                )}
                onMouseEnter={this.handleMouseEnter.bind(
                  this,
                  actionGroup.map(action => getId(action))
                )}
                onMouseLeave={this.handleMouseLeave}
                onClick={this.handleClick.bind(
                  this,
                  actionGroup.map(action => getId(action))
                )}
              >
                <span className="timeline__action__count">
                  {actionGroup.length > 1 && actionGroup.length}
                </span>
              </div>
            );
          })}

          {/* The stages */}
          {stages.map(stage => (
            <div
              key={getId(stage)}
              className="timeline__stage-start"
              style={this.getDotPositionStyle(
                timesMap[getId(stage)].normalizedPosition
              )}
              onMouseEnter={this.handleMouseEnter.bind(this, [], stage)}
              onMouseLeave={this.handleMouseLeave}
            />
          ))}

          {/* In case of a published graph (and that only) the scheduled time to go live */}
          {isGraphPublished && publishedTime ? (
            <div
              className="timeline__action timeline__action--scheduled-time"
              style={this.getDotPositionStyle(
                timesMap['publishedTime'].normalizedPosition
              )}
              onMouseEnter={this.handleMouseEnter.bind(this, [], publishAction)}
              onMouseLeave={this.handleMouseLeave}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
