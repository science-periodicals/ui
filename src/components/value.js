import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import romanize from 'romanize';
import { getValue } from '@scipe/jsonld';

/**
 * Renders an HTML (or RDFa) value
 * Note: the CSS takes care of the common styles required for RDFa (shell icons etc.)
 */
export default class Value extends React.Component {
  static propTypes = {
    rel: PropTypes.string,
    escHtml: PropTypes.bool,
    property: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.shape({
        '@type': PropTypes.string,
        '@value': PropTypes.string
      })
    ]),
    tagName: PropTypes.string,
    className: PropTypes.string,
    setHref: PropTypes.func
  };

  static defaultProps = {
    tagName: 'div',
    children: '',
    escHtml: true
  };

  constructor(props) {
    super(props);
    this.$el = React.createRef();
  }

  handleSetHref() {
    const { setHref } = this.props;
    if (!setHref || !this.$el.current) return;
    const $links = this.$el.current.querySelectorAll('a[href^="#"]');
    for (let $link of $links) {
      const href = setHref($link);
      if (href == null) {
        $link.removeAttribute('href');
      } else {
        $link.setAttribute('href', setHref($link));
      }
    }
  }

  handleEndnotes() {
    // We render the endnotes as upper case roman to differentiate them from footnotes
    if (this.$el.current) {
      const $endnotes = this.$el.current.querySelectorAll('a[rel~="endnote"]');
      Array.from($endnotes).forEach($endnote => {
        Array.from($endnote.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && /\s*\d+\s*/.test(node.data)) {
            node.data = node.data.replace(/(\d+)/, (match, p1) => {
              return romanize(p1);
            });
          }
        });
      });
    }
  }

  componentDidMount() {
    this.handleSetHref();
    this.handleEndnotes();
  }

  componentDidUpdate(prevProps) {
    const { children, setHref } = this.props;
    if (prevProps.children !== children || prevProps.setHref !== setHref) {
      this.handleSetHref();
    }

    if (prevProps.children !== children) {
      this.handleEndnotes();
    }
  }

  render() {
    const {
      tagName,
      className,
      children,
      escHtml: _escHtml,
      setHref,
      ...others
    } = this.props;

    if (children == null) {
      return children;
    }

    let html = getValue(children);
    if (_escHtml && !(children['@value'] && children['@type'] === 'rdf:HTML')) {
      html = escHtml(html);
    }

    let datatype;
    if (
      (others.rel || others.property) &&
      children['@value'] &&
      children['@type']
    ) {
      datatype = escAttr(children['@type']);
    }

    return React.createElement(
      tagName,
      Object.assign(
        {
          className: classNames(className, 'value'),
          dangerouslySetInnerHTML: { __html: html },
          datatype,
          ref: this.$el
        },
        others
      )
    );
  }
}

function escHtml(str) {
  if (typeof str !== 'string') return str;
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function escAttr(str) {
  if (typeof str !== 'string') return str;
  return (str || '').replace(/"/g, '&quot;');
}
