import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import Iconoclass from '@scipe/iconoclass';
import ReactPortal from './react-portal';
import classNames from 'classnames';
import noop from 'lodash/noop';

class PaperSelect extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    portal: PropTypes.bool,
    children: PropTypes.node,
    id: PropTypes.string,
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    floatLabel: PropTypes.bool,
    large: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    name: PropTypes.string
  };

  static defaultProps = {
    readOnly: false,
    required: false,
    portal: false,
    floatLabel: true,
    large: false,
    disabled: false,
    multiple: false,
    name: 'PaperSelect'
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedIndexes: getSelectedIndexes(props),
      selectedKeyHover: undefined,
      selectOpen: false,
      lastCount: React.Children.count(props.children),
      lastValue: props.value,
      lastDefaultValue: props.defaultValue
    };

    this.controlRef = React.createRef();
    this.selectRef = React.createRef();

    this.handleEscKey = this.handleEscKey.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleEscKey, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEscKey, false);
  }

  static getDerivedStateFromProps(props, state) {
    const nextState = {};

    const nextCount = React.Children.count(props.children);
    if (state.lastCount !== nextCount) {
      nextState.lastCount = nextCount;
      nextState.selectedIndexes = getSelectedIndexes(props);
    }

    if (props.value) {
      if (props.value !== state.lastValue) {
        nextState.lastValue = props.value;
        nextState.selectedIndexes = getSelectedIndexes(props);
      }
    } else if (props.defaultValue) {
      if (props.defaultValue !== state.defaultValue) {
        nextState.lastDefaultValue = props.defaultValue;
        nextState.selectedIndexes = getSelectedIndexes(props);
      }
    }

    if (Object.keys(nextState).length) {
      return nextState;
    }
    return null;
  }

  handleClickOutside() {
    if (this.state.selectOpen) {
      this.setState({
        selectOpen: false
      });
    }
  }

  handleKeyPress(e) {
    let index =
      this.state.selectedKeyHover === undefined
        ? -1
        : this.state.selectedKeyHover;
    let hoveredIndex = index;

    // console.log('handleKeyPress', e.key, index);

    if (e.key === 'Enter' || e.keyCode === 32) {
      if (this.state.selectOpen && index >= 0) {
        this.handleSelectOption(index);
      } else {
        this.setState({
          selectedKeyHover:
            this.state.selectedIndexes.length > 0
              ? this.state.selectedIndexes[0]
              : 0,
          selectOpen: true
        });

        this.controlRef.current.focus();
      }
      e.preventDefault();
      return;
    }

    if (this.state.selectOpen) {
      if (e.key === 'Tab') {
        this.setState({
          selectOpen: false
        });
        return;
      }
      if (e.key === 'ArrowUp' && index > 0) {
        hoveredIndex = index - 1;
        e.preventDefault();
      } else if (
        e.key === 'ArrowDown' &&
        index < React.Children.count(this.props.children) - 1
      ) {
        hoveredIndex = index + 1;
        e.preventDefault();
      }
      if (this.state.selectedKeyHover !== hoveredIndex) {
        this.setState({ selectedKeyHover: hoveredIndex });
      }
    }
  }

  handleEscKey(e) {
    if (this.state.selectOpen && e.keyCode === 27) {
      this.setState({
        selectOpen: false
      });
    }
  }

  toggleDropdown(e) {
    e.stopPropagation();
    if (this.props.disabled === true) return;
    if (this.state.selectOpen == false) {
      //this.selectRef.current.focus();
    }
    this.setState({
      selectOpen: !this.state.selectOpen
    });
  }

  handleSelectOption(index, value = undefined) {
    this.controlRef.current.focus();
    let selectedIndexes = this.state.selectedIndexes.slice();
    const indexPos = selectedIndexes.indexOf(index);

    // toggle option select state. if index already exists in selectedIndexs, remove it.
    const previousOptionSelectState = indexPos === -1 ? false : true;
    if (previousOptionSelectState) {
      if (this.props.multiple) {
        selectedIndexes.splice(indexPos, 1);
      }
    } else {
      if (this.props.multiple) {
        selectedIndexes.push(index);
      } else {
        selectedIndexes = [index];
      }
    }

    /*
       selectedOptions would normally contain an htmlCollection object with each
       option child that is selected. Here we emulate that
     */
    const selectedOptions = React.Children.toArray(this.props.children)
      .filter((child, i) => {
        if (i === index && !previousOptionSelectState) {
          return true;
        } else if (child.props.selected) {
          return true;
        }
        return false;
      })
      .map(child => {
        return {
          label: child.props.children,
          value: child.props.value
        };
      });

    if (selectedOptions.length > 0 && value === undefined) {
      value = selectedOptions[0].value;
    }

    const target = {
      value: value,
      name: this.props.name,
      /* target selectedIndex should be the first selected index */
      selectedIndex: selectedIndexes.sort()[0],
      selectedOptions: selectedOptions
    };
    const e = {
      preventDefault: noop,
      target,
      nativeEvent: { target }
    };

    if (this.props.onChange) {
      this.props.onChange(e);
    }

    this.setState({
      selectOpen: false,
      selectedIndexes,
      selectedKeyHover: selectedIndexes.length > 0 ? selectedIndexes[0] : 0
    });
  }

  render() {
    let displayedValue = [];

    const {
      id,
      className,
      readOnly: _readOnly,
      children,
      floatLabel,
      large,
      disabled,
      required,
      label,
      portal
    } = this.props;

    const { selectedIndexes, selectOpen, selectedKeyHover } = this.state;
    const readOnly = _readOnly || React.Children.count(children) === 1;

    const selectionIndex =
      selectedIndexes.length > 0 ? selectedIndexes.sort()[0] : 0;
    const yOffset = (selectionIndex + 1) * -32;

    let displayOptionChildren = (
      <ul
        className="paper-select__display-option-list"
        style={{
          marginTop: yOffset,
          visibility: selectOpen ? 'visible' : 'hidden' // Note: use `visibility` here to force the collapsed menu to stretch to width of longest dropdown item
        }}
      >
        {React.Children.map(children, (child, j) => {
          const isSelected = selectedIndexes.includes(j);
          if (isSelected) {
            displayedValue.push(child && child.props && child.props.children);
          }

          const isKeyHovered = selectedKeyHover === j;

          return (
            <Option
              onClick={() =>
                this.handleSelectOption(
                  j,
                  child && child.props && child.props.value
                )
              }
              value={child && child.props && child.props.value}
              selected={isSelected}
              keyHovered={isKeyHovered}
            >
              {child && child.props && child.props.children}
            </Option>
          );
        })}
      </ul>
    );

    return (
      <div
        id={id}
        className={`paper-select
          ${className ? className : ''}
          ${selectOpen ? 'paper-select--open' : 'paper-select--closed'}
          ${readOnly ? 'paper-select--read-only' : 'paper-select--selectable'}
          ${
            floatLabel
              ? 'paper-select--float-label'
              : 'paper-select--no-float-label'
          }
          ${large ? 'paper-select--large' : 'paper-select--small'}
          ${
            displayedValue.length > 0
              ? 'paper-select--has-value'
              : 'paper-select--no-value'
          }
          ${disabled ? 'paper-select--disabled' : ''}
          ${required && !selectedIndexes.length ? 'paper-select--required' : ''}
        `}
      >
        <div
          className="paper-select__control"
          tabIndex={disabled || readOnly ? -1 : 0}
          onClick={e => this.toggleDropdown(e)}
          onKeyDown={e =>
            this.handleKeyPress(e)
          } /* note: must use keyDown to capture arrow keys */
          ref={this.controlRef}
        >
          <div className="paper-select__display-text">
            <span className="paper-select__label">{label}</span>
            <span className="paper-select__value">
              {displayedValue.length > 0 ? displayedValue.join(', ') : ''}
            </span>
          </div>
          <div className="paper-select__icon">
            <Iconoclass iconName="dropdown" />
          </div>
          <div className="paper-select__focus-line" />
        </div>
        {!readOnly && portal && selectOpen && (
          <ReactPortal
            portalClass="ignore-react-onclickoutside paper-select-portal"
            widthSource="biggest"
          >
            {displayOptionChildren}
          </ReactPortal>
        )}
        {!readOnly && !portal && <Fragment>{displayOptionChildren}</Fragment>}
      </div>
    );
  }
}

export default onClickOutside(PaperSelect);

class Option extends React.PureComponent {
  static propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    selected: PropTypes.bool,
    keyHovered: PropTypes.bool,
    children: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.optionRef = React.createRef();
  }

  getValue() {
    return this.props.value;
  }

  handleKeyDown(e) {
    console.log('Option key down', e);
  }

  componentDidMount(lastProps) {
    if (this.props.selected) {
      //this.optionRef.current.focus();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.keyHovered) {
      //this.optionRef.current.focus();
    }
  }

  render() {
    return (
      <li
        className={classNames('paper-select__display-option', {
          'paper-select__display-option--selected': this.props.selected,
          'paper-select__display-option--hovered': this.props.keyHovered
        })}
        onClick={this.props.onClick}
        /*onKeyDown={this.props.onKeyDown}*/
        ref={this.optionRef}
      >
        <Iconoclass
          iconName={this.props.selected ? 'check' : 'none'}
          className="paper-select__display-option__icon"
          size="18px"
        />
        {this.props.children}
      </li>
    );
  }
}

function getSelectedIndexes({ value, defaultValue, children, multiple } = {}) {
  const selectedIndexes = [];
  React.Children.forEach(children, (child, i) => {
    if (
      (!multiple &&
        value &&
        child &&
        child.props &&
        child.props.value === value) ||
      (multiple && child && child.props && child.props.selected)
    ) {
      selectedIndexes.push(i);
    }
  });

  return selectedIndexes;
}
