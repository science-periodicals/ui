import React from 'react';
import PropTypes from 'prop-types';

const WorkflowBadgeMatrix = ({
  size,
  activePathColor,
  inactivePathColor,
  cellColor,
  paths
}) => {
  const actionCount = paths.length;
  const roleNames = ['Author', 'Editor', 'Reviewer', 'Producer'];
  const cellHeight = size / 4;
  const strokeWidth = 1.5; /* width of a single role path line */
  const strokeGap = 1; /* space between role path lines */
  const pathSize =
    4 * strokeWidth +
    3 * strokeGap; /* total width of the path (4 strokes + 3 graps) */

  /*
  count total number of columns - this is a function of the number of actions
  and the number of times the role changes.
  */
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

  /**
   * Sort actions by by X value
   */
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
  const roleActionMatrix = (() => {
    // initialize every cell value
    let roleActionMatrix = [];
    for (let col = 0; col < colCount; col++) {
      for (let row = 0; row < rowCount; row++) {
        if (!roleActionMatrix[col]) {
          roleActionMatrix[col] = { rows: [], colType: undefined, colWidth: 0 };
        }
        roleActionMatrix[col].rows[row] = { id: 'empty', x: col, y: row };
      }
    }

    // piece together the different types of paths
    let colIndex = 0;
    paths.forEach((action, i) => {
      if (i == 0) {
        roleActionMatrix[colIndex].rows[action.y] = {
          id: 'actionGroup',
          x: colIndex,
          y: action.y,
          actions: [action]
        };
      } else {
        const prevAction = sortedPaths[i - 1];
        if (action.y == prevAction.y) {
          // part of same group
          roleActionMatrix[colIndex].rows[action.y] = {
            id: 'actionGroup',
            x: colIndex,
            y: action.y,
            actions: roleActionMatrix[colIndex].rows[action.y].actions.concat(
              action
            )
          };
        } else {
          const prevAction = sortedPaths[i - 1];
          // new group - add action connectors
          colIndex++;
          // an action can jump through multiple roles, so build segment for each one
          // Note: action's can move up or down
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

            roleActionMatrix[colIndex].rows[row] = {
              id: `${type}:${subtype}`,
              x: colIndex,
              y: row,
              z:
                prevAction.z /* inherit the visibility permissions from the previous action */
            };
          }
          // add the new action
          colIndex++;
          //console.log('add action to ', colIndex, action.y);
          roleActionMatrix[colIndex].rows[action.y] = {
            id: 'actionGroup',
            x: colIndex,
            y: action.y,
            actions: [action]
          };
        }
      }
    });

    // find the fixed column widths
    roleActionMatrix.forEach(col => {
      let colWidth = 0;
      let type = 'connector';
      col.rows.forEach(row => {
        if (row.id === 'actionGroup') {
          type = 'actionGroup';
          if (row.actions.length > colWidth) {
            colWidth = row.actions.length;
          }
        }
      });
      col.colWidth = type === 'connector' ? pathSize : colWidth;
      col.colType = type;
      //fixedWidth += type === 'connector' ? pathSize : 0;
    });

    const fixedWidth = roleActionMatrix.reduce((acc, curr) => {
      return curr.colType === 'connector' ? acc + curr.colWidth : acc;
    }, 0);

    // find the available space for the action widths
    const variableWidth = size - fixedWidth;

    // now that we know how much free space we have, we can go back through the
    // matrix and plug in the widths for the actions
    const singleActionWidth = variableWidth / actionCount;
    if (singleActionWidth < 1) {
      // TODO maybe scale entire badge if this happens;
      console.warn('There is not enough space to render the worflow badge.');
    }

    roleActionMatrix.forEach(col => {
      if (col.colType === 'actionGroup') {
        col.colWidth = col.colWidth * singleActionWidth;
      }
    });
    //console.log('roleActionMatrix: ', roleActionMatrix);
    return roleActionMatrix;
  })();

  /**
   * Render functions to convert matrix into svg paths
   */
  const renderActionMatrix = size => {
    let segments = [];
    let xOffset = 0;

    roleActionMatrix.forEach((col, x) => {
      col.rows.forEach((cell, y) => {
        let yOffset = y * cellHeight;

        segments.push(
          renderCell(xOffset, yOffset, col.colWidth, cellHeight, cell.x, cell.y)
        );

        if (cell.id === 'vertical:down') {
          //console.log('adding cell', cell);
          segments.push(
            renderVerticalPathSegment(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              'down'
            )
          );
        } else if (cell.id === 'vertical:up') {
          //console.log('adding cell', cell);
          segments.push(
            renderVerticalPathSegment(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              'up'
            )
          );
        } else if (cell.id === 'corner:tr') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              'tr'
            )
          );
        } else if (cell.id === 'corner:br') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              'br'
            )
          );
        } else if (cell.id === 'corner:tl') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              'tl'
            )
          );
        } else if (cell.id === 'corner:bl') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              'bl'
            )
          );
        } else if (cell.id === 'actionGroup') {
          segments.push(
            renderRightPathSegment(
              xOffset,
              yOffset,
              col.colWidth,
              cell.x,
              cell.y,
              cell.actions
            )
          );
        }
      });
      xOffset += col.colWidth;
    });

    return segments;
  };

  /* 
  render the background grid cell
  */
  const renderCell = (xOffset, yOffset, width, height, col, row) => {
    return (
      <rect
        width={width - 1}
        height={height - 1}
        x={xOffset + 0.5}
        y={yOffset + 0.5}
        fill={cellColor}
        key={`cell_${col}_${row}`}
      />
    );
  };

  /*
  render the corners
  */
  const renderCorner = (
    xOffset,
    yOffset,
    width,
    height,
    col,
    row,
    viz,
    type
  ) => {
    const x1 = xOffset;
    const y1 = yOffset;

    const cellWidth = width;
    const cellHeight = height;

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
        startY =
          strokeWidth / 2 +
          y1 +
          (cellHeight - pathSize) / 2 +
          strokeStartYOffset;
        cornerStartX = startX;
        cornerStartY = startY;
        cornerEndX =
          strokeWidth / 2 + x1 + (cellWidth - pathSize) / 2 + strokeEndXOffset;
        cornerEndY = y1 + gridSquareSize + gridSquareYOffset;
        endX =
          strokeWidth / 2 + x1 + (cellWidth - pathSize) / 2 + strokeEndXOffset;
        endY = y1 + cellHeight;
        cornerQX = cornerEndX;
        cornerQY = cornerStartY;
        r =
          strokeWidth / 2 +
          (3 - i) * (strokeGap + strokeWidth) +
          (gridSquareSize - cornerSize) / 2;
        sweep = 1;
      } else if (type == 'tl') {
        // must be entering from the bottom
        strokeStartXOffset = i * (strokeGap + strokeWidth);
        strokeStartYOffset = 0;
        strokeEndXOffset = 0;
        strokeEndYOffset = i * (strokeGap + strokeWidth);
        startX =
          strokeWidth / 2 +
          x1 +
          (cellWidth - pathSize) / 2 +
          strokeStartXOffset;
        startY = y1 + cellHeight;
        cornerStartX = startX;
        cornerStartY = startY - gridSquareYOffset;
        endX = x1 + cellWidth;
        endY =
          strokeWidth / 2 + y1 + (cellHeight - pathSize) / 2 + strokeEndYOffset;
        cornerEndX = endX;
        cornerEndY = endY;
        cornerQX = cornerStartX;
        cornerQY = cornerEndY;
        r =
          strokeWidth / 2 +
          (3 - i) * (strokeGap + strokeWidth) +
          (cornerSize - pathSize) / 2;
        sweep = 1;
      } else if (type == 'bl') {
        // must be entering from the top
        strokeStartXOffset = (3 - i) * (strokeGap + strokeWidth);
        strokeStartYOffset = 0;
        strokeEndXOffset = 0;
        strokeEndYOffset = i * (strokeGap + strokeWidth);
        startX =
          strokeWidth / 2 +
          x1 +
          (cellWidth - pathSize) / 2 +
          strokeStartXOffset;
        startY = y1;
        cornerStartX = startX + gridSquareXOffset;
        cornerStartY = startY + gridSquareYOffset;
        endX = x1 + cellWidth;
        endY =
          strokeWidth / 2 + y1 + (cellHeight - pathSize) / 2 + strokeEndYOffset;
        cornerEndX = endX;
        cornerEndY = endY;
        cornerQX = cornerStartX;
        cornerQY = cornerEndY;
        r =
          strokeWidth / 2 +
          i * (strokeGap + strokeWidth) +
          (cornerSize - pathSize) / 2;
        sweep = 0;
      } else if (type == 'br') {
        // must be entering from the bottom
        // must be entering from the left
        strokeStartXOffset = 0;
        strokeStartYOffset = i * (strokeGap + strokeWidth);
        strokeEndXOffset = i * (strokeGap + strokeWidth);
        strokeEndYOffset = 0;
        startX = x1;
        startY =
          strokeWidth / 2 +
          y1 +
          (cellHeight - pathSize) / 2 +
          strokeStartYOffset;
        cornerStartX = startX;
        cornerStartY = startY;
        endX =
          strokeWidth / 2 + x1 + (cellWidth - pathSize) / 2 + strokeEndXOffset;
        endY = y1;
        cornerEndX = endX;
        cornerEndY = y1 + gridSquareYOffset;
        cornerQX = cornerEndX;
        cornerQY = cornerStartY;
        r =
          strokeWidth / 2 +
          i * (strokeGap + strokeWidth) +
          (gridSquareSize - pathSize) / 2;
        sweep = 0;
      }

      return (
        <path
          fill="none"
          key={`rcorner_${col}_${row}_${i}`}
          stroke={viz[i] ? activePathColor : inactivePathColor}
          strokeWidth={strokeWidth}
          data-role={roleNames[i]}
          d={`
              M ${startX},${startY}
              L ${cornerStartX},${cornerStartY}
              A ${r} ${r} 0 0 ${sweep} ${cornerEndX} ${cornerEndY}
              L ${endX},${endY}
            `}
        />
      );
      //alternatively use quadratic bezzier
      /*
      return (
        <path
          fill="none"
          key={`corner_${x}_${y}_${i}`}
          stroke={activePathColor}
          data-role={roleNames[i]}
          data-type={type}
          d={`
              M${startX},${startY}
              L ${cornerStartX},${cornerStartY}
              Q ${cornerQX},${cornerQY} ${cornerEndX},${cornerEndY}
              L ${endX},${endY}
            `}
        />
      );*/
    });

    return (
      <g
        className={`workflow-badge__segment-corner`}
        data-pos={`${col},${row}`}
        key={`corner_${col}_${row}`}
      >
        {/* uncomment to debug */
        /* <rect
          id="grid-square"
          width={gridSquareSize}
          height={gridSquareSize}
          x={x1 + gridSquareXOffset}
          y={y1 + gridSquareYOffset}
          strokeWidth=".5"
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
          strokeWidth=".5"
          fill="none"
        /> */}
        {strokes}
      </g>
    );
  };

  const renderVerticalPathSegment = (
    xOffset,
    yOffset,
    width,
    height,
    col,
    row,
    viz,
    type
  ) => {
    const x = xOffset + strokeWidth / 2;
    const y = yOffset;
    const paths = roleNames.map((roleName, i) => {
      const rolePos = type === 'up' ? i : 3 - i;
      const xOffset =
        (strokeGap + strokeWidth) * rolePos /* space between strokes */ +
        (width - pathSize) / 2; /* center the path in the cell */
      return (
        <path
          fill="none"
          key={`down_${col}_${row}_${rolePos}`}
          data-role={`${roleName}`}
          stroke={viz[i] ? activePathColor : inactivePathColor}
          strokeWidth={strokeWidth}
          d={`
            M ${x + xOffset}, ${y}
            L ${x + xOffset}, ${y + height}
          `}
        />
      );
    });
    return (
      <g
        className={`workflow-badge__segment-down`}
        data-pos={`${col},${row}`}
        key={`down_${col}_${row}`}
      >
        {paths}
      </g>
    );
  };

  const renderRightPathSegment = (
    xOffset,
    yOffset,
    width,
    col,
    row,
    actions
  ) => {
    const x = xOffset;
    const y = yOffset;

    const paths = actions.map(action => {
      return roleNames.map((roleName, i) => {
        const strokeYOffset =
          strokeWidth / 2 /* account for stroke thickness */ +
          (strokeWidth + strokeGap) * i /* space between strokes */ +
          (cellHeight - pathSize) / 2; /* center the path in the cell */

        return (
          <path
            fill="none"
            key={`right_${col}_${row}_${i}`}
            stroke={action.z[i] ? activePathColor : inactivePathColor}
            strokeWidth={strokeWidth}
            d={`
              M ${x}, ${y + strokeYOffset}
              L ${x + width}, ${y + strokeYOffset}
            `}
          />
        );
      });
    });

    return (
      <g
        className={`workflow-badge__segment-right`}
        data-pos={`${col},${row}`}
        key={`right_${col}_${row}`}
      >
        {paths}
      </g>
    );
  };

  return <g> {renderActionMatrix(size, 0)}</g>;
};

WorkflowBadgeMatrix.propTypes = {
  size: PropTypes.number,
  activePathColor: PropTypes.string,
  inactivePathColor: PropTypes.string,
  paths: PropTypes.array
};

export default WorkflowBadgeMatrix;
