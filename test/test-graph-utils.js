import assert from 'assert';
import omit from 'lodash/omit';
import { flatten, getNodeMap, getId } from '@scipe/jsonld';
import data from './fixtures/graph';
import {
  getDependents,
  getRequirements,
  getResourceInfo,
  forEachResource,
  getResourceParts,
  findResource,
  getRootEncoding,
  getPotentialDependencies,
  compareResources,
  getResourceTree
} from '../src/utils/graph';

describe('graph utils', function() {
  let graph, nodeMap, resourceInfo;
  before(done => {
    flatten(data, (err, flattened) => {
      if (err) throw err;
      graph = flattened;
      nodeMap = getNodeMap(graph);
      resourceInfo = getResourceInfo(graph, nodeMap, { sort: true });
      done();
    });
  });

  it('should get the root encoding', () => {
    const resource = {
      encoding: [
        {
          '@id': '_:3',
          isBasedOn: '_:2'
        },
        {
          '@id': '_:2',
          isBasedOn: '_:1'
        },
        {
          '@id': '_:1'
        }
      ]
    };

    assert.equal(getId(getRootEncoding(resource)), '_:1');
  });

  it('should sort resources', () => {
    const resources = [
      {
        '@id': '_:0',
        position: 0,
        name: 'On a figure',
        alternateName: 'Figure 1'
      },
      {
        '@id': '_:2',
        name: 'A nicer figure',
        alternateName: 'Figure 3'
      },
      {
        '@id': '_:1',
        position: 1,
        name: 'On the effect',
        alternateName: 'Figure 2'
      },
      {
        '@id': '_:3',
        position: 3,
        name: 'On the effect',
        alternateName: 'Figure 4'
      }
    ];

    const expected = ['_:0', '_:1', '_:2', '_:3'];

    assert.deepEqual(
      resources
        .slice()
        .sort(compareResources)
        .map(x => x['@id']),
      expected
    );
    assert.deepEqual(
      resources
        .map(r => omit(r, ['position']))
        .sort(compareResources)
        .map(x => x['@id']),
      expected
    );
  });

  it('should get a resourceTree', () => {
    assert.deepEqual(
      getResourceTree(getId(graph.mainEntity), getNodeMap(graph), {
        sort: true
      }),
      {
        '@id': 'node:article',
        hasPart: [
          { '@id': 'node:code' },
          {
            '@id': 'node:image',
            hasPart: [{ '@id': 'node:part1' }, { '@id': 'node:part2' }]
          },
          {
            '@id': 'node:standaloneMpFigure',
            hasPart: [
              { '@id': 'node:standalonePart1' },
              { '@id': 'node:standalonePart2' }
            ]
          },
          {
            '@id': 'node:supportingInfo',
            hasPart: [
              {
                '@id': 'node:standaloneSiMpFigure',
                hasPart: [
                  { '@id': 'node:standaloneSiPart1' },
                  { '@id': 'node:standaloneSiPart2' }
                ]
              },
              { '@id': 'node:video' }
            ]
          }
        ]
      }
    );
  });

  it('should get resourceInfo', () => {
    assert.deepEqual(
      resourceInfo.resourceIds.sort(),
      [
        'node:article',
        'node:image',
        'node:part1',
        'node:part2',
        'node:standaloneMpFigure',
        'node:standalonePart1',
        'node:standalonePart2',
        'node:code',
        'node:supportingInfo',
        'node:video',
        'node:standaloneSiMpFigure',
        'node:standaloneSiPart1',
        'node:standaloneSiPart2'
      ].sort()
    );

    assert.deepEqual(resourceInfo.resourceTree, [
      {
        '@id': 'node:article',
        hasPart: [
          { '@id': 'node:code' },
          {
            '@id': 'node:image',
            hasPart: [{ '@id': 'node:part1' }, { '@id': 'node:part2' }]
          },
          {
            '@id': 'node:standaloneMpFigure',
            hasPart: [
              { '@id': 'node:standalonePart1' },
              { '@id': 'node:standalonePart2' }
            ]
          },
          {
            '@id': 'node:supportingInfo',
            hasPart: [
              {
                '@id': 'node:standaloneSiMpFigure',
                hasPart: [
                  { '@id': 'node:standaloneSiPart1' },
                  { '@id': 'node:standaloneSiPart2' }
                ]
              },
              { '@id': 'node:video' }
            ]
          }
        ]
      }
    ]);
  });

  it('should get resourceInfo when mainEntity is undefined', () => {
    const { resourceIds, resourceTree } = getResourceInfo({});

    assert.deepEqual(resourceIds, []);
    assert.deepEqual(resourceTree, []);
  });

  it('should get requirement', () => {
    const requirements = getRequirements('node:article', nodeMap);
    assert.deepEqual(Array.from(requirements['node:code']), ['node:part2']);
  });

  it('should get dependents', () => {
    const dependents = getDependents(
      'node:code',
      resourceInfo.resourceIds,
      nodeMap
    );
    assert.deepEqual(dependents, ['node:part2']);
  });

  it('should get the potential dependencies of a resource', done => {
    const graph = {
      '@id': 'graph:graphId',
      mainEntity: 'a',
      '@graph': [
        {
          '@id': 'a',
          '@type': 'CreativeWork',
          encoding: { '@type': 'MediaObject' },
          resourceOf: 'graph:graphId',
          hasPart: [
            {
              '@id': 'b',
              '@type': 'CreativeWork',
              encoding: { '@type': 'MediaObject' },
              resourceOf: 'graph:graphId',
              hasPart: [
                {
                  '@id': 'c',
                  '@type': 'CreativeWork',
                  encoding: { '@type': 'MediaObject' },
                  resourceOf: 'graph:graphId'
                },
                {
                  '@id': 'd',
                  '@type': 'CreativeWork',
                  resourceOf: 'graph:graphId',
                  hasPart: [
                    {
                      '@id': 'e',
                      '@type': 'CreativeWork',
                      encoding: { '@type': 'MediaObject' },
                      resourceOf: 'graph:graphId'
                    },
                    {
                      '@id': 'f',
                      '@type': 'CreativeWork',
                      encoding: { '@type': 'MediaObject' },
                      resourceOf: 'graph:graphId',
                      isBasedOn: ['a', 'g']
                    }
                  ]
                }
              ]
            },
            {
              '@id': 'g',
              '@type': 'CreativeWork',
              encoding: { '@type': 'MediaObject' },
              resourceOf: 'graph:graphId'
            }
          ]
        }
      ]
    };
    flatten(graph, (err, flattened) => {
      const nodeMap = getNodeMap(flattened);
      const { resourceIds } = getResourceInfo(flattened);
      assert.deepEqual(
        getPotentialDependencies('a', resourceIds, nodeMap).sort(),
        ['b', 'c', 'd', 'e', 'f', 'g'].sort()
      );
      assert.deepEqual(
        getPotentialDependencies('f', resourceIds, nodeMap).sort(),
        ['b', 'c', 'd', 'e'].sort()
      );
      done();
    });
  });

  it('should get resourceInfo of a standalone mp figure', done => {
    flatten(
      {
        '@id': 'graph:graphId',
        mainEntity: 'node:standaloneMpFigure',
        '@graph': [
          {
            '@id': 'node:standaloneMpFigure',
            '@type': 'Image',
            alternateName: 'image',
            resourceOf: 'graph:graphId',
            hasPart: [
              {
                '@id': 'node:standalonePart1',
                '@type': 'Image',
                resourceOf: 'graph:graphId',
                encoding: { '@type': 'MediaObject' }
              },
              {
                '@id': 'node:standalonePart2',
                '@type': 'Image',
                resourceOf: 'graph:graphId',
                encoding: { '@type': 'MediaObject' }
              }
            ]
          }
        ]
      },
      (err, graph) => {
        if (err) throw err;
        nodeMap = getNodeMap(graph);
        resourceInfo = getResourceInfo(graph, nodeMap);
        assert.deepEqual(resourceInfo, {
          resourceIds: [
            'node:standaloneMpFigure',
            'node:standalonePart1',
            'node:standalonePart2'
          ],
          resourceTree: [
            {
              '@id': 'node:standaloneMpFigure',
              hasPart: [
                { '@id': 'node:standalonePart1' },
                { '@id': 'node:standalonePart2' }
              ]
            }
          ]
        });
        done();
      }
    );
  });

  it('should iterate through all the resources of a resourceTree', function() {
    const resourceTree = [
      {
        '@id': 1,
        hasPart: [{ '@id': 2, hasPart: [{ '@id': 3 }, { '@id': 4 }] }]
      }
    ];
    const rIds = [];
    forEachResource(resourceTree, r => rIds.push(r['@id']));
    assert.deepEqual(rIds, [1, 2, 3, 4]);
  });

  it('should get all the resources of a bundle', function() {
    const node = {
      '@id': 1,
      hasPart: [{ '@id': 2, hasPart: [{ '@id': 3 }, { '@id': 4 }] }]
    };
    assert.deepEqual(getResourceParts(node).map(r => r['@id']), [2, 3, 4]);
  });

  it('should find resource', function() {
    const resourceTree = [
      {
        '@id': 1,
        hasPart: [{ '@id': 2, hasPart: [{ '@id': 3 }, { '@id': 4 }] }]
      }
    ];
    assert.equal(findResource(3, resourceTree)['@id'], 3);
  });

  it('should get the resource info of a graph being reconciliated', () => {
    // here the encoding of the ScholaryArticle has been replaced by a new one
    // this happens during reconciliation and this test ensure that the proper logic remains
    // we need to make sure that the part is invalidated and doesn't show up as an independant resource

    const graph = {
      '@id': 'graph:graphId',
      '@type': 'Graph',
      mainEntity: 'node:mainEntityId',
      '@graph': [
        {
          '@id': 'node:mainEntityId',
          '@type': 'ScholarlyArticle',
          encoding: 'node:newMainEntityEncodingIdEncodingId',
          hasPart: ['node:partId'],
          resourceOf: 'graph:graphId'
        },
        {
          '@id': 'node:partId',
          encoding: 'node:partEncodingId',
          isPartOf: 'node:mainEntityId'
        },
        {
          '@id': 'node:partEncodingId',
          encodesCreativeWork: 'node:partId',
          isBasedOn: ['node:oldMainEntityEncodingId']
        },
        {
          '@id': 'node:newMainEntityEncodingIdEncodingId',
          '@type': 'DocumentObject'
        }
      ]
    };

    const resourceInfo = getResourceInfo(graph);
    // console.log(require('util').inspect(resourceInfo, { depth: null }));
    assert.deepEqual(resourceInfo.resourceIds, ['node:mainEntityId']);
    assert.deepEqual(resourceInfo.resourceTree, [
      { '@id': 'node:mainEntityId' }
    ]);
  });
});
