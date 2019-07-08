import React from 'react';
import { LinkInterceptor } from '../../src/';

export default class LinkInterceptorExample extends React.Component {
  constructor(props) {
    super(props);
    this.handleLink = this.handleLink.bind(this);
    this.state = {
      type: null,
      resourceId: null,
      href: null
    };
  }

  handleLink(e, $a, type, resourceId) {
    e.preventDefault();
    this.setState({ type, resourceId, href: $a.href });
  }

  render() {
    return (
      <div className="example">
        <LinkInterceptor onLink={this.handleLink}>
          <ul>
            <li>
              <a href="http://berjon.com/">normal link</a>
            </li>
            <li>
              <a href="http://berjon.com/">
                <span>normal link with an inner target</span>
              </a>
            </li>
            <li>
              <a href="#fn1" rel="footnote">
                footnote
              </a>
            </li>
            <li>
              <a href="#fn1" property="sa:roleAction">
                role-based footnote
              </a>
            </li>
            <li>
              <a href="#ref1" rel="doc-biblioentry">
                citation
              </a>
            </li>
            <li>
              <a href="#ref1" property="schema:citation">
                schema citation
              </a>
            </li>
            <li>
              <a href="scienceai:foo" resource="scienceai:resource">
                resource
              </a>
            </li>
            <li>
              <a href="#huh" rel="whatever">
                bad
              </a>
            </li>
            <li>
              <a
                href="#SA_REF_ANCHOR__Ref437173130"
                rel="schema:hasPart noopener"
                resource="scienceai:49025630-1671-4a94-acce-7c549c20966e"
                about="scienceai:46cb098c-b21b-4250-8599-45cc1b70af8b"
              >
                resource
              </a>
            </li>
            <li>
              <a
                href="#SA_CITATION_ANCHOR_Wil011"
                rel="doc-biblioentry noopener"
                property="schema:citation"
                content="scienceai:E3DDD88F-9E89-FA4D-8F78-A0B6ED8F7EF4"
              >
                citation
              </a>
            </li>
            <li>
              <a href="http://journal.science.ai/a/b/c">sifter</a>
            </li>
            <li>
              <a href="/a/b/c?hostname=journal.science.ai">
                sifter (localhost)
              </a>
            </li>
          </ul>
        </LinkInterceptor>

        <p>Intercepted</p>
        <ul>
          {this.state.href &&
            <li>
              href: {this.state.href}
            </li>}
          {this.state.type &&
            <li>
              type: {this.state.type}
            </li>}
          {this.state.resourceId &&
            <li>
              resourceId: {this.state.resourceId}
            </li>}
        </ul>
      </div>
    );
  }
}
