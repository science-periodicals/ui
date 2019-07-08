import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const FlexPacker = props => {
  const { tagName, children, className, columns, ...otherProps } = props;

  const numChildren = React.Children.count(children);
  const childrenArray = React.Children.toArray(children);
  let rows = [];

  /*
    when performing a grid layout, break the images into a series of rows. This helps in printing for page-break control. Chrome only honors page-break css control on block elements. so, here, each row is precalculated and wraped in a div block.
  */

  if (columns && numChildren >= columns) {
    const rowCount = numChildren / columns;
    let childIndex = 0;
    for (let r = 0; r < rowCount; r++) {
      let cols = [];
      for (let c = 0; c < columns; c++) {
        cols.push(childrenArray[childIndex]);
        childIndex++;
      }
      rows.push(
        <div key={r} className="flex-packer__row">
          {cols}
        </div>
      );
    }
  } else {
    rows = children;
  }
  //console.log('rows', rows);

  return React.createElement(
    tagName,
    Object.assign(
      { className: classNames('flex-packer', className) },
      otherProps
    ),

    rows
  );
};

FlexPacker.defaultProps = {
  tagName: 'div'
};

FlexPacker.propTypes = {
  tagName: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
  isPrinting: PropTypes.bool,
  isGrid: PropTypes.bool,
  columns: PropTypes.number
};

export default FlexPacker;

export const FlexPackerCaption = props => {
  const { tagName, children, className, ...otherProps } = props;
  return React.createElement(
    tagName,
    Object.assign(
      { className: classNames('flex-packer__caption', className) },
      otherProps
    ),
    children
  );
};
FlexPackerCaption.defaultProps = {
  tagName: 'div'
};
FlexPackerCaption.propTypes = FlexPacker.propTypes;
