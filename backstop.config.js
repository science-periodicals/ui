require('@babel/register');

const examples = require('./example');
const keys = Object.keys(examples);

module.exports = {
  id: 'backstop-ui',
  viewports: [
    {
      label: 'desktop',
      width: 1440,
      height: 1075
    }
  ],
  onBeforeScript: 'puppet/onBefore.js',
  onReadyScript: 'puppet/onReady.js',
  readySelector: '[data-test-ready="true"]',
  puppeteerOffscreenCaptureFix: true, // currently not documented bug fix issue where header are re-added to screenshot despit the fact that we specfify a selector for just a part of the screen
  scenarios: keys
    //.filter(key => key === 'ActionProgressLogExample')
    .map(key => {
      const label = key.replace(/Example$/, '');
      return customize({
        label,
        delay: 1000,
        selectors: ['[data-testid="backstop-ui-component"]'],
        hideSelectors: ['[data-test-progress="true"]'],
        url: `http://127.0.0.1:3030/${label}`
      });
    }),
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['CI'],
  engine: 'puppeteer',
  engineOptions: {
    args: ['--no-sandbox']
  },
  asyncCaptureLimit: 4,
  asyncCompareLimit: 1,
  debug: false,
  debugWindow: false
};

function customize(scenario) {
  let extra;
  switch (scenario.label) {
    case 'Banner':
    case 'ProgessiveImage':
      // Need to wait that images are loaded
      extra = {
        readySelector: '[data-test-loaded="true"]'
      };
      break;

    case 'PagedMedia':
    case 'AppLayoutStickyList':
      extra = {
        selectors: ['viewport']
      };
      break;

    case 'SVGAnnotable':
    case 'ActionProgressLog':
      // more delay for CSS anim or SVG loading
      extra = {
        delay: 2000
      };
      break;

    default:
      break;
  }

  return Object.assign({}, scenario, extra);
}
