import React from 'react';
import { WorkflowBadge } from '../../src/';

export default function WorkflowBadgeExample(props) {
  const A = 0;
  const E = 1;
  const R = 2;
  const P = 3;

  const testPaths1 = [
    {
      id: 'action:createReleaseActionId',
      x: 0,
      y: 0,
      z: [true, false, false, false] // only visible to author
    },
    {
      id: 'action:createReleaseActionId',
      x: 1,
      y: 0,
      z: [true, true, false, false] // author and editor can view
    },
    {
      id: 'action:createReleaseActionId',
      x: 2,
      y: 0,
      z: [true, true, true, true] // all can view
    },
    {
      id: 'action:createReleaseActionId',
      x: 3,
      y: 0,
      z: [true, true, true, true] // all can view
    },

    // ReviewAction
    {
      id: 'action:reviewActionId',
      x: 4,
      y: 2,
      z: [false, false, true, false] // only visible to reviewer first
    },

    // editor
    {
      id: 'action:editorActionId',
      x: 5,
      y: 1,
      z: [false, false, true, false] // only visible to reviewer first
    },

    // author
    {
      id: 'action:editorActionId',
      x: 6,
      y: 0,
      z: [true, true, true, false] // only visible to reviewer first
    },

    // producer
    {
      id: 'action:editorActionId',
      x: 7,
      y: 3,
      z: [true, true, true, false] // only visible to reviewer first
    },
    // author
    {
      id: 'action:authoActionId',
      x: 8,
      y: 0,
      z: [true, true, true, false] // only visible to reviewer first
    },
    {
      id: 'action:authoActionId',
      x: 9,
      y: 0,
      z: [true, true, true, false] // only visible to reviewer first
    }
  ];

  return (
    <div className="example">
      <WorkflowBadge paths={testPaths1} />
    </div>
  );
}
