import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import flatten from 'lodash/flatten';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import classNames from 'classnames';
import { getId, arrayify } from '@scipe/jsonld';
import withOnSubmit from '../hoc/with-on-submit';
import PaperInput from './paper-input';
import PaperSelect from './paper-select';
import RichTextarea from './rich-textarea/rich-textarea';

const ControledPaperInput = withOnSubmit(PaperInput);

class PublicationElementTypeEditor extends React.Component {
  static propTypes = {
    nodeMap: PropTypes.object.isRequired,
    webPageElementId: PropTypes.string.isRequired,
    webPageElementIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    options: PropTypes.arrayOf(PropTypes.object),
    connectDragSource: PropTypes.any.isRequired,
    connectDropTarget: PropTypes.any.isRequired,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    onDelete: PropTypes.func,
    onOrder: PropTypes.func,
    isDragging: PropTypes.bool,
    canDrop: PropTypes.bool,
    isOver: PropTypes.bool,
    isShallowOver: PropTypes.bool
  };

  static defaultProps = {
    // !! keep in sync with `@scipe/ontology`
    // TODO use ontology directly ?
    options: [
      {
        name: 'Abstract',
        value: 'WPAbstract'
      },

      {
        name: 'Impact Statement',
        value: 'WPImpactStatement'
      },

      {
        name: 'Keywords',
        value: 'WPKeywords'
      },

      {
        name: 'Introduction',
        value: 'WPIntroduction'
      },

      {
        name: 'Materials And Methods',
        value: 'WPMaterialsAndMethods'
      },

      {
        name: 'Results',
        value: 'WPResults'
      },

      {
        name: 'Discussion',
        value: 'WPDiscussion'
      },

      {
        name: 'Conclusion',
        value: 'WPConclusion'
      },

      {
        name: 'Acknowledgements',
        value: 'WPAcknowledgements'
      },

      {
        name: 'Funding',
        value: 'WPFunding'
      },
      {
        name: 'Disclosure',
        value: 'WPDisclosure'
      },

      {
        name: 'Supporting Information',
        value: 'WPSupportingInformation'
      },

      {
        name: 'Reference List',
        value: 'WPReferenceList'
      }
    ],
    onChange: noop,
    onDelete: noop,
    onOrder: noop
  };

  handleChange = e => {
    const { nodeMap, webPageElementId } = this.props;

    const webPageElement = nodeMap[webPageElementId];
    const publicationElementType =
      nodeMap[webPageElement && webPageElement.additionalType];

    this.props.onChange(
      Object.assign({}, publicationElementType, {
        [e.target.name]: e.target.value
      })
    );
  };

  handleDelete = e => {
    const { webPageElementId } = this.props;

    this.props.onDelete(webPageElementId);
  };

  render() {
    const {
      readOnly,
      disabled,
      nodeMap,
      webPageElementId,
      webPageElementIds,
      options,
      connectDragSource,
      connectDropTarget
    } = this.props;

    const webPageElement = nodeMap[webPageElementId];
    const publicationElementType =
      nodeMap[webPageElement && webPageElement.additionalType] || {};

    const blacklist = new Set(
      flatten(
        arrayify(webPageElementIds).map(id => {
          const webPageElement = nodeMap[id];
          if (webPageElement) {
            const type = nodeMap[getId(webPageElement.additionalType)];
            if (type) {
              return arrayify(type.sameAs).filter(
                id =>
                  !arrayify(publicationElementType.sameAs).some(
                    sameAs => sameAs === id
                  )
              );
            }
          }
        })
      ).filter(Boolean)
    );

    return connectDragSource(
      connectDropTarget(
        <div
          className={classNames('publication-element-type-editor', {
            'publication-element-type-editor--dnd-is-over': this.props.isOver,
            'publication-element-type-editor--dnd-can-drop': this.props.canDrop,
            'publication-element-type-editor--dnd-dragging': this.props
              .isDragging
          })}
          tabIndex="0"
        >
          <div className="publication-element-type-editor__controls">
            <h2 className="publication-element-type-editor__title">
              {publicationElementType.name || 'Section'}
            </h2>
            {!readOnly && (
              <div className="publication-element-type-editor__controls-buttons">
                <Iconoclass
                  className="publication-element-type-editor__delete"
                  iconName="trash"
                  behavior="button"
                  disabled={disabled}
                  onClick={this.handleDelete}
                />
                <Iconoclass
                  className="publication-element-type-editor__drag"
                  iconName="reorder"
                  disabled={disabled}
                  behavior="button"
                />
              </div>
            )}
          </div>
          <div className="publication-element-type-editor__body">
            <ControledPaperInput
              name="name"
              label={'Section title'}
              large={true}
              value={publicationElementType.name || ''}
              readOnly={readOnly}
              disabled={disabled}
              onSubmit={this.handleChange}
            />

            <PaperSelect
              label="Semantic"
              name="sameAs"
              readOnly={readOnly}
              disabled={disabled}
              value={
                arrayify(publicationElementType.sameAs)[0] || 'WPUnspecified'
              }
              onChange={this.handleChange}
            >
              <option value="WPUnspecified">N/A</option>
              {options
                .filter(opt => !blacklist.has(opt.value))
                .map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.name}
                  </option>
                ))}
            </PaperSelect>

            <RichTextarea
              name="description"
              label="Description"
              schema="free"
              readOnly={readOnly}
              disabled={disabled}
              defaultValue={publicationElementType.description}
              onSubmit={this.handleChange}
            />
          </div>
        </div>
      )
    );
  }
}

export default DragSource(
  'PublicationElementTypeEditor',
  {
    beginDrag(props) {
      return {
        id: props.webPageElementId
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
    'PublicationElementTypeEditor',
    {
      drop(props, monitor, component) {
        props.onOrder(monitor.getItem().id, props.webPageElementId, true);
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

          props.onOrder(monitor.getItem().id, props.webPageElementId, false);
        }
      },
      canDrop(props, monitor) {
        return !props.readOnly && !props.disabled;
      }
    },
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isShallowOver: monitor.isOver({ shallow: true })
    })
  )(PublicationElementTypeEditor)
);
