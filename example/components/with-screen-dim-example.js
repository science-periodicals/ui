import React from 'react';
import PropTypes from 'prop-types';
import { withScreenDim, CSS_XLARGE_DESKTOP } from '../../src/';

class _Reporter extends React.Component {
  static propTypes = {
    screenWidth: PropTypes.string,
    screenHeight: PropTypes.string
  };

  render() {
    return (
      <dl>
        <dt>width</dt>
        <dd>
          constant <strong>value</strong>: {this.props.screenWidth}
          {' | '}
          <span>
            {' '}
            Check that the constant sort lexicographicaly{' '}
            <code>{`screenWidth < CSS_XLARGE_DESKTOP === ${(
              this.props.screenWidth < CSS_XLARGE_DESKTOP
            ).toString()}`}</code>
          </span>
        </dd>
        <dt>height</dt>
        <dd>
          constant <strong>value</strong>: {this.props.screenHeight}
        </dd>
      </dl>
    );
  }
}

const Reporter = withScreenDim(_Reporter);

export default function WithScreenDimExample(props) {
  return (
    <div className="example">
      <Reporter />
    </div>
  );
}
