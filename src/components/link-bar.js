import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as colors from '@scipe/resources/constants/resource-colors';

export default class LinkBar extends Component {
  render() {
    const { link } = this.props;
    let gradientAnim = '';
    let horTopGradientAnim = 'cycle-gradient-left';
    let horBotGradientAnim = 'cycle-gradient-right';
    let topType = '';
    let bottomType = '';

    if (link.sourceOffset < link.sinkOffset) {
      if (link.type == 'requirement') {
        gradientAnim = 'cycle-gradient-down';
        horTopGradientAnim = 'cycle-gradient-left';
        horBotGradientAnim = 'cycle-gradient-right';
      } else {
        gradientAnim = 'cycle-gradient-up';
        horTopGradientAnim = 'cycle-gradient-right';
        horBotGradientAnim = 'cycle-gradient-left';
      }
      topType = link.sourceType;
      bottomType = link.sinkType;
    } else {
      if (link.type == 'requirement') {
        gradientAnim = 'cycle-gradient-up';
        horTopGradientAnim = 'cycle-gradient-right';
        horBotGradientAnim = 'cycle-gradient-left';
      } else {
        gradientAnim = 'cycle-gradient-down';
        horTopGradientAnim = 'cycle-gradient-left';
        horBotGradientAnim = 'cycle-gradient-right';
      }
      topType = link.sinkType;
      bottomType = link.sourceType;
    }
    // TODO add a third state / animation for when both resources require each other

    const horizontalStyle = {
      position: 'absolute',
      height: '16px',
      borderTopRightRadius: '10px',
      borderBottomRightRadius: '10px'
    };

    const horizontalTopStyles = Object.assign(
      {
        width: `${22 + (link.horizontalTopExtraWidth || 0)}px`,
        backgroundColor: colors[topType],
        opacity: 0.4,
        backgroundSize: '64px',
        MozBackgroundSize: '64px',
        WebkitBackgroundSize: '64px',
        animation: horTopGradientAnim + ' 2s linear infinite',
        MozAnimation: horTopGradientAnim + ' 2s linear infinite',
        WebkitAnimation: horTopGradientAnim + ' 2s linear infinite',
        backgroundImage: `linear-gradient(left, ${colors[topType]}, ${colors[
          bottomType
        ] !== colors[topType]
          ? colors[bottomType]
          : '#FFFFFF'}, ${colors[topType]})`,
        backgroundImage: `-webkit-linear-gradient(left, ${colors[
          topType
        ]}, ${colors[bottomType] !== colors[topType]
          ? colors[bottomType]
          : '#FFFFFF'}, ${colors[topType]})`
      },
      horizontalStyle
    );

    const horizontalBottomStyles = Object.assign(
      {
        width: `${22 + (link.horizontalBottomExtraWidth || 0)}px`,
        backgroundColor: colors[bottomType],
        top: `${link.top + link.height + 8}px`,
        opacity: 0.4,
        backgroundSize: '64px',
        MozBackgroundSize: '64px',
        WebkitBackgroundSize: '64px',
        animation: horBotGradientAnim + ' 2s linear infinite',
        MozAnimation: horBotGradientAnim + ' 2s linear infinite',
        WebkitAnimation: horBotGradientAnim + ' 2s linear infinite',
        backgroundImage: `linear-gradient(left, ${colors[topType]}, ${colors[
          bottomType
        ] !== colors[topType]
          ? colors[bottomType]
          : '#FFFFFF'}, ${colors[topType]})`,
        backgroundImage: `-webkit-linear-gradient(left, ${colors[
          topType
        ]}, ${colors[bottomType] !== colors[topType]
          ? colors[bottomType]
          : '#FFFFFF'}, ${colors[topType]})`
      },
      horizontalStyle
    );

    const verticalStyles = {
      position: 'absolute',
      marginLeft: '-16px',
      width: '16px',
      borderTopLeftRadius: '10px',
      borderBottomLeftRadius: '10px',
      backgroundSize: '64px',
      MozBackgroundSize: '64px',
      WebkitBackgroundSize: '64px',
      animation: gradientAnim + ' 2s linear infinite',
      MozAnimation: gradientAnim + ' 2s linear infinite',
      WebkitAnimation: gradientAnim + ' 2s linear infinite',
      backgroundColor: colors[link.sourceType],
      opacity: 0.4,
      backgroundImage: `linear-gradient(${colors[topType]}, ${colors[
        bottomType
      ] !== colors[topType]
        ? colors[bottomType]
        : '#FFFFFF'}, ${colors[topType]})`
    };

    if (link.top >= 0) {
      verticalStyles.top = `${link.top + 8}px`;
      verticalStyles.height = `${link.height + 16}px`;
    } else {
      verticalStyles.top = 8;
      verticalStyles.height = `${link.height + link.top + 16}px`;
    }

    if (link.top >= 0) {
      horizontalTopStyles.top = `${link.top + 8}px`;
    }

    return (
      <div>
        <div className={'link-bar__horizontal'} style={horizontalTopStyles} />
        <div className={'link-bar__vertical'} style={verticalStyles} />
        <div
          className={'link-bar__horizontal'}
          style={horizontalBottomStyles}
        />
      </div>
    );
  }
}

LinkBar.propTypes = {
  link: PropTypes.shape({
    id: PropTypes.string, // uniq id for the link
    horizontalTopExtraWidth: PropTypes.number,
    horizontalBottomExtraWidth: PropTypes.number,
    type: PropTypes.oneOf(['requirement', 'dependent']),
    sourceOffset: PropTypes.number,
    sinkOffset: PropTypes.number,
    sourceType: PropTypes.string,
    sinkType: PropTypes.string,
    top: PropTypes.number,
    height: PropTypes.number
  }).isRequired
};
