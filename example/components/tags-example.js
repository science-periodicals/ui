import React, { Component } from 'react';
import { arrayify, getId } from '@scipe/jsonld';
import { Tags, TagMenu, MenuItem } from '../../src';

function makeTagAction(name, audienceTypes) {
  return {
    '@id': `_:tag-${name}`,
    '@type': 'TagAction',
    participant: arrayify(audienceTypes).map(audienceType => {
      return {
        '@type': 'Audience',
        audienceType
      };
    }),
    result: {
      '@id': `_:${name}`,
      '@type': 'Tag',
      name
    }
  };
}

// realistic names provided by @tiffbogich to optimize colors
const tags = [
  'priority',
  'urgent',
  'backlog',
  'impactful',
  'special',
  'editorial',
  'caution'
].map(name => makeTagAction(name));

const roles = [
  {
    '@id': 'role:role1',
    '@type': 'ContributorRole',
    author: 'user:userId',
    roleName: 'author'
  },
  {
    '@id': 'role:role2',
    '@type': 'ContributorRole',
    editor: 'user:userId',
    roleName: 'editor',
    name: 'editor-in-chief'
  }
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags
    };
    this.log = null;

    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleDeleteTag = this.handleDeleteTag.bind(this);
  }

  handleAddTag(tagName, audienceTypes) {
    this.log.textContent += `• Added tag ${tagName}, ${arrayify(
      audienceTypes
    ).join(' - ')}\n`;
    this.setState({
      tags: this.state.tags.concat(makeTagAction(tagName, audienceTypes))
    });
  }

  handleDeleteTag(tagActionId, tag) {
    this.log.textContent += `• Deleted tag ${tag.name}\n`;
    this.setState({
      tags: this.state.tags.filter(
        tagAction => getId(tagAction) !== tagActionId
      )
    });
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <Tags
            onAddTag={this.handleAddTag}
            onDeleteTag={this.handleDeleteTag}
            tagActions={this.state.tags}
            roles={roles}
          />
        </div>

        <div className="example__row">
          disabled
          <Tags
            onAddTag={this.handleAddTag}
            onDeleteTag={this.handleDeleteTag}
            tagActions={this.state.tags}
            roles={roles}
            disabled
          />
        </div>

        <div className="example__row">
          readOnly
          <Tags
            onAddTag={this.handleAddTag}
            onDeleteTag={this.handleDeleteTag}
            tagActions={this.state.tags}
            readOnly
          />
        </div>

        {/* TagMenu */}
        <div className="example__row" style={{ display: 'flex' }}>
          TagMenu (disabled, readOnly and normal)
          <TagMenu
            value="Projects"
            disabled
            onChange={value =>
              (this.log.textContent += `• TagMenu onChange: ${value}\n`)
            }
          >
            <MenuItem icon={{ iconName: 'fileText' }} value="Projects">
              Projects
            </MenuItem>
            <MenuItem icon={{ iconName: 'journal' }} value="Journals">
              Journals
            </MenuItem>
          </TagMenu>
          <TagMenu
            value="Projects"
            readOnly
            onChange={value =>
              (this.log.textContent += `• TagMenu onChange: ${value}\n`)
            }
          >
            <MenuItem icon={{ iconName: 'fileText' }} value="Projects">
              Projects
            </MenuItem>
            <MenuItem icon={{ iconName: 'journal' }} value="Journals">
              Journals
            </MenuItem>
          </TagMenu>
          <TagMenu
            value="Projects"
            onChange={value =>
              (this.log.textContent += `• TagMenu onChange: ${value}\n`)
            }
          >
            <MenuItem icon={{ iconName: 'fileText' }} value="Projects">
              Projects
            </MenuItem>
            <MenuItem icon={{ iconName: 'journal' }} value="Journals">
              Journals
            </MenuItem>
          </TagMenu>
        </div>
        <div>
          <pre ref={r => (this.log = r)} />
        </div>
      </div>
    );
  }
}
