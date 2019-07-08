import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId, unrole } from '@scipe/jsonld';
import { Tag } from './tag';
import TagAdd from './tag-add';
import BemTags from '../utils/bem-tags';

export default class Tags extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    tagActions: PropTypes.array,
    tags: PropTypes.array,
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    // all the roles of the user
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        '@type': PropTypes.oneOf(['ContributorRole', 'ServiceProviderRole']),
        roleName: PropTypes.string.isRequired,
        name: PropTypes.string
      })
    ),
    acl: PropTypes.object,
    onAddTag: PropTypes.func,
    onDeleteTag: PropTypes.func,
    blacklist: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    tags: [],
    tagActions: [],
    onAddTag: noop,
    onDeleteTag: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      adding: false,
      hoveredTagName: ''
    };

    this.showAddTag = this.showAddTag.bind(this);
    this.hideAddTag = this.hideAddTag.bind(this);
    this.hoverEnterTag = this.hoverEnterTag.bind(this);
    this.hoverExitTag = this.hoverExitTag.bind(this);
    this.handleDeleteTag = this.handleDeleteTag.bind(this);
  }

  showAddTag(e) {
    e.stopPropagation();
    this.setState({ adding: true });
  }

  hideAddTag() {
    this.setState({ adding: false });
  }

  hoverEnterTag(tag) {
    this.setState({ hoveredTagName: tag.name });
  }

  hoverExitTag() {
    this.setState({ hoveredTagName: '' });
  }

  handleDeleteTag(tag, tagActionId) {
    this.props.onDeleteTag(tag, tagActionId);
    this.hoverExitTag();
  }

  render() {
    const {
      acl,
      user,
      roles,
      tags,
      tagActions,
      onAddTag,
      blacklist,
      disabled,
      readOnly
    } = this.props;

    const bem = BemTags();

    const tagsData = tags
      .map(tag => ({
        tag
      }))
      .concat(
        tagActions.map(action => ({
          tagActionId: getId(action),
          tag: action.result,
          audience: action.participant,
          canDelete:
            acl &&
            acl.checkPermission(user, 'DeleteActionPermission', { action })
        }))
      );

    return (
      <div
        className={bem`tag-list`}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className={bem`items`}>
          {tagsData.map(({ tagActionId, tag, audience, canDelete }) => (
            <Tag
              key={getId(tag) || tag.name}
              tagActionId={tagActionId}
              tag={tag}
              audience={audience}
              disabled={disabled}
              readOnly={readOnly}
              nothovered={
                this.state.hoveredTagName !== tag.name &&
                this.state.hoveredTagName !== ''
              }
              onMouseOver={this.hoverEnterTag}
              onMouseOut={this.hoverExitTag}
              onDelete={canDelete ? this.handleDeleteTag : undefined}
            />
          ))}

          {!readOnly && (
            <TagAdd
              disabled={disabled}
              roles={roles}
              tags={tagsData.map(data => data.tag)}
              onAddTag={onAddTag}
              onCancel={this.hideAddTag}
              blacklist={blacklist}
            />
          )}
        </div>
      </div>
    );
  }
}
