import React, { Component } from 'react';
import { ActionProgressLog } from '../../src/';
import data from '../../test/fixtures/events';

export default class ActionProgressLogExample extends Component {
  render() {
    return (
      <div className="example">
        <div style={{ width: '400px', maxWidth: '100%' }}>
          {data.map(({ action, events }) => (
            <ActionProgressLog
              key={action['@id']}
              action={action}
              events={events}
            />
          ))}
        </div>

        <div style={{ width: '400px', maxWidth: '100%', marginTop: '40px' }}>
          <ActionProgressLog
            action={{
              '@type': 'UploadAction',
              actionStatus: 'CanceledActionStatus',
              startTime: '2019-06-18T06:20:00.656Z',
              endTime: '2019-06-18T06:20:50.656Z'
            }}
          />
        </div>

        <div style={{ width: '400px', maxWidth: '100%', marginTop: '40px' }}>
          <ActionProgressLog
            action={{
              '@type': 'UploadAction',
              actionStatus: 'FailedActionStatus',
              error: {
                '@type': 'Error',
                name: 'error',
                statusCode: 400,
                description: 'something went wrong'
              },
              startTime: '2019-06-18T06:20:00.656Z',
              endTime: '2019-06-18T06:20:50.656Z'
            }}
          />
        </div>
      </div>
    );
  }
}
