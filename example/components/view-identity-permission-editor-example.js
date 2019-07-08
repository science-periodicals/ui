import React, { Component } from 'react';
import {
  ViewIdentityPermissionEditor,
  PublicViewIdentityPermissionEditor
} from '../../src/';
import createGraphAction from '../../test/fixtures/workflow.json';

export default class ViewIdentityPermissionEditorExample extends Component {
  constructor(props) {
    super(props);

    const permissions = createGraphAction.result.hasDigitalDocumentPermission.filter(
      permission => permission.permissionType === 'ViewIdentityPermission'
    );

    this.state = {
      viewIdentityPermission: permissions,
      audiences: []
    };
  }

  handleChange = viewIdentityPermission => {
    this.setState({
      viewIdentityPermission: viewIdentityPermission
    });
  };

  handleChangePublicPermission = audiences => {
    this.setState({
      audiences
    });
  };

  render() {
    const { viewIdentityPermission, audiences } = this.state;

    return (
      <div className="example" style={{ width: '75vw' }}>
        <div>
          <h2>Submission permission</h2>
          <ViewIdentityPermissionEditor
            readOnly={false}
            viewIdentityPermission={viewIdentityPermission}
            onChange={this.handleChange}
          />
        </div>

        <div>
          <h2>Production permission</h2>
          <PublicViewIdentityPermissionEditor
            readOnly={false}
            audiences={audiences}
            onChange={this.handleChangePublicPermission}
          />
        </div>
      </div>
    );
  }
}
