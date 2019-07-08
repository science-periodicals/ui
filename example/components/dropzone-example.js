import React from 'react';
import Iconoclass from '@scipe/iconoclass';
import ds3Mime from '@scipe/ds3-mime';
import { Dropzone } from '../../src/';

export default function DropzoneExample(props) {
  return (
    <div className="example">
      <div className="example__row" style={{ height: '60px' }}>
        <Dropzone disabled />
      </div>
      <div className="example__row" style={{ height: '40px' }}>
        <Dropzone readOnly>
          readOnly With custom children - Parent height set to 40px
        </Dropzone>
      </div>

      <div className="example__row" style={{ height: '40px' }}>
        <Dropzone multiple accept="video/*">
          accept multi video only
        </Dropzone>
      </div>

      <div className="example__row" style={{ height: '40px' }}>
        <Dropzone accept={ds3Mime}>accept DS3 only</Dropzone>
      </div>

      <div className="example__row" style={{ height: '60px' }}>
        <Dropzone>
          <div
            className="example__dropzone-icons"
            style={{
              display: 'flex',
              padding: '4px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              color: 'darkgrey',
              justifyContent: 'space-between'
            }}
          >
            <Iconoclass
              iconName="fileText"
              size="100%"
              elementType="div"
              round
              color="rgba(0,0,0,.1)"
              style={{ flex: 'auto' }}
            />
            <Iconoclass
              iconName="fileCode"
              size="100%"
              elementType="div"
              round
              color="rgba(0,0,0,.1)"
              style={{ flex: 'auto' }}
            />
            <Iconoclass
              iconName="fileAudio"
              size="100%"
              elementType="div"
              round
              color="rgba(0,0,0,.1)"
              style={{ flex: 'auto' }}
            />
            <Iconoclass
              iconName="fileMedia"
              size="100%"
              elementType="div"
              round
              color="rgba(0,0,0,.1)"
              style={{ flex: 'auto' }}
            />
            <Iconoclass
              iconName="fileData"
              size="100%"
              elementType="div"
              round
              color="rgba(0,0,0,.1)"
              style={{ flex: 'auto' }}
            />
          </div>
        </Dropzone>
      </div>
    </div>
  );
}
