import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class AutoAbridge extends Component {
  static propTypes = {
    children: PropTypes.any, // !!must be string if ellipsis is not true
    backgroundColor: PropTypes.string,
    renderText: PropTypes.func,
    ellipsis: PropTypes.bool,
    className: PropTypes.string
  };

  static defaultProps = {
    children: '',
    backgroundColor: 'transparent',
    renderText: text => text
  };

  render() {
    const {
      backgroundColor,
      children: text,
      renderText,
      ellipsis,
      className
    } = this.props;

    if (ellipsis) {
      return (
        <span
          className={classNames('auto-abridge', className)}
          style={{
            display: 'inline-block',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'pre',
            width: '100%'
          }}
        >
          {renderText(text)}
        </span>
      );
    }

    const halfText = Math.ceil(text.length / 2);
    const leftText = text.substr(0, halfText + 1);
    const rightText = text.substr(halfText + 1);
    // if(rightText.charAt(0) == '-' || rightText.charAt(0) == '.') rightText = rightText.substr(1, halfText);

    return (
      <div
        className={classNames('auto-abridge', className)}
        style={{
          display: 'block',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          flexGrow: '1',
          backgroundColor: backgroundColor
        }}
      >
        <div
          className="auto-abridge__shrinkwrap"
          style={{
            zIndex: '0',
            display: 'flex'
          }}
        >
          <div
            className="auto-abridge__left"
            style={{
              whiteSpace: 'pre',
              textAlign: 'left',
              maxWidth: '50%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-block',
              zIndex: '10'
            }}
          >
            {renderText(leftText)}
          </div>
          <div
            className="auto-abridge__right-wrapper"
            style={{
              display: 'inline-block',
              maxWidth: '50%',
              overflow: 'hidden',
              backgroundColor: 'none',
              whiteSpace: 'pre',
              position: 'relative'
            }}
          >
            {backgroundColor != 'transparent' ? (
              <div
                className="auto-abridge__gradient"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  left: '0px',
                  top: '0px',
                  background: [
                    'linear-gradient(-90deg, rgba(255,255,255,0), rgba(255,255,255,0) 98%, ' +
                      backgroundColor +
                      ' 100% )',
                    'none'
                  ],
                  zIndex: '5'
                }}
              />
            ) : null}
            <div
              className="auto-abridge__right"
              ref="rightText"
              style={{
                whiteSpace: 'pre',
                width: 'auto',
                overflow: 'visible',
                display: 'inline-block',
                zIndex: '1',
                boxSizing: 'border-box',
                position: 'relative',
                textAlign: 'right',
                float: 'right'
              }}
            >
              {renderText(rightText)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
