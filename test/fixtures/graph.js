var graph = {
  '@id': 'graph:graphId',
  '@type': 'Graph',
  mainEntity: 'node:article',
  dateCreated: new Date().toISOString(),
  '@graph': [
    {
      '@id': 'node:audio',
      '@type': 'Audio',
      encoding: {
        '@type': 'AudioObject'
      },
      resourceOf: 'graph:graphId'
    },
    {
      '@id': 'node:article',
      '@type': 'ScholarlyArticle',
      alternateName: 'article',
      name: 'on the effect of X on Y',
      dateCreated: new Date().toISOString(),
      encoding: {
        '@id': 'node:docx',
        '@type': 'DocumentObject'
      },
      resourceOf: 'graph:graphId',
      hasPart: [
        {
          '@id': 'node:image',
          '@type': 'Image',
          alternateName: 'image',
          name: 'multipart figure',
          dateCreated: new Date().toISOString(),
          resourceOf: 'graph:graphId',
          hasPart: [
            {
              '@id': 'node:part1',
              '@type': 'Image',
              dateCreated: new Date().toISOString(),
              alternateName: 'part 1',
              resourceOf: 'graph:graphId',
              encoding: {
                '@id': 'node:png1',
                '@type': 'ImageObject',
                isBasedOn: 'node:docx'
              }
            },
            {
              '@id': 'node:part2',
              '@type': 'Image',
              dateCreated: new Date().toISOString(),
              alternateName: 'part 2',
              isBasedOn: ['node:code'],
              resourceOf: 'graph:graphId',
              encoding: {
                '@id': 'node:png2',
                '@type': 'ImageObject',
                isBasedOn: 'node:docx'
              }
            }
          ]
        },
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
              encoding: {
                '@type': 'ImageObject'
              }
            },
            {
              '@id': 'node:standalonePart2',
              '@type': 'Image',
              resourceOf: 'graph:graphId',
              encoding: {
                '@type': 'ImageObject'
              }
            }
          ]
        },
        {
          '@id': 'node:code',
          '@type': 'SoftwareSourceCode',
          dateCreated: new Date().toISOString(),
          alternateName: 'code',
          resourceOf: 'graph:graphId',
          encoding: {
            '@type': 'SoftwareSourceCodeObject'
          }
        },
        {
          '@id': 'node:supportingInfo',
          '@type': 'ScholarlyArticle',
          resourceOf: 'graph:graphId',
          encoding: {
            '@id': 'node:si',
            '@type': 'DocumentObject'
          },
          hasPart: [
            {
              '@id': 'node:video',
              '@type': 'Video',
              resourceOf: 'graph:graphId',
              encoding: {
                '@id': 'node:avi',
                '@type': 'VideoObject',
                isBasedOn: 'node:si'
              }
            },
            {
              '@id': 'node:standaloneSiMpFigure',
              '@type': 'Image',
              alternateName: 'image',
              resourceOf: 'graph:graphId',
              hasPart: [
                {
                  '@id': 'node:standaloneSiPart1',
                  '@type': 'Image',
                  resourceOf: 'graph:graphId',
                  encoding: {
                    '@type': 'ImageObject'
                  }
                },
                {
                  '@id': 'node:standaloneSiPart2',
                  '@type': 'Image',
                  resourceOf: 'graph:graphId',
                  encoding: {
                    '@type': 'ImageObject'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = graph;
