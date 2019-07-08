import React from 'react';
import { Acl, createId } from '@scipe/librarian';
import { AudienceAutocomplete } from '../../src/';

export default class AudienceAutocompleteExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value, item) {
    console.warn('change', value, item);
  }

  handleSubmit(value, item) {
    if (item) {
      console.log('selected', item);
      this.setState({ selected: item });
    }
  }

  render() {
    const graph = {
      '@id': createId('graph')['@id'],
      '@type': 'Graph',
      hasDigitalDocumentPermission: {
        '@type': 'DigitalDocumentPermission',
        permissionType: 'ViewIdentityPermission',
        grantee: {
          '@type': 'Audience',
          audienceType: 'editor'
        },
        permissionScope: {
          '@type': 'Audience',
          audienceType: 'editor'
        }
      },
      editor: [
        {
          '@id': 'role:peter',
          '@type': 'ContributorRole',
          editor: 'user:peter',
          roleName: 'editor',
          name: 'editor in chief'
        },
        {
          '@id': 'role:leah',
          '@type': 'ContributorRole',
          editor: 'user:leah',
          roleName: 'editor'
        }
      ]
    };

    const acl = new Acl(graph);
    const blindingData = acl.getBlindingData('user:peter');
    const blacklist = [
      {
        '@id': 'role:leah',
        '@type': 'ContributorRole',
        roleName: 'editor',
        participant: 'user:leah'
      },
      {
        '@id': '_:blank',
        '@type': 'Audience',
        audienceType: 'author'
      }
    ];

    return (
      <div className="example">
        <AudienceAutocomplete
          ref={el => (this.autocomplete = el)}
          name="name"
          label="Audience"
          graph={graph}
          blindingData={blindingData}
          action={blacklist}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        />

        {!!this.state.selected && (
          <p>Selected: {JSON.stringify(this.state.selected)}</p>
        )}
      </div>
    );
  }
}
