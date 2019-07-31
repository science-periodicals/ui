import React, { Component } from 'react';
import {
  RichSnippet,
  RichSnippetImpactImage,
  RichSnippetAbstract,
  RichSnippetImpactAbstract,
  RichSnippetImageGallery,
  RichSnippetAuthor,
  RichSnippetReviewer,
  RichSnippetChordal,
  PaperButton
} from '../../src/';

let chordalData = [
  {
    id: 'a',
    label: 'Buffy',
    color: '#ff6146',
    links: ['b', 'c']
  },
  {
    id: 'b',
    label: 'Faith',
    color: '#3f6560',
    links: ['e']
  },
  {
    id: 'c',
    label: 'Willow',
    color: '#e3d800',
    links: ['d']
  },
  {
    id: 'd',
    label: 'Xander',
    color: '#d5a427',
    links: ['e']
  },
  {
    id: 'e',
    label: 'Spike',
    color: '#33ace0',
    links: ['c']
  }
];

// pseudo random percentage from string - without and low-lyers
function shortHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + c */
  }
  hash = parseInt(hash.toString().substr(0, 2));
  hash = Math.abs(hash) + 40;
  hash = hash > 100 ? 100 : hash;
  return hash;
}

export default class RichSnippetExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewMode: 'scholar'
    };
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          {`Showing ${this.state.viewMode} Mode`}
          <br />
          <PaperButton
            onClick={() =>
              this.setState({
                viewMode:
                  this.state.viewMode === 'scholar' ? 'impact' : 'scholar'
              })
            }
          >
            Toggle Mode
          </PaperButton>
        </div>
        <div className="example__row">
          {/* Basic Snippet */}
          <RichSnippet
            url={`https://nature.science.ai/Host-and-viral-traits-predict-zoonotic-spillover-from-mammals`}
            reviewType="Double Blind Review"
            journal="Nature"
            date="2017"
            title="Host and viral traits predict zoonotic spillover from mammals"
            snippetMode={this.state.viewMode}
            citedBy={1243}
            impactFactor={13}
          >
            <RichSnippetReviewer ranking={shortHash('Jon Smith')}>
              Jon Smith
            </RichSnippetReviewer>
            <RichSnippetReviewer ranking={shortHash('Peter OTool')}>
              Peter O’Tool
            </RichSnippetReviewer>
            <RichSnippetReviewer ranking={shortHash('Reality Winner')}>
              Reality Winner
            </RichSnippetReviewer>
            <RichSnippetAuthor ranking={shortHash('Kevin J. Olival')}>
              Kevin J. Olival
            </RichSnippetAuthor>
            <RichSnippetAuthor ranking={shortHash('Carlos Zambrana-torrelio')}>
              Carlos Zambrana-torrelio
            </RichSnippetAuthor>
            <RichSnippetImpactImage>
              <img
                src="./images/nature22975-f2.jpg"
                width="116px"
                height="65px"
              />
            </RichSnippetImpactImage>
            <RichSnippetImpactAbstract>
              <span>
                Understanding patterns of <b>viral diversity</b> in wildlife and
                determinants of successful cross-species transmission.
              </span>
            </RichSnippetImpactAbstract>
          </RichSnippet>
        </div>
        <div className="example__row">
          {/* Small Feature Snippet */}
          <RichSnippet
            url={`https://nature.science.ai/Host-and-viral-traits-predict-zoonotic-spillover-from-mammals`}
            reviewType="Double Blind Review"
            journal="Nature"
            date="2017"
            title="Host and viral traits predict zoonotic spillover from mammals"
            citedBy={1243}
            snippetType="small"
            snippetMode={this.state.viewMode}
            impactFactor={13}
          >
            <RichSnippetReviewer ranking={shortHash('Jon Smith')}>
              Jon Smith
            </RichSnippetReviewer>
            <RichSnippetReviewer ranking={shortHash('Peter OTool')}>
              Peter O'Tool
            </RichSnippetReviewer>
            <RichSnippetReviewer ranking={shortHash('Reality Winner')}>
              Reality Winner
            </RichSnippetReviewer>
            <RichSnippetAuthor ranking={shortHash('Kevin J. Olival')}>
              Kevin J. Olival
            </RichSnippetAuthor>
            <RichSnippetAuthor ranking={shortHash('Carlos Zambrana-torrelio')}>
              Carlos Zambrana-torrelio
            </RichSnippetAuthor>
            <RichSnippetImpactImage id="example-impact-image-id">
              <img
                src="./images/nature22975-f2.jpg"
                width="116px"
                height="65px"
              />
            </RichSnippetImpactImage>
            black
            <RichSnippetChordal data={chordalData} />
            <RichSnippetAbstract>
              <span>
                The population extinction pulse we describe here shows, from a
                quantitative viewpoint, that Earth’s sixth mass extinction is
                more severe than perceived when looking exclusively at species
                extinctions.
              </span>
            </RichSnippetAbstract>
            <RichSnippetImpactAbstract>
              <span>
                The strong focus on species extinctions, a critical aspect of
                the contemporary pulse of biological extinction, leads to a
                common misimpression that Earth’s biota is not immediately
                threatened...
              </span>
            </RichSnippetImpactAbstract>
          </RichSnippet>
        </div>
        <div className="example__row">
          <RichSnippet
            url={`http://www.pnas.org/content/114/30/E6089`}
            reviewType="Open Peer Review"
            journal="PNAS"
            date="May 23, 2017"
            title="Biological annihilation via the ongoing sixth mass extinction signaled by vertebrate population losses and declines"
            citedBy={1243}
            topCitations={[
              { title: 'title', count: 1234, journal: 'PLOS One' },
              { title: 'title 2', count: 2345, journal: 'arXiv' }
            ]}
            snippetType="big"
            snippetMode={this.state.viewMode}
            impactFactor={13}
          >
            <RichSnippetAuthor ranking={90}>Gerardo Ceballos</RichSnippetAuthor>
            <RichSnippetAuthor ranking={80}>Paul R. Ehrlich</RichSnippetAuthor>
            <RichSnippetAuthor ranking={90}>Rodolfo Dirzo</RichSnippetAuthor>
            <RichSnippetReviewer ranking={85}>
              Thomas E. Lovejoy
            </RichSnippetReviewer>
            <RichSnippetReviewer ranking={89}>
              Peter H. Raven
            </RichSnippetReviewer>

            <RichSnippetImageGallery id="test">
              <RichSnippetChordal data={chordalData} size={108} />
              <img src="./images/pnas/F1.large.jpg" />
              <img src="./images/pnas/F2.medium.gif" />
              <img src="./images/pnas/F3.medium.gif" />
              <img src="./images/pnas/F4.medium.gif" />
              <img src="./images/pnas/F5.medium.gif" />
              <img src="./images/pnas/F6.medium.gif" />
            </RichSnippetImageGallery>

            <RichSnippetImpactAbstract>
              <p>
                The strong focus on species extinctions, a critical aspect of
                the contemporary pulse of biological extinction, leads to a
                common misimpression that Earth’s biota is not immediately
                threatened, just slowly entering an episode of major
                biodiversity loss. This view overlooks the current trends of
                population declines and extinctions. Using a sample of 27,600
                terrestrial vertebrate species, and a more detailed analysis of
                177 mammal species, we show the extremely high degree of
                population decay in vertebrates, even in common “species of low
                concern.” Dwindling population sizes and range shrinkages amount
                to a massive anthropogenic erosion of biodiversity and of the
                ecosystem services essential to civilization. This “biological
                annihilation” underlines the seriousness for humanity of Earth’s
                ongoing sixth mass extinction event.
              </p>
            </RichSnippetImpactAbstract>
            <RichSnippetAbstract>
              <p>
                The population extinction pulse we describe here shows, from a
                quantitative viewpoint, that Earth’s sixth mass extinction is
                more severe than perceived when looking exclusively at species
                extinctions. Therefore, humanity needs to address anthropogenic
                population extirpation and decimation immediately. That
                conclusion is based on analyses of the numbers and degrees of
                range contraction (indicative of population shrinkage and/or
                population extinctions according to the International Union for
                Conservation of Nature) using a sample of 27,600 vertebrate
                species, and on a more detailed analysis documenting the
                population extinctions between 1900 and 2015 in 177 mammal
                species. We find that the rate of population loss in terrestrial
                vertebrates is extremely high—even in “species of low concern.”
                In our sample, comprising nearly half of known vertebrate
                species, 32% (8,851/27,600) are decreasing; that is, they have
                decreased in population size and range. In the 177 mammals for
                which we have detailed data, all have lost 30% or more of their
                geographic ranges and more than 40% of the species have
                experienced severe population declines (80% range shrinkage).
                Our data indicate that beyond global species extinctions Earth
                is experiencing a huge episode of population declines and
                extirpations, which will have negative cascading consequences on
                ecosystem functioning and services vital to sustaining
                civilization. We describe this as a “biological annihilation” to
                highlight the current magnitude of Earth’s ongoing sixth major
                extinction event.
              </p>
            </RichSnippetAbstract>
          </RichSnippet>
        </div>
      </div>
    );
  }
}
