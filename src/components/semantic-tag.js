import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import Tooltip from './tooltip';
import SemanticTagsAutocomplete from './autocomplete/semantic-tags-autocomplete';

export default class SemanticTag extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false,
      buttonHover: 'none',
      addingSemanticTagId: null,
      displayAddTag: false
    };

    this.height = 0;

    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleMouseOverDeleteButton = this.handleMouseOverDeleteButton.bind(
      this
    );
    this.handleMouseOutButton = this.handleMouseOutButton.bind(this);
    this.handlePop = this.handlePop.bind(this);
    this.handleMouseOverPopButton = this.handleMouseOverPopButton.bind(this);
    this.handleMouseOutButton = this.handleMouseOutButton.bind(this);
    this.handleToggleAddTag = this.handleToggleAddTag.bind(this);
    this.handleMouseOverAddButton = this.handleMouseOverAddButton.bind(this);
    this.handleMouseOutButton = this.handleMouseOutButton.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (this.$root) {
      this.height = this.$root.offsetHeight;
      this.props.onResize(this.$root.offsetHeight, this.height);
      this.height = this.$root.offsetHeight;
    }
  }

  componentDidUpdate() {
    if (this.$root) {
      this.props.onResize(this.$root.offsetHeight, this.height);
      this.height = this.$root.offsetHeight;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.state.addingSemanticTagId &&
      this.state.addingSemanticTagId === nextProps.addedSemanticTagId
    ) {
      this.refs.autocomplete.reset();
      this.setState({
        addingSemanticTagId: null,
        displayAddTag: false
      });
    }
  }

  // TODO move higlighting logic one component higher so that
  // higlighting one tag also highlight the duplicated tags
  handleMouseOver(e) {
    this.setState({ hover: true });
    e.stopPropagation();
  }

  handleMouseOut(e) {
    this.setState({ hover: false });
    e.stopPropagation();
  }

  handleMouseOverAddButton(e) {
    const { readOnly, disabled } = this.props;
    if (!readOnly && !disabled) this.setState({ buttonHover: 'add' });
  }

  handleMouseOverPopButton(e) {
    const { readOnly, disabled } = this.props;
    if (!readOnly && !disabled) this.setState({ buttonHover: 'pop' });
  }

  handleMouseOverDeleteButton(e) {
    const { readOnly, disabled } = this.props;
    if (!readOnly && !disabled) this.setState({ buttonHover: 'remove' });
  }

  handleMouseOutButton(e) {
    this.setState({ buttonHover: 'none' });
  }

  handleToggleAddTag(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ displayAddTag: !this.state.displayAddTag }, () => {
      if (this.state.displayAddTag) {
        this.refs.autocomplete.focus();
      }
    });
  }

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    // TODO move that logic up and use the subtree instead of the react tree
    // Also be sure to only delete if no other occurence are present
    // in other part of the tree so that the `dedup` option can be
    // relaxed to false

    let semanticTagIds = [this.props.semanticTag['@id']];
    // recursively grab nested semanticTags from children
    (function getId(ctx) {
      if (ctx.props.children) {
        Children.forEach(ctx.props.children, child => {
          semanticTagIds.push(child.props.semanticTag['@id']);
          if (child.props.children) {
            getId(child);
          }
        });
      }
    })(this);

    this.props.onDelete(semanticTagIds);
  }

  handlePop(e) {
    e.preventDefault();
    e.stopPropagation();

    this.props.onDelete(this.props.semanticTag['@id']);
  }

  handleSubmit(tag) {
    // this is also called on blur, we use that to toggle close the add semantic tag option
    if (tag) {
      this.setState({
        addingSemanticTagId: tag['@id']
      });
      this.props.onSubmit(tag);
      // 'add tag control' will be closed when the component receive
      // write acknowledgement in componentWillReceiveProps
    } else {
      this.refs.autocomplete.reset();
      this.setState({
        displayAddTag: false
      });
    }
  }

  render() {
    const {
      readOnly,
      disabled,
      semanticTag,
      children,
      level,
      addingSemanticTagId,
      addedSemanticTagId,
      ontology
    } = this.props;
    const { buttonHover, hover, displayAddTag } = this.state;

    const justAdded = addedSemanticTagId === semanticTag['@id'];
    const isAdding = !!this.state.addingSemanticTagId;

    return (
      <div
        ref={el => {
          this.$root = el;
        }}
        className={classnames('semantic-tag', `semantic-tag--level-${level}`, {
          'semantic-tag__delete--hover': buttonHover === 'remove',
          'semantic-tag__pop--hover': buttonHover === 'pop',
          'semantic-tag--hover': hover,
          'semantic-tag--just-added': justAdded,
          'semantic-tag--add-tag-displayed': displayAddTag,
          'semantic-tag--has-children': children,
          'semantic-tag--read-only': readOnly,
          'semantic-tag--disabled': disabled
        })}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        <div className="semantic-tag__label no-select">
          <Tooltip
            wrap={true}
            className="semantic-tag__label-tooltip"
            displayText={
              semanticTag.description ||
              semanticTag.name ||
              semanticTag['@id'] ||
              ''
            }
          >
            <span className="semantic-tag__term">
              {semanticTag.name || semanticTag['@id']}
            </span>
          </Tooltip>
          <div className="semantic-tag__controls">
            {!readOnly && (
              <Iconoclass
                className={hover ? ' semantic-tag__delete--hover' : ''}
                behavior="button"
                disabled={disabled}
                elementType="button"
                iconName="delete"
                onClick={this.handleDelete}
                onMouseOver={this.handleMouseOverDeleteButton}
                onMouseOut={this.handleMouseOutButton}
              />
            )}
            {!readOnly &&
              children && (
                <Iconoclass
                  className={hover ? ' semantic-tag__pop--hover' : ''}
                  behavior="button"
                  disabled={disabled}
                  elementType="button"
                  iconName="pop"
                  onClick={this.handlePop}
                  onMouseOver={this.handleMouseOverPopButton}
                  onMouseOut={this.handleMouseOutButton}
                />
              )}
            {!readOnly &&
              addingSemanticTagId == null && (
                <Iconoclass
                  behavior="button"
                  elementType="button"
                  iconName="add"
                  disabled={disabled}
                  onClick={this.handleToggleAddTag}
                  onMouseOver={this.handleMouseOverAddButton}
                  onMouseOut={this.handleMouseOutButton}
                />
              )}
          </div>
        </div>
        <div className={children ? 'semantic-tag__children' : ''}>
          <div
            className={
              `semantic-tag__add semantic-tag__add--level-${level}` +
              (displayAddTag
                ? ' semantic-tag__add--displayed'
                : ' semantic-tag__add--hidden')
            }
            onFocus={e => e.stopPropagation()}
            onBlur={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          >
            <SemanticTagsAutocomplete
              ref="autocomplete"
              label="search"
              ontology={ontology}
              scope={semanticTag}
              blacklist={[semanticTag['@id']]}
              onSubmit={this.handleSubmit}
              readOnly={readOnly}
              disabled={disabled}
            />
            {isAdding ? (
              <div className="status__icon--24px icon--loading" />
            ) : null}
          </div>
          {children}
        </div>
      </div>
    );
  }
}

SemanticTag.defaultProps = {
  level: 0,
  onSubmit: noop,
  onDelete: noop,
  onResize: noop,
  readOnly: false
};

SemanticTag.propTypes = {
  ontology: PropTypes.string,
  semanticTag: PropTypes.object.isRequired,
  level: PropTypes.number,
  chidren: PropTypes.element,
  addingSemanticTagId: PropTypes.string,
  addedSemanticTagId: PropTypes.string,
  onSubmit: PropTypes.func,
  onDelete: PropTypes.func,
  onResize: PropTypes.func,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.any
};
