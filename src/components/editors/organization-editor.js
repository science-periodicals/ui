import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import { createId } from '@scipe/librarian';
import OrganizationFormFragment from '../forms/organization-form-fragment';
import PersonOrOrganizationFormFragment from '../forms/person-or-organization-form-fragment';
import PaperButton from '../paper-button';
import ControlPanel from '../control-panel';
import RdfaOrganization from '../rdfa/rdfa-organization';
import classnames from 'classnames';

export default class OrganizationEditor extends React.Component {
  static propTypes = {
    node: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    allowPersonTypeSelection: PropTypes.bool,
    onClose: PropTypes.func,
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func, // (node, key, value, {force: true})
    onDelete: PropTypes.func // (parentNode, parentKey, value)
  };

  static defaultProps = {
    node: {},
    onCreate: noop,
    onUpdate: noop,
    onDelete: noop
  };

  static getDerivedStateFromProps(props, state) {
    if (getId(props.node) !== getId(state.lastNode)) {
      return {
        activeNodeId: getId(props.node),
        lastNode: props.node
      };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      activeNodeId: getId(props.node),
      hoverDelete: undefined,
      lastNode: props.node
    };

    this.handleClose = this.handleClose.bind(this);
  }

  handleAddParentOrganization(activeNode, e) {
    const newNode = {
      '@id': createId('blank')['@id'],
      '@type': 'Organization'
    };
    this.props.onCreate(activeNode, 'parentOrganization', newNode);
    this.setState({
      activeNodeId: getId(newNode)
    });
  }

  handleDelete(parentNode, activeNode, e) {
    this.props.onDelete(parentNode, 'parentOrganization', activeNode);
    this.setState({
      activeNodeId: getId(parentNode)
    });
  }

  handleHoverDelete(i, hovered, e) {
    if (this.state.hoverDelete !== i && hovered === true) {
      this.setState({ hoverDelete: i });
    } else if (hovered === false) {
      this.setState({ hoverDelete: undefined });
    }
  }

  handleChangeActiveNode(activeNode, e) {
    this.setState({
      activeNodeId: getId(activeNode)
    });
  }

  handleClose() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const {
      node: root,
      readOnly,
      disabled,
      onClose,
      allowPersonTypeSelection,
      ...others
    } = this.props;
    const { activeNodeId } = this.state;

    if (typeof root === 'string') return null;

    let activeNode = root;
    while (activeNode && getId(activeNode) !== activeNodeId) {
      activeNode = activeNode.parentOrganization;
    }

    const trail = [root];
    let trailPart = root;
    while (trailPart) {
      trailPart = trailPart.parentOrganization;
      if (trailPart) {
        trail.push(trailPart);
      }
    }

    const isLeaf = getId(trail[trail.length - 1]) === activeNodeId;

    return (
      <div className="organization-editor">
        {/* The rendered trail to help the user vizualize which part he is currently editing (and provide control to delete / switch to other parts of the trail) */}
        <div className="organization-editor__trail">
          <ul className="organization-editor__trail-list">
            {trail.map((organization, i) => (
              <li
                key={getId(organization) || i}
                className={classnames('organization-editor__trail-list__item', {
                  'organization-editor__trail-list__item--active':
                    getId(organization) === activeNodeId,
                  'organization-editor__trail-list__item--delete-hovered':
                    this.state.hoverDelete == i
                })}
              >
                <a
                  href="#"
                  className="organization-editor__trail-list__part-name"
                  onClick={this.handleChangeActiveNode.bind(this, organization)}
                >
                  <RdfaOrganization
                    object={organization}
                    recursive={false}
                    location={false}
                    link={false}
                  >
                    {`Untitled part ${i + 1}`}
                  </RdfaOrganization>
                </a>
                {/*<Iconoclass
                     iconName="pencil"
                     behavior="button"
                     onClick={this.handleChangeActiveNode.bind(this, organization)}
                     size="18px"
                     className="organization-editor__trail-list__edit-icon"
                     />*/}
                {i > 0 && !readOnly && (
                  <Iconoclass
                    iconName="delete"
                    behavior="button"
                    disabled={disabled}
                    onClick={this.handleDelete.bind(
                      this,
                      trail[i - 1],
                      trail[i]
                    )}
                    size="18px"
                    className="organization-editor__trail-list__delete-icon"
                    onMouseOver={this.handleHoverDelete.bind(this, i, true)}
                    onMouseLeave={this.handleHoverDelete.bind(this, i, false)}
                  />
                )}
              </li>
            ))}

            {!readOnly && (
              <li className="organization-editor__trail-list__add">
                <Iconoclass
                  iconName="add"
                  behavior="button"
                  disabled={disabled}
                  size="24px"
                  onClick={this.handleAddParentOrganization.bind(
                    this,
                    trail[trail.length - 1]
                  )}
                  className="organization-editor__trail-list__add-icon"
                />
              </li>
            )}
          </ul>
        </div>

        {/* a form for the part of the trail currently being edited */}
        <div className="organization-editor__form">
          {allowPersonTypeSelection ? (
            <PersonOrOrganizationFormFragment
              {...others}
              readOnly={readOnly}
              disabled={disabled}
              node={activeNode}
            />
          ) : (
            <OrganizationFormFragment
              {...others}
              readOnly={readOnly}
              disabled={disabled}
              node={activeNode}
            />
          )}
        </div>

        {/*controls*/}
        <ControlPanel>
          {isLeaf && !readOnly && (
            <PaperButton
              disabled={disabled}
              onClick={this.handleAddParentOrganization.bind(this, activeNode)}
            >
              add parent organization
            </PaperButton>
          )}

          {onClose && (
            <PaperButton onClick={this.handleClose}>close</PaperButton>
          )}
        </ControlPanel>
      </div>
    );
  }
}
