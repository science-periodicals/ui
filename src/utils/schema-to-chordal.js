import flatten from 'lodash/flatten';
import * as colors from '@scipe/resources/constants/resource-colors';
import { arrayify, getId, getValue } from '@scipe/jsonld';
import { getCssType } from './graph';

function defaultColorMapper(resource) {
  return colors[getCssType(resource)];
}

/**
 * Expects a list of schema.org resources. It will not recurse into them for you, just look at the
 * descendent resources for the links
 */
export default function schemaToChordal(
  resources,
  { colorMapper = defaultColorMapper, imagePart, hasPart } = {}
) {
  colorMapper = colorMapper || defaultColorMapper;

  // for multi part figure if `imagePart` is false we remap the link to the part
  // to link to the parent thanks to `linkIdMap`
  const blacklist = new Set();
  const linkIdMap = {};
  resources = arrayify(resources);
  const allResources = resources;
  if (imagePart === false) {
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

  return resources.map(r => {
    let linkProviders = arrayify(r.isBasedOn).concat(
      imagePart === false && r['@type'] === 'Image' && r.hasPart
        ? flatten(
            arrayify(r.hasPart).map(p => {
              // `r` can be flattened and so just be an @id => we try to get p from `allResources`
              p = allResources.find(r => getId(r) === getId(p)) || p;
              return arrayify(p.isBasedOn);
            })
          )
        : []
    );
    if (hasPart) {
      linkProviders = linkProviders.concat(arrayify(r.hasPart));
    }

    let links = Array.from(
      new Set(
        linkProviders
          .map(obj => {
            const id = getId(obj);
            return linkIdMap[id] || id;
          })
          .filter(id => !blacklist.has(id) && id !== getId(r))
      )
    );

    return {
      id: getId(r),
      label:
        getValue(r.alternateName || r.name || r.description || r.caption) || '',
      color: colorMapper(r),
      links
    };
  });
}
