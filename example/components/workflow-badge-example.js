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
      y: A,
      z: [true, false, false, false], // only visible to author
      isPublicDuring: false,
      isPublicAfter: false
    },
    {
      id: 'action:createReleaseActionId',
      x: 1,
      y: A,
      z: [true, true, false, false], // author and editor can view
      isPublicDuring: false,
      isPublicAfter: true
    },
    {
      id: 'action:createReleaseActionId',
      x: 2,
      y: 0,
      z: [true, true, true, false], // all can view
      isPublicDuring: true,
      isPublicAfter: false
    },
    {
      id: 'action:createReleaseActionId2',
      x: 3,
      y: A,
      z: [true, true, true, true], // all can view
      isPublicDuring: true,
      isPublicAfter: true
    },

    // ReviewAction
    {
      id: 'action:reviewActionId',
      x: 4,
      y: R,
      z: [false, true, true, false], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: true
    },

    // editor
    {
      id: 'action:editorActionId1',
      x: 5,
      y: E,
      z: [false, false, true, false], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: true
    },

    // author
    {
      id: 'action:editorActionId2',
      x: 6,
      y: A,
      z: [true, true, true, false], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: false
    },

    // producer
    {
      id: 'action:editorActionId3',
      x: 7,
      y: P,
      z: [true, true, true, false], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: true
    },
    // author
    {
      id: 'action:authorActionId0',
      x: 8,
      y: A,
      z: [true, true, true, false], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: false
    },
    {
      id: 'action:authorActionId1',
      x: 9,
      y: A,
      z: [true, true, true, true], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: true
    },
    {
      id: 'action:authorActionId2',
      x: 10,
      y: A,
      z: [true, true, true, true], // only visible to reviewer first
      isPublicDuring: true,
      isPublicAfter: true
    }
  ];

  const viewIdentityPermissionMatrix = {
    author: {
      author: true,
      editor: true,
      reviewer: false,
      producer: true
    },
    editor: {
      author: true,
      editor: true,
      reviewer: true,
      producer: true
    },
    reviewer: {
      author: false,
      editor: true,
      reviewer: false,
      producer: false
    },
    producer: {
      author: true,
      editor: true,
      reviewer: false,
      producer: true
    },
    public: {
      author: true,
      editor: true,
      reviewer: true,
      producer: false
    }
  };

  const counts = {
    authors: 2,
    editors: 3,
    reviewers: 3,
    producers: 0
  };

  return (
    <div className="example">
      <div className="example__row">
        <WorkflowBadge
          paths={testPaths1}
          startTime={new Date()}
          endTime={new Date()}
          viewIdentityPermissionMatrix={viewIdentityPermissionMatrix}
          counts={counts}
          badgeHeight={108}
          badgeWidth={260}
        />
        <WorkflowBadge
          paths={testPaths1}
          startTime={new Date()}
          endTime={new Date()}
          viewIdentityPermissionMatrix={viewIdentityPermissionMatrix}
          counts={counts}
          activePathColor="white"
          inactivePathColor="#cccccc"
          foregroundColor="white"
          backgroundColor="#858585"
          cellColor="#949494"
        />
        <WorkflowBadge
          badgeHeight={200}
          badgeWidth={200}
          paths={testPaths1}
          startTime={new Date()}
          endTime={new Date()}
          viewIdentityPermissionMatrix={viewIdentityPermissionMatrix}
          counts={counts}
        />
      </div>
      <div className="example__row">
        <WorkflowBadge
          badgeHeight={120}
          badgeWidth={240}
          paths={testPaths1}
          startTime={new Date()}
          endTime={new Date()}
          viewIdentityPermissionMatrix={viewIdentityPermissionMatrix}
          counts={counts}
          activePathColor="white"
          inactivePathColor="#cccccc"
          foregroundColor="white"
          backgroundColor="#858585"
          cellColor="#949494"
        />
        <WorkflowBadge
          badgeHeight={120}
          badgeWidth={300}
          paths={testPaths1}
          startTime={new Date()}
          endTime={new Date()}
          viewIdentityPermissionMatrix={viewIdentityPermissionMatrix}
          counts={counts}
          activePathColor="white"
          inactivePathColor="#cccccc"
          foregroundColor="white"
          backgroundColor="#858585"
          cellColor="#949494"
        />
        <WorkflowBadge
          badgeHeight={120}
          badgeWidth={80}
          paths={testPaths1}
          startTime={new Date()}
          endTime={new Date()}
          viewIdentityPermissionMatrix={viewIdentityPermissionMatrix}
          counts={counts}
          activePathColor="white"
          inactivePathColor="#cccccc"
          foregroundColor="white"
          backgroundColor="#858585"
          cellColor="#949494"
        />
      </div>
    </div>
  );
}
