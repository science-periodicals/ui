import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import padStart from 'lodash/padStart';
import noop from 'lodash/noop';
import classNames from 'classnames';
import PaperInput from './paper-input';
import Menu from './menu/menu';

export default class PaperTimeInput extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    value: PropTypes.instanceOf(Date),
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onSubmit: PropTypes.func,
    disabled: PropTypes.bool,
    floatLabel: PropTypes.bool,
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    portal: PropTypes.bool,
    children: PropTypes.node,
    readOnly: PropTypes.bool,
    'data-test-now': PropTypes.oneOf(['true', 'false'])
  };

  static defaultProps = {
    'data-test-now': 'false',
    floatLabel: true,
    readOnly: false,
    onChange: noop,
    onSubmit: noop
  };

  constructor(props, context) {
    super(props, context);
    this.timeInputType = 'time';
    let tempDate = props.value || new Date();
    this.state = {
      date: tempDate,
      displayTime: this.getDisplayTimeFromDate(tempDate),
      cursorStartPos: 0,
      cursorEndPos: 0
    };

    this.getDisplayTimeFromDate = this.getDisplayTimeFromDate.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleTimeKeyDown = this.handleTimeKeyDown.bind(this);
    this.getSelectionStart = this.getSelectionStart.bind(this);
    this.getSelectionEnd = this.getSelectionEnd.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value !== this.state.date &&
      (!nextProps.value ||
        nextProps.value.toISOString() !== this.state.date.toISOString())
    ) {
      this.setState({
        date: nextProps.value,
        displayTime: this.getDisplayTimeFromDate(nextProps.value || new Date())
      });
    }
  }

  componentDidUpdate() {
    //console.log('set selectStart: ', this.state.cursorStartPos, this.state.cursorEndPos);
    if (this.timeInput.type === 'text')
      this.timeInput.setSelectionRange(
        this.state.cursorStartPos,
        this.state.cursorEndPos
      );
    this.timeInputType = this.timeInput.type;
  }

  getDisplayTimeFromDate(date) {
    //console.log('getDisplayTimeFromDate: ', date.getHours());
    let hours = padStart(date.getHours(), 2, '0');
    let mins = padStart(date.getMinutes(), 2, '0');
    return `${hours}:${mins}`;
  }

  handleTimeInputClick(ev) {
    let start = this.getSelectionStart(ev.target);
    let end = this.getSelectionEnd(ev.target);
    //console.log('handleTimeInputClick: ', start, end);
    let cursorStartPos = start;
    let cursorEndPos = end;
    if (end <= 2) {
      // select hours
      cursorStartPos = 0;
      cursorEndPos = 2;
    } else {
      // select mins
      cursorStartPos = 3;
      cursorEndPos = 5;
    }
    this.setState({
      cursorStartPos: cursorStartPos,
      cursorEndPos: cursorEndPos
    });
  }

  getSelectionStart(inputEl = null) {
    let input = inputEl ? inputEl : this.timeInput;
    //console.log('getSelectionStart: ', input.type);
    if (input.type === 'text') return input.selectionStart;
    return -1;
  }

  getSelectionEnd(inputEl = null) {
    let input = inputEl ? inputEl : this.timeInput;
    //console.log('getSelectionEnd: ', input.type);
    if (input.type === 'text') return input.selectionEnd;
    return -1;
  }

  handleBlur(e) {
    this.props.onSubmit(this.state.date);
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  handleTimeChange(input) {
    //console.log('handleTimeChange()');
    let timeStr;
    let cursorStartPos = 0;
    let cursorEndPos = 0;

    if (input.target) {
      timeStr = input.target.value;
      //let start = input.target.selectionStart;
      let start = this.getSelectionStart(input.target);
      //if(input.target.length < 3)
      //console.log('handleTimeChange input pos: ', start, end);
      cursorStartPos = start == 2 ? 3 : start;
      cursorEndPos = start == 2 ? 5 : start;
    } else {
      timeStr = input;
    }

    let timeStrArr = timeStr.split(':');
    //console.log('timeStrArr: ', timeStrArr);
    let hoursStr = timeStrArr[0] ? timeStrArr[0].replace(/\D/g, '') : '';
    let minsStr = timeStrArr.length > 1 ? timeStrArr[1].replace(/\D/g, '') : '';

    let displayTime;

    if (timeStrArr.length > 1) {
      // have colon
      //console.log('colon: ', hoursStr, minsStr);
      hoursStr = hoursStr.length > 2 ? hoursStr.substring(0, 2) : hoursStr;
      hoursStr = hoursStr.length < 2 ? padStart(hoursStr) : hoursStr;
      hoursStr = parseInt(hoursStr, 10) > 23 ? '23' : hoursStr;
      minsStr = minsStr.length > 2 ? minsStr.substring(0, 2) : minsStr;
      minsStr = parseInt(minsStr, 10) > 59 ? '59' : minsStr;
      //minsStr = minsStr.length < 2 ? padStart(minsStr) : minsStr;
      displayTime = `${hoursStr}:${minsStr}`;
      //console.log('transformed with colon: ', hoursStr, minsStr);
    } else {
      // no colon - field has probably been cleared
      if (hoursStr.length === 2) {
        displayTime = `${hoursStr}:${minsStr}`;
        cursorStartPos = 0;
        cursorEndPos = 2;
        //console.log('trying to move caret');
      } else if (hoursStr.length > 2) {
        //console.log('hours to long');
        displayTime = `${hoursStr.substring(0, 2)}:${minsStr}`;
      } else {
        displayTime = '00:00';
        hoursStr = '00';
        minsStr = '00';
        cursorStartPos = 0;
        cursorEndPos = 2;
      }
    }

    let hoursInt = parseInt(hoursStr, 10);
    hoursInt = isNaN(hoursInt) ? 0 : hoursInt;
    let minsInt = parseInt(minsStr, 10);
    minsInt = isNaN(minsInt) ? 0 : minsInt;

    let d = new Date(this.state.date.getTime());
    d.setHours(hoursInt);
    d.setMinutes(minsInt);
    //console.log('setting date: ', hoursInt, minsInt, d);

    this.setState({
      date: d,
      displayTime,
      cursorStartPos,
      cursorEndPos
    });
    this.props.onChange(d);
  }

  handleTimeKeyDown(e) {
    //console.log('handleTimeKeyDown: ', e.key);

    // don't mess with os time picker
    if (this.timeInput.type === 'time') return;

    if (
      e.key !== 'ArrowUp' &&
      e.key !== 'ArrowDown' &&
      e.key !== 'ArrowLeft' &&
      e.key !== 'ArrowRight' &&
      e.key !== 'Tab'
    )
      return;

    let start = this.getSelectionStart();
    let end = this.getSelectionEnd();
    let cursorStartPos = start;
    let cursorEndPos = end;

    let d = new Date(this.state.date.getTime());
    let hours = d.getHours();
    let mins = d.getMinutes();

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (end < 3) {
        hours++;
        cursorStartPos = 0;
        cursorEndPos = 2;
      }
      if (end > 3) {
        mins++;
        cursorStartPos = 3;
        cursorEndPos = 5;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (end < 3) {
        hours--;
        cursorStartPos = 0;
        cursorEndPos = 2;
      }
      if (end > 3) {
        mins--;
        if (mins < 0) mins = 59;
        cursorStartPos = 3;
        cursorEndPos = 5;
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cursorStartPos = 0;
      cursorEndPos = 2;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      cursorStartPos = 3;
      cursorEndPos = 5;
    } else if (e.key === 'Tab') {
      if (end < 3) {
        e.preventDefault();
        cursorStartPos = 3;
        cursorEndPos = 5;
      }
    }

    d.setHours(hours);
    d.setMinutes(mins);

    this.setState({
      date: d,
      displayTime: this.getDisplayTimeFromDate(d),
      cursorStartPos: cursorStartPos,
      cursorEndPos: cursorEndPos
    });

    //console.log('sel: ', key, start, end);
  }

  handlePaperInputRef(ref) {
    //console.log('handlePaperInputRef: ', ref);
    if (ref) {
      this.timeInput = ref.getInputRef();
      this.timeInputType = this.timeInput.type;
    }
  }

  handleMenuItemClick(value) {
    console.log('setting date: ', value);

    const date = new Date(this.state.date.getTime());
    const tmpDate = moment(value, 'HH:mm').toDate();
    date.setHours(tmpDate.getHours());
    date.setMinutes(tmpDate.getMinutes());

    this.setState({
      date,
      displayTime: this.getDisplayTimeFromDate(date)
    });
    this.props.onChange(date);

    if (
      !this.props.value ||
      date.toISOString() !== this.props.value.toISOString()
    ) {
      this.props.onSubmit(date);
    }
  }

  render() {
    let { date } = this.state;
    let {
      disabled = false,
      readOnly,
      floatLabel,
      label,
      children,
      name,
      id,
      className,
      portal,
      ...others
    } = this.props;

    let mTime = `(${moment(date).format('hh:mm A')})`;
    let newLabel = `${label} ${this.timeInputType === 'text' ? mTime : ''}`;

    return (
      <div
        id={id}
        className={classNames(
          'paper-time-input',
          className,
          {
            'paper-time-input--disabled': disabled
          },
          { 'paper-time-input--read-only': readOnly }
        )}
      >
        <div className={`paper-time-input__input-container`}>
          <PaperInput
            {...others}
            label={newLabel}
            floatLabel={floatLabel}
            name={name}
            value={this.state.displayTime}
            onChange={this.handleTimeChange}
            onKeyDown={this.handleTimeKeyDown}
            onBlur={this.handleBlur}
            error={''}
            mustDisplayError={true}
            className="paper-time-input__time-input"
            ref={ref => this.handlePaperInputRef(ref)}
            onClick={ev => this.handleTimeInputClick(ev)}
            maxLength={5}
            type={'time'}
            disabled={disabled}
            readOnly={readOnly}
          />
        </div>
        {children && (
          <Menu
            disabled={disabled || readOnly}
            portal={portal}
            icon="time"
            align="right"
            iconSize={16}
            className={`paper-time-input__menu paper-time-input__menu--${
              this.props.floatLabel ? 'float-label' : 'no-label'
            }`}
          >
            {React.Children.map(children, child => {
              let newProps = {
                onClick: this.handleMenuItemClick.bind(this, child.props.value)
              };
              return React.cloneElement(child, newProps);
            })}
          </Menu>
        )}
      </div>
    );
  }
}
