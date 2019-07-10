import React from 'react';
import { Card, BemTags } from '../../src/';

const bem = BemTags('@test2');

export default function CardExample(props) {
  return (
    <div className={bem`example`}>
      <div className={bem`row__`}>
        <Card className={bem`card @font-style --mod`}>
          <h2 style={{ padding: '16px' }}>Regular Card</h2>
        </Card>
      </div>
      <div className="example__row">
        <Card active={true} className="my-class-name">
          <h2 style={{ padding: '16px' }}>Active card</h2>
        </Card>
        <Card active={false}>
          <h2 style={{ padding: '16px' }}>Inactive card</h2>
        </Card>
      </div>
      <div className="example__row">
        <Card bevel={true}>
          <h2 style={{ padding: '16px' }}>Active Bevel card</h2>
        </Card>
      </div>
      <div className="example__row">
        <Card
          bevel={true}
          active={false}
          className="my-class-name"
          noticeColor="red"
        >
          <h2 style={{ padding: '16px' }}>Inactive Bevel card</h2>
          <div
            style={{
              borderTop: '1px solid grey',
              padding: '16px',
              left: '24px'
            }}
          >
            Some Content Here
          </div>
        </Card>
      </div>
      <div className="example__row">
        <div style={{ position: 'absolute' }}>
          <Card bevel={true}>
            <h2 style={{ padding: '16px' }}>
              Bevel Test with Absolute Positioned Parent
            </h2>
            <div
              style={{
                borderTop: '1px solid grey',
                padding: '16px',
                left: '24px',
                backgroundColor: 'whitesmoke',
                marginBottom: '24px'
              }}
            >
              Some Content Here
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
