/* eslint react/display-name: 0 */
// Adapted from https://github.com/reactjs/react-autocomplete

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import scrollIntoView from 'dom-scroll-into-view';
import classNames from 'classnames';
import PaperInput from './paper-input';

// TODO allow this component to be controlled and remove reset and similar hacks...

export default class PaperAutocomplete extends Component {
  static propTypes = {
    defaultValue: PropTypes.any,
    items: PropTypes.array,
    id: PropTypes.string,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onSubmit: PropTypes.func,
    shouldItemRender: PropTypes.func,
    validator: PropTypes.func,
    renderItem: PropTypes.func.isRequired,
    menuStyle: PropTypes.object,
    inputProps: PropTypes.object,
    allowUnlistedInput: PropTypes.bool.isRequired,
    submitOnBlur: PropTypes.bool,
    error: PropTypes.string,
    className: PropTypes.string,
    navRight: PropTypes.func,
    navLeft: PropTypes.func,
    customAutocomplete: PropTypes.bool,
    floatLabel: PropTypes.bool,
    getItemValue: PropTypes.func.isRequired,
    sortItems: PropTypes.func,
    renderMenu: PropTypes.func
  };

  static defaultProps = {
    inputProps: {},
    onChange() {},
    onSelect(value, item) {},
    onSubmit(value) {},
    renderMenu: function(items, value, style) {
      return <div style={Object.assign({}, style, this.menuStyle)}>items</div>;
    },
    shouldItemRender() {
      return true;
    },
    validator(filteredItems, props, state) {
      return filteredItems.some(item => {
        const itemValue = props.getItemValue(item);
        return itemValue.toLowerCase().indexOf(state.value.toLowerCase()) === 0;
      });
    },
    allowUnlistedInput: false,
    floatLabel: true,
    menuStyle: {
      borderRadius: '3px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '2px 0',
      fontSize: '90%',
      position: 'fixed',
      overflow: 'auto',
      maxHeight: '50%' // TODO: don't cheat, let it flow to the bottom
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.defaultValue || '',
      isOpen: false,
      highlightedIndex: null
    };
  }

  componentWillMount() {
    this._ignoreBlur = false;
    this._performAutoCompleteOnUpdate = false;
    this._performAutoCompleteOnKeyUp = false;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.customAutocomplete) {
      this._performAutoCompleteOnUpdate = true;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.isOpen === true && prevState.isOpen === false)
      this.setMenuPositions();

    if (this.state.isOpen && this._performAutoCompleteOnUpdate) {
      this._performAutoCompleteOnUpdate = false;
      this.maybeAutoCompleteText();
    }

    this.maybeScrollItemIntoView();
  }

  focus() {
    this.paperInput.focus();
  }

  blur() {
    this.paperInput.blur();
  }

  maybeScrollItemIntoView() {
    if (this.state.isOpen === true && this.state.highlightedIndex !== null) {
      const itemNode = this.refs[`item-${this.state.highlightedIndex}`];
      const menuNode = this.refs.menu;

      if (itemNode && menuNode) {
        scrollIntoView(itemNode, menuNode, { onlyScrollIfNeeded: true });
      }
    }
  }

  handleKeyDown(e) {
    if (this.props.inputProps.readOnly) return;
    if (keyDownHandlers[e.key]) {
      keyDownHandlers[e.key].call(this, e);
    } else {
      this.setState({
        highlightedIndex: null,
        isOpen: true
      });
    }
  }

  handleChange(e) {
    e.persist();
    if (!this.props.customAutocomplete) {
      this._performAutoCompleteOnKeyUp = true;
    }
    this.setState(
      {
        value: e.target.value
      },
      () => {
        const items = this.getFilteredItems();
        const itemValueDoesMatch = this.props.validator(
          items,
          this.props,
          this.state
        );
        this.props.onChange(e, this.state.value, itemValueDoesMatch);
      }
    );
  }

  handleKeyUp(e) {
    if (this._performAutoCompleteOnKeyUp) {
      this._performAutoCompleteOnKeyUp = false;
      this.maybeAutoCompleteText();
    }
  }

  getFilteredItems() {
    let { items } = this.props;
    if (this.props.shouldItemRender) {
      items = items.filter(item =>
        this.props.shouldItemRender(item, this.state.value)
      );
    }

    if (this.props.sortItems) {
      items.sort((a, b) => this.props.sortItems(a, b, this.state.value));
    }
    return items;
  }

  maybeAutoCompleteText() {
    if (this.state.value === '') return;
    var { highlightedIndex } = this.state;
    var items = this.getFilteredItems();
    if (items.length === 0) return;

    var matchedItem =
      highlightedIndex !== null ? items[highlightedIndex] : items[0];

    var itemValue = this.props.getItemValue(matchedItem);
    var itemValueDoesMatch =
      itemValue.toLowerCase().indexOf(this.state.value.toLowerCase()) === 0;

    if (itemValueDoesMatch) {
      var node = findDOMNode(this.paperInput).querySelector('input');
      var setSelection = () => {
        node.value = itemValue;
        node.setSelectionRange(this.state.value.length, itemValue.length);
      };
      if (highlightedIndex === null) {
        this.setState({ highlightedIndex: 0 }, setSelection);
      } else {
        setSelection();
      }
    }
  }

  setMenuPositions() {
    const node = findDOMNode(this.paperInput).querySelector('input');
    const rect = node.getBoundingClientRect();
    const computedStyle = getComputedStyle(node);
    const marginBottom = parseInt(computedStyle.marginBottom, 10) || 0;
    const marginLeft = parseInt(computedStyle.marginLeft, 10) || 0;
    const marginRight = parseInt(computedStyle.marginRight, 10) || 0;
    this.setState({
      menuTop: rect.bottom + marginBottom,
      menuLeft: rect.left + marginLeft,
      menuWidth: rect.width + marginLeft + marginRight
    });
  }

  highlightItemFromMouse(index) {
    this.setState({ highlightedIndex: index });
  }

  selectItemFromMouse(item) {
    this.setState(
      {
        value: this.props.getItemValue(item),
        isOpen: false,
        highlightedIndex: null
      },
      () => {
        this._itemWasSelected = true;
        this.props.onSelect(this.state.value, item);
        this.focus();
        this.setIgnoreBlur(false);
      }
    );
  }

  setIgnoreBlur(ignore) {
    this._ignoreBlur = ignore;
  }

  renderMenu() {
    const items = this.getFilteredItems();

    const elements = items.map((item, index) => {
      var element = this.props.renderItem(
        item,
        this.state.highlightedIndex === index,
        { cursor: 'default' }
      );
      return React.cloneElement(element, {
        onMouseDown: () => this.setIgnoreBlur(true),
        onMouseEnter: () => this.highlightItemFromMouse(index),
        onClick: () => this.selectItemFromMouse(item),
        ref: `item-${index}`
      });
    });

    const style = {
      left: this.state.menuLeft,
      top: this.state.menuTop,
      minWidth: this.state.menuWidth
    };

    const menu = this.props.renderMenu(
      elements,
      this.state.value,
      style,
      items
    );
    return React.cloneElement(menu, {
      ref: 'menu'
    });
  }

  handleInputBlur(e) {
    if (this._ignoreBlur) {
      return;
    }
    this.setState(
      {
        isOpen: false,
        highlightedIndex: null
      },
      () => {
        if (this.props.submitOnBlur) {
          // this is to avoid to have select and submit both called
          if (!this._enterWasPressed && !this._itemWasSelected) {
            this.props.onSubmit(
              this.state.value,
              this.getFilteredItems().find(
                item => this.props.getItemValue(item) === this.state.value
              )
            );
          } else {
            this._enterWasPressed = false;
            this._itemWasSelected = false;
          }
        }
      }
    );
  }

  handleInputFocus(e) {
    if (this.props.inputProps.readOnly || this._ignoreBlur) return;
    this.setState({ isOpen: true });
  }

  handleInputClick(e) {
    if (this.props.inputProps.readOnly) return;
    if (this.state.isOpen === false) {
      this.setState({ isOpen: true });
    }
  }

  setHighlightedIndex(highlightedIndex) {
    this.setState({ highlightedIndex });
  }

  getHighlightedIndex() {
    return this.state.highlightedIndex;
  }

  resetValue(value) {
    this.setState({ value: value || '' });
  }

  reset() {
    this.setState({ value: '' });
    this.blur();
    this.paperInput.cancel();
  }

  render() {
    return (
      <div
        className={classNames('paper-autocomplete', this.props.className)}
        id={this.props.id}
      >
        <PaperInput
          {...this.props.inputProps}
          role="combobox"
          aria-expanded={this.state.isOpen ? 'true' : 'false'}
          aria-autocomplete="both"
          autoComplete="off"
          ref={el => (this.paperInput = el)}
          onFocus={this.handleInputFocus.bind(this)}
          onBlur={this.handleInputBlur.bind(this)}
          onChange={this.handleChange.bind(this)}
          onKeyDown={this.handleKeyDown.bind(this)}
          onKeyUp={this.handleKeyUp.bind(this)}
          onClick={this.handleInputClick.bind(this)}
          value={this.state.value}
          floatLabel={this.props.floatLabel}
        />
        {this.state.isOpen && this.renderMenu()}
      </div>
    );
  }
}

const keyDownHandlers = {
  ArrowRight(e) {
    if (!this.props.navRight) return;
    e.preventDefault();
    this.props.navRight(
      this.state.highlightedIndex != null &&
        this.getFilteredItems()[this.state.highlightedIndex]
    );
  },

  ArrowLeft(e) {
    if (!this.props.navLeft) return;
    e.preventDefault();
    this.props.navLeft(
      this.state.highlightedIndex != null &&
        this.getFilteredItems()[this.state.highlightedIndex]
    );
  },

  ArrowDown(e) {
    e.preventDefault();
    const { highlightedIndex } = this.state;
    const index =
      highlightedIndex === null ||
      highlightedIndex === this.getFilteredItems().length - 1
        ? 0
        : highlightedIndex + 1;
    this._performAutoCompleteOnKeyUp = true;
    this.setState({
      highlightedIndex: index,
      isOpen: true
    });
  },

  ArrowUp(e) {
    e.preventDefault();
    var { highlightedIndex } = this.state;
    var index =
      highlightedIndex === 0 || highlightedIndex === null
        ? this.getFilteredItems().length - 1
        : highlightedIndex - 1;
    this._performAutoCompleteOnKeyUp = true;
    this.setState({
      highlightedIndex: index,
      isOpen: true
    });
  },

  Enter(e) {
    let value = e.target.value;
    e.preventDefault();
    if (this.state.isOpen === false) {
      // menu is closed so there is no selection to accept -> do nothing
      return;
    } else if (this.state.highlightedIndex == null) {
      // input has focus but no menu item is selected + enter is hit
      // -> close the menu, highlight whatever's in input
      this.setState(
        {
          isOpen: false
        },
        () => {
          if (this.props.allowUnlistedInput) {
            this.props.onSubmit(
              value,
              this.getFilteredItems().find(
                item => this.props.getItemValue(item) === value
              )
            );
          } else {
            findDOMNode(this.paperInput)
              .querySelector('input')
              .select();
          }
        }
      );
    } else {
      // text entered + menu item has been highlighted + enter is hit
      // -> update value to that of selected menu item, close the menu
      var item = this.getFilteredItems()[this.state.highlightedIndex];
      this.setState(
        {
          value: this.props.getItemValue(item),
          isOpen: false,
          highlightedIndex: null
        },
        () => {
          findDOMNode(this.paperInput)
            .querySelector('input')
            .setSelectionRange(
              this.state.value.length,
              this.state.value.length
            );
          this._enterWasPressed = true;
          this._itemWasSelected = true;
          this.props.onSelect(this.state.value, item);
        }
      );
    }
  },

  Escape(e) {
    this.setState({
      highlightedIndex: null,
      isOpen: false
    });
  }
};
