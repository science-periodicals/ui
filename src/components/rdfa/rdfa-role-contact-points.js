import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';
import { getId, arrayify } from '@scipe/jsonld';
import { Span } from '../elements';
import bemify from '../../utils/bemify';
import { RE_TWITTER, RE_FACEBOOK, RE_ORCID } from '../../constants';

// TODO RDFa

export default class RdfaRoleContactPoints extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    object: PropTypes.shape({
      '@type': PropTypes.oneOf(['ContributorRole', 'Role']),
      roleContactPoint: PropTypes.array
    }),
    isPrinting: PropTypes.bool
  };

  getContactPointIcon = contactPoint => {
    const { name = '', url = '' } = contactPoint;
    let iconName;

    if (RE_TWITTER.test(url) || /twitter/i.test(name)) {
      iconName = 'socialTwitter';
    } else if (RE_FACEBOOK.test(url) || /facebook/i.test(name)) {
      iconName = 'socialFacebook';
    } else if (RE_ORCID.test(url) || /orcid/i.test(name)) {
      iconName = 'orcid';
    } else if (url.startsWith('mailto:') || /email/i.test(name)) {
      iconName = 'email';
    } else if (contactPoint.address || /address/i.test(name)) {
      iconName = 'locationCity';
    } else if (/linkedin/i.test(name)) {
      iconName = 'socialLinkedIn';
    } else if (/reddit/i.test(name)) {
      iconName = 'socialReddit';
    } else if (/tel/i.test(name)) {
      iconName = 'phone';
    }

    return iconName ? (
      <Iconoclass
        iconName={iconName}
        size={this.props.isPrinting ? '8px' : '16px'}
        style={{ verticalAlign: 'middle' }}
        className={'rdfa-role-contact-points__icon'}
      />
    ) : (
      <Span>{contactPoint.name}</Span>
    );
  };

  render() {
    const { object, className, id } = this.props;

    const bem = bemify('rdfa-role-contact-points');

    return (
      <dl id={id} className={classNames(bem``, className)}>
        {arrayify(object.roleContactPoint).map(contactPoint => (
          <div key={getId(contactPoint)} className={bem`__item`}>
            <dt className={bem`__term`}>
              {this.getContactPointIcon(contactPoint)}
            </dt>
            <dd className={bem`__def`}>
              {contactPoint.url ? (
                <a href={contactPoint.url}>
                  {contactPoint.url.replace(/tel:|fax:|mailto:/, '')}
                </a>
              ) : contactPoint.email ? (
                <a href={contactPoint.email}>
                  {contactPoint.email.replace(/mailto:/, '')}
                </a>
              ) : (
                <Span>{contactPoint.address}</Span>
              )}
              {contactPoint.contactType ? (
                <Fragment>
                  (<Span>{contactPoint.contactType}</Span>)
                </Fragment>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    );
  }
}
