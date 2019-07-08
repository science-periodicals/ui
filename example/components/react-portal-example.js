import React from 'react';
import { Card, ReactPortal } from '../../src/';

export default function ReactPortalExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <div
          className="example__scrollbox"
          style={{
            width: '500px',
            height: '400px',
            padding: '24px',
            overflowY: 'scroll',
            border: '1px solid grey',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'whitesmoke'
          }}
        >
          <div
            className="example__scroll-content"
            id="portal-example-context"
            style={{ position: 'relative' }}
          >
            <Card style={{ margin: '24px' }}>
              <div
                style={{
                  padding: '24px',
                  height: '100px',
                  background: 'white'
                }}
              >
                <ReactPortal>
                  <div
                    style={{
                      border: '1px solid whitesmoke',
                      padding: '24px',
                      margin: '24px',
                      height: '60px'
                    }}
                  >
                    Portaled Card Contents with no parentID. Position='relative'
                  </div>
                </ReactPortal>
              </div>
            </Card>
            <Card style={{ margin: '24px' }}>
              <div
                style={{
                  padding: '24px',
                  height: '100px',
                  background: 'white'
                }}
              >
                Non-portaled Card content
              </div>
            </Card>
            <Card style={{ margin: '24px' }}>
              <div
                style={{
                  padding: '24px',
                  height: '100px',
                  background: 'white'
                }}
              >
                <ReactPortal
                  parentID="portal-example-context"
                  position="absoluteRelative"
                  portalClass="to-portal-example-context"
                >
                  <div
                    style={{
                      border: '1px solid whitesmoke',
                      padding: '24px',
                      margin: '24px',
                      height: '60px'
                    }}
                  >
                    Portaled Card Contents with parentID set to scrollbox
                    content. Position='absoluteRelative'
                  </div>
                </ReactPortal>
              </div>
            </Card>
            <Card style={{ margin: '24px' }}>
              <div
                style={{
                  padding: '24px',
                  height: '100px',
                  background: 'white'
                }}
              >
                Non-portaled Card content
              </div>
            </Card>
            <Card style={{ margin: '24px' }}>
              <div
                style={{
                  padding: '24px',
                  height: '100px',
                  background: 'white'
                }}
              >
                Non-portaled Card content
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
