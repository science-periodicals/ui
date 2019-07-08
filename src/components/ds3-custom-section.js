import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import classNames from 'classnames';
import { getId, arrayify } from '@scipe/jsonld';
import CaptureSubmit from 'capture-submit';
import PaperInput from './paper-input';
import PaperSelect from './paper-select';
import RichTextarea from './rich-textarea/rich-textarea';

const ControledPaperInput = CaptureSubmit(PaperInput);

class Ds3CustomSection extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleChange(e) {
    const { section } = this.props;
    this.props.onChange(
      Object.assign({}, section, {
        [e.target.name]: e.target.value
      })
    );
  }

  handleDelete(e) {
    this.props.onDelete(getId(this.props.section));
  }

  render() {
    const {
      readOnly,
      disabled,
      section,
      sections,
      options,
      children,
      level,
      connectDragSource,
      connectDropTarget
    } = this.props;

    const blacklist = sections
      .map(section => arrayify(section.isBasedOn)[0])
      .filter(uri => uri)
      .reduce((s, uri) => {
        s.add(uri);
        return s;
      }, new Set());

    const uri = arrayify(section.isBasedOn)[0];
    if (uri) {
      blacklist.delete(uri);
    }

    return connectDragSource(
      connectDropTarget(
        <div
          className={classNames('ds3-custom-section', {
            'ds3-custom-section--dnd-is-over': this.props.isOver,
            'ds3-custom-section--dnd-can-drop': this.props.canDrop,
            'ds3-custom-section--dnd-dragging': this.props.isDragging
          })}
          tabIndex="0"
        >
          <div className="ds3-custom-section__controls">
            <h2 className="ds3-custom-section__title">
              {section.name || `${level > 0 ? 'Sub-s' : 'S'}ection`}
            </h2>
            {!readOnly && (
              <div className="ds3-custom-section__controls-buttons">
                <Iconoclass
                  className="ds3-custom-section__delete"
                  iconName="trash"
                  behavior="button"
                  disabled={disabled}
                  onClick={this.handleDelete}
                />
                <Iconoclass
                  className="ds3-custom-section__drag"
                  iconName="reorder"
                  disabled={disabled}
                  behavior="button"
                />
              </div>
            )}
          </div>
          <div className="ds3-custom-section__body">
            <ControledPaperInput
              name="name"
              label={`${level > 0 ? 'Sub-s' : 'S'}ection title`}
              large={level === 0}
              value={section.name || ''}
              readOnly={readOnly}
              disabled={disabled}
              onSubmit={this.handleChange}
            />

            {level === 0 && (
              <PaperSelect
                label="Semantic"
                name="isBasedOn"
                readOnly={readOnly}
                disabled={disabled}
                value={arrayify(section.isBasedOn)[0] || 'tmp:null'}
                onChange={this.handleChange}
              >
                <option value="tmp:null">N/A</option>
                {options
                  .filter(opt => !blacklist.has(opt.value))
                  .map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.name}
                    </option>
                  ))}
              </PaperSelect>
            )}

            <RichTextarea
              name="description"
              label="Description"
              readOnly={readOnly}
              disabled={disabled}
              defaultValue={section.description}
              onSubmit={this.handleChange}
            />
          </div>

          {children}
        </div>
      )
    );
  }
}

Ds3CustomSection.defaultProps = {
  options: [
    {
      value: 'ds3:AuthorsContributorsAndAffiliations',
      name: 'Author list and affiliations'
    },
    { value: 'ds3:Abstract', name: 'Abstract' },
    { value: 'ds3:ImpactStatement', name: 'Impact statement' },
    { value: 'ds3:Keywords', name: 'Keywords' },
    { value: 'ds3:License', name: 'License' },
    { value: 'ds3:Copyright', name: 'Copyright' },
    { value: 'ds3:Abbreviations', name: 'Abbreviations' },
    { value: 'ds3:Funding', name: 'Funding' },
    { value: 'ds3:Disclosure', name: 'Disclosure' },
    { value: 'ds3:Acknowledgements', name: 'Acknowledgements' },
    { value: 'ds3:SupportingInformation', name: 'Supporting Information' },
    { value: 'ds3:Citations', name: 'Citations' }
  ],
  onChange: noop,
  onDelete: noop,
  onOrder: noop
};

Ds3CustomSection.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object),
  connectDragSource: PropTypes.any.isRequired,
  connectDropTarget: PropTypes.any.isRequired,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  onOrder: PropTypes.func,
  section: PropTypes.object.isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  level: PropTypes.number.isRequired,
  children: PropTypes.any,
  isDragging: PropTypes.bool,
  canDrop: PropTypes.bool,
  isOver: PropTypes.bool,
  isShallowOver: PropTypes.bool
};

export default DragSource(
  'Ds3CustomSection',
  {
    beginDrag(props) {
      return {
        id: getId(props.section),
        level: props.level
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
    'Ds3CustomSection',
    {
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

          props.onOrder(monitor.getItem().id, getId(props.section));
        }
      },
      canDrop(props, monitor) {
        const item = monitor.getItem();
        return (
          !props.readOnly &&
          !props.disabled &&
          getId(props.section) !== item.id &&
          props.level === item.level
        );
      }
    },
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isShallowOver: monitor.isOver({ shallow: true })
    })
  )(Ds3CustomSection)
);
