import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import capitalize from 'lodash/capitalize';
import pluralize from 'pluralize';
import Iconoclass from '@scipe/iconoclass';
import {
  Acl,
  schema,
  getScopeId,
  getStageActions,
  getRootPart,
  getAgent,
  getAgentId
} from '@scipe/librarian';
import { arrayify, getId, unprefix, unrole, textify } from '@scipe/jsonld';
import AutoAbridge from './auto-abridge';
import UserBadgeMenu from './user-badge-menu';
import JournalBadge from './journal-badge';
import OrganizationBadge from './organization-badge';
import DateFromNow from './date-from-now';
import Card from './card';
import BemTags from '../utils/bem-tags';
import {
  getIconNameFromSchema,
  getDisplayName,
  getUserBadgeLabel
} from '../utils/graph';
import { API_LABELS } from '../constants';
import Hyperlink from './hyperlink';
import { Span, Li } from './elements';
import PaperButton from './paper-button';
import ControlPanel from './control-panel';
import Value from './value';
import RatingStars from './rating-stars';
import Price from './price';
import ActionIdentifier from './action-identifier';
import PaperButtonLink from './paper-button-link';

export default class FeedItem extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    user: PropTypes.object,
    item: PropTypes.object.isRequired,
    scope: PropTypes.object, // the scope of the `item` as defined by  `item._id`
    onAction: PropTypes.func.isRequired,
    isProgressing: PropTypes.bool,
    droplets: PropTypes.object.isRequired,
    error: PropTypes.instanceOf(Error)
  };

  static defaultProps = {
    onAction: noop
  };

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  handleAcceptInvite = e => {
    const { item: action } = this.props;
    const acceptAction = {
      '@type': 'AcceptAction',
      actionStatus: 'CompletedActionStatus',
      agent: action.recipient.recipient
        ? Object.assign(omit(action.recipient, ['recipient']), {
            agent: getAgent(action.recipient)
          })
        : getAgentId(action.recipient),
      object: getId(action)
    };
    this.props.onAction(acceptAction, { parentAction: action });
  };

  handleRejectInvite = e => {
    const { item: action } = this.props;
    const rejectAction = {
      '@type': 'RejectAction',
      actionStatus: 'CompletedActionStatus',
      agent: action.recipient.recipient
        ? Object.assign(omit(action.recipient, ['recipient']), {
            agent: getAgent(action.recipient)
          })
        : getAgentId(action.recipient),
      object: getId(action)
    };
    this.props.onAction(rejectAction, { parentAction: action });
  };

  handleDenyCheckAction = e => {
    const { item: action, onAction } = this.props;
    onAction(Object.assign({}, action, { actionStatus: 'FailedActionStatus' }));
  };

  handleConfirmCheckAction = e => {
    const { item: action, onAction } = this.props;
    onAction(
      Object.assign({}, action, { actionStatus: 'CompletedActionStatus' })
    );
  };

  render() {
    const {
      user,
      error,
      item,
      scope,
      isProgressing,
      disabled,
      droplets
    } = this.props;

    const bem = BemTags();

    // potentialy need blinding => we compute blindingData
    const acl = new Acl(
      scope,
      item['@type'] === 'InviteAction' ? item : undefined
    );
    const blindingData = acl.getBlindingData(user);

    // we need to specify all these values
    let journal,
      organization,
      iconName,
      title,
      subject,
      predicate,
      object,
      complement,
      body,
      userBadge;

    switch (item['@type']) {
      case 'AuthorizeContributorAction':
      case 'DeauthorizeContributorAction': {
        const addedOrRemoved =
          item['@type'] === 'AuthorizeContributorAction' ? 'added' : 'removed';

        const itemObject = hydrate(unrole(item.object, 'object'), droplets);

        iconName = getIconNameFromSchema(item);
        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: itemObject
        });
        if (schema.is(itemObject, 'Organization')) {
          organization = itemObject;

          title = `Organization member ${addedOrRemoved}`;
          subject = getRoleLink(item.agent, blindingData, {
            object: itemObject
          });
          predicate = `${addedOrRemoved} a member to`;
          object = getOrganizationLink(itemObject);

          body = (
            <ul>
              <li>
                Member :{' '}
                {getRoleLink(item.recipient, blindingData, {
                  object: itemObject
                })}
              </li>
              <li>
                Role:{' '}
                {item.recipient.name ||
                  item.recipient.roleName ||
                  'contributor'}
              </li>
            </ul>
          );
        } else if (schema.is(itemObject, 'Periodical')) {
          journal = itemObject;

          title = `Journal staff ${addedOrRemoved}`;
          subject = getRoleLink(item.agent, blindingData, {
            object: itemObject
          });
          predicate = `${addedOrRemoved} a staff to`;
          object = getJournalLink(itemObject);

          body = (
            <ul>
              <li>
                Staff :{' '}
                {getRoleLink(item.recipient, blindingData, {
                  object: itemObject
                })}
              </li>
              <li>
                Role:{' '}
                {item.recipient.name ||
                  item.recipient.roleName ||
                  'contributor'}
              </li>
            </ul>
          );
        } else {
          journal = getJournal(itemObject, droplets);

          title = `Submission contributor ${addedOrRemoved}`;
          subject = getRoleLink(item.agent, blindingData, {
            object: itemObject
          });
          predicate = `${addedOrRemoved} a contributor to`;
          object = getSubmissionLink(itemObject);

          body = (
            <ul>
              <li>
                Contributor :{' '}
                {getRoleLink(item.recipient, blindingData, {
                  object: itemObject
                })}
              </li>
              <li>
                Role:{' '}
                {item.recipient.name ||
                  item.recipient.roleName ||
                  'contributor'}
              </li>
            </ul>
          );
        }
        break;
      }

      case 'InviteAction': {
        const itemObject = hydrate(unrole(item.object, 'object'), droplets);

        const isAccepted =
          item.actionStatus === 'CompletedActionStatus' &&
          arrayify(item.potentialAction).some(action => {
            return (
              action['@type'] === 'AcceptAction' &&
              action.actionStatus === 'CompletedActionStatus'
            );
          });

        const isRejected =
          item.actionStatus === 'CompletedActionStatus' &&
          arrayify(item.potentialAction).some(action => {
            return (
              action['@type'] === 'RejectAction' &&
              action.actionStatus === 'CompletedActionStatus'
            );
          });

        iconName = getIconNameFromSchema(item);

        if (item.actionStatus === 'ActiveActionStatus') {
          userBadge = getUserBadge(item.agent, blindingData, {
            isProgressing,
            object: itemObject
          });

          title = <span>New Invitation</span>;

          subject = getRoleLink(item.agent, blindingData, {
            object: itemObject
          });
          predicate = <span>invited you to</span>;
        } else {
          userBadge = getUserBadge(item.recipient, blindingData, {
            isProgressing,
            object: itemObject
          });

          subject = getRoleLink(item.recipient, blindingData, {
            object: itemObject
          });

          if (isAccepted) {
            title = <span>Invitation Accepted</span>;
            predicate = <span>accepted the invite to</span>;
          } else if (isRejected) {
            title = <span>Invitation Rejected</span>;
            predicate = <span>rejected the invite to</span>;
          } else {
            title = '';
            predicate = '';
          }
        }

        if (schema.is(itemObject, 'Organization')) {
          organization = itemObject;
          object = isRejected
            ? textify(
                itemObject.name ||
                  itemObject.alternateName ||
                  unprefix(getId(itemObject))
              )
            : getOrganizationLink(itemObject);
        } else if (schema.is(itemObject, 'Periodical')) {
          journal = itemObject;
          object = isRejected
            ? textify(
                itemObject.name ||
                  itemObject.alternateName ||
                  unprefix(getId(itemObject))
              )
            : getJournalLink(itemObject);
        } else {
          journal = getJournal(itemObject, droplets);

          object = isRejected
            ? textify(
                itemObject.name ||
                  itemObject.alternateName ||
                  unprefix(getId(itemObject))
              )
            : getSubmissionLink(itemObject);
        }

        body = (
          <div>
            <div>
              Role:{' '}
              {item.recipient.name || item.recipient.roleName || 'participant'}
            </div>
            {item.actionStatus === 'ActiveActionStatus' &&
            itemObject['@type'] !== 'Graph' ? (
              <ControlPanel error={error}>
                <PaperButton
                  onClick={this.handleRejectInvite}
                  disabled={disabled || isProgressing}
                >
                  {status === 'active' ? 'Rejecting' : 'Reject'}
                </PaperButton>
                <PaperButton
                  onClick={this.handleAcceptInvite}
                  disabled={disabled || isProgressing}
                >
                  {status === 'active' ? 'Accepting' : 'Accept'}
                </PaperButton>
              </ControlPanel>
            ) : item.actionStatus === 'ActiveActionStatus' &&
              itemObject['@type'] === 'Graph' ? (
              <ControlPanel>
                <PaperButtonLink page="submission" graph={itemObject}>
                  View
                </PaperButtonLink>
              </ControlPanel>
            ) : (
              <span>
                Invited by:{' '}
                {getRoleLink(item.agent, blindingData, { object: itemObject })}
              </span>
            )}
          </div>
        );

        break;
      }

      case 'JoinAction': {
        const itemObject = hydrate(unrole(item.object, 'object'), droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: itemObject
        });

        iconName = getIconNameFromSchema(item);

        subject = getRoleLink(item.agent, blindingData, {
          object: itemObject
        });
        predicate = <span>joined</span>;

        if (schema.is(itemObject, 'Organization')) {
          title = <span>User Joined Organization</span>;

          organization = itemObject;
          object = getOrganizationLink(itemObject);
        } else if (schema.is(itemObject, 'Periodical')) {
          title = <span>User Joined Journal</span>;
          journal = itemObject;
          object = getJournalLink(itemObject);
        } else {
          title = <span>User Joined Submission</span>;
          journal = getJournal(itemObject, droplets);
          object = getSubmissionLink(itemObject);
        }

        const roleName = item.agent && item.agent.roleName;
        const name = roleName && item.agent.name;

        body = <div>Role: {name || roleName || 'participant'}</div>;
        break;
      }

      case 'LeaveAction': {
        const itemObject = hydrate(unrole(item.object, 'object'), droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: itemObject
        });

        iconName = getIconNameFromSchema(item);

        subject = getRoleLink(item.agent, blindingData, {
          object: itemObject
        });
        predicate = <span>left</span>;

        if (schema.is(itemObject, 'Organization')) {
          title = <span>User Left Organization</span>;
          organization = itemObject;
          object = getOrganizationLink(itemObject);
        } else if (schema.is(itemObject, 'Periodical')) {
          title = <span>User Left Journal</span>;
          journal = itemObject;
          object = getJournalLink(itemObject);
        } else {
          title = <span>User Left Submission</span>;
          journal = getJournal(itemObject, droplets);
          object = getSubmissionLink(itemObject);
        }

        body = null;
        break;
      }

      case 'CheckAction': {
        const itemObject = hydrate(unrole(item.object, 'object'), droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: itemObject
        });

        iconName = getIconNameFromSchema(item);

        subject = getRoleLink(item.agent, blindingData, {
          object: itemObject
        });

        predicate =
          item.actionStatus === 'ActiveActionStatus' ? (
            <span>was credited in</span>
          ) : (
            <span>confirmed contributing to</span>
          );

        title = (
          <span>
            Digital signature
            {item.actionStatus === 'ActiveActionStatus' ? ' required' : ''}
          </span>
        );
        journal = getJournal(itemObject, droplets);
        object = getSubmissionLink(itemObject);

        const roleName = item.agent && item.agent.roleName;
        const name = roleName && item.agent.name;

        if (item.actionStatus === 'ActiveActionStatus') {
          body = (
            <div>
              <p>Role: {name || roleName || 'contributor'}</p>
              <ControlPanel>
                <PaperButtonLink page="submission" graph={itemObject}>
                  Review
                </PaperButtonLink>
                {/*
                <PaperButton onClick={this.handleDenyCheckAction}>
                  Deny
                </PaperButton>
                <PaperButton onClick={this.handleConfirmCheckAction}>
                  Confirm & Sign
                </PaperButton> */}
              </ControlPanel>
            </div>
          );
        } else {
          body = <div>Role: {name || roleName || 'contributor'}</div>;
        }
        break;
      }

      case 'CreateGraphAction': {
        // !! For CreateGraphAction the agent is typically just a userId => use `author` as fallbackRoleName
        const graph = hydrate(unrole(item.result, 'result'), droplets);

        const workflow = hydrate(unrole(item.object, 'object'), droplets);
        journal = workflow
          ? hydrate(workflow.isPotentialWorkflowOf, droplets)
          : undefined;

        iconName = 'fileAdd';
        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });
        title = <span>Submission Started</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph,
          fallbackRoleName: 'author'
        });
        predicate = <span>started</span>;
        object = getSubmissionLink(graph);

        body = workflow ? (
          <div>
            Workflow:{' '}
            <Span>
              {textify(workflow.name || workflow.alternateName) ||
                'unspecified'}
            </Span>
          </div>
        ) : null;
        break;
      }

      case 'CreatePeriodicalAction': {
        journal = hydrate(unrole(item.result, 'result'), droplets);
        organization = hydrate(unrole(item.object, 'object'), droplets);

        iconName = getIconNameFromSchema(item);
        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: journal
        });

        title = <span>New Journal</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: journal
        });
        predicate = <span>created</span>;
        object = getJournalLink(journal);

        const bem = BemTags('feed-item__body');
        body = journal ? (
          <div>
            {journal.description ? (
              <div className={bem`publication-description`}>
                <Value className={bem`description-text`}>
                  {journal.description}
                </Value>
                <Hyperlink
                  className={bem`more-link`}
                  page="journal"
                  periodical={journal}
                  reset={true}
                >{`More…`}</Hyperlink>
              </div>
            ) : (
              <span>
                Journal URL:{' '}
                <Hyperlink
                  className={bem`more-link`}
                  page="journal"
                  periodical={journal}
                  reset={true}
                >
                  {journal.url}
                </Hyperlink>
              </span>
            )}
          </div>
        ) : null;
        break;
      }

      case 'CreateReleaseAction': {
        const graph = hydrate(unrole(item.result, 'result'), droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });

        const version =
          graph.version || (getId(graph) || '').split('?version=')[1];

        if (version === '0.0.0-0') {
          iconName = 'star';
          title = <span>New Submission</span>;
          predicate = <span>submitted</span>;
        } else {
          iconName = 'layers';
          title = <span>New Revision</span>;
          predicate = <span>revised</span>;
        }
        object = getSubmissionActionLink(graph, item);

        const isPublished = !!graph.datePublished;
        const mainEntityTitle = graph.mainEntity && graph.mainEntity.name;

        body = (
          <ul>
            {isPublished && graph.url ? (
              <li>
                URL:{' '}
                <Hyperlink page="article" graph={graph} reset={true}>
                  {graph.url}
                </Hyperlink>
              </li>
            ) : (
              <li>Version: {version}</li>
            )}
            {isPublished && !!mainEntityTitle && (
              <li>
                <AutoAbridge ellipsis={true}>
                  Title: <Span>{mainEntityTitle}</Span>
                </AutoAbridge>
              </li>
            )}
          </ul>
        );
        break;
      }

      case 'DeclareAction': {
        const graph = hydrate(unrole(item.object, 'object'), droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        const nQuestions = arrayify(item.question).length;

        iconName = getIconNameFromSchema(item);
        title = <span>New Answer</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = (
          <span>{`answered ${nQuestions} ${pluralize(
            'question',
            nQuestions
          )} for`}</span>
        );
        object = getSubmissionActionLink(graph, item);
        body = null;
        break;
      }

      case 'ReviewAction': {
        const graph = hydrate(unrole(item.object, 'object'), droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = getIconNameFromSchema(item);
        title = <span>New Review</span>;

        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>reviewed</span>;
        object = getSubmissionActionLink(graph, item);
        body = (
          <div className="feed-item__rating">
            Rating:{' '}
            <RatingStars
              readOnly={true}
              disabled={true}
              rating={item.resultReview.reviewRating}
            />
          </div>
        );
        break;
      }

      case 'AssessAction': {
        const graph = hydrate(unrole(item.object, 'object'), droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = getIconNameFromSchema(item);
        title = <span>New Decision</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>assessed</span>;
        object = getSubmissionActionLink(graph, item);

        const result = arrayify(item.result)[0];

        body = result ? (
          <div>
            {`Decision: ${
              result['@type'] === 'RejectAction'
                ? 'reject'
                : result.name
                ? `send to ${textify(result.name).toLowerCase()}`
                : (result.alternateName &&
                    textify(result.alternateName).toLowerCase()) ||
                  'send to next stage'
            }`}
          </div>
        ) : null;
        break;
      }

      case 'PayAction': {
        const graph = hydrate(unrole(item.object, 'object'), droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = getIconNameFromSchema(item);

        title = <span>New payment</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });

        predicate = <span>paid fees for</span>;
        object = getSubmissionActionLink(graph, item);

        body = (
          <div>
            Amount:{' '}
            <Price
              priceSpecification={item.priceSpecification}
              requestedPrice={item.requestedPrice}
            />
          </div>
        );
        break;
      }

      case 'PublishAction': {
        const graph =
          hydrate(unrole(item.result, 'result'), droplets) ||
          hydrate(unrole(item.object, 'object'), droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = 'publish';
        title = <span>New Publication</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>published</span>;

        object = (
          <Hyperlink page="article" reset={true} graph={graph}>
            <Span>
              {graph.name ||
                graph.alternateName ||
                unprefix(getScopeId(getId(graph)))}
            </Span>
          </Hyperlink>
        );

        const version =
          graph.version || (getId(graph) || '').split('?version=')[1];

        const articleTitle =
          graph.publication &&
          graph.publication.workFeatured &&
          graph.publication.workFeatured.name;

        body = (
          <ul>
            {!!graph.datePublished && (
              <li>
                Scheduled:{' '}
                <Span>
                  {moment(graph.datePublished).format('MMM Do YYYY, h:mm a')}
                </Span>
              </li>
            )}
            <li>Version: {version}</li>
            {!!graph.slug && (
              <li>
                Slug:{' '}
                <Hyperlink page="article" graph={graph} reset={true}>
                  {graph.slug}
                </Hyperlink>
              </li>
            )}
            {!!articleTitle && (
              <li>
                <AutoAbridge ellipsis={true}>
                  Title: <Span>{articleTitle}</Span>
                </AutoAbridge>
              </li>
            )}
          </ul>
        );
        break;
      }

      case 'CommentAction': {
        const workflowAction = hydrate(item.object, droplets);
        const graph = getMetaActionGraph(item, scope, droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName =
          item.resultComment['@type'] === 'EndorserComment'
            ? 'thumbUpWarning'
            : 'comment';
        title = 'New Comment';

        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>commented on</span>;
        object = getSubmissionActionLink(graph, workflowAction);

        body = (
          <AutoAbridge ellipsis={true}>
            {textify(item.resultComment.text)}
          </AutoAbridge>
        );
        break;
      }

      case 'ScheduleAction': {
        const scheduledAction = hydrate(item.object, droplets);
        const graph = getMetaActionGraph(item, scope, droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = getIconNameFromSchema(item);
        title = 'New Deadline';

        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>re-scheduled an action for</span>;
        object = getSubmissionActionLink(graph, scheduledAction);

        const actionName = (
          <span>
            {textify(
              scheduledAction.name ||
                scheduledAction.alternateName ||
                API_LABELS[scheduledAction['@type']]
            )}{' '}
            <ActionIdentifier>{scheduledAction.identifier}</ActionIdentifier>
          </span>
        );

        const date = moment(scheduledAction.startTime)
          .add(moment.duration(item.expectedDuration))
          .format('MMM Do YYYY, h:mm a');

        body = (
          <ul>
            <li>
              Action:{' '}
              <Hyperlink
                page="submission"
                graph={graph}
                action={scheduledAction}
              >
                {actionName}
              </Hyperlink>
            </li>
            <li>Deadline: {date}</li>
          </ul>
        );
        break;
      }

      case 'AssignAction': {
        const assignedAction = hydrate(item.object, droplets);
        const graph = getMetaActionGraph(item, scope, droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = getIconNameFromSchema(item);

        title = <span>New Assignment</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>assigned an action for</span>;
        object = getSubmissionActionLink(graph, assignedAction);

        const actionName = (
          <span>
            {textify(
              assignedAction.name ||
                assignedAction.alternateName ||
                API_LABELS[assignedAction['@type']]
            )}{' '}
            <ActionIdentifier>{assignedAction.identifier}</ActionIdentifier>
          </span>
        );

        body = (
          <ul>
            <li>
              Action:{' '}
              <Hyperlink
                page="submission"
                graph={graph}
                action={assignedAction}
              >
                {actionName}
              </Hyperlink>
            </li>
            <li>
              Assignee:{' '}
              {getRoleLink(item.recipient, blindingData, { object: graph })}
            </li>
          </ul>
        );

        break;
      }

      case 'UnassignAction': {
        const unassignedAction = hydrate(item.object, droplets);
        const graph = getMetaActionGraph(item, scope, droplets);
        journal = getJournal(graph, droplets);

        userBadge = getUserBadge(item.agent, blindingData, {
          isProgressing,
          object: graph
        });

        iconName = getIconNameFromSchema(item);

        title = <span>Unassignment</span>;
        subject = getRoleLink(item.agent, blindingData, {
          object: graph
        });
        predicate = <span>unassigned an action for</span>;
        object = getSubmissionActionLink(graph, unassignedAction);

        const actionName = (
          <span>
            {textify(
              unassignedAction.name ||
                unassignedAction.alternateName ||
                API_LABELS[unassignedAction['@type']]
            )}{' '}
            <ActionIdentifier>{unassignedAction.identifier}</ActionIdentifier>
          </span>
        );

        body = (
          <ul>
            <li>
              Action:{' '}
              <Hyperlink
                page="submission"
                graph={graph}
                action={unassignedAction}
              >
                {actionName}
              </Hyperlink>
            </li>
          </ul>
        );

        break;
      }

      // Events
      case 'PublicationEvent': {
        const event = item;
        const { workFeatured } = event;

        journal = getJournal(workFeatured, droplets);
        iconName = getIconNameFromSchema(workFeatured);

        let type = (
          API_LABELS[workFeatured && workFeatured['@type']] || 'work'
        ).toLowerCase();

        if (type === 'data') {
          type = 'dataset';
        } else if (type === 'code' || type === 'audio') {
          type = `${type} resource`;
        }
        title = <span>{`New ${capitalize(type)}`}</span>;

        let authors = arrayify(workFeatured.author).map(author =>
          getAgent(author)
        );
        let etal;
        if (authors.length >= 4) {
          authors = authors.slice(0, 1);
          etal = true;
        }

        const bem = BemTags('feed-item__body');

        body = (
          <div className={bem`publication-info`}>
            <header className={bem`header`}>
              <Hyperlink page="article" event={event} reset={true}>
                <Span>{workFeatured.name || workFeatured.alternateName}</Span>
              </Hyperlink>
              <ul className={bem`names-list`}>
                {authors.map(author => (
                  <Li className={bem`list-name`} key={author['@id']}>
                    {author.name}
                  </Li>
                ))}
                {etal ? (
                  <li className={bem`list-name --et-al`} key="etal">
                    et al.
                  </li>
                ) : null}
              </ul>
            </header>
            {workFeatured.description && (
              <div className={bem`publication-description`}>
                <Value className={bem`description-text`}>
                  {workFeatured.description}
                </Value>
                <Hyperlink
                  page="article"
                  event={event}
                  reset={true}
                  className={bem`more-link`}
                >
                  {'More…'}
                </Hyperlink>
              </div>
            )}
          </div>
        );

        break;
      }

      default:
        console.error('unsupported item', item);
        iconName = getIconNameFromSchema(item);
        body = null;
        break;
    }

    return (
      <Card className={bem`feed-item`} active={true}>
        <div className={bem`contents`}>
          <header className={bem`header__`}>
            <div className={bem`__row`}>
              <div className={bem`__row-group`}>
                <Iconoclass iconSize={24} iconName={iconName} round={true} />
                <h4 className={bem`__action-title`}>{title}</h4>
              </div>
              <div className={bem`__row-group`}>
                {userBadge}
                {getJournalBadge(journal)}
                {getOrganizationBadge(organization)}
              </div>
            </div>
          </header>

          <div className={bem`body__`}>
            {schema.is(item, 'Action') && (
              <div className={bem`__row`}>
                <b>{subject} </b>
                {predicate} {object} {complement}
              </div>
            )}
            <div className={bem`__row`}>{body}</div>
          </div>

          <div className={bem`footer__`}>
            <dl className={bem`__info`}>
              {journal ? (
                <Fragment>
                  <dt className={bem`__label --journal`}>Journal</dt>
                  <dd className={bem`__value`}>
                    <Hyperlink
                      page="periodical"
                      periodical={journal}
                      reset={true}
                    >
                      <AutoAbridge ellipsis={true}>
                        <Span title={textify(journal.name)}>
                          {journal.alternateName ||
                            journal.name ||
                            unprefix(getId(journal))}
                        </Span>
                      </AutoAbridge>
                    </Hyperlink>
                  </dd>
                </Fragment>
              ) : organization ? (
                <Fragment>
                  <dt className={bem`__label --organization`}>Organization</dt>
                  <dd className={bem`__value`}>
                    <Hyperlink page="organization" organization={organization}>
                      <AutoAbridge ellipsis={true}>
                        <Span title={textify(organization.name)}>
                          {organization.alternateName ||
                            organization.name ||
                            unprefix(getId(organization))}
                        </Span>
                      </AutoAbridge>
                    </Hyperlink>
                  </dd>
                </Fragment>
              ) : null}

              <dt className={bem`__label --time`}>Time</dt>
              <dd className={bem`__value --time`}>
                <AutoAbridge ellipsis={true}>
                  <DateFromNow>
                    {item.endDate ||
                      item.endTime ||
                      item.startDate ||
                      item.startTime}
                  </DateFromNow>
                </AutoAbridge>
              </dd>
            </dl>
          </div>
        </div>
      </Card>
    );
  }
}

function hydrate(node, droplets = {}, fromStage = false) {
  const nodeId = getId(node);
  if (nodeId && nodeId in droplets) {
    return droplets[nodeId];
  }

  if (fromStage) {
    // For ScheduleAction, AssignAction, UnassignAction, CancelActione etc. we
    // may not have access to the `object` of the action (so it won't be in the
    // droplets). To circumvent that, those action have an instrument property
    // pointing to the worfklow stage they take place in.

    const stageId = arrayify(node.instrument).find(instrumentId => {
      const instrument = droplets[getId(instrumentId)];
      return instrument && instrument['@type'] === 'StartWorkflowStageAction';
    });

    if (stageId) {
      const stage = droplets[stageId];
      if (stage) {
        const actions = getStageActions(stage);
        const hydrated = actions.find(action => getId(action) === nodeId);
        if (hydrated) {
          return hydrated;
        }
      }
    }
  }

  return node;
}

function getJournalLink(journal) {
  return journal ? (
    <Hyperlink page="journal" reset={true} periodical={journal}>
      <Span>
        {journal.name || journal.alternateName || unprefix(getId(journal))}
      </Span>
    </Hyperlink>
  ) : (
    'journal'
  );
}

function getOrganizationLink(organization) {
  return organization ? (
    <Hyperlink page="organization" organization={organization}>
      <Span>
        {organization.name ||
          organization.alternateName ||
          unprefix(getId(organization))}
      </Span>
    </Hyperlink>
  ) : (
    'organization'
  );
}

function getSubmissionLink(graph) {
  return graph ? (
    <Hyperlink page="submission" graph={graph}>
      <Span>
        {graph.name || graph.alternateName || unprefix(getScopeId(graph))}
      </Span>
    </Hyperlink>
  ) : (
    'submission'
  );
}

function getSubmissionActionLink(graph, action) {
  return graph ? (
    <Hyperlink page="submission" graph={graph} action={action}>
      <Span>
        {graph.name || graph.alternateName || unprefix(getScopeId(graph))}
      </Span>
    </Hyperlink>
  ) : (
    'submission'
  );
}

function getJournalBadge(journal) {
  return journal ? <JournalBadge size={24} journal={journal} /> : null;
}

function getOrganizationBadge(organization) {
  return organization ? (
    <OrganizationBadge size={24} organization={organization} />
  ) : null;
}

function getUserBadge(
  role,
  blindingData,
  { isProgressing, fallbackRoleName, object } = {}
) {
  role = blindingData ? blindingData.resolve(role) : role;
  const needAnonimity = object && object['@type'] === 'Graph';

  const anonymous =
    needAnonimity && !(blindingData && blindingData.allVisible)
      ? blindingData
        ? blindingData.isBlinded(role)
        : true
      : false;

  const displayName = anonymous
    ? blindingData
      ? getDisplayName(blindingData, role, {
          roleName: fallbackRoleName
        })
      : role.roleName
      ? `"Anonymous ${role.roleName}"`
      : ''
    : unprefix(getAgentId(role));

  return (
    <UserBadgeMenu
      size={24}
      portal={true}
      anonymous={anonymous}
      userId={getAgentId(blindingData ? blindingData.resolve(role) : role)}
      name={displayName}
      roleName={role.roleName}
      subRoleName={role.roleName ? role.name : undefined}
      userBadgeLabel={
        anonymous && blindingData
          ? getUserBadgeLabel(blindingData, role, {
              roleName: fallbackRoleName
            })
          : undefined
      }
      progressMode={isProgressing ? 'spinUp' : 'none'}
    />
  );
}

function getRoleLink(role, blindingData, { fallbackRoleName, object } = {}) {
  role = blindingData ? blindingData.resolve(role) : role;
  const needAnonimity = object && object['@type'] === 'Graph';

  const anonymous =
    needAnonimity && !(blindingData && blindingData.allVisible)
      ? blindingData
        ? blindingData.isBlinded(role)
        : true
      : false;

  const displayName = anonymous
    ? blindingData
      ? getDisplayName(blindingData, role, {
          roleName: fallbackRoleName
        })
      : role.roleName
      ? `"Anonymous ${role.roleName}"`
      : '"Anonymous user"'
    : unprefix(getAgentId(role));

  return anonymous ? (
    displayName
  ) : (
    <Hyperlink page="user" role={role}>
      {displayName}
    </Hyperlink>
  );
}

function getJournal(graph, droplets) {
  const journal = getRootPart(graph);
  return hydrate(journal, droplets);
}

/**
 * Used to get the graph of meta action (action operating on other acitons)
 * E.g AssignAction on an EndorseAction. To get the graph we need to get the object of the object of the EndorseAction
 */
function getMetaActionGraph(metaAction, scope, droplets) {
  let graph = scope;
  const action = hydrate(metaAction.object, droplets);

  if (action && action.object) {
    let object = hydrate(action.object, droplets);
    if (object['@type'] === 'Graph') {
      graph = object;
    } else if (object.object) {
      object = hydrate(object.object, droplets);
      if (object['@type'] === 'Graph') {
        graph = object;
      }
    }
  }

  return graph;
}
