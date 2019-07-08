import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../utils/bem-tags';

const bem = BemTags();

export default class RatingStars extends Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,

    /**
     * The core settings for the component, which indicate the
     * range the rating can take (discrete, inclusive) as well as
     * the current rating.
     */
    rating: PropTypes.shape({
      worstRating: PropTypes.number.isRequired,
      bestRating: PropTypes.number.isRequired,
      ratingValue: PropTypes.number
    }),
    readOnly: PropTypes.bool, // DEPRECATED: Use the disabled property instead.
    disabled: PropTypes.bool,

    /**
     * Handler call when a rating changes; it is passed a single argument,
     * the integer value of the new rating.
     */
    onChange: PropTypes.func,
    iconSize: PropTypes.number
  };

  static defaultProps = {
    rating: {
      worstRating: 1,
      bestRating: 5,
      ratingValue: 0
    },
    onChange: noop,
    readOnly: false,
    disabled: false,
    iconSize: 24
  };

  constructor(props) {
    super(props);

    // We materalize the state locally here, and keep it in sync
    // using the componentWillReceiveProps lifecycle hook.
    this.state = {
      ratingValue: props.rating.ratingValue
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rating !== this.props.rating) {
      this.setState({ ratingValue: nextProps.rating.ratingValue });
    }
  }

  handleClick(val) {
    let newRatingValue;

    // If the worst ratign is selected, the user can click on it
    // again to clear the rating altogether.
    // TODO: Might make more sense to introduce an icon for this
    //       case, and a property to say "canClear" or similar.
    if (val === 0 && this.state.ratingValue === this.props.rating.worstRating) {
      newRatingValue = undefined;
    } else {
      newRatingValue = val + 1;
    }
    this.setState({ ratingValue: newRatingValue });
    if (this.props.rating.ratingValue != newRatingValue) {
      this.props.onChange(newRatingValue);
    }
  }

  render() {
    const { ratingValue } = this.state;
    const { id, className, rating, readOnly, iconSize } = this.props;
    const disabled = readOnly || this.props.disabled;

    // This is essentially range(worst, best), inclusive.
    const labels = Array.from(
      { length: rating.bestRating - rating.worstRating + 1 },
      (v, i) => i + 1
    );

    return (
      <div
        id={id}
        className={classNames(
          bem`rating-stars --${disabled ? 'read-only' : 'editable'}`,
          className
        )}
      >
        {labels.map((star, i) => (
          <div
            key={star}
            title={star.toString()}
            className={bem`star --${
              ratingValue != null && i < ratingValue ? 'on' : 'off'
            }`}
          >
            <Iconoclass
              iconSize={iconSize}
              iconName="star"
              elementType={`${disabled ? 'div' : 'button'}`}
              onClick={disabled ? undefined : this.handleClick.bind(this, i)}
            />
          </div>
        ))}
      </div>
    );
  }
}
