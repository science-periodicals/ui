import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { arrayify } from '@scipe/jsonld';

const defaultBreakPoints = {
  mobile: {
    vw: 420,
    widthPerc: 100
  },
  smallTablet: {
    vw: 640,
    widthPerc: 100
  },
  tablet: {
    vw: 768,
    widthPerc: 100
  },
  smallDesktop: {
    vw: 1024,
    widthPerc: 100
  },
  largeDesktop: {
    vw: 1280,
    widthPerc: 75
  },
  xlargeDesktop: {
    vw: 1824,
    widthPerc: 50
  },
  xxlargeDesktop: {
    vw: 2560,
    widthPerc: 50
  }
};

export default class ProgressiveImage extends Component {
  static propTypes = {
    id: PropTypes.string,
    resource: PropTypes.object.isRequired,
    isPrinting: PropTypes.bool,
    width: PropTypes.string,
    height: PropTypes.string,
    breakPoints: PropTypes.object
  };

  static defaultProps = {
    resource: {},
    isPrinting: false,
    breakPoints: defaultBreakPoints
  };

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      fullSizeImageLoaded: false,
      fullSizeSrc: undefined
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  getBreakPoints() {
    const { breakPoints } = this.props;
    return Object.assign({}, defaultBreakPoints, breakPoints);
  }

  /**
   * load the image asynchronously
   * this creates an Image dom element to pull down the resource. The image
   * element is not used per se, but the resource should be cached. we do this
   * instead of loading currentSrc to take advantage of the img srcset and sizes
   * attributes.
   */
  loadImage(src, srcSet, sizes) {
    const image = new Image();

    return new Promise(resolve => {
      const image = new Image();
      image.src = src;
      if (srcSet) image.srcset = srcSet;
      if (sizes) image.sizes = sizes;
      image.addEventListener(
        'load',
        e => {
          if (!this.state.fullSizeImageLoaded && this._isMounted) {
            this.setState({
              fullSizeImageLoaded: true,
              fullSizeSrc: image.currentSrc
            });
          }
          resolve(image.currentSrc);
        },
        false
      );
    });
  }

  /**
   * load the full res image if needed and render it once it has loaded
   */
  renderFullSizeImage(encoding) {
    const { id, width, height } = this.props;
    const { srcSet, sizes } = getResponsiveImageData(
      encoding,
      this.getBreakPoints()
    );

    if (this.state.fullSizeImageLoaded === false) {
      let loadedSrc = this.loadImage(encoding.contentUrl, srcSet, sizes);
    } else {
      return (
        <picture>
          <source media="print" srcSet={encoding.contentUrl} />
          <img
            id={id}
            className="progressive-image__full-size-image__img"
            src={encoding.contentUrl}
            srcSet={srcSet}
            sizes={sizes}
            width={width}
            height={height}
          />
        </picture>
      );
    }
  }

  render() {
    const { resource, id, width, height, breakPoints, isPrinting } = this.props;

    const encoding = getCanonicalImageObject(resource);
    const smallestImage = getSmallestThumbnail(encoding);
    console.log('resource', resource);
    console.log('encoding', encoding);
    console.log('smallestImage', smallestImage);

    if (!encoding || !encoding.contentUrl) {
      return <div>No rendering available.</div>;
    }

    //const { srcSet, sizes } = getResponsiveImageData(encoding, breakPoints);

    let style = {};
    if (width) style.width = width;
    if (height) style.height = height;

    /* note that the browser's print mode doesn't necessarily correctly choose the best resolution from sizes and/or srcSet props for printing. Below we fall back to the max size for print using the picture source tag
     */

    const previewThumbnail = getSmallestThumbnail(encoding);

    return (
      <div className="progressive-image" style={style}>
        {/* render the low-res preview thumbnail */}
        <div
          className={`progressive-image__preview-image ${
            this.state.fullSizeImageLoaded
              ? 'progressive-image__preview-image--hidden'
              : ''
          }`}
        >
          <picture>
            <source media="print" srcSet={encoding.contentUrl} />
            <img
              id={id}
              className="progressive-image__preview-image__img"
              src={previewThumbnail.contentUrl}
              width={width}
              height={height}
            />
          </picture>
        </div>
        {/* render the full-res image */}
        <div
          className="progressive-image__full-size-image"
          data-test-loaded="true"
        >
          {this.renderFullSizeImage(encoding)}
        </div>
      </div>
    );
  }
}

/**
 * Returns the canonical ImageObject (encoding) associated with an Image resource
 */
export function getCanonicalImageObject(resource) {
  return arrayify(resource.encoding).find(encoding => {
    return /image\/png|image\/jpeg|application\/x-msmetafile/.test(
      encoding.fileFormat
    );
  });
}

/**
 * Extract the resolution info from the encoding exifData
 */
function getEncodingSize(encoding) {
  //console.log('getEncodingSize', encoding);

  let sizeInfo = {
    height: undefined,
    width: undefined,
    resolution: undefined,
    units: undefined,
    heightResolution: undefined,
    widthResolution: undefined,
    heightInches: undefined,
    widthInches: undefined
  };

  const resolutionObject = encoding.exifData.find(exif => {
    return exif.propertyID == 'resolution';
  });

  sizeInfo.height = encoding.height ? parseInt(encoding.height) : undefined;
  sizeInfo.width = encoding.width ? parseInt(encoding.width) : undefined;

  if (resolutionObject && resolutionObject.value) {
    sizeInfo.resolution = resolutionObject.value;
  } else {
    sizeInfo.resolution = '72x72';
  }

  if (resolutionObject && resolutionObject.unitText) {
    sizeInfo.units = resolutionObject.unitText;
  } else {
    sizeInfo.units = 'ppi';
  }

  if (
    sizeInfo.width &&
    sizeInfo.height &&
    sizeInfo.resolution &&
    sizeInfo.units == 'ppi'
  ) {
    const resolutions = sizeInfo.resolution.split('x');
    //onsole.log('- resolutions', resolutions);
    const heightRes = parseInt(resolutions[0], 10);
    const widthRes = parseInt(resolutions[1], 10);
    sizeInfo.heightResolution = heightRes;
    sizeInfo.widthResolution = widthRes;
    sizeInfo.heightInches = sizeInfo.height / heightRes;
    sizeInfo.widthInches = sizeInfo.width / widthRes;
  }

  return sizeInfo;
}
/**
 * Computes responsive image attributes `srcSet` and `sizes`
 * see: https://jakearchibald.com/2015/anatomy-of-responsive-images/
 */
function getResponsiveImageData(encoding = {}, breakPoints) {
  let sources = encoding.thumbnail ? arrayify(encoding.thumbnail) : [encoding];

  sources = sources.filter(
    source =>
      /image\/png|image\/jpeg/.test(source.fileFormat) &&
      source.contentUrl &&
      !source.contentUrl.startsWith('file:') &&
      source.width != null
  );

  // TODO sync with https://github.com/scienceai/workers/blob/master/src/image-worker/thumbnail.js
  // ImageWorker create thumbnail for: 940px 640px 320px
  // On top of that we need to take into account for reader padding etc.

  let srcSet,
    sizes = '';

  if (sources.length) {
    srcSet = sources
      .map(source => {
        return `${source.contentUrl} ${source.width}w`;
      })
      .join(', ');

    const max = Math.max.apply(Math, sources.map(thumbnail => thumbnail.width));

    // find the source img that is the next biggest above the breakpoint

    // sort the queries
    let sortedBreakPoints = Object.values(breakPoints).sort((a, b) => {
      if (a.vw < b.vw) return -1;
      if (a.vw > b.vw) return 1;
      return 0;
    });

    // create the sizes sttring
    sortedBreakPoints.forEach(breakPoint => {
      let imageSize = breakPoint.vw * (breakPoint.widthPerc / 100);
      imageSize = imageSize > max ? max : imageSize;
      sizes += `(max-width: ${breakPoint.vw}px) ${imageSize}px, `;
    });

    // add the fallback size
    sizes += ' 100vw';
  }
  return { srcSet, sizes };
}

/**
 * find the smallest thumbnail object in an array of encodings
 */
function getSmallestThumbnail(encoding = {}) {
  let sources = encoding.thumbnail ? arrayify(encoding.thumbnail) : [encoding];
  sources = sources.filter(source => {
    return (
      /image\/png|image\/jpeg/.test(source.fileFormat) &&
      source.contentUrl &&
      source.width != null
    );
  });

  if (sources.length > 0) {
    sources = sources.reduce((acc, curr) => {
      return curr.width * curr.height < acc.width * acc.height ? curr : acc;
    });
  }
  return sources;
}
