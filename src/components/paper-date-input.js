import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { PaperDatePicker } from './paper-date-picker';
import PaperInput from './paper-input';
import Menu from './menu/menu';
import { MenuCardItem } from './menu/menu-item';
import BemTags from '../utils/bem-tags';

const bem = BemTags();

// !! This assumes M/D/YYYY format (e.g., 4/20/2017 for Apr 20, 2017)
// !! We MUST preseve the time part of the date. We only change day, month, year NOT the time

export default class PaperDateInput extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    value: PropTypes.instanceOf(Date),
    className: PropTypes.string,
    children: PropTypes.any,
    showCalendar: PropTypes.string,
    portal: PropTypes.bool,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    label: PropTypes.string,
    floatLabel: PropTypes.bool,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onSubmit: PropTypes.func,
    allowPast: PropTypes.bool,
    'data-test-now': PropTypes.oneOf(['true', 'false'])
  };

  static defaultProps = {
    'data-test-now': 'false',
    className: '',
    portal: false,
    showCalendar: 'menu',
    disabled: false,
    readOnly: false,
    label: '',
    floatLabel: true,
    onChange: noop,
    onSubmit: noop,
    allowPast: true
  };

  constructor(props) {
    super(props);

    const { value = new Date() } = props;

    this.state = {
      displayDate: moment(value).format('ll'), // Sep 4 1986
      enteredDate: moment(value).format('l'), // 9/4/1986
      date: value,
      isStrictlyValid: true,
      menuOpen: false
    };

    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleCalClick = this.handleCalClick.bind(this);
    this.handleDayKeyDown = this.handleDayKeyDown.bind(this);
    this.handleMenuOpen = this.handleMenuOpen.bind(this);

    this.datePickerRef = React.createRef();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value &&
      nextProps.value.getTime() !== this.state.date.getTime()
    ) {
      this.setState({
        displayDate: moment(nextProps.value).format('ll'), // Sep 4 1986
        enteredDate: moment(nextProps.value).format('l'), // 9/4/1986
        date: nextProps.value,
        isStrictlyValid: true
      });
    }
  }

  handleTextChange(e) {
    let newDate;
    // loose validity check
    if (moment(e.target.value, 'M/D/YYYY').isValid()) {
      newDate = moment(e.target.value, 'M/D/YYYY');
      if (this.datePickerRef.current && this.datePickerRef.current.showMonth) {
        this.datePickerRef.current.showMonth(newDate.toDate());
      }
    }
    const isStrictlyValid = moment(e.target.value, 'M/D/YYYY', true).isValid();
    let nextDate;
    if (isStrictlyValid) {
      nextDate = newDate.toDate();
      // Be sure _not_ to modify the time component
      nextDate.setHours(this.state.date.getHours());
      nextDate.setMinutes(this.state.date.getMinutes());
    } else {
      nextDate = this.state.date;
    }

    this.setState({
      displayDate: isStrictlyValid
        ? newDate.format('ll')
        : this.state.displayDate,
      enteredDate: e.target.value,
      date: nextDate,
      isStrictlyValid
    });

    if (newDate && isStrictlyValid) {
      this.props.onChange(nextDate);
    }
  }

  handleCalClick(date, modifiers, e) {
    // if (this.props.disabled) return;

    // update day month and year while keeping time intact
    const nextDate = new Date(this.state.date.getTime());
    nextDate.setDate(date.getDate());
    nextDate.setMonth(date.getMonth());
    nextDate.setFullYear(date.getFullYear());
    const nextMoment = moment(nextDate);

    this.setState({
      date: nextDate,
      displayDate: nextMoment.format('ll'),
      enteredDate: nextMoment.format('l'),
      isStrictlyValid: true
    });

    this.props.onChange(nextDate);
    this.props.onSubmit(nextDate);
  }

  handleDayKeyDown(date, modifier, e) {
    if (e.keyCode === 32) {
      this.handleCalClick(date, modifier, e);
    }
  }

  handleMenuOpen() {
    this.setState({ menuOpen: true });
  }

  handleMenuClose() {
    this.setState({ menuOpen: false });
  }

  handleBlur(e) {
    this.props.onSubmit(this.state.date);
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  render() {
    const {
      className,
      id,
      showCalendar,
      label,
      portal,
      floatLabel,
      disabled,
      readOnly,
      allowPast
    } = this.props;

    const { date, enteredDate, displayDate, isStrictlyValid } = this.state;

    let errorMsg = null;

    if (!isStrictlyValid || enteredDate == null) {
      errorMsg = 'Invalid Date';
    } else if (!allowPast && moment(enteredDate).isBefore(new Date())) {
      errorMsg = 'Past Date';
    }

    errorMsg;
    return (
      <div
        id={id}
        className={classNames(
          bem`paper-date-input ${readOnly ? '--read-only' : ''} ${
            disabled ? '--disabled' : '--enabled'
          }`,
          className
        )}
      >
        <div className={bem`input-container`}>
          <PaperInput
            data-test-now={this.props['data-test-now']}
            label={`${label} ${errorMsg ? '' : '(' + displayDate + ')'}`}
            floatLabel={floatLabel}
            name="Date"
            value={enteredDate}
            onChange={this.handleTextChange}
            onBlur={this.handleBlur}
            error={errorMsg}
            mustDisplayError={true}
            readOnly={readOnly}
            disabled={disabled}
          />
        </div>
        {showCalendar === 'always' && (
          <div className={bem`calendar-container`}>
            <PaperDatePicker
              disabled={disabled}
              selectedDays={day => moment(date).isSame(day, 'day')}
              initialMonth={date}
              value={date}
              onDayClick={this.handleCalClick}
              ref={this.datePickerRef}
              allowPast={allowPast}
            />
          </div>
        )}
        {showCalendar === 'menu' && (
          <Menu
            disabled={disabled}
            icon="calendar"
            align="right"
            portal={portal}
            portalProps={{ portalClass: 'ignore-react-onclickoutside' }}
            iconSize={16}
            closeOnClick={false}
            className={bem`menu --${
              this.props.floatLabel ? 'float-label' : 'no-label'
            }`}
            onOpen={this.handleMenuOpen}
          >
            <MenuCardItem className={bem`menu-calendar-container`}>
              <PaperDatePicker
                disabled={disabled}
                selectedDays={day => moment(date).isSame(day, 'day')}
                initialMonth={date}
                value={date}
                onDayClick={this.handleCalClick}
                onDayKeyDown={this.handleDayKeyDown}
                className="ignore-react-onclickoutside"
                ref={this.datePickerRef}
                allowPast={allowPast}
                tabIndex={0}
              />
            </MenuCardItem>
          </Menu>
        )}
      </div>
    );
  }
}
