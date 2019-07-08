import React, { Component } from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import { arrayify } from '@scipe/jsonld';
import { DEFAULT_PEER_REVIEW_TYPES } from '@scipe/librarian';
import PaperCheckbox from '../paper-checkbox';
import PaperSelect from '../paper-select';
import BemTags from '../../utils/bem-tags';
import { WORKFLOW_ROLE_NAMES } from '../../constants';
import {
  getViewIdentityPermissionMatrix,
  getViewIdentityPermission
} from '../../utils/graph';
import ExpansionPanel from '../expansion-panel';
import ExpansionPanelPreview from '../expansion-panel-preview';

export default class ViewIdentityPermissionEditor extends Component {
  static defaultProps = {
    defaultExpanded: false,
    onChange: noop
  };

  static propTypes = {
    defaultExpanded: PropTypes.bool,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    viewIdentityPermission: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    onChange: PropTypes.func
  };

  static getDerivedStateFromProps(props, state) {
    if (
      !state.isOpen &&
      state.lastViewIdentityPermission !== props.viewIdentityPermission
    ) {
      const matrix = getViewIdentityPermissionMatrix(
        state.lastViewIdentityPermission
      );
      const peerReviewType =
        Object.keys(DEFAULT_PEER_REVIEW_TYPES).find(peerReviewType => {
          return isEqual(
            matrix,
            getViewIdentityPermissionMatrix(
              DEFAULT_PEER_REVIEW_TYPES[peerReviewType].permissions
            )
          );
        }) || 'custom';

      const nextMatrix = getViewIdentityPermissionMatrix(
        props.viewIdentityPermission
      );
      const nextPeerReviewType =
        Object.keys(DEFAULT_PEER_REVIEW_TYPES).find(peerReviewType => {
          return isEqual(
            nextMatrix,
            getViewIdentityPermissionMatrix(
              DEFAULT_PEER_REVIEW_TYPES[peerReviewType].permissions
            )
          );
        }) || 'custom';

      if (nextPeerReviewType === 'custom' && peerReviewType !== 'custom') {
        return {
          isOpen: true,
          lastViewIdentityPermission: props.viewIdentityPermission
        };
      }
    }

    if (state.lastViewIdentityPermission !== props.viewIdentityPermission) {
      return {
        lastViewIdentityPermission: props.viewIdentityPermission
      };
    }

    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.defaultExpanded,
      lastViewIdentityPermission: props.viewIdentityPermission
    };
  }

  handleClick(i, j, k, e) {
    const { onChange, viewIdentityPermission } = this.props;
    const matrix = getViewIdentityPermissionMatrix(viewIdentityPermission);
    matrix[i][j] = k;
    onChange(getViewIdentityPermission(matrix));
  }

  handleChange = e => {
    e.preventDefault();
    const { onChange, viewIdentityPermission } = this.props;
    const peerReviewType = e.target.value;
    let nextViewIdentityPermission;
    if (peerReviewType === 'custom') {
      this.setState({ isOpen: true });
      const matrix = getViewIdentityPermissionMatrix(viewIdentityPermission);
      const peerReviewType = Object.keys(DEFAULT_PEER_REVIEW_TYPES)
        .filter(type => type !== 'custom')
        .find(peerReviewType => {
          return isEqual(
            matrix,
            getViewIdentityPermissionMatrix(
              DEFAULT_PEER_REVIEW_TYPES[peerReviewType].permissions
            )
          );
        });
      nextViewIdentityPermission = peerReviewType
        ? DEFAULT_PEER_REVIEW_TYPES.custom.permissions
        : viewIdentityPermission;
    } else {
      nextViewIdentityPermission =
        DEFAULT_PEER_REVIEW_TYPES[peerReviewType].permissions;
    }
    onChange(nextViewIdentityPermission);
  };

  handleToggleExpansionPanel = isOpen => {
    this.setState({ isOpen });
  };

  render() {
    const { isOpen } = this.state;
    const { viewIdentityPermission, disabled, readOnly } = this.props;

    const matrix = getViewIdentityPermissionMatrix(viewIdentityPermission);
    const peerReviewType =
      Object.keys(DEFAULT_PEER_REVIEW_TYPES).find(peerReviewType => {
        return isEqual(
          matrix,
          getViewIdentityPermissionMatrix(
            DEFAULT_PEER_REVIEW_TYPES[peerReviewType].permissions
          )
        );
      }) || 'custom';

    const bem = BemTags();

    return (
      <div className={bem`view-identity-permission-editor`}>
        <ExpansionPanel
          expanded={isOpen}
          onChange={this.handleToggleExpansionPanel}
        >
          <ExpansionPanelPreview>
            <PaperSelect
              floatLabel={false}
              portal={true}
              readOnly={readOnly}
              disabled={disabled}
              name="type"
              label="Peer Review Type"
              value={peerReviewType}
              onChange={this.handleChange}
              className={bem`profile-select`}
            >
              {Object.keys(DEFAULT_PEER_REVIEW_TYPES).map(value => (
                <option value={value} key={value}>
                  {DEFAULT_PEER_REVIEW_TYPES[value].name}
                </option>
              ))}
            </PaperSelect>
          </ExpansionPanelPreview>
          <div className={bem`body`}>
            <table className={bem`matrix`}>
              <thead className={bem`matrix-head`}>
                <tr className={bem`matrix-head-row`}>
                  <th className={bem`matrix-head-item`} />
                  {WORKFLOW_ROLE_NAMES.map(roleName => (
                    <th key={roleName} className={bem`matrix-head-item`}>
                      <span>{capitalize(roleName)}s</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={bem`matrix-body`}>
                {WORKFLOW_ROLE_NAMES.map((rowRoleName, i) => (
                  <tr key={rowRoleName} className={bem`matrix-row`}>
                    <th className={bem`matrix-row-head-item`}>
                      <strong>{capitalize(rowRoleName)}s</strong> can view
                      identity of
                    </th>
                    {WORKFLOW_ROLE_NAMES.map((columnRoleName, j) => (
                      <td key={columnRoleName} className={bem`matrix-item`}>
                        <PaperCheckbox
                          theme="light"
                          readOnly={readOnly}
                          disabled={
                            disabled ||
                            /* we make sure that user cannot uncheck author-author, editor-editor, producer-producer, editor-producer, producer-editor, producer-author view identity as those currently create issues in publisher */
                            (matrix[i][j] &&
                              ((rowRoleName === columnRoleName &&
                                rowRoleName !== 'reviewer') ||
                                ((rowRoleName === 'editor' &&
                                  columnRoleName === 'producer') ||
                                  (rowRoleName === 'producer' &&
                                    columnRoleName === 'editor') ||
                                  (rowRoleName === 'producer' &&
                                    columnRoleName === 'author'))))
                          }
                          checked={matrix[i][j]}
                          onClick={this.handleClick.bind(
                            this,
                            i,
                            j,
                            !matrix[i][j]
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExpansionPanel>
      </div>
    );
  }
}

export class PublicViewIdentityPermissionEditor extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    audiences: PropTypes.array,
    onChange: PropTypes.func
  };

  static defaultProps = {
    audiences: []
  };

  handleClick(audienceType, nextIsChecked) {
    const { audiences, onChange } = this.props;
    let nextAudiences;
    if (nextIsChecked) {
      nextAudiences = arrayify(audiences)
        .filter(audience => {
          return audience.audienceType !== audienceType;
        })
        .concat({
          '@type': 'Audience',
          audienceType
        });
    } else {
      nextAudiences = arrayify(audiences).filter(audience => {
        return audience.audienceType !== audienceType;
      });
    }

    onChange(nextAudiences);
  }

  render() {
    const { readOnly, disabled, audiences } = this.props;

    const bem = BemTags();
    return (
      <div className={bem`view-identity-permission-editor --public`}>
        <table className={bem`matrix`}>
          <thead className={bem`matrix-head`}>
            <tr className={bem`matrix-head-row`}>
              <th className={bem`matrix-head-item`} />
              {WORKFLOW_ROLE_NAMES.map(roleName => (
                <th key={roleName} className={bem`matrix-head-item`}>
                  <span>{capitalize(roleName)}s</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={bem`matrix-body`}>
            <tr className={bem`matrix-row`}>
              <th className={bem`matrix-row-head-item`}>
                <strong>Public readers</strong> can view identity of
              </th>
              {WORKFLOW_ROLE_NAMES.map(roleName => {
                const isChecked = arrayify(audiences).some(audience => {
                  return audience.audienceType === roleName;
                });

                return (
                  <td key={roleName} className={bem`matrix-item`}>
                    <PaperCheckbox
                      theme="light"
                      readOnly={readOnly}
                      disabled={disabled}
                      checked={isChecked}
                      onClick={this.handleClick.bind(
                        this,
                        roleName,
                        !isChecked
                      )}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
