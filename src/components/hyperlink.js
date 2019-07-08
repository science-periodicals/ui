import querystring from 'querystring';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import classNames from 'classnames';
import pick from 'lodash/pick';
import { Link } from 'react-router-dom';
import { getRootPartId, getAgentId } from '@scipe/librarian';
import { getId, unprefix } from '@scipe/jsonld';
import resetSubdomain from '../utils/reset-subdomain';

// TODO service

export default class Hyperlink extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    href: PropTypes.string,
    to: PropTypes.any,
    reset: PropTypes.bool, // will force use a `<a> + `href` instead of a `<Link> + `to`
    children: PropTypes.any,
    className: PropTypes.string,

    query: PropTypes.shape({
      stage: PropTypes.string,
      action: PropTypes.string,
      hostname: PropTypes.string,
      issue: PropTypes.string
    }),
    page: PropTypes.oneOf([
      // need role
      'user',
      // need `graph`
      'submission',
      'publisher', // alias for "submission"

      'graph', // if `issue` is specified, will create an issue specific link, if `node` is specified, will go to the node
      'article', // alias for "graph"

      'graphPreview',
      'articlePreview', //alias for "graphPreview"
      // need `periodical`
      'journal',
      'periodical', // alias for "journal"
      // need `periodical` _and_ `authorGuidelines`

      'authorGuidelines',
      // need `issue`
      'issue',

      // need `rfa` (if reset or href is set we need `journal` as well)
      'rfa'
    ]),
    acl: PropTypes.object,
    issue: PropTypes.oneOfType([
      PropTypes.shape({
        '@id': PropTypes.string
      }),
      PropTypes.string
    ]),
    graph: PropTypes.oneOfType([
      PropTypes.shape({
        '@id': PropTypes.string,
        url: PropTypes.string,
        isPartOf: PropTypes.oneOfType([
          PropTypes.object,
          PropTypes.string,
          PropTypes.array
        ])
      }),
      PropTypes.string
    ]),
    periodical: PropTypes.oneOfType([
      PropTypes.shape({
        '@id': PropTypes.string,
        url: PropTypes.string
      }),
      PropTypes.string
    ]),
    authorGuidelines: PropTypes.oneOfType([
      PropTypes.shape({
        '@id': PropTypes.string
      }),
      PropTypes.string
    ]),
    event: PropTypes.oneOfType([
      PropTypes.shape({
        '@id': PropTypes.string,
        url: PropTypes.string
      }),
      PropTypes.string
    ]),
    resource: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string
      })
    ]),
    action: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string
      })
    ]),
    node: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string
      })
    ]),
    role: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    rfa: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string,
        '@type': PropTypes.oneOf(['RequestArticleAction'])
      })
    ])
  };

  static defaultProps = {
    graph: {},
    periodical: {},
    event: {},
    query: {},
    className: ''
  };

  render() {
    let {
      id,
      className,
      page,
      reset,
      children,
      role,
      periodical,
      authorGuidelines,
      graph,
      issue,
      event,
      resource,
      action,
      node,
      rfa,
      query,
      ...linkProps
    } = this.props;

    const isDevOrNightly =
      process.env.NODE_ENV !== 'production' ||
      (typeof window !== 'undefined' &&
        window.location &&
        window.location.hostname === 'nightly.sci.pe');

    if (typeof graph === 'string') {
      graph = { '@id': graph };
    }
    if (typeof periodical === 'string') {
      periodical = { '@id': periodical };
    }
    if (typeof event === 'string') {
      event = { '@id': event };
    }
    if (typeof issue === 'string') {
      issue = { '@id': issue };
    }

    if (linkProps.href || reset) {
      // **************** //
      // <a href=""> case //
      // **************** //

      let href = linkProps.href || '';

      if (page) {
        switch (page) {
          case 'user': {
            query = omit(query, ['issue']);
            const agentId = getAgentId(role);
            if (agentId && agentId.startsWith('user:')) {
              href = `/about/${unprefix(agentId)}`;
            }
            break;
          }

          case 'periodical':
          case 'journal':
            query = omit(query, ['issue', 'stage', 'action']);
            if (isDevOrNightly) {
              query = Object.assign({}, query, {
                hostname: `${unprefix(getId(periodical))}.sci.pe`
              });
              href = '/';
            } else if (periodical.url) {
              href = periodical.url;
            }
            break;

          case 'rfa': {
            if (isDevOrNightly) {
              query = Object.assign({}, query, {
                hostname: `${unprefix(getId(periodical))}.sci.pe`
              });
              href = `/rfas/${unprefix(getId(rfa))}`;
            } else {
              href = `https://${unprefix(
                getId(periodical)
              )}.sci.pe/rfas/${unprefix(getId(rfa))}`;
            }

            break;
          }

          case 'graph':
          case 'article':
            if (getId(issue)) {
              query = Object.assign({}, query, {
                issue: unprefix((getId(issue) || '').split('/', 2)[1])
              });
            }

            if (isDevOrNightly) {
              href = `/${graph.slug || unprefix(getId(graph))}`;
              const journalId = getRootPartId(graph);
              query = Object.assign({}, query, {
                hostname: `${unprefix(journalId)}.sci.pe`
              });
            } else if (graph.url) {
              href = graph.url;
            } else if (event['@type'] === 'PublicationEvent' && event.url) {
              href = event.url;
            }
            break;

          case 'authorGuidelines':
            query = omit(query, ['issue']);
            href = `${resetSubdomain(periodical.url)}about/journal`;
            break;

          default:
            break;
        }
      }

      if (href) {
        query = pick(query, ['hostname', 'action', 'issue', 'stage']);

        if (action) {
          const actionId = getId(action);
          if (actionId) {
            query.action = unprefix(actionId);
            delete query.stage;
          }
        }

        if (Object.keys(query).length) {
          href = `${href}?${querystring.stringify(query)}`;
        }

        // handle hash, we make sure that it's after the qs
        let hashId;
        if (page === 'authorGuidelines') {
          hashId = getId(authorGuidelines);
        } else if (resource || node) {
          hashId = getId(resource) || getId(node);
        }

        if (hashId) {
          href = `${href}#${hashId}`;
        }
      }

      return (
        <a
          id={id}
          className={classNames('hyperlink', className)}
          {...linkProps}
          href={href}
        >
          {children}
        </a>
      );
    }

    // *********************** //
    // React router link case  //
    // *********************** //

    let to;
    if (linkProps.to) {
      if (typeof linkProps.to === 'string') {
        if (linkProps.to.includes('?')) {
          const [pathname, search] = linkProps.to.split('?');
          to = { pathname, search: `?${search}` };
        } else {
          to = { pathname: linkProps.to };
        }
      } else {
        to = linkProps.to;
      }
    } else {
      to = { pathname: '' };
    }

    if (to.pathname == null) {
      to.pathname = '';
    }

    if (page) {
      // we overwrite to if it was provided
      switch (page) {
        case 'user': {
          query = omit(query, ['issue']);
          const agentId = getAgentId(role);
          if (agentId && agentId.startsWith('user:')) {
            to.pathname = `/about/${unprefix(agentId)}`;
          }
          break;
        }

        case 'rfa': {
          if (isDevOrNightly) {
            query = Object.assign({}, query, {
              hostname: `${unprefix(getId(periodical))}.sci.pe`
            });
          }
          to.pathname = `/rfas/${unprefix(getId(rfa))}`;
          break;
        }

        case 'publisher':
        case 'submission': {
          query = omit(query, ['issue']);
          const periodicalId = getRootPartId(graph) || getId(periodical);
          const graphId = getId(graph);
          if (periodicalId && graphId) {
            to.pathname = `/${unprefix(periodicalId)}/${
              unprefix(graphId).split('?')[0]
            }/submission`;
          }
          break;
        }
        case 'graphPreview':
        case 'articlePreview': {
          query = omit(query, ['issue']);
          const periodicalId = getRootPartId(graph) || getId(periodical);
          const graphId = getId(graph);
          if (periodicalId && graphId) {
            to.pathname = `/${unprefix(periodicalId)}/${
              unprefix(graphId).split('?')[0]
            }/preview`;
          }
          break;
        }

        case 'periodical':
        case 'journal': {
          query = omit(query, ['issue']);
          to.pathname = '/';
          break;
        }

        case 'graph':
        case 'article':
          query = omit(query, ['issue']);
          if (getId(issue)) {
            query = Object.assign({}, query, {
              issue: unprefix((getId(issue) || '').split('/', 2)[1])
            });
          }

          if (graph.slug) {
            to.pathname = `/${graph.slug}`;
          }
          break;

        case 'issue':
          query = omit(query, ['issue']);
          to.pathname = `/issue/${unprefix(
            (getId(issue) || '').split('/', 2)[1]
          )}`;
          break;

        case 'authorGuidelines':
          query = omit(query, ['issue']);
          to.pathname = `/about/journal`;
          break;
        default:
          break;
      }
    }

    if (to.pathname && !(to.search || to.hash)) {
      query = pick(query, ['hostname', 'action', 'issue', 'stage']);

      if (action) {
        const actionId = getId(action);
        if (actionId) {
          query.action = unprefix(actionId);
          delete query.stage;
        }
      }

      if (Object.keys(query).length) {
        to.search = `?${querystring.stringify(query)}`;
      }

      // handle hash, we make sure that it's after the qs
      let hashId;
      if (page === 'authorGuidelines') {
        hashId = getId(authorGuidelines);
      } else if (resource || node) {
        hashId = getId(resource) || getId(node);
      }

      if (hashId) {
        to.hash = `#${hashId}`;
      }
    }

    return (
      <Link
        id={id}
        className={classNames('hyperlink', className)}
        {...linkProps}
        to={to}
      >
        {children}
      </Link>
    );
  }
}
