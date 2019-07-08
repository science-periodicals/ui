import React from 'react';
import { DomToc, withDomSpy } from '../../src/';

class Body extends React.Component {
  render() {
    return (
      <section>
        <h1>Title</h1>
        <section>
          <h2>Heading 2 - A</h2>
          <section>
            <h3>Heading 3 - A.A</h3>
          </section>
          <section>
            <h3>Heading 3 - A.B</h3>
          </section>
        </section>
        <section>
          <h2>Heading 2 - B</h2>
          <section>
            <h3>Heading 3 - B.A</h3>
          </section>
          <section>
            <h3>Heading 3 - B.B</h3>
          </section>
        </section>
      </section>
    );
  }
}

const SpiedBody = withDomSpy(Body);

export default class DomTocExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      $content: props.$content
    };
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleUpdate($content) {
    this.setState({ $content });
  }

  render() {
    return (
      <div className="example sa__default-ui-type">
        <div>
          <h2 className={'sa__default-ui-type--headline'}>Table of content</h2>
          <DomToc $content={this.state.$content} topLevel={1} />
        </div>
        <div style={{ padding: '32px' }}>
          <h2 className={'sa__default-ui-type--headline'}>Body</h2>
          <SpiedBody onUpdate={this.handleUpdate} />
        </div>
      </div>
    );
  }
}
