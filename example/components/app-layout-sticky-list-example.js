import React from 'react';
import {
  Card,
  AppLayoutStickyList,
  AppLayoutStickyListItem,
  AppLayoutListItem
} from '../../src/';

export default function AppLayoutStickyListExample(props) {
  return (
    <div className="app-layout-sticky-list-example">
      <AppLayoutStickyList id="AppLayoutStickyList_1">
        <AppLayoutStickyListItem id="AppLayoutStickyList_1_1">
          {sticking => (
            <div className={`${sticking && 'sticking'}`}>
              <Card>
                <div
                  style={{
                    height: '10vh',
                    padding: '24px'
                  }}
                >
                  Sticky List Item
                </div>
              </Card>
            </div>
          )}
        </AppLayoutStickyListItem>
        <AppLayoutListItem>
          <div style={{ margin: '24px' }}>
            <Card>
              <div style={{ height: '25vh', padding: '24px' }}>List Item</div>
            </Card>
          </div>
        </AppLayoutListItem>
        <AppLayoutListItem>
          <div style={{ margin: '24px' }}>
            <Card>
              <div style={{ height: '25vh', padding: '24px' }}>List Item</div>
            </Card>
          </div>
        </AppLayoutListItem>
        <AppLayoutListItem>
          <div style={{ margin: '24px' }}>
            <Card>
              <div style={{ height: '25vh', padding: '24px' }}>List Item</div>
            </Card>
          </div>
        </AppLayoutListItem>
      </AppLayoutStickyList>
      <div style={{ height: '80px', background: 'pink', opacity: '0.5' }} />
      <AppLayoutStickyList id="AppLayoutStickyList_2">
        <AppLayoutStickyListItem id="AppLayoutStickyList_2_1">
          {sticking => (
            <div className={`${sticking && 'sticking'}`}>
              <Card>
                <div className="app-layout-sticky-list-example__shrinking-banner">
                  Shrink-on-mobile Sticky List Item;
                </div>
              </Card>
            </div>
          )}
        </AppLayoutStickyListItem>
        <AppLayoutListItem>
          <div style={{ margin: '24px' }}>
            <Card>
              <div style={{ height: '25vh', padding: '24px' }}>List Item</div>
            </Card>
          </div>
        </AppLayoutListItem>
        <AppLayoutListItem>
          <div style={{ margin: '24px' }}>
            <Card>
              <div style={{ height: '25vh', padding: '24px' }}>List Item</div>
            </Card>
          </div>
        </AppLayoutListItem>
        <AppLayoutListItem>
          <div style={{ margin: '24px' }}>
            <Card>
              <div style={{ height: '25vh', padding: '24px' }}>List Item</div>
            </Card>
          </div>
        </AppLayoutListItem>
      </AppLayoutStickyList>
    </div>
  );
}
