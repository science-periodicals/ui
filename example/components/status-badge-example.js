import React from 'react';
import { StatusBadge, JournalBadge, OrganizationBadge } from '../../src';

export default class StatusBadgeExample extends React.Component {
  render() {
    return (
      <div className="example" style={{ maxWidth: '800px' }}>
        <div className="example__row">
          <StatusBadge iconName="alert" color="red">
            <div
              style={{ width: '24px', height: '24px', backgroundColor: 'lime' }}
            />
          </StatusBadge>
          <StatusBadge iconName="4" color="red">
            <OrganizationBadge
              organization={{
                name: 'N journal name'
              }}
            />
          </StatusBadge>
          <StatusBadge iconName="10" color="red">
            <JournalBadge
              journal={{
                name: 'Hello World'
              }}
            />
          </StatusBadge>
        </div>
        <div className="example__row">
          <StatusBadge iconName="alert" color="red">
            <div
              style={{ width: '32px', height: '32px', backgroundColor: 'lime' }}
            />
          </StatusBadge>
          <StatusBadge iconName="4" color="red">
            <OrganizationBadge
              organization={{
                name: 'N journal name'
              }}
              size={32}
            />
          </StatusBadge>
          <StatusBadge iconName="10" color="red">
            <JournalBadge
              journal={{
                name: 'Hello World'
              }}
              size={32}
            />
          </StatusBadge>
        </div>
        <div className="example__row">
          <StatusBadge iconName="alert" color="red" size={18}>
            <div
              style={{ width: '32px', height: '32px', backgroundColor: 'lime' }}
            />
          </StatusBadge>
          <StatusBadge iconName="4" color="red" size={18}>
            <OrganizationBadge
              organization={{
                name: 'N journal name'
              }}
              size={32}
            />
          </StatusBadge>
          <StatusBadge iconName="10" color="red" size={18}>
            <JournalBadge
              journal={{
                name: 'Hello World'
              }}
              size={32}
            />
          </StatusBadge>
        </div>
        <div>
          <h4 style={{ padding: '8px' }}>
            Test Sizing outide of a flex layout
          </h4>
          <div style={{ outline: '1px solid grey', padding: '8px' }}>
            <StatusBadge iconName="10" color="red" size={18}>
              <JournalBadge
                journal={{
                  name: 'Hello World'
                }}
                size={32}
              />
            </StatusBadge>
          </div>
        </div>
      </div>
    );
  }
}
