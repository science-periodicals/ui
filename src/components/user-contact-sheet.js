import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { arrayify, getId, unrole } from '@scipe/jsonld';
import { getAgent } from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import Divider from './divider';
import BemTags from '../utils/bem-tags';
import { RE_TWITTER, RE_FACEBOOK, RE_ORCID } from '../constants';
import RdfaOrganization from './rdfa/rdfa-organization';

export default class UserContactSheet extends Component {
  static propTypes = {
    role: PropTypes.object // a `ContributorRole` object
  };

  static defaultProps = {
    role: {}
  };

  render() {
    const { role } = this.props;

    const agent = getAgent(role);

    const roleContactPoints = arrayify(role.roleContactPoint);

    // TODO handle different email and `contactType`. Be sure group contactType per email in case the same email is used for multiple contact type
    // display could be: email: x@example.com (contactType1, contactType2)
    const email = roleContactPoints.find(contactPoint => contactPoint.email);
    const twitter = roleContactPoints.find(
      contactPoint => contactPoint.url && RE_TWITTER.test(contactPoint.url)
    );
    let twitterHandle;
    if (twitter) {
      const splt = twitter.url.split('/');
      twitterHandle = splt[3];
    }

    const affiliations = arrayify(role.roleAffiliation)
      .map(affiliation => unrole(affiliation, 'roleAffiliation'))
      .concat(
        arrayify(agent.affiliation).map(affiliation =>
          unrole(affiliation, 'affiliation')
        )
      );

    const links = [getId(agent)]
      .concat(arrayify(agent.sameAs))
      .filter(u => u && /^http/i.test(u));

    if (!email && !twitter && !affiliations.length && !links.length) {
      return null;
    }

    const bem = BemTags();
    return (
      <div className={bem`user-contact-sheet`}>
        {(email || twitter) && (
          <div className={bem`row --email`}>
            <h4 className={bem`row-title`}>Contact</h4>
            <div className={bem`row-content`}>
              <ul className={bem`content-list`}>
                {!!email && (
                  <li className={bem`content-list-item`}>
                    <Iconoclass
                      iconName="email"
                      iconSize={16}
                      className={bem`info-icon`}
                      style={{ verticalAlign: 'middle', marginRight: '.8rem' }}
                    />
                    <a href={email.email} className={bem`email-address`}>
                      {email.email.replace(/^mailto:/, '')}
                    </a>
                  </li>
                )}
                {!!twitter && (
                  <li className={bem`content-list-item`}>
                    <Iconoclass
                      iconName="socialTwitter"
                      iconSize={16}
                      className={bem`info-icon`}
                      style={{ verticalAlign: 'middle', marginRight: '.8rem' }}
                    />
                    <a href={twitter.url} className={bem`content-details`}>
                      {`@${twitterHandle}`}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {(email || twitter) && !!affiliations.length && <Divider />}

        {!!affiliations.length && (
          <div className={bem`row --affiliations`}>
            <h4 className={bem`row-title`}>
              Affiliation
              {affiliations.length > 1 ? 's' : ''}
            </h4>
            <div className={bem`row-content`}>
              <ul className={bem`content-list`}>
                {affiliations.map((affiliation, i) => (
                  <li
                    key={getId(affiliation) || i}
                    className={bem`content-list-item`}
                  >
                    <Iconoclass
                      iconName="locationCity"
                      iconSize={16}
                      className={bem`info-icon`}
                      style={{ verticalAlign: 'middle', marginRight: '.8rem' }}
                    />
                    <span className={bem`content-details`}>
                      <RdfaOrganization object={affiliation} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!!affiliations.length && !!links.length && <Divider />}

        {!!links.length && (
          <div className={bem`row --links`}>
            <h4 className={bem`row-title`}>
              Link
              {links.length > 1 ? 's' : ''}
            </h4>
            <div className={bem`row-content`}>
              <ul className={bem`content-list`}>
                {links.map(url => (
                  <li key={url} className={bem`content-list-item`}>
                    <Iconoclass
                      iconName={
                        RE_TWITTER.test(url)
                          ? 'socialTwitter'
                          : RE_FACEBOOK.test(url)
                          ? 'socialFacebook'
                          : RE_ORCID.test(url)
                          ? 'orcid'
                          : 'link'
                      }
                      iconSize={16}
                      className={bem`info-icon`}
                      style={{ verticalAlign: 'middle', marginRight: '.8rem' }}
                    />
                    <span className={bem`content-details`}>
                      <a className={bem`content-link`} href={url}>
                        {url}
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }
}
