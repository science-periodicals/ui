import React from 'react';
import { getId } from '@scipe/jsonld';
import { FeedItem } from '../../src/';

export default function FeedItemExample(props) {
  const journal = {
    '@id': 'journal:journalId',
    '@type': 'Periodical',
    name: 'Journal of science',
    url: 'https://journal.science.ai',
    alternateName: 'JoS',
    description:
      'JoS emphasizes sophisticated methodologies and innovative theoretical syntheses—all in an effort to advance the knowledge of organic evolution and other broad biological principles'
  };

  const graph = {
    '@id': 'scienceai:graphId',
    '@type': 'Graph',
    name: 'submission',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras faucibus nec sapien sit amet fringilla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Proin id scelerisque eros. Duis quis nulla vel sem pellentesque euismod a ut mauris. Nulla facilisi. Vestibulum ex justo, sollicitudin vel interdum a, pulvinar id arcu. Vestibulum id porta mi.',
    isPartOf: journal
  };

  const graphV1 = {
    '@id': 'scienceai:graphId?version=0.0.0-0',
    '@type': 'Graph',
    version: '0.0.0-0',
    name: 'submission',
    description: 'release note for v0',
    isPartOf: journal
  };

  const graphV2 = {
    '@id': 'scienceai:graphId?version=1.0.0-0',
    '@type': 'Graph',
    version: '1.0.0-0',
    name: 'submission',
    description: 'release note for v1',
    isPartOf: journal
  };

  const graphPublic = {
    '@id': 'graph:graphId?version=1.0.0',
    '@type': 'Graph',
    name: 'project',
    url: 'https://journal.science.ai/a-slug',
    hasDigitalDocumentPermission: {
      '@type': 'DigitalDocumentPermission',
      grantee: {
        '@type': 'Audience',
        audienceType: 'public'
      }
    },
    isPartOf: journal
  };

  const productionStage = {
    '@id': 'action:stageId',
    '@type': 'StartWorkflowStageAction',
    name: 'Production stage',
    alternateName: 'Accept'
  };

  const workflow = {
    '@id': 'workflow:workflowId',
    '@type': 'WorkflowSpecification',
    name: 'test workflow',
    isPotentialWorkflowOf: journal
  };

  const scope = graph;

  const droplets = {
    [getId(journal)]: journal,
    [getId(graph)]: graph,
    [getId(graphV1)]: graphV1,
    [getId(graphV2)]: graphV2,
    [getId(graphPublic)]: graphPublic,
    [getId(productionStage)]: productionStage,
    [getId(workflow)]: workflow
  };

  return (
    <div
      className="example feed-item-example"
      style={{
        border: 'none',
        maxWidth: '400px',
        margin: '100px auto',
        backgroundColor: 'whitesmoke'
      }}
    >
      <ul>
        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'InviteAction',
              actionStatus: 'ActiveActionStatus',
              agent: 'user:alan',
              recipient: {
                roleName: 'reviewer',
                recipient: 'user:peter'
              },
              object: graph,
              startTime: new Date().toISOString()
            }}
            onAction={action => {
              console.log(action);
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'InviteAction',
              actionStatus: 'CompletedActionStatus',
              agent: 'user:alan',
              recipient: {
                roleName: 'reviewer',
                recipient: 'user:peter'
              },
              object: graph,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              potentialAction: {
                '@type': 'RejectAction',
                actionStatus: 'CompletedActionStatus'
              }
            }}
            onAction={action => {
              console.log(action);
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'InviteAction',
              actionStatus: 'CompletedActionStatus',
              agent: 'user:alan',
              recipient: {
                roleName: 'reviewer',
                recipient: 'user:peter'
              },
              object: graph,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              potentialAction: {
                '@type': 'AcceptAction',
                actionStatus: 'CompletedActionStatus'
              }
            }}
            onAction={action => {
              console.log(action);
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'JoinAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'editor',
                name: 'editor in chief',
                agent: 'user:alan'
              },
              object: journal,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'JoinAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'editor',
                name: 'editor in chief',
                agent: 'user:alan'
              },
              object: graph,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'CreatePeriodicalAction',
              actionStatus: 'CompletedActionStatus',
              agent: 'user:alan',
              result: journal,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'CreateGraphAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'author',
                agent: 'user:ted'
              },
              object: workflow,
              result: graph,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'CreateReleaseAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'author',
                agent: 'user:ted'
              },
              object: graph,
              result: graphV1,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'CreateReleaseAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'author',
                agent: 'user:ted'
              },
              object: graph,
              result: graphV2,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'ReviewAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'editor',
                agent: 'user:ted'
              },
              object: graphV2,
              resultReview: {
                reviewRating: {
                  '@type': 'Rating',
                  worstRating: 1,
                  bestRating: 5,
                  ratingValue: 3
                }
              },
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'PayAction',
              actionStatus: 'CompletedActionStatus',
              name: 'Article processing charge',
              agent: {
                roleName: 'author',
                agent: 'user:anton'
              },
              object: graphV2,
              priceSpecification: {
                '@type': 'PriceSpecification',
                price: 0,
                priceCurrency: 'USD'
              },
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'AssessAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'editor',
                agent: 'user:ted'
              },
              object: graphV2,
              result: productionStage,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'ScheduleAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'author',
                agent: 'user:ted'
              },
              object: {
                '@type': 'ReviewAction',
                identifier: '1.1',
                object: graphV2
              },
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              scheduledTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'CreateReleaseAction',
              actionStatus: 'CompletedActionStatus',
              agent: {
                roleName: 'author',
                agent: 'user:ted'
              },
              object: graph,
              result: graphPublic,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>

        <li>
          <FeedItem
            item={{
              '@id': 'scienceai:actionId',
              '@type': 'PublicationEvent',
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
              url: 'https://journal.science.ai/article',
              workFeatured: {
                '@type': 'ScholarlyArticle',
                isPartOf: journal,
                name:
                  'The path of least resistance: aggressive or moderate treatment?',
                description: {
                  '@type': 'rdf:HTML',
                  '@value':
                    '<p>The period polynomial <span role="math" style="display: inline-block; line-height: 1; vertical-align: -1.1712149712092133ex; height: 3.509ex"><math display="inline"><msub><mrow><mi>r</mi></mrow><mrow><mi>f</mi></mrow></msub><mo>(</mo><mi>z</mi><mo>)</mo></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="4.915ex" height="3.509ex" viewBox="0 -1006.6 2116.2 1510.9" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E1-STIXWEBMAINI-72" d="M176 223l16 35c19 42 53 95 94 138c26 27 56 45 79 45c28 0 47 -21 47 -51s-17 -54 -47 -54c-18 0 -26 11 -35 26c-6 10 -9 14 -16 14c-18 0 -46 -33 -82 -94c-43 -74 -61 -114 -111 -282h-76l81 292c14 52 16 61 16 82s-18 26 -38 26c-8 0 -16 -1 -31 -3v17l155 27l3 -2 Z"></path><path stroke-width="1" id="E1-STIXWEBMAINI-66" d="M41 428h93c22 71 39 126 72 173c30 43 71 77 132 77c49 0 86 -26 86 -62c0 -22 -19 -43 -42 -43c-18 0 -37 15 -37 39c0 17 10 22 10 31c0 8 -8 13 -22 13c-56 0 -93 -70 -122 -228h107l-6 -32h-108l-72 -320c-42 -185 -109 -283 -200 -283c-45 0 -79 26 -79 61 c0 23 17 42 38 42c23 0 38 -16 38 -37c0 -13 -9 -18 -9 -29c0 -9 8 -16 20 -16c42 0 74 54 97 162l88 420h-91Z"></path><path stroke-width="1" id="E1-STIXWEBMAIN-28" d="M304 -161l-12 -16c-158 90 -244 259 -244 429c0 185 87 329 247 424l9 -16c-139 -119 -170 -212 -170 -405c0 -186 30 -299 170 -416Z"></path><path stroke-width="1" id="E1-STIXWEBMAINI-7A" d="M380 417l-289 -344c58 -13 80 -24 120 -83c26 -38 45 -50 70 -50c16 0 27 6 27 15c0 4 -2 9 -5 15c-6 12 -8 20 -8 28c1 17 17 34 33 34c21 0 35 -15 35 -37c0 -40 -37 -76 -93 -76c-29 0 -63 13 -113 44c-47 29 -79 42 -105 42c-16 0 -29 -5 -45 -18l-9 9l310 372h-136 c-52 0 -71 -9 -91 -60l-16 4l32 116h283v-11Z"></path><path stroke-width="1" id="E1-STIXWEBMAIN-29" d="M29 660l12 16c153 -92 244 -259 244 -429c0 -185 -88 -327 -247 -424l-9 16c142 117 170 211 170 405c0 187 -25 302 -170 416Z"></path><path stroke-width="1" id="E1-STIXWEBSIZE1-28" d="M382 -134v-30c-142 134 -243 343 -243 615c0 267 101 481 243 615v-30c-90 -110 -162 -282 -162 -585c0 -306 72 -475 162 -585Z"></path><path stroke-width="1" id="E1-STIXWEBSIZE1-29" d="M86 1036v30c142 -134 243 -343 243 -615c0 -267 -101 -481 -243 -615v30c90 110 162 282 162 585c0 306 -72 475 -162 585Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E1-STIXWEBMAINI-72"></use><use transform="scale(0.707)" x="550" y="-213" xlink:href="#E1-STIXWEBMAINI-66"></use><use x="789" y="-201" xlink:href="#E1-STIXWEBSIZE1-28"></use><use x="1258" y="0" xlink:href="#E1-STIXWEBMAINI-7A"></use><use x="1647" y="-201" xlink:href="#E1-STIXWEBSIZE1-29"></use></g></svg></span> for a weight <span role="math" style="display: inline-block; line-height: 1; vertical-align: -0.5047926829268294ex; height: 2.343ex"><math display="inline"><mi>k</mi><mo>≥</mo><mn>3</mn></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="5.117ex" height="2.343ex" viewBox="0 -791.3 2203.1 1008.6" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E2-STIXWEBMAINI-6B" d="M461 428v-16c-47 -3 -78 -23 -225 -154l37 -88c39 -92 62 -129 81 -129c15 0 27 11 45 42c5 8 10 17 15 26l15 -11c-46 -84 -71 -109 -111 -109c-29 0 -49 19 -81 82c-18 35 -44 97 -60 141l-40 -32l-48 -180h-75l141 528c13 48 16 71 18 88c-2 18 -17 24 -51 24h-18v16 c59 7 98 14 157 27l6 -6l-120 -456l43 33c94 72 143 120 143 140c0 11 -12 18 -37 18h-14v16h179Z"></path><path stroke-width="1" id="E2-STIXWEBMAIN-2265" d="M629 324l-565 -273v63l432 215l-432 215v65l565 -275v-10zM629 -103h-565v66h565v-66Z"></path><path stroke-width="1" id="E2-STIXWEBMAIN-33" d="M61 510l-16 4c29 95 92 162 196 162c93 0 156 -55 156 -137c0 -48 -26 -98 -93 -138c44 -19 62 -31 83 -53c28 -31 44 -77 44 -129c0 -53 -17 -102 -46 -140c-48 -64 -143 -93 -232 -93c-73 0 -112 21 -112 57c0 21 18 36 41 36c17 0 33 -6 61 -26c37 -26 58 -31 86 -31 c74 0 130 68 130 153c0 76 -35 125 -104 145c-22 7 -45 10 -102 10v14c38 13 64 24 84 36c49 28 81 73 81 134c0 68 -42 102 -108 102c-62 0 -108 -32 -149 -106Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E2-STIXWEBMAINI-6B"></use><use x="739" y="0" xlink:href="#E2-STIXWEBMAIN-2265"></use><use x="1702" y="0" xlink:href="#E2-STIXWEBMAIN-33"></use></g></svg></span> and level <em>N</em> newform <span role="math" style="display: inline-block; line-height: 1; vertical-align: -0.6713734727878565ex; height: 2.509ex"><math display="inline"><mi>f</mi><mo>∈</mo><msub><mrow><mi>S</mi></mrow><mrow><mi>k</mi></mrow></msub><mo>(</mo><msub><mrow><mi>Γ</mi></mrow><mrow><mn>0</mn></mrow></msub><mo>(</mo><mi>N</mi><mo>)</mo><mo>,</mo><mi>χ</mi><mo>)</mo></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="15.751ex" height="2.509ex" viewBox="-146.5 -791.3 6781.5 1080.4" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E3-STIXWEBMAINI-66" d="M41 428h93c22 71 39 126 72 173c30 43 71 77 132 77c49 0 86 -26 86 -62c0 -22 -19 -43 -42 -43c-18 0 -37 15 -37 39c0 17 10 22 10 31c0 8 -8 13 -22 13c-56 0 -93 -70 -122 -228h107l-6 -32h-108l-72 -320c-42 -185 -109 -283 -200 -283c-45 0 -79 26 -79 61 c0 23 17 42 38 42c23 0 38 -16 38 -37c0 -13 -9 -18 -9 -29c0 -9 8 -16 20 -16c42 0 74 54 97 162l88 420h-91Z"></path><path stroke-width="1" id="E3-STIXWEBMAIN-2208" d="M625 -27h-291c-160 0 -274 131 -274 279s112 279 271 279h294v-66h-290c-103 0 -189 -85 -206 -180h496v-66h-497c17 -95 103 -180 206 -180h291v-66Z"></path><path stroke-width="1" id="E3-STIXWEBMAINI-53" d="M508 667l-40 -200l-18 3c0 102 -22 163 -119 163c-69 0 -112 -37 -112 -100c0 -49 8 -65 99 -156c91 -92 113 -135 113 -200c0 -114 -87 -195 -202 -195c-31 0 -58 7 -104 23c-27 10 -36 12 -47 12c-20 0 -36 -9 -43 -32h-18l34 224l20 -2c-2 -9 -2 -16 -2 -23 c0 -98 60 -167 144 -167c77 0 131 52 131 128c0 43 -14 73 -60 123l-39 42c-14 15 -26 29 -39 42c-60 64 -75 96 -75 150c0 105 82 164 178 164c31 0 64 -5 85 -14c21 -8 33 -11 46 -11c22 0 31 5 45 26h23Z"></path><path stroke-width="1" id="E3-STIXWEBMAINI-6B" d="M461 428v-16c-47 -3 -78 -23 -225 -154l37 -88c39 -92 62 -129 81 -129c15 0 27 11 45 42c5 8 10 17 15 26l15 -11c-46 -84 -71 -109 -111 -109c-29 0 -49 19 -81 82c-18 35 -44 97 -60 141l-40 -32l-48 -180h-75l141 528c13 48 16 71 18 88c-2 18 -17 24 -51 24h-18v16 c59 7 98 14 157 27l6 -6l-120 -456l43 33c94 72 143 120 143 140c0 11 -12 18 -37 18h-14v16h179Z"></path><path stroke-width="1" id="E3-STIXWEBMAIN-28" d="M304 -161l-12 -16c-158 90 -244 259 -244 429c0 185 87 329 247 424l9 -16c-139 -119 -170 -212 -170 -405c0 -186 30 -299 170 -416Z"></path><path stroke-width="1" id="E3-STIXWEBMAINI-393" d="M645 653l-32 -154l-21 2c3 22 3 27 3 33c0 73 -23 86 -199 86c-46 0 -61 -6 -68 -32l-132 -473c-7 -25 -14 -45 -14 -60c0 -24 18 -35 77 -39v-16h-251v16c58 4 68 26 83 78l123 442c7 25 10 45 10 61c0 28 -10 34 -76 40v16h497Z"></path><path stroke-width="1" id="E3-STIXWEBMAIN-30" d="M476 330c0 -172 -63 -344 -226 -344c-171 0 -226 186 -226 350c0 177 69 340 230 340c131 0 222 -141 222 -346zM380 325c0 208 -44 325 -132 325c-83 0 -128 -118 -128 -321s44 -317 130 -317c85 0 130 115 130 313Z"></path><path stroke-width="1" id="E3-STIXWEBMAINI-4E" d="M727 653v-16c-63 -14 -65 -16 -102 -145l-146 -507h-18l-230 550l-114 -422c-6 -21 -9 -41 -9 -54c0 -28 18 -39 70 -43v-16h-198v16c56 8 70 24 106 152l117 415c-15 35 -39 54 -86 54v16h160l207 -499l106 388c6 21 8 32 8 44c0 36 -12 46 -69 51v16h198Z"></path><path stroke-width="1" id="E3-STIXWEBMAIN-29" d="M29 660l12 16c153 -92 244 -259 244 -429c0 -185 -88 -327 -247 -424l-9 16c142 117 170 211 170 405c0 187 -25 302 -170 416Z"></path><path stroke-width="1" id="E3-STIXWEBMAIN-2C" d="M83 -141l-10 19c55 37 83 74 83 107c0 7 -6 13 -14 13s-18 -4 -29 -4c-37 0 -58 17 -58 51s24 57 60 57c45 0 80 -35 80 -87c0 -60 -43 -123 -112 -156Z"></path><path stroke-width="1" id="E3-STIXWEBMAINI-3C7" d="M498 428l-285 -353c-1 -26 -1 -49 -1 -69c0 -126 16 -150 45 -150c13 0 38 19 57 74h16c-13 -65 -35 -137 -93 -137c-46 0 -63 62 -63 128c0 36 3 93 8 124l-197 -244h-93l287 345v89c0 94 -8 143 -45 143c-14 0 -41 -16 -61 -73h-16c17 65 40 136 98 136 c36 0 58 -32 58 -144c0 -10 -2 -25 -4 -123l196 254h93Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E3-STIXWEBMAINI-66"></use><use x="702" y="0" xlink:href="#E3-STIXWEBMAIN-2208"></use><g transform="translate(1665,0)"><use x="0" y="0" xlink:href="#E3-STIXWEBMAINI-53"></use><use transform="scale(0.707)" x="707" y="-213" xlink:href="#E3-STIXWEBMAINI-6B"></use></g><use x="2592" y="0" xlink:href="#E3-STIXWEBMAIN-28"></use><g transform="translate(2925,0)"><use x="0" y="0" xlink:href="#E3-STIXWEBMAINI-393"></use><use transform="scale(0.707)" x="864" y="-213" xlink:href="#E3-STIXWEBMAIN-30"></use></g><use x="3991" y="0" xlink:href="#E3-STIXWEBMAIN-28"></use><use x="4324" y="0" xlink:href="#E3-STIXWEBMAINI-4E"></use><use x="5052" y="0" xlink:href="#E3-STIXWEBMAIN-29"></use><use x="5385" y="0" xlink:href="#E3-STIXWEBMAIN-2C"></use><use x="5802" y="0" xlink:href="#E3-STIXWEBMAINI-3C7"></use><use x="6301" y="0" xlink:href="#E3-STIXWEBMAIN-29"></use></g></svg></span> is the generating function for special values of <em>L(s, f)</em>. The functional equation for <em>L(s, f)</em> induces a functional equation on <span role="math" style="display: inline-block; line-height: 1; vertical-align: -1.1712149712092133ex; height: 3.509ex"><math display="inline"><msub><mrow><mi>r</mi></mrow><mrow><mi>f</mi></mrow></msub><mo>(</mo><mi>z</mi><mo>)</mo></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="4.915ex" height="3.509ex" viewBox="0 -1006.6 2116.2 1510.9" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E4-STIXWEBMAINI-72" d="M176 223l16 35c19 42 53 95 94 138c26 27 56 45 79 45c28 0 47 -21 47 -51s-17 -54 -47 -54c-18 0 -26 11 -35 26c-6 10 -9 14 -16 14c-18 0 -46 -33 -82 -94c-43 -74 -61 -114 -111 -282h-76l81 292c14 52 16 61 16 82s-18 26 -38 26c-8 0 -16 -1 -31 -3v17l155 27l3 -2 Z"></path><path stroke-width="1" id="E4-STIXWEBMAINI-66" d="M41 428h93c22 71 39 126 72 173c30 43 71 77 132 77c49 0 86 -26 86 -62c0 -22 -19 -43 -42 -43c-18 0 -37 15 -37 39c0 17 10 22 10 31c0 8 -8 13 -22 13c-56 0 -93 -70 -122 -228h107l-6 -32h-108l-72 -320c-42 -185 -109 -283 -200 -283c-45 0 -79 26 -79 61 c0 23 17 42 38 42c23 0 38 -16 38 -37c0 -13 -9 -18 -9 -29c0 -9 8 -16 20 -16c42 0 74 54 97 162l88 420h-91Z"></path><path stroke-width="1" id="E4-STIXWEBMAIN-28" d="M304 -161l-12 -16c-158 90 -244 259 -244 429c0 185 87 329 247 424l9 -16c-139 -119 -170 -212 -170 -405c0 -186 30 -299 170 -416Z"></path><path stroke-width="1" id="E4-STIXWEBMAINI-7A" d="M380 417l-289 -344c58 -13 80 -24 120 -83c26 -38 45 -50 70 -50c16 0 27 6 27 15c0 4 -2 9 -5 15c-6 12 -8 20 -8 28c1 17 17 34 33 34c21 0 35 -15 35 -37c0 -40 -37 -76 -93 -76c-29 0 -63 13 -113 44c-47 29 -79 42 -105 42c-16 0 -29 -5 -45 -18l-9 9l310 372h-136 c-52 0 -71 -9 -91 -60l-16 4l32 116h283v-11Z"></path><path stroke-width="1" id="E4-STIXWEBMAIN-29" d="M29 660l12 16c153 -92 244 -259 244 -429c0 -185 -88 -327 -247 -424l-9 16c142 117 170 211 170 405c0 187 -25 302 -170 416Z"></path><path stroke-width="1" id="E4-STIXWEBSIZE1-28" d="M382 -134v-30c-142 134 -243 343 -243 615c0 267 101 481 243 615v-30c-90 -110 -162 -282 -162 -585c0 -306 72 -475 162 -585Z"></path><path stroke-width="1" id="E4-STIXWEBSIZE1-29" d="M86 1036v30c142 -134 243 -343 243 -615c0 -267 -101 -481 -243 -615v30c90 110 162 282 162 585c0 306 -72 475 -162 585Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E4-STIXWEBMAINI-72"></use><use transform="scale(0.707)" x="550" y="-213" xlink:href="#E4-STIXWEBMAINI-66"></use><use x="789" y="-201" xlink:href="#E4-STIXWEBSIZE1-28"></use><use x="1258" y="0" xlink:href="#E4-STIXWEBMAINI-7A"></use><use x="1647" y="-201" xlink:href="#E4-STIXWEBSIZE1-29"></use></g></svg></span>. Jin, Ma, Ono, and Soundararajan proved that for all newforms <em>f</em> of even weight <span role="math" style="display: inline-block; line-height: 1; vertical-align: -0.5047926829268294ex; height: 2.343ex"><math display="inline"><mi>k</mi><mo>≥</mo><mn>4</mn></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="5.117ex" height="2.343ex" viewBox="0 -791.3 2203.1 1008.6" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E5-STIXWEBMAINI-6B" d="M461 428v-16c-47 -3 -78 -23 -225 -154l37 -88c39 -92 62 -129 81 -129c15 0 27 11 45 42c5 8 10 17 15 26l15 -11c-46 -84 -71 -109 -111 -109c-29 0 -49 19 -81 82c-18 35 -44 97 -60 141l-40 -32l-48 -180h-75l141 528c13 48 16 71 18 88c-2 18 -17 24 -51 24h-18v16 c59 7 98 14 157 27l6 -6l-120 -456l43 33c94 72 143 120 143 140c0 11 -12 18 -37 18h-14v16h179Z"></path><path stroke-width="1" id="E5-STIXWEBMAIN-2265" d="M629 324l-565 -273v63l432 215l-432 215v65l565 -275v-10zM629 -103h-565v66h565v-66Z"></path><path stroke-width="1" id="E5-STIXWEBMAIN-34" d="M473 167h-103v-167h-78v167h-280v64l314 445h44v-445h103v-64zM292 231v343l-240 -343h240Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E5-STIXWEBMAINI-6B"></use><use x="739" y="0" xlink:href="#E5-STIXWEBMAIN-2265"></use><use x="1702" y="0" xlink:href="#E5-STIXWEBMAIN-34"></use></g></svg></span> and trivial nebentypus, the “Riemann Hypothesis” holds for <span role="math" style="display: inline-block; line-height: 1; vertical-align: -1.1712149712092133ex; height: 3.509ex"><math display="inline"><msub><mrow><mi>r</mi></mrow><mrow><mi>f</mi></mrow></msub><mo>(</mo><mi>z</mi><mo>)</mo></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="4.915ex" height="3.509ex" viewBox="0 -1006.6 2116.2 1510.9" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E6-STIXWEBMAINI-72" d="M176 223l16 35c19 42 53 95 94 138c26 27 56 45 79 45c28 0 47 -21 47 -51s-17 -54 -47 -54c-18 0 -26 11 -35 26c-6 10 -9 14 -16 14c-18 0 -46 -33 -82 -94c-43 -74 -61 -114 -111 -282h-76l81 292c14 52 16 61 16 82s-18 26 -38 26c-8 0 -16 -1 -31 -3v17l155 27l3 -2 Z"></path><path stroke-width="1" id="E6-STIXWEBMAINI-66" d="M41 428h93c22 71 39 126 72 173c30 43 71 77 132 77c49 0 86 -26 86 -62c0 -22 -19 -43 -42 -43c-18 0 -37 15 -37 39c0 17 10 22 10 31c0 8 -8 13 -22 13c-56 0 -93 -70 -122 -228h107l-6 -32h-108l-72 -320c-42 -185 -109 -283 -200 -283c-45 0 -79 26 -79 61 c0 23 17 42 38 42c23 0 38 -16 38 -37c0 -13 -9 -18 -9 -29c0 -9 8 -16 20 -16c42 0 74 54 97 162l88 420h-91Z"></path><path stroke-width="1" id="E6-STIXWEBMAIN-28" d="M304 -161l-12 -16c-158 90 -244 259 -244 429c0 185 87 329 247 424l9 -16c-139 -119 -170 -212 -170 -405c0 -186 30 -299 170 -416Z"></path><path stroke-width="1" id="E6-STIXWEBMAINI-7A" d="M380 417l-289 -344c58 -13 80 -24 120 -83c26 -38 45 -50 70 -50c16 0 27 6 27 15c0 4 -2 9 -5 15c-6 12 -8 20 -8 28c1 17 17 34 33 34c21 0 35 -15 35 -37c0 -40 -37 -76 -93 -76c-29 0 -63 13 -113 44c-47 29 -79 42 -105 42c-16 0 -29 -5 -45 -18l-9 9l310 372h-136 c-52 0 -71 -9 -91 -60l-16 4l32 116h283v-11Z"></path><path stroke-width="1" id="E6-STIXWEBMAIN-29" d="M29 660l12 16c153 -92 244 -259 244 -429c0 -185 -88 -327 -247 -424l-9 16c142 117 170 211 170 405c0 187 -25 302 -170 416Z"></path><path stroke-width="1" id="E6-STIXWEBSIZE1-28" d="M382 -134v-30c-142 134 -243 343 -243 615c0 267 101 481 243 615v-30c-90 -110 -162 -282 -162 -585c0 -306 72 -475 162 -585Z"></path><path stroke-width="1" id="E6-STIXWEBSIZE1-29" d="M86 1036v30c142 -134 243 -343 243 -615c0 -267 -101 -481 -243 -615v30c90 110 162 282 162 585c0 306 -72 475 -162 585Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E6-STIXWEBMAINI-72"></use><use transform="scale(0.707)" x="550" y="-213" xlink:href="#E6-STIXWEBMAINI-66"></use><use x="789" y="-201" xlink:href="#E6-STIXWEBSIZE1-28"></use><use x="1258" y="0" xlink:href="#E6-STIXWEBMAINI-7A"></use><use x="1647" y="-201" xlink:href="#E6-STIXWEBSIZE1-29"></use></g></svg></span>: that is, all roots of <span role="math" style="display: inline-block; line-height: 1; vertical-align: -1.0048874908080727ex; height: 2.843ex"><math display="inline"><msub><mrow><mi>r</mi></mrow><mrow><mi>f</mi></mrow></msub><mfenced separators="|"><mrow><mi>z</mi></mrow></mfenced></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="4.675ex" height="2.843ex" viewBox="0 -791.3 2012.8 1223.9" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E7-STIXWEBMAINI-72" d="M176 223l16 35c19 42 53 95 94 138c26 27 56 45 79 45c28 0 47 -21 47 -51s-17 -54 -47 -54c-18 0 -26 11 -35 26c-6 10 -9 14 -16 14c-18 0 -46 -33 -82 -94c-43 -74 -61 -114 -111 -282h-76l81 292c14 52 16 61 16 82s-18 26 -38 26c-8 0 -16 -1 -31 -3v17l155 27l3 -2 Z"></path><path stroke-width="1" id="E7-STIXWEBMAINI-66" d="M41 428h93c22 71 39 126 72 173c30 43 71 77 132 77c49 0 86 -26 86 -62c0 -22 -19 -43 -42 -43c-18 0 -37 15 -37 39c0 17 10 22 10 31c0 8 -8 13 -22 13c-56 0 -93 -70 -122 -228h107l-6 -32h-108l-72 -320c-42 -185 -109 -283 -200 -283c-45 0 -79 26 -79 61 c0 23 17 42 38 42c23 0 38 -16 38 -37c0 -13 -9 -18 -9 -29c0 -9 8 -16 20 -16c42 0 74 54 97 162l88 420h-91Z"></path><path stroke-width="1" id="E7-STIXWEBMAIN-28" d="M304 -161l-12 -16c-158 90 -244 259 -244 429c0 185 87 329 247 424l9 -16c-139 -119 -170 -212 -170 -405c0 -186 30 -299 170 -416Z"></path><path stroke-width="1" id="E7-STIXWEBMAINI-7A" d="M380 417l-289 -344c58 -13 80 -24 120 -83c26 -38 45 -50 70 -50c16 0 27 6 27 15c0 4 -2 9 -5 15c-6 12 -8 20 -8 28c1 17 17 34 33 34c21 0 35 -15 35 -37c0 -40 -37 -76 -93 -76c-29 0 -63 13 -113 44c-47 29 -79 42 -105 42c-16 0 -29 -5 -45 -18l-9 9l310 372h-136 c-52 0 -71 -9 -91 -60l-16 4l32 116h283v-11Z"></path><path stroke-width="1" id="E7-STIXWEBMAIN-29" d="M29 660l12 16c153 -92 244 -259 244 -429c0 -185 -88 -327 -247 -424l-9 16c142 117 170 211 170 405c0 187 -25 302 -170 416Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E7-STIXWEBMAINI-72"></use><use transform="scale(0.707)" x="550" y="-213" xlink:href="#E7-STIXWEBMAINI-66"></use><g transform="translate(956,0)"><use x="0" y="0" xlink:href="#E7-STIXWEBMAIN-28"></use><use x="333" y="0" xlink:href="#E7-STIXWEBMAINI-7A"></use><use x="723" y="0" xlink:href="#E7-STIXWEBMAIN-29"></use></g></g></svg></span> lie on the circle of symmetry <span role="math" style="display: inline-block; line-height: 1; vertical-align: -1.3381398005439709ex; height: 3.843ex"><math display="inline"><mo>|</mo><mi>z</mi><mo>|</mo><mo>=</mo><mn>1</mn><mo>/</mo><msqrt><mi>N</mi></msqrt></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="10.374ex" height="3.843ex" viewBox="0 -1078.4 4466.6 1654.5" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E8-STIXWEBVARIANTS-7C" d="M193 -189h-66v879h66v-879Z"></path><path stroke-width="1" id="E8-STIXWEBMAINI-7A" d="M380 417l-289 -344c58 -13 80 -24 120 -83c26 -38 45 -50 70 -50c16 0 27 6 27 15c0 4 -2 9 -5 15c-6 12 -8 20 -8 28c1 17 17 34 33 34c21 0 35 -15 35 -37c0 -40 -37 -76 -93 -76c-29 0 -63 13 -113 44c-47 29 -79 42 -105 42c-16 0 -29 -5 -45 -18l-9 9l310 372h-136 c-52 0 -71 -9 -91 -60l-16 4l32 116h283v-11Z"></path><path stroke-width="1" id="E8-STIXWEBMAIN-3D" d="M637 320h-589v66h589v-66zM637 120h-589v66h589v-66Z"></path><path stroke-width="1" id="E8-STIXWEBMAIN-31" d="M394 0h-276v15c74 4 95 25 95 80v449c0 34 -9 49 -30 49c-10 0 -27 -5 -45 -12l-27 -10v14l179 91l9 -3v-597c0 -43 20 -61 95 -61v-15Z"></path><path stroke-width="1" id="E8-STIXWEBMAIN-2F" d="M287 676l-228 -690h-68l229 690h67Z"></path><path stroke-width="1" id="E8-STIXWEBMAINI-4E" d="M727 653v-16c-63 -14 -65 -16 -102 -145l-146 -507h-18l-230 550l-114 -422c-6 -21 -9 -41 -9 -54c0 -28 18 -39 70 -43v-16h-198v16c56 8 70 24 106 152l117 415c-15 35 -39 54 -86 54v16h160l207 -499l106 388c6 21 8 32 8 44c0 36 -12 46 -69 51v16h198Z"></path><path stroke-width="1" id="E8-STIXWEBMAIN-221A" d="M963 973l-478 -1232h-32l-202 530c-17 45 -37 59 -62 59c-17 0 -43 -11 -65 -31l-12 20l156 124h19l204 -536h4l414 1066h54Z"></path><path stroke-width="1" id="E8-STIXWEBMAIN-7C" d="M133 -14h-66v690h66v-690Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g transform="translate(0,1002)"><use x="0" y="-677" xlink:href="#E8-STIXWEBMAIN-7C"></use><g transform="translate(0,-857.5848778901734) scale(1,0.31844147398843925)"><use xlink:href="#E8-STIXWEBMAIN-7C"></use></g><use x="0" y="-1490" xlink:href="#E8-STIXWEBMAIN-7C"></use></g><use x="200" y="0" xlink:href="#E8-STIXWEBMAINI-7A"></use><g transform="translate(590,1002)"><use x="0" y="-677" xlink:href="#E8-STIXWEBMAIN-7C"></use><g transform="translate(0,-857.5848778901734) scale(1,0.31844147398843925)"><use xlink:href="#E8-STIXWEBMAIN-7C"></use></g><use x="0" y="-1490" xlink:href="#E8-STIXWEBMAIN-7C"></use></g><use x="1068" y="0" xlink:href="#E8-STIXWEBMAIN-3D"></use><use x="2031" y="0" xlink:href="#E8-STIXWEBMAIN-31"></use><use x="2532" y="0" xlink:href="#E8-STIXWEBMAIN-2F"></use><g transform="translate(2810,0)"><use x="0" y="-32" xlink:href="#E8-STIXWEBMAIN-221A"></use><rect stroke="none" width="727" height="60" x="928" y="882"></rect><use x="928" y="0" xlink:href="#E8-STIXWEBMAINI-4E"></use></g></g></svg></span> . We generalize their methods to prove that this phenomenon holds for all but possibly finitely many newforms f of weight <span role="math" style="display: inline-block; line-height: 1; vertical-align: -0.5047926829268294ex; height: 2.343ex"><math display="inline"><mi>k</mi><mo>≥</mo><mn>3</mn></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="5.117ex" height="2.343ex" viewBox="0 -791.3 2203.1 1008.6" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E9-STIXWEBMAINI-6B" d="M461 428v-16c-47 -3 -78 -23 -225 -154l37 -88c39 -92 62 -129 81 -129c15 0 27 11 45 42c5 8 10 17 15 26l15 -11c-46 -84 -71 -109 -111 -109c-29 0 -49 19 -81 82c-18 35 -44 97 -60 141l-40 -32l-48 -180h-75l141 528c13 48 16 71 18 88c-2 18 -17 24 -51 24h-18v16 c59 7 98 14 157 27l6 -6l-120 -456l43 33c94 72 143 120 143 140c0 11 -12 18 -37 18h-14v16h179Z"></path><path stroke-width="1" id="E9-STIXWEBMAIN-2265" d="M629 324l-565 -273v63l432 215l-432 215v65l565 -275v-10zM629 -103h-565v66h565v-66Z"></path><path stroke-width="1" id="E9-STIXWEBMAIN-33" d="M61 510l-16 4c29 95 92 162 196 162c93 0 156 -55 156 -137c0 -48 -26 -98 -93 -138c44 -19 62 -31 83 -53c28 -31 44 -77 44 -129c0 -53 -17 -102 -46 -140c-48 -64 -143 -93 -232 -93c-73 0 -112 21 -112 57c0 21 18 36 41 36c17 0 33 -6 61 -26c37 -26 58 -31 86 -31 c74 0 130 68 130 153c0 76 -35 125 -104 145c-22 7 -45 10 -102 10v14c38 13 64 24 84 36c49 28 81 73 81 134c0 68 -42 102 -108 102c-62 0 -108 -32 -149 -106Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E9-STIXWEBMAINI-6B"></use><use x="739" y="0" xlink:href="#E9-STIXWEBMAIN-2265"></use><use x="1702" y="0" xlink:href="#E9-STIXWEBMAIN-33"></use></g></svg></span> with any nebentypus. We also show that the roots of <span role="math" style="display: inline-block; line-height: 1; vertical-align: -1.1712149712092133ex; height: 3.509ex"><math display="inline"><msub><mrow><mi>r</mi></mrow><mrow><mi>f</mi></mrow></msub><mo>(</mo><mi>z</mi><mo>)</mo></math><svg xmlns:xlink="http://www.w3.org/1999/xlink" width="4.915ex" height="3.509ex" viewBox="0 -1006.6 2116.2 1510.9" role="img" focusable="false" aria-hidden="true"><defs><path stroke-width="1" id="E10-STIXWEBMAINI-72" d="M176 223l16 35c19 42 53 95 94 138c26 27 56 45 79 45c28 0 47 -21 47 -51s-17 -54 -47 -54c-18 0 -26 11 -35 26c-6 10 -9 14 -16 14c-18 0 -46 -33 -82 -94c-43 -74 -61 -114 -111 -282h-76l81 292c14 52 16 61 16 82s-18 26 -38 26c-8 0 -16 -1 -31 -3v17l155 27l3 -2 Z"></path><path stroke-width="1" id="E10-STIXWEBMAINI-66" d="M41 428h93c22 71 39 126 72 173c30 43 71 77 132 77c49 0 86 -26 86 -62c0 -22 -19 -43 -42 -43c-18 0 -37 15 -37 39c0 17 10 22 10 31c0 8 -8 13 -22 13c-56 0 -93 -70 -122 -228h107l-6 -32h-108l-72 -320c-42 -185 -109 -283 -200 -283c-45 0 -79 26 -79 61 c0 23 17 42 38 42c23 0 38 -16 38 -37c0 -13 -9 -18 -9 -29c0 -9 8 -16 20 -16c42 0 74 54 97 162l88 420h-91Z"></path><path stroke-width="1" id="E10-STIXWEBMAIN-28" d="M304 -161l-12 -16c-158 90 -244 259 -244 429c0 185 87 329 247 424l9 -16c-139 -119 -170 -212 -170 -405c0 -186 30 -299 170 -416Z"></path><path stroke-width="1" id="E10-STIXWEBMAINI-7A" d="M380 417l-289 -344c58 -13 80 -24 120 -83c26 -38 45 -50 70 -50c16 0 27 6 27 15c0 4 -2 9 -5 15c-6 12 -8 20 -8 28c1 17 17 34 33 34c21 0 35 -15 35 -37c0 -40 -37 -76 -93 -76c-29 0 -63 13 -113 44c-47 29 -79 42 -105 42c-16 0 -29 -5 -45 -18l-9 9l310 372h-136 c-52 0 -71 -9 -91 -60l-16 4l32 116h283v-11Z"></path><path stroke-width="1" id="E10-STIXWEBMAIN-29" d="M29 660l12 16c153 -92 244 -259 244 -429c0 -185 -88 -327 -247 -424l-9 16c142 117 170 211 170 405c0 187 -25 302 -170 416Z"></path><path stroke-width="1" id="E10-STIXWEBSIZE1-28" d="M382 -134v-30c-142 134 -243 343 -243 615c0 267 101 481 243 615v-30c-90 -110 -162 -282 -162 -585c0 -306 72 -475 162 -585Z"></path><path stroke-width="1" id="E10-STIXWEBSIZE1-29" d="M86 1036v30c142 -134 243 -343 243 -615c0 -267 -101 -481 -243 -615v30c90 110 162 282 162 585c0 306 -72 475 -162 585Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><use x="0" y="0" xlink:href="#E10-STIXWEBMAINI-72"></use><use transform="scale(0.707)" x="550" y="-213" xlink:href="#E10-STIXWEBMAINI-66"></use><use x="789" y="-201" xlink:href="#E10-STIXWEBSIZE1-28"></use><use x="1258" y="0" xlink:href="#E10-STIXWEBMAINI-7A"></use><use x="1647" y="-201" xlink:href="#E10-STIXWEBSIZE1-29"></use></g></svg></span> are equidistributed if <em>N</em> or <em>k</em> is sufficiently large.</p>'
                },
                author: [
                  {
                    '@id': 'user:roger',
                    name: 'Roger D. Kouyos'
                  },
                  {
                    '@id': 'user:jessica',
                    name: 'Jessica E. Metcalf'
                  },
                  {
                    '@id': 'user:ruthie',
                    name: 'Ruthie Birger'
                  },
                  {
                    '@id': 'user:eili',
                    name: 'Eili Y. Klein'
                  }
                ]
              }
            }}
            droplets={droplets}
            scope={scope}
          />
        </li>
      </ul>
    </div>
  );
}
