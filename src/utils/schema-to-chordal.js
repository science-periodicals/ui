import * as colors from '@scipe/resources/constants/resource-colors';
import { arrayify, getId, getValue } from '@scipe/jsonld';
import { getCssType } from './graph';

function defaultColorMapper(resource) {
  return colors[getCssType(resource)];
}

// Expects a list of schema.org resources. It will not recurse into them for you, just look at the
// descendent resources for the links
export default function schemaToChordal(resources, opts = {}) {
  const colorMapper = opts.colorMapper || defaultColorMapper;

  // TODO new option (`imagePart`) to exclude subfigure but remap the link to subfigure to link to parent figures
  const blacklist = new Set();
  const linkIdMap = {};
  resources = arrayify(resources);
  if (opts.imagePart === false) {
    resources.forEach(resource => {
      if (resource['@type'] === 'Image' && resource.hasPart) {
        arrayify(resource.hasPart).forEach(p => {
          const id = getId(p);
          if (id) {
            linkIdMap[id] = getId(resource);
            blacklist.add(id);
          }
        });
      }
    });
    resources = resources.filter(resource => !blacklist.has(getId(resource)));
  }

  return arrayify(resources).map(res => {
    let linkProviders = arrayify(res.isBasedOn);
    if (opts.hasPart) {
      linkProviders = linkProviders.concat(arrayify(res.hasPart));
    }
    let links = Array.from(
      new Set(
        linkProviders
          .map(obj => {
            const id = getId(obj);
            return linkIdMap[id] || id;
          })
          .filter(id => !blacklist.has(id))
      )
    );

    return {
      id: getId(res),
      label:
        getValue(
          res.alternateName || res.name || res.description || res.caption
        ) || '',
      color: colorMapper(res),
      links
    };
  });
}
