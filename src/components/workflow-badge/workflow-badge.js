import React from 'react';
import PropTypes from 'prop-types';

/* 
We chose to use a block level render of each line segment because creating 
acurate stroke offsets with parallel bazzier radius is quite complex in practice. 
See: http://tavmjong.free.fr/blog/?p=1257 for explanation. Instead we took a 
lego-brick approach where each segment type can be composed on a grid */

const WorkflowBadge = ({ size = 100, startTime, endTime, counts, paths }) => {
  const strokeWidth = 1; /* width of a single role path line */
  const strokeGap = 1; /* space between role path lines */
  const pathSize =
    3 * strokeWidth /* */ +
    3 * strokeGap; /* total width of the path (4 strokes + 3 graps) */
  const actionWidth = 2; /* x space alloted to an action */
  const connectorWidth = pathSize; /* space needed to connect actions between roles */
  const pathColor = 'white';
  const roleNames = ['Author', 'Editor', 'Reviewer', 'Producer'];

  const colCount = (() => {
    let count = 1;
    paths.forEach((action, i) => {
      if (i > 0) {
        const prevAction = paths[i - 1];
        if (prevAction.x !== action.x && prevAction.y !== action.y) {
          // make a col for the connector and one for the action
          count += 2;
        }
      }
    });
    return count;
  })();

  const rowCount = roleNames.length;

  //console.log('colCount', colCount);
  const cellHeight = size / 4;
  const cellWidth = size / colCount;

  const svgViewBox = `0 0 ${size} ${size}`;

  // make sure actions are ordered by X value
  const sortedPaths = paths.sort((actionA, actionB) => {
    if (actionA.x < actionB.x) {
      return -1;
    }
    if (actionA.x > actionB.x) {
      return 1;
    }
    // sort by y if x is the same
    if (actionA.y < actionB.y) {
      return -1;
    }
    if (actionA.y > actionB.y) {
      return 1;
    }

    return 0;
  });

  /**
   * transform action data in full matrix, grouping contiguous actions together -
   */
  let roleActionMatrix = [];

  // initialize every cell value
  for (let col = 0; col < colCount; col++) {
    for (let row = 0; row < rowCount; row++) {
      if (!roleActionMatrix[col]) {
        roleActionMatrix[col] = [];
      }
      roleActionMatrix[col][row] = { id: 'empty', x: col, y: row };
    }
  }
  //console.log('roleActionMatrix: ', roleActionMatrix);

  let colIndex = 0;
  paths.forEach((action, i) => {
    if (i == 0) {
      roleActionMatrix[colIndex][action.y] = {
        id: 'actionGroup',
        x: colIndex,
        y: action.y,
        actions: [action]
      };
    } else {
      const prevAction = sortedPaths[i - 1];
      if (action.y == prevAction.y) {
        // part of same group
        roleActionMatrix[colIndex][action.y] = {
          id: 'actionGroup',
          x: colIndex,
          y: action.y,
          actions: roleActionMatrix[colIndex][action.y].actions.concat(action)
        };
      } else {
        // new group - add action connectors
        colIndex++;
        // an action can jump through multiple roles, so build segment for each one
        // action's can move up or down
        const rowStart = prevAction.y < action.y ? prevAction.y : action.y;
        const rowEnd = prevAction.y < action.y ? action.y : prevAction.y;

        for (let row = rowStart; row <= rowEnd; row++) {
          const type =
            row === prevAction.y || row == action.y ? 'corner' : 'vertical';
          const direction = prevAction.y < action.y ? 'down' : 'up';

          let subtype;
          if (row === prevAction.y && direction === 'down') {
            subtype = 'tr'; // top-right radius
          } else if (row == action.y && direction === 'down') {
            subtype = 'bl'; // bottom-left radius
          } else if (row === prevAction.y && direction === 'up') {
            subtype = 'br'; // bottom-right radius
          } else if (row === action.y && direction === 'up') {
            subtype = 'tl'; // top-right radius
          } else {
            subtype = direction;
          }

          roleActionMatrix[colIndex][row] = {
            id: `${type}:${subtype}`,
            x: colIndex,
            y: row,
            z: [false, false, false, false]
          };
        }
        // add the new action
        colIndex++;
        //console.log('add action to ', colIndex, action.y);
        roleActionMatrix[colIndex][action.y] = {
          id: 'actionGroup',
          x: colIndex,
          y: action.y,
          actions: [action]
        };
      }
    }
  });

  //console.log('roleActionMatrix: ', roleActionMatrix);

  const renderActionMatrix = () => {
    let segments = [];

    roleActionMatrix.forEach((col, x) => {
      col.forEach((cell, y) => {
        if (cell.id === 'empty') {
          segments.push(renderCell(cell.x, cell.y));
        } else if (cell.id === 'vertical:down') {
          //console.log('adding cell', cell);
          segments.push(renderDownPathSegment(cell.x, cell.y));
        } else if (cell.id === 'vertical:up') {
          //console.log('adding cell', cell);
          segments.push(renderDownPathSegment(cell.x, cell.y));
        } else if (cell.id === 'corner:tr') {
          segments.push(renderCorner(cell.x, cell.y, 'tr'));
        } else if (cell.id === 'corner:br') {
          segments.push(renderCorner(cell.x, cell.y, 'br'));
        } else if (cell.id === 'corner:tl') {
          segments.push(renderCorner(cell.x, cell.y, 'tl'));
        } else if (cell.id === 'corner:bl') {
          segments.push(renderCorner(cell.x, cell.y, 'bl'));
        } else {
          segments.push(renderRightPathSegment(cell.x, cell.y));
        }
      });
    });

    return segments;
  };

  const renderCell = (x, y) => {
    return (
      <rect
        width={cellWidth - 2}
        height={cellHeight - 2}
        x={x * cellWidth + 1}
        y={y * cellHeight + 1}
        fill="grey"
        key={`cell_${x}_${y}`}
      />
    );
  };

  const renderCorner = (x, y, type) => {
    const x1 = x * cellWidth;
    const y1 = y * cellHeight;

    let vAlign, hAlign;

    if (type === 'tr') {
      vAlign = 'bottom';
      hAlign = 'left';
    } else if (type === 'tl') {
      vAlign = 'bottom';
      hAlign = 'right';
    } else if (type === 'br') {
      vAlign = 'top';
      hAlign = 'left';
    } else if (type === 'bl') {
      vAlign = 'top';
      hAlign = 'right';
    }

    const gridSquareSize = Math.min(cellWidth, cellHeight);

    const gridSquareXOffset = (cellWidth - gridSquareSize) / 2;
    const gridSquareYOffset = (cellHeight - gridSquareSize) / 2;

    const cornerSize = pathSize + (gridSquareSize - pathSize) / 2;

    const cornerXOffset =
      hAlign === 'left'
        ? 0
        : gridSquareSize - cornerSize; /* position relative to gridSquare */

    const cornerYOffset = vAlign === 'top' ? 0 : gridSquareSize - cornerSize;

    const strokes = roleNames.map((role, i) => {
      let strokeStartXOffset,
        strokeStartYOffset,
        strokeEndXOffset,
        strokeEndYOffset,
        startX,
        startY,
        endX,
        endY,
        cornerStartX,
        cornerStartY,
        cornerEndX,
        cornerEndY,
        cornerQX,
        cornerQY,
        r,
        sweep;

      if (type === 'tr') {
        // must be entering from the left
        strokeStartXOffset = 0;
        strokeStartYOffset = i * (strokeGap + strokeWidth);
        strokeEndXOffset = (3 - i) * (strokeGap + strokeWidth);
        strokeEndYOffset = 0;
        startX = x1;
        startY = y1 + (cellHeight - pathSize) / 2 + strokeStartYOffset;
        cornerStartX = startX;
        cornerStartY = startY;
        cornerEndX = x1 + (cellWidth - pathSize) / 2 + strokeEndXOffset;
        cornerEndY = y1 + gridSquareSize + gridSquareYOffset;
        endX = x1 + (cellWidth - pathSize) / 2 + strokeEndXOffset;
        endY = y1 + cellHeight;
        cornerQX = cornerEndX;
        cornerQY = cornerStartY;
        r =
          (4 - i) * (strokeGap + strokeWidth) +
          (gridSquareSize - cornerSize) / 2;
        sweep = 1;
      } else if (type == 'tl') {
        // must be entering from the bottom
        strokeStartXOffset = i * (strokeGap + strokeWidth);
        strokeStartYOffset = 0;
        strokeEndXOffset = 0;
        strokeEndYOffset = i * (strokeGap + strokeWidth);
        startX = x1 + (cellWidth - pathSize) / 2 + strokeStartXOffset;
        startY = y1 + cellHeight;
        cornerStartX = startX;
        cornerStartY = startY - gridSquareYOffset;
        endX = x1 + cellWidth;
        endY = y1 + (cellHeight - pathSize) / 2 + strokeEndYOffset;
        cornerEndX = endX;
        cornerEndY = endY;
        cornerQX = cornerStartX;
        cornerQY = cornerEndY;
        r = (4 - i) * (strokeGap + strokeWidth) + (cornerSize - pathSize) / 2;
        sweep = 1;
      } else if (type == 'bl') {
        // must be entering from the top
        strokeStartXOffset = (3 - i) * (strokeGap + strokeWidth);
        strokeStartYOffset = 0;
        strokeEndXOffset = 0;
        strokeEndYOffset = i * (strokeGap + strokeWidth);
        startX = x1 + (cellWidth - pathSize) / 2 + strokeStartXOffset;
        startY = y1;
        cornerStartX = startX + gridSquareXOffset;
        cornerStartY = startY + gridSquareYOffset;
        endX = x1 + cellWidth;
        endY = y1 + (cellHeight - pathSize) / 2 + strokeEndYOffset;
        cornerEndX = endX;
        cornerEndY = endY;
        cornerQX = cornerStartX;
        cornerQY = cornerEndY;
        r = i * (strokeGap + strokeWidth) + (gridSquareSize - pathSize) / 2;
        sweep = 0;
      } else if (type == 'br') {
        // must be entering from the bottom
        // must be entering from the left
        strokeStartXOffset = 0;
        strokeStartYOffset = i * (strokeGap + strokeWidth);
        strokeEndXOffset = i * (strokeGap + strokeWidth);
        strokeEndYOffset = 0;
        startX = x1;
        startY = y1 + (cellHeight - pathSize) / 2 + strokeStartYOffset;
        cornerStartX = startX;
        cornerStartY = startY;
        endX = x1 + (cellWidth - pathSize) / 2 + strokeEndXOffset;
        endY = y1;
        cornerEndX = endX;
        cornerEndY = y1 + gridSquareYOffset;
        cornerQX = cornerEndX;
        cornerQY = cornerStartY;
        r = i * (strokeGap + strokeWidth) + (gridSquareSize - pathSize) / 2;
        sweep = 0;
      }

      return (
        <path
          fill="none"
          key={`rcorner_${x}_${y}_${i}`}
          stroke={pathColor}
          data-role={roleNames[i]}
          d={`
              M ${startX},${startY}
              L ${cornerStartX},${cornerStartY}
              A ${r} ${r} 0 0 ${sweep} ${cornerEndX} ${cornerEndY}
              L ${endX},${endY}
            `}
        />
      );
      // alternatively use quadratic bezzier
      // return (
      //   <path
      //     fill="none"
      //     key={`corner_${x}_${y}_${i}`}
      //     stroke={pathColor}
      //     data-role={roleNames[i]}
      //     data-type={type}
      //     d={`
      //         M${startX},${startY}
      //         L ${cornerStartX},${cornerStartY}
      //         Q ${cornerQX},${cornerQY} ${cornerEndX},${cornerEndY}
      //         L ${endX},${endY}
      //       `}
      //   />
      // );
    });

    return (
      <g
        className={`workflow-badge__segment-corner`}
        data-pos={`${x},${y}`}
        key={`corner_${x}_${y}`}
      >
        <rect
          id="grid-square"
          width={gridSquareSize}
          height={gridSquareSize}
          x={x1 + gridSquareXOffset}
          y={y1 + gridSquareYOffset}
          stroke="red"
          fill="none"
        />
        <rect
          id="corner-square"
          width={cornerSize}
          height={cornerSize}
          x={x1 + gridSquareXOffset + cornerXOffset}
          y={y1 + gridSquareYOffset + cornerYOffset}
          stroke="orange"
          fill="none"
        />
        {strokes}
      </g>
    );
  };

  const renderDownPathSegment = (xPos, yPos) => {
    const x = xPos * cellWidth;
    const y = yPos * cellHeight;
    const paths = roleNames.map((roleName, i) => {
      const xOffset =
        (strokeGap + strokeWidth) * i /* space between strokes */ +
        (cellWidth - pathSize) / 2; /* center the path in the cell */
      return (
        <path
          fill="none"
          key={`down_${xPos}_${yPos}_${i}`}
          stroke={pathColor}
          d={`
            M ${x + xOffset}, ${y}
            L ${x + xOffset}, ${y + cellHeight}
          `}
        />
      );
    });
    return (
      <g
        className={`workflow-badge__segment-down`}
        data-pos={`${xPos},${yPos}`}
        key={`down_${xPos}_${yPos}`}
      >
        {paths}
      </g>
    );
  };

  const renderRightPathSegment = (xPos, yPos) => {
    const x = xPos * cellWidth;
    const y = yPos * cellHeight;
    const paths = roleNames.map((roleName, i) => {
      const yOffset =
        (strokeWidth + strokeGap) * i /* space between strokes */ +
        (cellHeight - pathSize) / 2; /* center the path in the cell */
      return (
        <path
          fill="none"
          key={`right_${xPos}_${yPos}_${i}`}
          stroke={pathColor}
          d={`
            M ${x}, ${y + yOffset}
            L ${x + cellWidth}, ${y + yOffset}
          `}
        />
      );
    });
    return (
      <g
        className={`workflow-badge__segment-right`}
        data-pos={`${xPos},${yPos}`}
        key={`right_${xPos}_${yPos}`}
      >
        {paths}
      </g>
    );
  };

  return (
    <div className="workflow-badge">
      <div
        className="workflow-badge__background"
        style={{ width: size, height: size }}
      >
        <svg viewBox={svgViewBox} xmlns="http://www.w3.org/2000/svg">
          {renderActionMatrix()}
        </svg>
      </div>
    </div>
  );
};

WorkflowBadge.propTypes = {
  size: PropTypes.number,
  startTime: PropTypes.instanceOf(Date),
  endTime: PropTypes.instanceOf(Date),
  counts: PropTypes.shape({
    authors: PropTypes.number.isRequired,
    editors: PropTypes.number.isRequired,
    reviewers: PropTypes.number.isRequired,
    producers: PropTypes.number.isRequired
  }),
  paths: PropTypes.array,
  // paths: PropTypes.shape({
  //   authors: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   ),
  //   editors: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   ),
  //   reviewers: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   ),
  //   producers: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   )
  // }),
  identityMatrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)), // who can view identity of whom
  postPublicationVisibleIdentities: PropTypes.arrayOf(PropTypes.bool)
};

export default WorkflowBadge;
