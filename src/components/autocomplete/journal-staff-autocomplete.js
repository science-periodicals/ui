import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import noop from 'lodash/noop';
import { getAgentId, getActiveRoles } from '@scipe/librarian';
import { unprefix } from '@scipe/jsonld';
import Fuse from 'fuse.js';
import UserBadge from '../user-badge';
import PaperAutocomplete from '../paper-autocomplete';
import BemTags from '../../utils/bem-tags';
import { WORKFLOW_ROLE_NAMES } from '../../constants';

// TODO blacklist

export default class JournalStaffAutocomplete extends Component {
  static propTypes = {
    periodical: PropTypes.object.isRequired,
    roleName: PropTypes.oneOf(WORKFLOW_ROLE_NAMES),
    name: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    readOnly: PropTypes.bool
  };

  static defaultProps = {
    label: 'Add staff',
    readOnly: false,
    onSubmit: noop,
    onChange: noop
  };

  constructor(props) {
    super(props);
    const items = this.getItems(props);
    this.state = { items };
    this.fuse = new Fuse(items, {
      keys: [`${props.roleName}.username`, 'name']
    });
    this.renderItem = this.renderItem.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getItems(props) {
    props = props || this.props;
    const { periodical, roleName } = props;

    return getActiveRoles(periodical)
      .filter(role => role.roleName === roleName)
      .map(role => {
        const agentId = getAgentId(role);
        return Object.assign(
          { name: roleName },
          pick(role, ['@id', '@type', 'name', 'roleName']),
          {
            [roleName]: { '@id': agentId, username: unprefix(agentId) }
          }
        );
      });
  }

  UNASFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.periodical !== this.props.periodical ||
      nextProps.roleName !== this.props.roleName
    ) {
      const items = this.getItems(nextProps);
      this.setState({ items });
      this.fuse = new Fuse(items, {
        keys: [`${nextProps.roleName}.username`, 'name']
      });
    }
  }

  focus() {
    this.autocomplete.focus();
  }

  blur() {
    this.autocomplete.blur();
  }

  reset() {
    const items = this.getItems();
    this.setState({ items });
    this.autocomplete.reset();
  }

  handleChange(e, value, itemValueDoesMatch) {
    const item = this.state.items.find(item => {
      return value === getAgentId(item);
    });
    this.props.onChange(value, item);
    this.setState({
      items: value ? this.fuse.search(value) : this.getItems()
    });
  }

  handleSubmit(value, item) {
    if (item) {
      this.props.onSubmit(value, item);
    }
  }

  renderItem(item, isHighlighted, style) {
    const { roleName } = this.props;

    const agentId = getAgentId(item);
    const username = unprefix(agentId);
    const bem = BemTags(`journal-staff-autocomplete`);
    return (
      <li
        key={`${agentId}-${item.name}`}
        className={isHighlighted ? 'highlighted' : ''}
        style={{ lineHeight: '24px' }}
      >
        <UserBadge userId={agentId} roleName={roleName} size={24} />
        <span className={bem`user-name`}>{username}</span>
        {item.name && <span className={bem`user-title`}>({item.name})</span>}
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

  render() {
    const { type, value, onChange, roleName, ...others } = this.props;
    const { items } = this.state;
    const bem = BemTags();

    return (
      <PaperAutocomplete
        className={bem`journal-staff-autocomplete`}
        ref={el => {
          this.autocomplete = el;
        }}
        items={items}
        getItemValue={item =>
          `${item[roleName].username} (${item.name || roleName})`
        }
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        allowUnlistedInput={false}
        inputProps={others}
      />
    );
  }
}
