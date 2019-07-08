import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export default class DateFromNow extends Component {
  static propTypes = {
    children: PropTypes.any, // ISO datetime string or moment object
    interval: PropTypes.number,
    now: PropTypes.string // mostly usefull for testing to "freeze" the component
  };

  static defaultProps = {
    interval: 120000
  };

  componentDidMount() {
    const { now } = this.props;
    if (now) {
      this.intervalId = setInterval(() => {
        this.forceUpdate();
      }, this.props.interval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    const { now, children } = this.props;
    if (!children) return null;

    return (
      <span className="date-from-now" data-test-now={now ? 'false' : 'true'}>
        {now ? moment(children).from(now) : moment(children).fromNow()}
      </span>
    );
  }
}
