import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Value from '../value';
import { getValue } from '@scipe/jsonld';
import getCaretCoordinates from 'textarea-caret';
import RichTextareaPortal from './rich-textarea-portal';
import RichTextareaMenu from './rich-textarea-menu';
import { toMarkdown, toHtmlNode } from '../../utils/markdown-utils';

/**
 * Takes some HTML (or plain text) as `defaultValue` and allow the user to
 * edit it in markdow (on focus) and emit HTML (or plain text) back on blur
 */
export default class RichTextarea extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    defaultValue: PropTypes.oneOfType([
      PropTypes.string, // if string it must be not formated plain text (not an HTML string). For HTML used a typed node with `@type: rdf:HTML`
      PropTypes.shape({
        '@type': PropTypes.oneOf(['rdf:HTML']).isRequired,
        '@value': PropTypes.string.isRequired
      })
    ]),
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,

    // for mention autocomplete
    options: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        description: PropTypes.string,
        children: PropTypes.array,
        disabled: PropTypes.bool // if `disabled` is true we can't select that item
      })
    ),
    suggestionMapper: PropTypes.func,
    locationLinksType: PropTypes.oneOf(['shell', 'scroll']),

    onChange: PropTypes.func, // will be called with the markdown value
    onResize: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onSubmit: PropTypes.func // will be called with the HTML value
  };

  static defaultProps = {
    locationLinksType: 'shell',
    onChange: noop,
    onResize: noop,
    onBlur: noop,
    onFocus: noop,
    onSubmit: noop
  };

  static getDerivedStateFromProps(props, state) {
    if (
      props.defaultValue !== state.lastDefaultValue ||
      props.readOnly !== state.lastReadOnly // as an optimization we don't run `toMarkdown` in read only mode
    ) {
      return {
        value:
          !props.readOnly && state.isFocused
            ? toMarkdown(props.defaultValue)
            : '', // first markdown conversion is done on focus
        editedHtmlNode: null,
        selectedItemIndex: 0,
        prevActiveOptions: null,
        activeOptions: props.options,
        lastOptions: props.options,
        lastDefaultValue: props.defaultValue,
        lastReadOnly: props.readOnly
      };
    }

    if (props.options !== state.lastOptions) {
      return {
        selectedItemIndex: 0,
        lastOptions: props.options,
        prevActiveOptions: null,
        activeOptions: props.options
      };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.$textarea = React.createRef();

    this.state = {
      value: '', // first markdown conversion is done on focus
      editedHtmlNode: null,
      isFocused: false,
      lastDefaultValue: props.defaultValue,
      selectedItemIndex: 0,
      prevActiveOptions: null,
      activeOptions: props.options,
      lastOptions: props.options,
      lastReadOnly: props.readOnly,
      menuCoordinates: null
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalculateSize);
    this.height = this.recalculateSize();
  }

  componentDidUpdate() {
    this.height = this.recalculateSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateSize);
  }

  // This is usefull when we have a ref to the component
  getNextDefaultValue() {
    return this.state.editedHtmlNode || toHtmlNode(this.state.value);
  }

  focus() {
    this.handleFocus();
  }

  blur() {
    this.handleBlur();
  }

  reset() {
    const { onResize, defaultValue, options, readOnly } = this.props;
    const prevHeight = this.height;
    this.setState(
      {
        value: '',
        editedHtmlNode: null,
        isFocused: false,
        lastDefaultValue: defaultValue,
        selectedItemIndex: 0,
        prevActiveOptions: null,
        activeOptions: options,
        lastOptions: options,
        lastReadOnly: readOnly,
        menuCoordinates: null
      },
      () => {
        this.height = this.recalculateSize();

        if (prevHeight !== this.height) {
          onResize(this.height, prevHeight);
        }
      }
    );
  }

  recalculateSize = () => {
    const { isFocused } = this.state;

    if (isFocused) {
      const $textarea = this.$textarea.current;
      if ($textarea) {
        // override the browser defaults before measuring
        $textarea.style.height = 'auto';
        $textarea.style.padding = '0 0 4px 0';
        $textarea.style.border = 'none';
        const height = $textarea.scrollHeight;
        if (height > 0) {
          $textarea.style.height = $textarea.scrollHeight + 'px';
        }
        return $textarea.scrollHeight;
      }
    }
  };

  handleKeyDown = e => {
    const { name, options, suggestionMapper } = this.props;
    const {
      menuCoordinates,
      selectedItemIndex,
      activeOptions,
      prevActiveOptions
    } = this.state;

    const $textarea = this.$textarea.current;

    if (e.key === '#') {
      if ($textarea && options) {
        const coord = getCaretCoordinates($textarea, $textarea.selectionStart);
        const rect = $textarea.getBoundingClientRect();
        const top = coord.top + window.scrollY + rect.top + coord.height;
        const left = coord.left + window.scrollX + rect.left;

        this.setState({
          menuCoordinates: {
            top,
            left,
            textareaLeft: rect.left,
            textareaWidth: rect.width
          }
        });
      }
    } else if (
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'Enter'
    ) {
      // maybe menu navigation
      if (activeOptions && menuCoordinates) {
        e.preventDefault(); // prevent to navigate the textarea
        switch (e.key) {
          case 'ArrowUp':
            if (selectedItemIndex > 0) {
              this.setState({ selectedItemIndex: selectedItemIndex - 1 });
            }
            break;

          case 'ArrowDown':
            if (selectedItemIndex < activeOptions.length - 1) {
              this.setState({ selectedItemIndex: selectedItemIndex + 1 });
            }
            break;

          case 'ArrowRight': {
            const option = activeOptions[selectedItemIndex];
            if (option && option.children) {
              this.setState({
                selectedItemIndex: 0,
                prevActiveOptions: activeOptions,
                activeOptions: option.children
              });
            }
            break;
          }

          case 'ArrowLeft': {
            const option = activeOptions[selectedItemIndex];
            if (option && prevActiveOptions) {
              this.setState({
                selectedItemIndex: 0,
                prevActiveOptions: findParentOptions(
                  options,
                  prevActiveOptions
                ),
                activeOptions: prevActiveOptions
              });
            }
            break;
          }

          case 'Enter': {
            // Inject the value
            const option = activeOptions[selectedItemIndex];
            if (option && !option.disabled) {
              const { text } = option;
              const nextValue = insertAtCaret(
                $textarea,
                suggestionMapper ? suggestionMapper(text) : text,
                suggestionMapper ? -1 : 0
              );
              // close menu and sync change
              this.setState({
                menuCoordinates: null,
                selectedItemIndex: 0,
                activeOptions: options,
                prevActiveOptions: null
              });
              this.handleChange({
                target: { name, value: nextValue },
                preventDefault: noop,
                stopPropagation: noop
              });
            }
            break;
          }

          default:
            break;
        }
      }
    } else {
      if (menuCoordinates) {
        this.setState({ menuCoordinates: null });
      }
    }
  };

  handleChange = e => {
    const { onChange, onResize } = this.props;
    const prevHeight = this.height;
    // Note that onChange is called with the _markdown_ value
    onChange(e);
    this.setState(
      {
        value: e.target.value
      },
      () => {
        this.height = this.recalculateSize();

        if (prevHeight !== this.height) {
          onResize(this.height, prevHeight);
        }
      }
    );
  };

  handleBlur = e => {
    const { name, onSubmit, onBlur, options, onResize } = this.props;
    const { value } = this.state;

    const htmlNode = toHtmlNode(value);

    onSubmit(
      // issue a fake event for compat with Paper suite elements
      {
        target: {
          name: name,
          value: htmlNode
        },
        preventDefault: noop,
        stopPropagation: noop
      },
      htmlNode,
      value
    );
    onBlur();

    const prevHeight = this.height;
    this.setState(
      {
        editedHtmlNode: htmlNode,
        isFocused: false,
        menuCoordinates: null,
        activeOptions: options,
        prevActiveOptions: null
      },
      () => {
        this.height = this.recalculateSize();

        if (prevHeight !== this.height) {
          onResize(this.height, prevHeight);
        }
      }
    );
  };

  handleFocus = e => {
    const { disabled, readOnly, defaultValue, onFocus } = this.props;
    if (
      disabled ||
      readOnly ||
      (e &&
        e.target &&
        (e.target.localName === 'a' ||
          e.target.localName === 'button' ||
          e.target.localName === 'input'))
    ) {
      onFocus();
      return;
    }

    // markdown conversion is defered till first focus
    this.setState(
      {
        isFocused: true,
        value:
          this.state.value !== '' ? this.state.value : toMarkdown(defaultValue)
      },
      () => {
        this.$textarea.current.focus();
        this.height = this.recalculateSize();
        onFocus();
      }
    );
  };

  render() {
    const {
      value,
      editedHtmlNode,
      isFocused,
      menuCoordinates,
      selectedItemIndex,
      activeOptions,
      prevActiveOptions
    } = this.state;

    const {
      id,
      className,
      disabled,
      readOnly,
      defaultValue,
      name,
      label,
      locationLinksType
    } = this.props;

    const hasContent = !!getValue(editedHtmlNode || defaultValue);

    return (
      <div
        id={id}
        className={classNames('rich-textarea', className, {
          'rich-textarea--has-content': hasContent,
          'rich-textarea--readonly': readOnly,
          'rich-textarea--disabled': disabled
        })}
        tabIndex={disabled || readOnly ? '-1' : '0'}
        onClick={this.handleFocus}
        onFocus={this.handleFocus}
      >
        <div className={'rich-textarea__text'}>
          {(!isFocused && hasContent) || disabled || readOnly ? (
            <Value
              className={`rich-textarea__value rich-textarea__value--${locationLinksType} sa__ui-user-type`}
              name={name}
            >
              {editedHtmlNode || defaultValue}
            </Value>
          ) : (
            <textarea
              name={name}
              ref={this.$textarea}
              value={value}
              onChange={this.handleChange}
              onBlur={this.handleBlur}
              onFocus={this.handleFocus}
              onKeyDown={this.handleKeyDown}
              className="rich-textarea__textarea sa__ui-user-type"
              rows="1" /* default browser value is 2 - must be set to one for measuring 1-line heights */
            />
          )}
        </div>
        <label
          className={classNames('rich-textarea__label', {
            'rich-textarea__label--focused': isFocused
          })}
          htmlFor={name}
          ref={el => (this.$label = el)}
        >
          {label}
        </label>

        <span
          className={classNames('rich-textarea__border-line', {
            'rich-textarea__border-line--focused': isFocused
          })}
        />

        {menuCoordinates && (
          <RichTextareaPortal coordinates={menuCoordinates}>
            <RichTextareaMenu
              options={activeOptions}
              hasParent={!!prevActiveOptions}
              selectedItemIndex={selectedItemIndex}
            />
          </RichTextareaPortal>
        )}
      </div>
    );
  }
}

function insertAtCaret($textarea, text, offset = 0) {
  var scrollPos = $textarea.scrollTop;
  var caretPos = $textarea.selectionStart + offset;

  var front = $textarea.value.substring(0, caretPos);
  var back = $textarea.value.substring(
    $textarea.selectionEnd,
    $textarea.value.length
  );
  $textarea.value = front + text + back;
  caretPos = caretPos + text.length;
  $textarea.selectionStart = caretPos;
  $textarea.selectionEnd = caretPos;
  $textarea.focus();
  $textarea.scrollTop = scrollPos;

  return $textarea.value;
}

function findParentOptions(options, child, _root) {
  _root = _root || options;
  if (options === child) {
    return options === _root ? null : options;
  }

  for (const item of options) {
    if (item.children) {
      const match = findParentOptions(item.children, child, _root);
      if (match) {
        return options;
      }
    }
  }

  return null;
}
