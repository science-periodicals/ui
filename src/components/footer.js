import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import resetSubdomain from '../utils/reset-subdomain';
import Hyperlink from './hyperlink';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';

export default class Footer extends PureComponent {
  render() {
    const { hideCopyright, padding, sticky, shortBody, aboutLink } = this.props;
    return (
      <footer
        className={classNames('footer-container', {
          'footer--sticky': sticky,
          'footer--short-body': shortBody
        })}
      >
        {!hideCopyright && (
          <div className="footer__copyright">
            ©&nbsp;{new Date().getFullYear()} sci.pe, 7&nbsp;World Trade Center,
            New York, NY 10007
          </div>
        )}
        <div className={`footer footer--padding_${padding}`}>
          <div className="footer__item">
            <Hyperlink {...aboutLink}>sci.pe</Hyperlink>
          </div>
          <div className="footer__item">
            <a href={resetSubdomain('/get-started/terms')}>Terms</a>
          </div>
          <div className="footer__item">
            <a href={resetSubdomain('/get-started/pricing')}>Pricing</a>
          </div>
          <div className="footer__item">
            <a href={resetSubdomain('/get-started')}>Documentation</a>
          </div>
          <div className="footer__item">
            <a href="https://research.sci.pe/">Research</a>
          </div>
          <div className="footer__links">
            <a
              href="https://twitter.com/scipeTweets"
              title="Twitter"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              {/* <img
                src={resetSubdomain('/images/icons/icon_twitter_black.svg')}
                alt="Twitter"
              /> */}
              <Iconoclass iconName="socialTwitter" behavior="button" />
            </a>
            <a
              href="https://github.com/science-periodicals"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              {/* <img
                src={resetSubdomain('/images/icons/GitHub-Mark-32px.png')}
                alt="Github"
              /> */}
              <Iconoclass iconName="socialGithub" behavior="button" />
            </a>
            <a
              href="mailto:contact@sci.pe"
              title="Contact"
              className="footer__link"
            >
              {/* <img
                src={resetSubdomain('/images/icons/icon_email_black_24px.svg')}
                alt="contact us"
              /> */}
              <Iconoclass iconName="email" behavior="button" />
            </a>
          </div>
        </div>
      </footer>
    );
  }
}

// `hideCopyright` is a boolean, if set to true causes the copyright statement does not to appear
// `padding` is either 'large' (default) or 'small', the latter for when a more discreet footer is
// called for
// `sticky` is a boolean, if set to true it will cause the footer to try to be sticky at the bottom.
// Note that the stylesheet will never make a footer sticky if the height of the viewport is less
// than 900px *unless* the .footer--short-body class is set on the body, which is for situations in
// which a sticky footer is desirable no matter what because the content is known to be overly
// short.
Footer.propTypes = {
  hideCopyright: PropTypes.bool,
  padding: PropTypes.string,
  sticky: PropTypes.bool,
  aboutLink: PropTypes.object,
  shortBody: PropTypes.bool
};

Footer.defaultProps = {
  hideCopyright: false,
  padding: 'small',
  sticky: false,
  shortBody: false,
  aboutLink: {
    href: resetSubdomain('/get-started')
  }
};
