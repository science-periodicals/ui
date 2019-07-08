import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import uniq from 'lodash/uniq';
import noop from 'lodash/noop';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import ds3Mime from '@scipe/ds3-mime';

const DOCX =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

class Dropzone extends Component {
  static propTypes = {
    isOver: PropTypes.bool,
    connectDropTarget: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    accept: PropTypes.string, // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input
    onFiles: PropTypes.func,
    multiple: PropTypes.bool,
    placeholder: PropTypes.string,
    children: PropTypes.node
  };

  static defaultProps = {
    multiple: false,
    placeholder: 'Drop files or click to select files to upload',
    onFiles: noop
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  _accept(files) {
    const { multiple, accept } = this.props;

    if (!multiple && files.length > 1) {
      return false;
    }

    if (typeof accept === 'string') {
      const contentTypes = accept.split(',');

      for (let contentType of contentTypes) {
        contentType = contentType.trim();

        const [type, subtype] = contentType.split('/');

        for (let i = 0; i < files.length; i++) {
          const _contentType = files[i].type;
          const [_type] = _contentType.split('/');

          if (
            (subtype === '*' && type === _type) ||
            (subtype !== '*' &&
              (contentType === _contentType ||
                (contentType === ds3Mime &&
                  _contentType === DOCX &&
                  typeof files[i].name === 'string' &&
                  files[i].name.endsWith('.ds3.docx'))))
          ) {
            return true;
          }
        }
      }
      return false;
    }

    // no accept value so we return true
    return true;
  }

  handleClick(e) {
    if (this.props.disabled || this.props.readOnly) return;
    this.$input.click();
  }

  handleChange(e) {
    // see http://stackoverflow.com/questions/10214947/upload-files-using-input-type-file-field-with-change-event-not-always-firin
    if (!e.target.value) return;
    if (
      this.props.disabled ||
      this.props.readOnly ||
      !this._accept(e.target.files)
    ) {
      return;
    }

    this.props.onFiles(e.target.files);
    e.target.value = '';
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  render() {
    const {
      disabled,
      readOnly,
      isOver,
      connectDropTarget,
      accept,
      multiple,
      placeholder
    } = this.props;

    const sanitizedAccept = sanitizeAccept(accept);

    return connectDropTarget(
      <form
        onSubmit={this.handleSubmit.bind(this)}
        encType="multipart/form-data"
        className={classNames('dropzone', {
          'dropzone--active': isOver,
          'dropzone--disabled': disabled,
          'dropzone--read-only': readOnly,
          'dropzone--live': !disabled && !readOnly
        })}
        onClick={() => this.handleClick()}
      >
        <div className="dropzone__capsule">
          <input
            style={{ display: 'none' }}
            type="file"
            name="file[]"
            disabled={disabled}
            multiple={multiple}
            accept={sanitizedAccept}
            ref={$input => (this.$input = $input)}
            onChange={this.handleChange}
          />
          {this.props.children ? (
            <div className="dropzone__contents dropzone__contents--children">
              {this.props.children}
            </div>
          ) : (
            <div className="dropzone__contents">
              <img
                className="dropzone__icon"
                src="/images/icons/icon_add_round_black_40px.svg"
              />
              <span className="dropzone__placeholder">
                {' ' +
                  placeholder.replace(
                    /files?/g,
                    'file' + (multiple ? 's' : '')
                  )}
              </span>
            </div>
          )}
        </div>
      </form>
    );
  }
}

// dnd

const dropzoneTarget = {
  canDrop(props, monitor) {
    // Note: Due to the browser security restrictions, monitor.getItem() does not provide any information about the files or the URLs until they are dropped :(
    // See https://github.com/react-dnd/react-dnd/issues/584
    return !props.disabled;
  },

  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    const item = monitor.getItem();
    if (component._accept(item.files)) {
      // see http://stackoverflow.com/questions/10214947/upload-files-using-input-type-file-field-with-change-event-not-always-firin
      component.props.onFiles(item.files);
      component.$input.value = '';
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

export default DropTarget(NativeTypes.FILE, dropzoneTarget, collect)(Dropzone);

function sanitizeAccept(accept = '') {
  return uniq(
    accept
      .split(',')
      .map(value => value.trim())
      .map(value => (value === ds3Mime ? DOCX : value))
  ).join(',');
}
