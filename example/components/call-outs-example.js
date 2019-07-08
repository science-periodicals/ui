import React from 'react';

import { CallOuts, CallOut, Card } from '../../src/';

export default function CallOutsExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <CallOuts>
          <CallOut targetID="target-1">This is a block</CallOut>
          <CallOut defaultLabelVisible={true} targetID="target-2">
            defaultLabelVisible: true
          </CallOut>
          <CallOut defaultLabelVisible={false} targetID="target-3">
            Another Block: Target-3
          </CallOut>
          <CallOut
            defaultLabelVisible={false}
            targetID="target-4"
            label="my label"
          >
            With A Label set
          </CallOut>
        </CallOuts>
      </div>
      <div className="example__row">
        <div
          id="target-1"
          style={{
            width: '100px',
            height: '100px',
            background: 'whitesmoke',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {`#target-1`}
        </div>
        <Card>
          <div
            id="target-2"
            style={{
              width: '100px',
              height: '100px',
              background: 'whitesmoke',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {`#target-2`}
          </div>
        </Card>
        <div
          id="target-3"
          style={{
            width: '100px',
            height: '100px',
            background: 'whitesmoke',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {`#target-3`}
        </div>
        <div
          id="target-4"
          style={{
            width: '100px',
            height: '100px',
            background: 'whitesmoke',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {`#target-4`}
        </div>
      </div>
    </div>
  );
}
