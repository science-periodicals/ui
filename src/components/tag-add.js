import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import pluralize from 'pluralize';
import noop from 'lodash/noop';
import { getId, arrayify } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import PaperInput from './paper-input';
import BemTags from '../utils/bem-tags';
import Menu from './menu/menu';
import MenuItem, { MenuItemLabel, MenuItemDivider } from './menu/menu-item';

const ENTER_KEY_CODE = 13;

export default class TagAdd extends React.Component {
  static propTypes = {
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        '@id': PropTypes.string,
        '@type': PropTypes.oneOf(['ContributorRole', 'ServiceProviderRole']),
        roleName: PropTypes.string.isRequired,
        name: PropTypes.string
      })
    ),
    defaultAudienceType: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    tags: PropTypes.array,
    onAddTag: PropTypes.func,
    onCancel: PropTypes.func,
    blacklist: PropTypes.arrayOf(PropTypes.string)
  };

  static defaultProps = {
    roles: [],
    defaultAudienceType: ['editor'],
    blacklist: ['Accepted', 'Rejected', 'Scheduled', 'Published', 'Active'],
    tags: [],
    onAddTag: noop,
    onCancel: noop
  };

  static getDerivedStateFromProps(props, state) {
    if (props.roles !== state.lastRoles) {
      return {
        lastRoles: props.roles,
        role: props.roles[0]
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      role: props.roles[0],
      expanded: false,
      audienceTypes: props.defaultAudienceType,
      tagName: '',
      lastRoles: props.roles
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.expanded && this.state.expanded) {
      if (this.input) {
        this.input.focus();
      }
      if (this.menu) {
        // wait for animation to complete before opening menu
        this.timeoutId = setTimeout(() => {
          this.menu.getInstance().open();
        }, 200);
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  handleClickCancel = () => {
    const { defaultAudienceType, roles } = this.props;
    if (this.state.expanded) {
      this.props.onCancel();
      this.setState({
        role: roles[0],
        expanded: false,
        tagName: '',
        audienceTypes: defaultAudienceType
      });
    } else {
      this.setState({
        expanded: true
      });
    }
  };

  handleChange = e => {
    this.setState({ tagName: e.target.value });
  };

  handleAddAudienceType(audienceType) {
    this.setState({
      audienceTypes: this.state.audienceTypes.concat(audienceType)
    });
  }

  handleRemoveAudienceType(audienceType) {
    this.setState({
      audienceTypes: this.state.audienceTypes.filter(
        _audienceType => _audienceType !== audienceType
      )
    });
  }

  handleSetRole(role) {
    this.setState({
      role
    });
  }

  handleSubmit = e => {
    const { defaultAudienceType, onAddTag } = this.props;
    let { tagName, audienceTypes, role } = this.state;

    if (e.keyCode && e.keyCode !== ENTER_KEY_CODE) return;

    tagName = (tagName || '').trim();
    if (!tagName || this.getError(tagName)) return;
    onAddTag(tagName, audienceTypes, role);
    this.setState({
      expanded: false,
      tagName: '',
      audienceTypes: defaultAudienceType
    });

    if (this.menu) {
      clearTimeout(this.timeoutId);
      this.menu.getInstance().close();
    }

    this.props.onCancel();
  };

  getError(tagName = '') {
    const { tags, blacklist } = this.props;

    const isDuplicate = arrayify(tags).some(
      ({ name }) =>
        (name || '').toLowerCase().trim() === tagName.toLowerCase().trim()
    );
    if (isDuplicate) return 'Duplicate Tag';

    const isBlacklisted = arrayify(blacklist).some(
      name => (name || '').toLowerCase().trim() === tagName.toLowerCase().trim()
    );
    if (isBlacklisted) return 'Reserved Tag';

    return null;
  }

  render() {
    const { disabled, roles } = this.props;
    const { tagName, expanded, audienceTypes, role } = this.state;
    const bem = BemTags();

    return (
      <div
        className={bem`tag-add --${expanded ? 'expanded' : 'collapsed'} ${
          disabled ? '--disabled' : ''
        }`}
      >
        <div className={bem`input-container`}>
          <PaperInput
            ref={el => {
              this.input = el;
            }}
            className={bem`input`}
            error={this.getError(tagName)}
            autoComplete="off"
            label="New tag"
            name="name"
            value={tagName}
            floatLabel={false}
            onChange={this.handleChange}
            onKeyDown={this.handleSubmit}
          />
        </div>

        <Menu
          icon="dropdown"
          portal={true}
          className="tag-add__audience"
          closeOnClick={false}
          ref={el => {
            this.menu = el;
          }}
          disabled={!expanded}
        >
          <MenuItemLabel disabled={true}>Tag Audience</MenuItemLabel>
          {['editor', 'author', 'reviewer', 'producer'].map(audienceType => (
            <MenuItem
              key={audienceType}
              onClick={
                audienceTypes.includes(audienceType)
                  ? this.handleRemoveAudienceType.bind(this, audienceType)
                  : this.handleAddAudienceType.bind(this, audienceType)
              }
              icon={{
                iconName: audienceTypes.includes(audienceType)
                  ? 'check'
                  : 'none',
                round: false,
                color: 'black'
              }}
            >
              {capitalize(pluralize(audienceType))}
            </MenuItem>
          ))}

          {roles.length ? (
            <Fragment>
              <MenuItemDivider />
              <MenuItemLabel disabled={true}>Tag As…</MenuItemLabel>
              {roles.map(potentialRole => (
                <MenuItem
                  key={getId(potentialRole)}
                  onClick={this.handleSetRole.bind(this, potentialRole)}
                  icon={{
                    iconName:
                      getId(potentialRole) === getId(role) ? 'check' : 'none',
                    round: false,
                    color: 'black'
                  }}
                >
                  {potentialRole.name
                    ? `${potentialRole.name} (${potentialRole.roleName})`
                    : potentialRole.roleName}
                </MenuItem>
              ))}
            </Fragment>
          ) : null}
        </Menu>

        <Iconoclass
          customClassName={bem`button --${expanded ? 'delete' : 'add'}`}
          iconName="delete"
          disabled={disabled}
          iconSize={16}
          color="white"
          title="Cancel"
          onClick={this.handleClickCancel}
          elementType="button"
        />
      </div>
    );
  }
}
