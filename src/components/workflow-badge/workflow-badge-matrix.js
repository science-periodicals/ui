import React from 'react';
import PropTypes from 'prop-types';
import Tooltip, { TooltipContent } from '../tooltip';

function WorkflowBadgeMatrix({
  width,
  height,
  minTimeLineWidth,
  activePathColor,
  inactivePathColor,
  activePathHighlightColor = '#ff7560',
  inactivePathHighlightColor = '#ccaa6e',
  isPublicDuringColor = 'red',
  isPublicAfterColor = 'blue',
  isPublicDuringAndAfterColor = 'purple',
  cellColor,
  paths,
  highlightRole
}) {
  const actionCount = paths.length;
  const roleNames = ['Authors', 'Editors', 'Reviewers', 'Producers'];
  const cellHeight = height / 4;
  const strokeWidth = 1.5; /* width of a single role path line */
  const strokeGap = 1; /* space between role path lines */
  const pathSize =
    4 * strokeWidth +
    3 * strokeGap; /* total width of the path (4 strokes + 3 graps) */

  const publicPathSize =
    pathSize + 2; /* the size of the path used to color code the isPublic bg */
  const minActionWidth = 1; /* the min width of a single action - actions can stretch to fill available space */

  /* find the minimal desired space for the matrix. */
  const minMatrixWidth = Math.max(width, minTimeLineWidth);

  /*
  count total number of columns - this is a function of the number of actions
  and the number of times the role changes.
  */
  const colCount = (() => {
    let count = 1;
    paths.forEach((actionItem, i) => {
      if (i > 0) {
        const prevActionItem = paths[i - 1];
        if (prevActionItem.y !== actionItem.y) {
          // make a col for the connector and one for the actionItem
          count += 2;
        } else if (prevActionItem.id !== actionItem.id) {
          // new col for each group of matching action id's
          count += 1;
        }
      }
    });
    return count;
  })();

  const rowCount = roleNames.length;

  /**
   * Sort actions by X value
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
   * transform actionItem data in full matrix, grouping contiguous actions together -
   */
  const roleActionMatrix = (() => {
    // initialize every cell value
    let roleActionMatrix = [];
    for (let col = 0; col < colCount; col++) {
      for (let row = 0; row < rowCount; row++) {
        if (!roleActionMatrix[col]) {
          roleActionMatrix[col] = { rows: [], colType: undefined, colWidth: 0 };
        }
        roleActionMatrix[col].rows[row] = { type: 'empty', x: col, y: row };
      }
    }

    // piece together the different types of paths
    let colIndex = 0;
    paths.forEach((actionItem, i) => {
      if (i === 0) {
        // initialize so we can have prevActionItem moving forward
        roleActionMatrix[colIndex].rows[actionItem.y] = {
          first: true,
          type: 'actionGroup',
          id: actionItem.id,
          x: colIndex,
          y: actionItem.y,
          actions: [actionItem]
        };
      } else {
        const prevActionItem = sortedPaths[i - 1];
        if (
          actionItem.id === prevActionItem.id &&
          actionItem.y === prevActionItem.y
        ) {
          // part of same group
          const existing = roleActionMatrix[colIndex].rows[actionItem.y];
          roleActionMatrix[colIndex].rows[actionItem.y] = {
            type: 'actionGroup',
            id: actionItem.id,
            x: colIndex,
            y: actionItem.y,
            actions: roleActionMatrix[colIndex].rows[
              actionItem.y
            ].actions.concat(actionItem)
          };
        } else {
          // new group - add actionItem connectors
          const prevActionItem = sortedPaths[i - 1];

          colIndex++;

          if (actionItem.y !== prevActionItem.y) {
            // an actionItem can jump through multiple roles, so build segment for each one
            // Note: actionItem's can move up or down
            const rowStart =
              prevActionItem.y < actionItem.y ? prevActionItem.y : actionItem.y;
            const rowEnd =
              prevActionItem.y < actionItem.y ? actionItem.y : prevActionItem.y;

            for (let row = rowStart; row <= rowEnd; row++) {
              const type =
                row === prevActionItem.y || row == actionItem.y
                  ? 'corner'
                  : 'vertical';
              const direction = prevActionItem.y < actionItem.y ? 'down' : 'up';

              let subtype;
              if (row === prevActionItem.y && direction === 'down') {
                subtype = 'tr'; // top-right radius
              } else if (row == actionItem.y && direction === 'down') {
                subtype = 'bl'; // bottom-left radius
              } else if (row === prevActionItem.y && direction === 'up') {
                subtype = 'br'; // bottom-right radius
              } else if (row === actionItem.y && direction === 'up') {
                subtype = 'tl'; // top-right radius
              } else {
                subtype = direction;
              }

              roleActionMatrix[colIndex].rows[row] = {
                type: `${type}:${subtype}`,
                x: colIndex,
                y: row,
                z:
                  prevActionItem.z /* inherit the visibility permissions from the previous actionItem */,
                isPublicDuring: prevActionItem.isPublicDuring,
                isPublicAfter: prevActionItem.isPublicAfter
              };
            }
            // add the new actionItem
            colIndex++;
          }

          //console.log('add actionItem to ', colIndex, actionItem.y);
          roleActionMatrix[colIndex].rows[actionItem.y] = {
            type: 'actionGroup',
            id: actionItem.id,
            x: colIndex,
            y: actionItem.y,
            actions: [actionItem]
          };
        }
      }
    });

    // find the fixed column widths
    roleActionMatrix.forEach(col => {
      let colWidth = 0;
      let type = 'connector';

      col.rows.forEach(row => {
        /* default colWidth of action groups will be the number of actions */

        if (row.type === 'actionGroup') {
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

    // find the minimum width we can use to render this matrix
    const minWidth = actionCount * minActionWidth + fixedWidth;

    // find the available space for the actionItem widths
    const variableWidth = minMatrixWidth - fixedWidth;

    // now that we know how much free space we have, we can go back through the
    // matrix and plug in the widths for the actions
    const singleActionWidth = Math.max(
      variableWidth / actionCount,
      minActionWidth
    );

    roleActionMatrix.forEach(col => {
      if (col.colType === 'actionGroup') {
        col.colWidth = col.colWidth * singleActionWidth;
      }
    });
    // console.log('roleActionMatrix: ', roleActionMatrix);
    return roleActionMatrix;
  })();

  /** 
    Render the underlying grid for each action 
  */
  const renderGrid = size => {
    let cellBlocks = [];

    let xOffset = 0;
    let prevActionId;
    let actionId;

    roleActionMatrix.forEach((col, x) => {
      col.rows.forEach((cell, y) => {
        let yOffset = y * cellHeight;
        let isEmpty = false;
        if (cell.type === 'actionGroup') {
          actionId = cell.actions[0].id;
        } else if (cell.type === 'empty') {
          isEmpty = true;
        }
        cellBlocks.push(
          renderGridCell(
            xOffset,
            yOffset,
            col.colWidth,
            isEmpty ? null : actionId
          )
        );

        // if (cell.type === 'actionGroup') {
        //   const actionCells = cell.actions.map((action, index) => {
        //     return renderGridCell(xOffset, yOffset, col.colWidth);
        //   });
        //   cellBlocks = cellBlocks.concat(actionCells);
        // } else {
        //   cellBlocks.push(
        //     renderGridCell(xOffset, yOffset, col.colWidth, `${x}_${y}`)
        //   );
        // }
      });
      xOffset += col.colWidth;
    });
    return <div className="workflow-badge-matrix__grid">{cellBlocks}</div>;
  };

  const renderGridCell = (xOffset, yOffset, width, toolTipText) => {
    return (
      <div
        className={`workflow-badge-matrix__grid__cell ${
          toolTipText ? 'workflow-badge-matrix__grid__cell--tooltip' : ''
        }`}
        key={`${xOffset}_${yOffset}`}
        style={{
          position: 'absolute',
          left: `${xOffset + 0.5}px`,
          top: `${yOffset + 0.5}px`,
          width: `${width - 1}px`,
          height: `${cellHeight - 1}px`,
          backgroundColor: cellColor
        }}
      >
        {toolTipText && (
          <Tooltip tagName="div">
            <TooltipContent>{toolTipText}</TooltipContent>
            <div
              style={{
                left: '0px',
                top: '0px',
                width: '100%',
                height: '100%'
              }}
            ></div>
          </Tooltip>
        )}
      </div>
    );
  };

  /**
   * Render functions to convert matrix into svg paths
   */
  const renderActionMatrix = size => {
    let segments = [];
    let xOffset = 0;

    roleActionMatrix.forEach((col, x) => {
      col.rows.forEach((cell, y) => {
        let yOffset = y * cellHeight;

        // segments.push(
        //   renderCell(xOffset, yOffset, col.colWidth, cellHeight, cell.x, cell.y)
        // );

        if (cell.type === 'vertical:down') {
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
              cell.isPublicDuring,
              cell.isPublicAfter,
              'down'
            )
          );
        } else if (cell.type === 'vertical:up') {
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
              cell.isPublicDuring,
              cell.isPublicAfter,
              'up'
            )
          );
        } else if (cell.type === 'corner:tr') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              cell.isPublicDuring,
              cell.isPublicAfter,
              'tr'
            )
          );
        } else if (cell.type === 'corner:br') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              cell.isPublicDuring,
              cell.isPublicAfter,
              'br'
            )
          );
        } else if (cell.type === 'corner:tl') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              cell.isPublicDuring,
              cell.isPublicAfter,
              'tl'
            )
          );
        } else if (cell.type === 'corner:bl') {
          segments.push(
            renderCorner(
              xOffset,
              yOffset,
              col.colWidth,
              cellHeight,
              cell.x,
              cell.y,
              cell.z,
              cell.isPublicDuring,
              cell.isPublicAfter,
              'bl'
            )
          );
        } else if (cell.type === 'actionGroup') {
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

    const totalWidth = roleActionMatrix.reduce((acc, curr) => {
      return acc + curr.colWidth;
    }, 0);

    return (
      <div className="workflow-badge-matrix-container">
        {renderGrid()}
        <svg
          height={height}
          width={totalWidth}
          className="workflow-badge-matrix__path-svg"
        >
          {segments}
        </svg>
      </div>
    );
  };

  /*
  render the background grid cell as an svg rect
  */
  const renderCell = (xOffset, yOffset, width, height, col, row) => {
    return (
      <rect
        className="workflow-badge__cell-bg"
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
    isPublicDuring,
    isPublicAfter,
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

    const pathNames = ['public'].concat(roleNames);

    const strokes = pathNames.map((roleName, i) => {
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

      // the bg isPublic stroke should offset to the middle of path, instead offset according to the role position
      const strokePos = roleName === 'public' ? 1.5 : i - 1;

      if (type === 'tr') {
        // must be entering from the left
        strokeStartXOffset = 0;
        strokeStartYOffset = strokePos * (strokeGap + strokeWidth);
        strokeEndXOffset = (3 - strokePos) * (strokeGap + strokeWidth);
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
          (3 - strokePos) * (strokeGap + strokeWidth) +
          (gridSquareSize - cornerSize) / 2;
        sweep = 1;
      } else if (type == 'tl') {
        // must be entering from the bottom
        strokeStartXOffset = strokePos * (strokeGap + strokeWidth);
        strokeStartYOffset = 0;
        strokeEndXOffset = 0;
        strokeEndYOffset = strokePos * (strokeGap + strokeWidth);
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
          (3 - strokePos) * (strokeGap + strokeWidth) +
          (cornerSize - pathSize) / 2;
        sweep = 1;
      } else if (type == 'bl') {
        // must be entering from the top
        strokeStartXOffset = (3 - strokePos) * (strokeGap + strokeWidth);
        strokeStartYOffset = 0;
        strokeEndXOffset = 0;
        strokeEndYOffset = strokePos * (strokeGap + strokeWidth);
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
          strokePos * (strokeGap + strokeWidth) +
          (cornerSize - pathSize) / 2;
        sweep = 0;
      } else if (type == 'br') {
        // must be entering from the bottom
        // must be entering from the left
        strokeStartXOffset = 0;
        strokeStartYOffset = strokePos * (strokeGap + strokeWidth);
        strokeEndXOffset = strokePos * (strokeGap + strokeWidth);
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
          strokePos * (strokeGap + strokeWidth) +
          (gridSquareSize - pathSize) / 2;
        sweep = 0;
      }

      const color = (() => {
        if (roleName === 'public') {
          if (isPublicAfter && isPublicDuring) {
            return isPublicDuringAndAfterColor;
          } else if (isPublicAfter) {
            return isPublicAfterColor;
          } else if (isPublicDuring) {
            return isPublicDuringColor;
          }
        } else if (viz[strokePos]) {
          if (roleName === highlightRole) {
            return activePathHighlightColor;
          } else {
            return activePathColor;
          }
        } else if (roleName === highlightRole) {
          return inactivePathHighlightColor;
        } else {
          return inactivePathColor;
        }
      })();

      return (
        <path
          fill="none"
          key={`rcorner_${col}_${row}_${i}`}
          stroke={color}
          strokeWidth={roleName === 'public' ? publicPathSize : strokeWidth}
          data-role={roleNames[strokePos]}
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
    isPublicDuring,
    isPublicAfter,
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
          stroke={
            viz[i]
              ? roleName === highlightRole
                ? activePathHighlightColor
                : activePathColor
              : roleName === highlightRole
              ? inactivePathHighlightColor
              : inactivePathColor
          }
          strokeWidth={strokeWidth}
          d={`
            M ${x + xOffset}, ${y}
            L ${x + xOffset}, ${y + height}
          `}
        />
      );
    });

    const isPublicColor =
      isPublicAfter && isPublicDuring
        ? isPublicDuringAndAfterColor
        : isPublicDuring
        ? isPublicDuringColor
        : isPublicAfter
        ? isPublicAfterColor
        : 'none';

    const publicPath = (
      <path
        fill="none"
        key={`down_${col}_${row}_pub-viz`}
        stroke={isPublicColor}
        strokeWidth={pathSize + 2}
        d={`
      M ${xOffset + width / 2}, ${y}
      L ${xOffset + width / 2}, ${y + height}
    `}
      />
    );
    return (
      <g
        className={`workflow-badge__segment-down`}
        data-pos={`${col},${row}`}
        key={`down_${col}_${row}`}
      >
        {publicPath}
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

    const paths = actions.map((actionItem, subActionIndex) => {
      return roleNames.map((roleName, i) => {
        const strokeYOffset =
          strokeWidth / 2 /* account for stroke thickness */ +
          (strokeWidth + strokeGap) * i /* space between strokes */ +
          (cellHeight - pathSize) / 2; /* center the path in the cell */

        const subActionWidth = width / actions.length;
        const subActionXOffset = subActionIndex * subActionWidth;

        return (
          <path
            fill="none"
            key={`right_${col}_${row}_${i}`}
            stroke={
              actionItem.z[i]
                ? roleName === highlightRole
                  ? activePathHighlightColor
                  : activePathColor
                : roleName === highlightRole
                ? inactivePathHighlightColor
                : inactivePathColor
            }
            strokeWidth={strokeWidth}
            d={`
              M ${x + subActionXOffset}, ${y + strokeYOffset}
              L ${x + subActionXOffset + subActionWidth}, ${y + strokeYOffset}
            `}
          />
        );
      });
    });

    const publicPath = actions.map((actionItem, subActionIndex) => {
      const subActionWidth = width / actions.length;
      const subActionXOffset = subActionIndex * subActionWidth;
      const strokeYOffset = cellHeight / 2;

      const color =
        actionItem.isPublicAfter && actionItem.isPublicDuring
          ? isPublicDuringAndAfterColor
          : actionItem.isPublicDuring
          ? isPublicDuringColor
          : actionItem.isPublicAfter
          ? isPublicAfterColor
          : 'none';

      return (
        <path
          key={`right_${col}_${row}_${subActionIndex}_pub-vis`}
          fill="none"
          stroke={color}
          strokeWidth={pathSize + 2}
          d={`
              M ${x + subActionXOffset}, ${y + strokeYOffset}
              L ${x + subActionXOffset + subActionWidth}, ${y + strokeYOffset}
            `}
        />
      );
    });

    return (
      <g
        className={`workflow-badge__segment-right`}
        data-pos={`${col},${row}`}
        key={`right_${col}_${row}`}
      >
        {publicPath}
        {paths}
      </g>
    );
  };

  return renderActionMatrix(height, 0);
}

WorkflowBadgeMatrix.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  minTimeLineWidth: PropTypes.number,
  cellColor: PropTypes.string,
  activePathColor: PropTypes.string,
  inactivePathColor: PropTypes.string,
  paths: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
      x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
      y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
      z: PropTypes.arrayOf(PropTypes.bool).isRequired, // A, E, R, P to color code the time-varying audience
      isPublicDuring: PropTypes.bool.isRequired, // an action can be viewed publicly _during_ the editorial workflow
      isPublicAfter: PropTypes.bool.isRequired // an action can be viewed publicly _after_ the editorial workflow has been completed
    })
  ),
  highlightRole: PropTypes.string
};

export default WorkflowBadgeMatrix;
