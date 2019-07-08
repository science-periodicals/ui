import React from 'react';
import PropTypes from 'prop-types';
import { FlexPacker, FlexPackerCaption } from '../../src/';

// Deterministic check Math.random alternative as we cannot seed Math.random

let seed = 1;
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const FlexPackerExample = () => {
  const styles = new Array(10).fill(1).map((x, i) => {
    return {
      width: Math.ceil(random() * 400) + 100,
      height: Math.ceil(random() * 200) + 100,
      background: 'hsla(206, 90%, 61%, 0.5)',
      marginBottom: 10
    };
  });

  return (
    <div className="example">
      <p>
        This demonstrates packing on random content. Note that this is
        essentially the worst-case scenario, normal content is usually more
        regular (and therefore packs better).
      </p>
      <FlexPacker>
        {styles.map((style, i) => (
          <div key={i} style={style} />
        ))}
        <FlexPackerCaption
          style={{ border: '1px solid #fc635d', padding: '1em' }}
        >
          This is just a caption that will alway take the full bottom.
        </FlexPackerCaption>
      </FlexPacker>
    </div>
  );
};

FlexPacker.propTypes = {
  tagName: PropTypes.string,
  children: PropTypes.node
};
export default FlexPackerExample;
