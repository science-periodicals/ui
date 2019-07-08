import React from 'react';
import { Tabs, TabsItem } from '../../src';

export default function TabsExample(props) {
  return (
    <div className="example">
      <Tabs>
        <TabsItem title="tab 1">Tab 1 content</TabsItem>
        <TabsItem title="tab 2">Tab 2 content</TabsItem>
      </Tabs>
    </div>
  );
}
