import React from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import classNames from 'classnames';

export class PaperDatePicker extends React.Component {
  constructor(props) {
    super(props);
  }

  showMonth(date) {
    if (this.picker && this.picker.showMonth) {
      this.picker.showMonth(date);
    }
  }

  render() {
    const { className, allowPast, ...props } = this.props;

    let disabledDays = [];
    if (!allowPast)
      disabledDays.push({
        before: new Date()
      });

    return (
      <div
        className={classNames('paper-date-picker', className, {
          'allow-past': allowPast
        })}
      >
        <DayPicker
          {...props}
          disabledDays={disabledDays}
          weekdaysShort={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
          ref={me => {
            this.picker = me;
          }}
        />
      </div>
    );
  }
}

PaperDatePicker.propTypes = {
  className: PropTypes.string,
  allowPast: PropTypes.bool
};
