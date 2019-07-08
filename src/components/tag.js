import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import pluralize from 'pluralize';
import contrast from 'contrast';
import noop from 'lodash/noop';
import { getAgent } from '@scipe/librarian';
import { arrayify, textify } from '@scipe/jsonld';
import { getTagColor } from '../utils/get-tag-color';
import BemTags from '../utils/bem-tags';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';
import { typesMatch } from '../utils/react-children-utils';

export class Tag extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    onDelete: PropTypes.func, // if not specified can't delete
    onMouseOut: PropTypes.func,
    onMouseOver: PropTypes.func,
    nothovered: PropTypes.bool,
    tagActionId: PropTypes.string,
    tag: PropTypes.shape({
      name: PropTypes.string
    }),
    audience: PropTypes.array,
    children: PropTypes.node,
    className: PropTypes.string,
    tagColor: PropTypes.string
  };

  static defaultProps = {
    onMouseOut: noop,
    onMouseOver: noop,
    nothovered: false
  };

  constructor(props) {
    super(props);

    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleMouseOver() {
    const { tag, tagActionId } = this.props;
    this.props.onMouseOver(tag, tagActionId);
  }

  handleMouseOut() {
    const { tag, tagActionId } = this.props;
    this.props.onMouseOut(tag, tagActionId);
  }

  handleDelete() {
    const { tag, tagActionId } = this.props;
    this.props.onDelete(tagActionId, tag);
  }

  render() {
    let {
      audience,
      onDelete,
      tag,
      nothovered,
      disabled,
      readOnly,
      children,
      className,
      tagColor
    } = this.props;

    const bem = BemTags('tag-list');

    const now = new Date().toISOString();
    const audienceTypes = arrayify(audience)
      .filter(participant => {
        const audience = getAgent(participant);
        return (
          participant.audienceType ||
          (audience.audienceType &&
            ((!participant.endDate || participant.endDate > now) &&
              (!participant.startDate || participant.startDate <= now)))
        );
      })
      .map(participant => getAgent(participant).audienceType);

    const color = tagColor ? tagColor : getTagColor(textify(tag.name));

    const style = {
      backgroundColor: color,
      color: contrast(color) === 'light' ? '#333' : '#fff'
    };

    const hasMenu = audienceTypes.length || !readOnly;
    const tagName = textify(tag.name);

    return (
      <div
        className={classnames({
          [bem`tag__`]: true,
          [bem`--deletable`]: !disabled,
          [bem`--read-only`]: readOnly,
          [bem`--disabled`]: disabled,
          [bem`--light`]: contrast(color) === 'light',
          [bem`--dark`]: contrast(color) !== 'light',
          nothovered,
          [className]: true
        })}
        title={hasMenu ? undefined : tagName}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        style={style}
      >
        {hasMenu ? (
          <Menu
            title={tagName}
            icon="dropdown"
            portal={true}
            align="right"
            className={bem`__audience`}
          >
            {!!audienceTypes.length && (
              <MenuItem disabled={true}>Tag Audience</MenuItem>
            )}
            {audienceTypes.map((audienceType, i) => (
              <MenuItem disabled={true} key={audienceType} divider={i == 0}>
                {pluralize(audienceType)}
              </MenuItem>
            ))}
            {!!onDelete && !readOnly && !children && (
              <MenuItem
                divider={!!audienceTypes.length}
                disabled={disabled}
                key="delete"
                icon="trash"
                onClick={this.handleDelete}
              >
                Delete Tag
              </MenuItem>
            )}
          </Menu>
        ) : (
          tagName
        )}

        {children}
      </div>
    );
  }
}

export class TagMenu extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    onChange: noop
  };

  handleMenuClick(value) {
    this.props.onChange(value);
  }

  render() {
    const { children, value } = this.props;

    let selectedChild;
    React.Children.forEach(children, function(child, i) {
      const childValue = child.props.value != null ? child.props.value : i;
      if (childValue == value) {
        selectedChild = child;
      }
    });

    const displayedValue =
      selectedChild && typeof selectedChild.props.children === 'string'
        ? selectedChild.props.children
        : value;

    return (
      <Tag
        canDelete={false}
        tag={{ name: '' }}
        className={`tag-list__tag--menu`}
        tagColor="lightgrey"
        disabled={this.props.disabled}
        readOnly={this.props.readOnly}
      >
        <Menu
          icon="dropdown"
          portal={true}
          align="right"
          title={displayedValue}
        >
          {React.Children.map(this.props.children, (child, i) => {
            if (typesMatch(child, MenuItem)) {
              let value = child.props.value != null ? child.props.value : i;
              let myProps = {
                onClick: this.handleMenuClick.bind(
                  this,
                  value,
                  child.props.children
                )
              };
              return React.cloneElement(child, myProps);
            }
          })}
        </Menu>
      </Tag>
    );
  }
}
