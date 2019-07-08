import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import noop from 'lodash/noop';
import pluralize from 'pluralize';
import {
  createId,
  getActiveRoles,
  remapRole,
  getAgent,
  getAgentId
} from '@scipe/librarian';
import { getId } from '@scipe/jsonld';
import PaperAutocomplete from '../paper-autocomplete';
import UserBadge from '../user-badge';
import { getDisplayName, getUserBadgeLabel } from '../../utils/graph';

export default class AudienceAutocomplete extends Component {
  static propTypes = {
    roleProp: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.string,
    blacklist: PropTypes.array, // list of role or audience (typically from `action.participant`)
    graph: PropTypes.object,
    disabled: PropTypes.bool,
    blindingData: PropTypes.object.isRequired
  };

  static defaultProps = {
    roleProp: 'participant',
    name: 'name',
    label: 'Audience',
    blacklist: [],
    graph: {},
    onSubmit: noop
  };

  constructor(props) {
    super(props);
    const options = this.getOptions(props);
    this.state = {
      value: props.value,
      options,
      error: null
    };

    this.fuse = new Fuse(options, { keys: ['name'] });

    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
      this.autocomplete.resetValue(nextProps.value);
    }

    if (
      nextProps.graph !== this.props.graph ||
      nextProps.blacklist !== this.props.blacklist
    ) {
      this.setState({
        options: this.getOptions(nextProps),
        error: null
      });
    }
  }

  getOptions(props) {
    props = props || this.props;
    const { graph, blacklist, blindingData, roleProp } = props;

    const allRoles = getActiveRoles(graph);

    if (!getId(graph) && !allRoles.length) {
      return [];
    }

    const blackset = blacklist.reduce((blackset, role) => {
      const unroled = getAgent(role);
      const id = getId(role);
      const unroledId = getId(unroled);
      if (
        (id &&
          (id.startsWith('role:') ||
            id.startsWith('audience:') ||
            id.startsWith('audienceRole:'))) ||
        (unroledId && unroledId.startsWith('audience:'))
      ) {
        blackset.add(id);
      }
      return blackset;
    }, new Set());

    const options = [];
    ['editor', 'author', 'reviewer', 'producer', 'public'].forEach(roleName => {
      const roles = allRoles
        .filter(role => role.roleName === roleName)
        .sort((a, b) => {
          return getAgentId(a).localeCompare(getAgentId(b));
        });
      const titles = Array.from(
        new Set(roles.filter(role => role.name).map(role => role.name))
      ).sort();

      if (getId(graph)) {
        // without a graph @id createId will throw
        const roleNameId = createId('audience', roleName, graph)['@id'];
        if (!blackset.has(roleNameId)) {
          options.push({
            id: roleName,
            roleName,
            type: 'Audience',
            name: roleName == 'public' ? roleName : pluralize(roleName),
            schema: {
              '@id': roleNameId,
              '@type': 'Audience',
              audienceType: roleName
            }
          });
        }
        titles.forEach(title => {
          const titleId = createId('audience', roleName, graph, title)['@id'];
          if (!blackset.has(title)) {
            options.push({
              id: title,
              roleName,
              subRoleName: title,
              type: 'Audience',
              name: pluralize(title),
              schema: {
                '@id': titleId,
                '@type': 'Audience',
                name: title,
                audienceType: roleName
              }
            });
          }
        });
      }

      roles.forEach(role => {
        if (!blackset.has(getId(role))) {
          options.push({
            id: getId(role),
            agentId: getAgentId(role),
            roleName: role.roleName,
            subRoleName: role.name,
            type: 'ContributorRole',
            name: `${getDisplayName(blindingData, role)} (${role.name ||
              role.roleName})`,
            anonymous: blindingData.isBlinded(role),
            userBadgeLabel: getUserBadgeLabel(blindingData, role),
            schema: remapRole(role, roleProp, { dates: false })
          });
        }
      });
    });

    return options;
  }

  resetValue(value) {
    this.autocomplete.resetValue(value);
  }

  blur() {
    this.autocomplete.blur();
  }

  reset() {
    const { value } = this.props;
    this.setState({
      value: value,
      error: null,
      options: this.getOptions()
    });
    this.autocomplete.resetValue(value);
    this.autocomplete.blur();
  }

  renderItem(item, isHighlighted, style) {
    let iconName;
    if (item.type === 'Audience') {
      switch (item.roleName) {
        case 'editor':
          iconName = 'roleEditorGroup';
          break;
        case 'producer':
          iconName = 'roleProducerGroup';
          break;
        case 'reviewer':
          iconName = 'roleReviewerGroup';
          break;
        case 'author':
          iconName = 'roleAuthorGroup';
          break;
        case 'public':
          iconName = 'star';
          break;
      }
    }

    return (
      <li
        key={item.name}
        className={`audience-autocomplete__item ${
          isHighlighted ? 'highlighted' : 'unhighlighted'
        }${
          item.type === 'Audience' && !item.subRoleName
            ? ' audience-autocomplete__item--role-name'
            : ''
        }`}
        style={{ lineHeight: '24px' }}
      >
        <UserBadge
          size={24}
          userId={item.agentId}
          userBadgeLabel={item.userBadgeLabel}
          anonymous={item.anonymous}
          roleName={item.roleName}
          iconName={iconName}
        />{' '}
        <span className="audience-autocomplete__item__text">{item.name}</span>
      </li>
    );
  }

  renderMenu(items, value, style) {
    return (
      <ol className="paper-autocomplete__results">
        {items.length ? items : null}
      </ol>
    );
  }

  handleChange(e, value, itemValueDoesMatch) {
    e.preventDefault();
    if (this.props.onChange) {
      this.props.onChange(value, itemValueDoesMatch);
    }
    this.setState({
      value,
      options: value ? this.fuse.search(value) : this.getOptions()
    });
  }

  handleSubmit(value, item) {
    this.props.onSubmit(value, item && item.schema);
  }

  render() {
    const { value, options } = this.state;
    const { disabled, name, label } = this.props;

    return (
      <PaperAutocomplete
        className="audience-autocomplete"
        ref={el => {
          this.autocomplete = el;
        }}
        defaultValue={value}
        items={options}
        getItemValue={item => item.name}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        submitOnBlur={true}
        allowUnlistedInput={true}
        inputProps={{
          name: name,
          label: label,
          disabled: disabled
        }}
      />
    );
  }
}
