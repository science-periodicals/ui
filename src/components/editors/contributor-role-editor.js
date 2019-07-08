import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { findDOMNode } from 'react-dom'; /* eslint-disable react/no-find-dom-node */
import { DragSource, DropTarget } from 'react-dnd';
import noop from 'lodash/noop';
import { schema, createId, getAgent } from '@scipe/librarian';
import { getId, arrayify } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import Stepper from '../stepper';
import StepperItem from '../stepper-item';
import PaperActionButton from '../paper-action-button';
import PersonOrOrganizationEditor from './person-or-organization-editor';
import OrganizationEditor from './organization-editor';
import ContactPointFormFragment from '../forms/contact-point-form-fragment';
import Divider from '../divider';
import RdfaOrganization from '../rdfa/rdfa-organization';
import AutoAbridge from '../auto-abridge';

export default class ContributorRoleEditor extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    role: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func, // (node, key, value, {force: true})
    onDelete: PropTypes.func // (parentNode, parentKey[, value])
  };

  static defaultProps = {
    role: {},
    onCreate: noop,
    onUpdate: noop,
    onDelete: noop
  };

  // overwrite onUpdate for the transition Person -> Organization so that roleAffiliation is deleted
  handleUpdate = (node, key, value, opts) => {
    const { role, onUpdate, onDelete } = this.props;
    onUpdate(node, key, value, opts);
    if (opts && opts.force && key === '@type' && value === 'Organization') {
      // need to delete the roleAffiliation property of the Role
      onDelete(role, 'roleAffiliation');
    }
  };

  render() {
    const { id, className, role, ...others } = this.props;
    if (typeof role === 'string') return null;

    const agent = getAgent(role) || {};
    const isPerson = schema.is(agent, 'Person');

    return (
      <div id={id} className={classNames('contributor-role-editor', className)}>
        <Stepper>
          <StepperItem
            icon={isPerson ? 'person' : 'locationCity'}
            title={isPerson ? 'Person information' : 'Organization information'}
          >
            <PersonOrOrganizationEditor
              {...others}
              onUpdate={this.handleUpdate}
              node={agent}
            />
          </StepperItem>
          {isPerson && (
            <StepperItem icon="locationCity" title="Affiliations">
              <AffiliationListEditor {...others} role={role} />
            </StepperItem>
          )}
          <StepperItem icon="email" title="Contact information">
            <ContactPointFormFragment
              {...others}
              name="roleContactPoint"
              parentNode={role}
              node={arrayify(role.roleContactPoint)[0]}
            />
          </StepperItem>
        </Stepper>
      </div>
    );
  }
}

class AffiliationListEditor extends React.Component {
  static propTypes = {
    role: PropTypes.object,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onCreate: PropTypes.func, // (parentNode, parentKey, value)
    onUpdate: PropTypes.func, // (node, key, value, {force: true})
    onDelete: PropTypes.func // (parentNode, parentKey, value)
  };

  static defaultProps = {
    role: {},
    onCreate: noop,
    onUpdate: noop,
    onDelete: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      items: arrayify(props.role.roleAffiliation).slice(),
      activeId: null // getId(arrayify(props.role.roleAffiliation)[0]) Note: uncomment to start open
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      getId(nextProps.role) !== getId(this.props.role) &&
      getId(nextProps.role) !== this.state.activeId
    ) {
      this.setState({
        activeId: null
      });
    }

    if (nextProps.role !== this.props.role) {
      this.setState({
        items: arrayify(nextProps.role.roleAffiliation).slice()
      });
    }
  }

  handleClickEdit(affiliationId) {
    // toggle
    this.setState({
      activeId: affiliationId
    });
  }

  handleClickDelete(affiliation) {
    const { role } = this.props;
    const { activeId } = this.state;

    this.props.onDelete(role, 'roleAffiliation', affiliation);
    if (getId(affiliation) === activeId) {
      this.setState({ activeId: null });
    }
  }

  handleClose() {
    this.setState({ activeId: null });
  }

  handleAdd() {
    const { role } = this.props;
    const newNode = {
      '@id': createId('blank')['@id'],
      '@type': 'Organization'
    };
    this.props.onCreate(role, 'roleAffiliation', newNode);
    this.setState({ activeId: getId(newNode) });
  }

  handleOrder(sourceId, targetId, dropped) {
    const { role } = this.props;
    const { items } = this.state;
    const nextItems = items.slice();

    const index = items.findIndex(item => getId(item) === sourceId);
    const hoveredIndex = items.findIndex(item => getId(item) === targetId);

    const item = nextItems[index];
    const hovered = nextItems[hoveredIndex];

    nextItems[index] = hovered;
    nextItems[hoveredIndex] = item;

    this.setState({ items: nextItems });

    if (dropped) {
      this.props.onUpdate(
        role,
        'roleAffiliation',
        nextItems.map(getId).filter(Boolean)
      );
    }
  }

  render() {
    const { role, readOnly, disabled, ...others } = this.props;
    const { activeId, items } = this.state;
    const affiliation = arrayify(role.roleAffiliation).find(
      affiliation => getId(affiliation) === activeId
    );

    return (
      <div className="affiliation-list-editor">
        <ol className="sa__clear-list-styles">
          {items.map(affiliation => (
            <AffiliationListItem
              key={getId(affiliation)}
              {...others}
              readOnly={readOnly}
              disabled={disabled}
              node={affiliation}
              onOrder={this.handleOrder}
              onClickDelete={this.handleClickDelete.bind(this, affiliation)}
              onClickEdit={this.handleClickEdit.bind(this, getId(affiliation))}
              isEdited={activeId === getId(affiliation)}
            />
          ))}
        </ol>

        {!readOnly && (
          <div className="affiliation-list-editor__controls">
            <PaperActionButton
              iconName="add"
              disabled={disabled}
              large={false}
              onClick={this.handleAdd}
            />
          </div>
        )}

        {affiliation && (
          <div>
            <Divider marginTop={20} marginBottom={20} type="major" />

            <div className="affiliation-list-editor__editor">
              <OrganizationEditor
                {...others}
                role={role}
                readOnly={readOnly}
                disabled={disabled}
                node={affiliation}
                onClose={this.handleClose}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

class _AffiliationListItem extends React.Component {
  static propTypes = {
    onOrder: PropTypes.func.isRequired,
    onClickDelete: PropTypes.func.isRequired,
    onClickEdit: PropTypes.func.isRequired,
    isEdited: PropTypes.bool,
    node: PropTypes.object,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,

    connectDragSource: PropTypes.any.isRequired,
    connectDropTarget: PropTypes.any.isRequired,
    isDragging: PropTypes.bool,
    canDrop: PropTypes.bool,
    isOver: PropTypes.bool
  };

  static defaultProps = {
    isEdited: false,
    node: {}
  };

  render() {
    const {
      node,
      readOnly,
      disabled,
      isEdited,
      onClickEdit,
      onClickDelete,
      isOver,
      canDrop,
      isDragging,
      connectDragSource,
      connectDropTarget
    } = this.props;

    return connectDragSource(
      connectDropTarget(
        <li
          className={classNames('affiliation-list-item', {
            sa__draggable: true,
            'sa__draggable--dnd-is-over': isOver,
            'sa__draggable--dnd-can-drop': canDrop,
            'sa__draggable--dnd-is-dragging': isDragging,
            'affiliation-list-item--active': isEdited
          })}
        >
          <AutoAbridge ellipsis={true}>
            <a
              href="#"
              onClick={onClickEdit}
              className="affiliation-list-item__org-name"
            >
              <RdfaOrganization object={node} link={false}>
                Untitled organization
              </RdfaOrganization>
            </a>
          </AutoAbridge>

          {!readOnly && (
            <div className="affiliation-list-item__controls">
              <Iconoclass
                iconName="pencil"
                behavior="button"
                disabled={disabled}
                round={isEdited}
                onClick={onClickEdit}
                className={classNames(
                  'affiliation-list-item__controls__edit-icon',
                  {
                    'affiliation-list-item__controls__edit-icon--active': isEdited
                  }
                )}
              />
              <Iconoclass
                iconName="trash"
                behavior="button"
                onClick={onClickDelete}
                className="affiliation-list-item__controls__delete-icon"
              />
              <Iconoclass
                iconName="reorder"
                behavior="button"
                disabled={disabled}
              />
            </div>
          )}
        </li>
      )
    );
  }
}

var AffiliationListItem = DragSource(
  'AffiliationListItem',
  {
    beginDrag(props) {
      return {
        id: getId(props.node)
      };
    },
    canDrag(props, monitor) {
      return !props.readOnly && !props.disabled;
    }
  },
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })
)(
  DropTarget(
    'AffiliationListItem',
    {
      drop(props, monitor, component) {
        props.onOrder(monitor.getItem().id, getId(props.node), true);
      },
      hover(props, monitor, component) {
        if (monitor.canDrop()) {
          // Determine rectangle on screen
          const hoverBoundingRect = findDOMNode(
            component
          ).getBoundingClientRect();

          // Get vertical middle
          const hoverMiddleY =
            (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          // Determine mouse position
          const clientOffset = monitor.getClientOffset();
          // Get pixels to the top
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;

          // Only perform the move when the mouse has crossed half of the items height
          // When dragging downwards, only move when the cursor is below 50%
          // When dragging upwards, only move when the cursor is above 50%
          const delta = monitor.getDifferenceFromInitialOffset();

          if (
            (delta.y < 0 && hoverClientY > hoverMiddleY) || // Dragging upwards
            (delta.y > 0 && hoverClientY < hoverMiddleY) // Dragging downwards
          ) {
            return;
          }

          props.onOrder(monitor.getItem().id, getId(props.node));
        }
      },
      canDrop(props, monitor) {
        return !props.readOnly && !props.disabled;
      }
    },
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  )(_AffiliationListItem)
);
