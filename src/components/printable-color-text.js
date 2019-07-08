import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class PrintableColorText extends React.PureComponent {
  renderChunk(textChunk, key = 0) {
    return (
      <span className="printable-color-text__chunk" key={key}>
        {/* two versions of text are rendered below. __screen is used to size the container since SVG's cannont be auto sized. __print and __screen are set visibility: hidden in the css to hide them in their respective counter media's */}
        <span className="printable-color-text__chunk__screen">{textChunk}</span>
        <span className="printable-color-text__chunk__print">
          <svg className="printable-color-text__svg" width="100%" height="100%">
            <text
              className="printable-color-text__svg-text"
              x="0"
              y=".9em" /* edge does not support svg baseline alignment features - this sets the text to hang from top of container */
              style={{ fill: 'currentColor' }}
            >
              {textChunk}
            </text>
          </svg>
        </span>
      </span>
    );
  }

  render() {
    const { id, className, children, wrapText } = this.props;

    if (wrapText) {
      /* this regex will split on non-word chars, but keep those chars in the match group */
      const text = children.split(/(?=[^A-Za-z0-9])/);

      return (
        <span
          className={classNames(
            'printable-color-text',
            'printable-color-text--wrap',
            className
          )}
        >
          {text.map((word, i) => {
            return this.renderChunk(word, i);
          })}
        </span>
      );
    } else {
      return (
        <span className={classNames('printable-color-text', className)}>
          {this.renderChunk(children)}
        </span>
      );
    }
  }
}

PrintableColorText.defaultProps = {};
PrintableColorText.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.string,
  wrapText: PropTypes.bool
};
