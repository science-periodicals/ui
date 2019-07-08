var events = [
  {
    action: {
      '@id': '_:611b619f-976d-4c68-a43c-3f7e265755ec',
      '@type': 'UploadAction',
      actionStatus: 'CompletedActionStatus',
      agent: 'user:jen',
      object: {
        '@id': '_:57161aa3-be57-4c46-bf19-49fd22d5c8db',
        encodesCreativeWork: 'scienceai:b97a9493-413e-4140-8129-c2db93e99303'
      },
      instrument: 'scienceai:81d09e6d-7f83-4673-8521-29906eb3499d@graph',
      startTime: '2017-01-06T04:09:07.077Z',
      endTime: '2017-01-06T04:09:08.176Z'
    },
    events: [
      {
        '@id': '_:6bca9502-9c06-4c49-996c-0e97067ca726',
        '@type': 'ProgressEvent',
        startDate: '2017-01-06T04:09:07.077Z',
        description: 'uploading video.mp4',
        endDate: '2017-01-06T04:09:08.176Z'
      }
    ]
  },
  {
    action: {
      result: 'scienceai:9c25435f-5cce-461a-9899-633f402bf8cc',
      startTime: '2017-01-06T04:09:12.869Z',
      targetCollection: 'scienceai:81d09e6d-7f83-4673-8521-29906eb3499d@graph',
      actionStatus: 'ActiveActionStatus',
      '@type': 'AudioVideoProcessingAction',
      agent: 'user:jen',
      object: 'scienceai:2e3c97d1-fd91-48b0-9507-1332dafe87d0',
      instrument: 'scienceai:81d09e6d-7f83-4673-8521-29906eb3499d@graph',
      '@id': 'scienceai:a7776d1b-5ddd-4e44-a0c4-d66d426ec676'
    },
    events: [
      {
        '@id': '_:1e04c3de-e1a4-47c0-a36e-b70399f4ab1d',
        '@type': 'ProgressEvent',
        startDate: '2017-01-06T04:09:08.330Z',
        description: 'processing video.mp4',
        subEvent: [
          {
            '@id': '_:4646ec83-08cd-47f6-b806-dabe2a381cdc',
            '@type': 'ProgressEvent',
            startDate: '2017-01-06T04:09:08.338Z',
            description: 'extracting metadata for video.mp4',
            superEvent: '_:1e04c3de-e1a4-47c0-a36e-b70399f4ab1d',
            endDate: '2017-01-06T04:09:08.724Z',
            subEvent: [
              {
                '@id': '_:dd749656-d896-4e16-a7b6-fa5abb8cd6a1',
                '@type': 'ProgressEvent',
                startDate: '2017-01-06T04:09:08.534Z',
                description: 'extracting thumbnail for video.mp4',
                superEvent: '_:4646ec83-08cd-47f6-b806-dabe2a381cdc',
                progress: {
                  '@type': 'QuantitativeValue',
                  value: 14.3232
                }
              }
            ]
          },
          {
            '@id': '_:914e570c-2e1e-4d62-aa1d-66cc88ac79a2',
            '@type': 'ProgressEvent',
            startDate: '2017-01-06T04:09:08.350Z',
            description: 'transcoding video.mp4 into video.webm',
            superEvent: '_:1e04c3de-e1a4-47c0-a36e-b70399f4ab1d',
            endDate: '2017-01-06T04:09:12.848Z',
            subEvent: [
              {
                '@id': '_:b8f5115d-eb80-46b1-8303-aa410e0592d0',
                '@type': 'ProgressEvent',
                startDate: '2017-01-06T04:09:12.782Z',
                description: 'extracting metadata for video.webm',
                superEvent: '_:914e570c-2e1e-4d62-aa1d-66cc88ac79a2',
                endDate: '2017-01-06T04:09:12.847Z',
                subEvent: [
                  {
                    '@id': '_:6325a099-ccba-4de8-868a-7c6a62328574',
                    '@type': 'ProgressEvent',
                    startDate: '2017-01-06T04:09:12.812Z',
                    description: 'extracting thumbnail for video.webm',
                    superEvent: '_:b8f5115d-eb80-46b1-8303-aa410e0592d0',
                    endDate: '2017-01-06T04:09:12.847Z'
                  }
                ]
              }
            ]
          },
          {
            '@id': '_:c8a9b626-eee7-42d6-be5e-02b056ebac05',
            '@type': 'ProgressEvent',
            startDate: '2017-01-06T04:09:08.432Z',
            description: 'transcoding video.mp4 into video.ogv',
            superEvent: '_:1e04c3de-e1a4-47c0-a36e-b70399f4ab1d',
            endDate: '2017-01-06T04:09:10.548Z',
            subEvent: [
              {
                '@id': '_:e8780676-7ade-41bc-9445-49d98661d7bf',
                '@type': 'ProgressEvent',
                startDate: '2017-01-06T04:09:10.442Z',
                description: 'extracting metadata for video.ogv',
                superEvent: '_:c8a9b626-eee7-42d6-be5e-02b056ebac05',
                endDate: '2017-01-06T04:09:10.548Z',
                subEvent: [
                  {
                    '@id': '_:121bed91-ecef-4fee-a35f-169414119f9a',
                    '@type': 'ProgressEvent',
                    startDate: '2017-01-06T04:09:10.474Z',
                    description: 'extracting thumbnail for video.ogv',
                    superEvent: '_:e8780676-7ade-41bc-9445-49d98661d7bf',
                    endDate: '2017-01-06T04:09:10.548Z'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    action: {
      '@id': '_:typesettingAction',
      '@type': 'TypesettingAction',
      actionStatus: 'ActiveActionStatus',
      expectsAcceptanceOf: 'offer:typesetting',
      startDate: '2017-01-06T04:09:10.442Z'
    },
    events: [
      {
        '@id': '_:eventId',
        '@type': 'ProgressEvent',
        startDate: '2017-01-06T04:09:08.432Z',
        description: `sending file to typesetting`
      }
    ]
  }
];

export default events;
