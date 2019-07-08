/* eslint-disable no-console */

import React from 'react';
import { createId } from '@scipe/librarian';
import { flatten, frame, arrayify, getId, getValue } from '@scipe/jsonld';
import { PersonOrOrganizationFormFragment } from '../../src/';

export default class PersonOrOrganizationFormExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      node: {
        '@id': createId('blank')['@id'].replace('_:', 'scienceai:'),
        '@type': 'Organization'
      }
    };

    this.handleCreate = this.handleCreate.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleCreate(parentNode, parentKey, value) {
    const { node } = this.state;
    flatten(node, { preserveUuidBlankNodes: true }, (err, flattened) => {
      if (err) console.error(err);
      const nodes = arrayify(flattened['@graph']);
      const parent = nodes.find(node => getId(node) === getId(parentNode));
      if (parent) {
        value = Object.assign({ '@id': createId('blank')['@id'] }, value);
        parent[parentKey] = parent[parentKey]
          ? arrayify(parent[parentKey])
              .filter(_value => getValue(_value) !== getValue(value))
              .concat(value)
          : value;
      }

      frame(
        { '@graph': nodes },
        { '@id': getId(node), '@embed': '@always' },
        { preserveUuidBlankNodes: true },
        (err, framed) => {
          if (err) console.error(err);
          if (this._isMounted) {
            this.setState({ node: framed['@graph'][0] });
            console.log('create', framed['@graph'][0]);
          }
        }
      );
    });
  }

  handleUpdate(parentNode, parentKey, value, opts = {}) {
    const { force } = opts;
    const { node } = this.state;

    flatten(node, { preserveUuidBlankNodes: true }, (err, flattened) => {
      if (err) console.error(err);
      const nodes = arrayify(flattened['@graph']);
      const parent = nodes.find(node => getId(node) === getId(parentNode));
      if (parent) {
        if (force) {
          Object.keys(parent).forEach(key => {
            if (
              !key.startsWith('@') &&
              !key.startsWith('_') &&
              key !== parentKey
            ) {
              delete parent[key];
            }
          });
        }
        parent[parentKey] = value;
      }

      frame(
        { '@graph': nodes },
        { '@id': getId(node), '@embed': '@always' },
        { preserveUuidBlankNodes: true },
        (err, framed) => {
          if (err) console.error(err);
          if (this._isMounted) {
            this.setState({ node: framed['@graph'][0] });
            console.log('update', framed['@graph'][0]);
          }
        }
      );
    });
  }

  handleDelete(parentNode, parentKey, value) {
    const { node } = this.state;
    flatten(node, { preserveUuidBlankNodes: true }, (err, flattened) => {
      if (err) console.error(err);
      const nodes = arrayify(flattened['@graph']);
      const parent = nodes.find(node => getId(node) === getId(parentNode));
      if (parent) {
        delete parent[parentKey];
      }

      frame(
        { '@graph': nodes },
        { '@id': getId(node), '@embed': '@always' },
        { preserveUuidBlankNodes: true },
        (err, framed) => {
          if (err) console.error(err);
          if (this._isMounted) {
            this.setState({ node: framed['@graph'][0] });
            console.log('delete', framed['@graph'][0]);
          }
        }
      );
    });
  }

  render() {
    const { node } = this.state;
    return (
      <div className="example">
        <PersonOrOrganizationFormFragment
          node={node}
          onCreate={this.handleCreate}
          onUpdate={this.handleUpdate}
          onDelete={this.handleDelete}
        />
      </div>
    );
  }
}
