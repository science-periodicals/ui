import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { parse } from 'url';
import { basename } from 'path';
import noop from 'lodash/noop';
import { RE_LOCAL_HOST_OR_DEV } from '@scipe/librarian';

export default class LinkInterceptor extends Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.any,
    onLink: PropTypes.func
  };

  static defaultProps = {
    onLink: noop
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    let $a = e.target;
    while ($a) {
      if ($a.localName === 'a') break;
      $a = $a.parentElement;
    }
    if (!$a) return;

    const parsed = parse($a.href, true);

    let attValues = [];
    if ($a.hasAttribute('role')) {
      attValues.push($a.getAttribute('role'));
    }
    if ($a.hasAttribute('rel')) {
      attValues = attValues
        .concat($a.getAttribute('rel').split(/\s+/))
        .filter(x => x && x !== 'noopener');
    }
    if ($a.hasAttribute('property')) {
      attValues.push($a.getAttribute('property'));
    }

    let type, resourceId;
    if (
      attValues.includes('sa:note') ||
      attValues.includes('footnote') ||
      attValues.includes('endnote')
    ) {
      type = 'footnote';
    } else if (attValues.includes('sa:roleAction')) {
      type = 'roleAction';
    } else if (attValues.includes('sa:roleAffiliation')) {
      type = 'roleAffiliation';
    } else if (attValues.includes('sa:roleContactPoint')) {
      type = 'roleContactPoint';
      // special case: resourceId is the roleId which is defined by a data- attribute
      resourceId = $a.getAttribute('data-role-id');
    } else if (
      attValues.includes('schema:citation') ||
      attValues.includes('doc-biblioentry') ||
      attValues.includes('doc-biblioref')
    ) {
      type = 'citation';
    } else if (
      !attValues.includes('schema:isBasedOn') && // we exclude isBasedOn as it can be a link to resource or citation
      ($a.hasAttribute('resource') ||
        $a.hasAttribute('content') ||
        attValues.includes('schema:hasPart'))
    ) {
      type = 'resource';
    } else if (
      attValues.includes('schema:isBasedOn') ||
      attValues.includes('schema:exampleOfWork')
    ) {
      // can be a resource or a citation
      type = 'requirement';
    } else {
      if (
        parsed.hostname &&
        (parsed.hostname.endsWith('.sci.pe') ||
          (RE_LOCAL_HOST_OR_DEV.test(parsed.hostname) &&
            parsed.query &&
            parsed.query.hostname &&
            parsed.query.hostname.endsWith('.sci.pe')))
      ) {
        type = 'sifter';
        resourceId = parsed.query.hostname || parsed.hostname;
      } else {
        type = 'none';
      }
    }

    if (!resourceId) {
      let _resourceId =
        $a.getAttribute('resource') || $a.getAttribute('content'); // content is legacy and invalid Rdfa for resource (bug in old document worker)

      if (!_resourceId) {
        _resourceId = basename(parsed.pathname);
      }

      if (
        _resourceId &&
        (_resourceId.startsWith('node:') ||
        type === 'citation' || // for citation, comment etc., resource can be a TargetRole, Comment, etc. which is often a blank node
          type === 'footnote' ||
          type === 'roleAction' ||
          type === 'roleAffiliation' ||
          type === 'roleContactPoint' ||
          type === 'requirement') // can be a citation
      ) {
        resourceId = _resourceId;
      }
    }
    this.props.onLink(e, $a, type, resourceId, parsed);
  }

  render() {
    const { id, className, children } = this.props;

    return (
      <div
        id={id}
        className={classNames(className, 'link-interceptor')}
        onClickCapture={this.handleClick}
      >
        {children}
      </div>
    );
  }
}
