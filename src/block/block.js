/**
 * BLOCK: if-incourage-topic-selector
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './editor.scss';
import './style.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { InspectorControls } = wp.editor;
const { SelectControl, TabPanel } = wp.components;
const { Component } = wp.element;

class TopicSelector extends Component {
  static getInitialState( selectedHub ) {
    return {
      categories: {},
      hub: {},
      hubs: {},
      selectedHub,
      videos: {},
    };
  }

  constructor() {
    // call the parent constructor
    super( ...arguments );
    // set the initial state
    this.state = this.constructor.getInitialState( this.props.attributes.selectedHub );
    // get the hubs
    this.getHubs = this.getHubs.bind( this );
    this.getHubs();
    // get all video posts
    this.getVideos = this.getVideos.bind( this );
    // get the categories
    this.getCategories = this.getCategories.bind( this );
    this.getCategories();
    // handle when the selected hub changes
    this.onChangeSelectedHub = this.onChangeSelectedHub.bind( this );
    this.renderTabContent = this.renderTabContent.bind( this );
  }

  async getHubs() {
    const HubModel = wp.api.models.Post.extend( {
      urlRoot: wpApiSettings.root + '/hub',
      defaults: {
        type: 'hub',
      },
    } );
    const HubCollection = wp.api.collections.Posts.extend( {
      url: wpApiSettings.root + wpApiSettings.versionString + 'hub',
      model: HubModel,
    } );
    const hubCol = new HubCollection();
    const hubs = await hubCol.fetch( { data: { per_page: 100 } } );
    // convert hubs into an object keyed by hub id
    const hubsObj = {};
    hubs.forEach( h => {
      hubsObj[ h.id ] = h.title.rendered;
    } );
    // do we need to set the selected hub in the state?
    if ( Object.keys( hubsObj ).length > 0 && 0 !== this.state.selectedHub ) {
      // yes
      const hub = hubsObj[ this.state.selectedHub ];
      this.setState( { hub, hubs: hubsObj } );
    } else {
      this.setState( { hubs: hubsObj } );
    }
    await this.props.setAttributes( { hubs: hubsObj } );
  }

  async getCategories() {
    const catCollection = new wp.api.collections.Categories();
    let categories = await catCollection.fetch( { data: { per_page: 100 } } );
    // remove the "uncategorized" category
    categories = categories.filter( c => c.slug !== 'uncategorized' );
    // convert it into an object keyed by category id
    const cats = {};
    categories.forEach( c => {
      cats[ c.id ] = c;
    } );
    // store the list of categories in the state
    this.setState( { categories: cats } );
    // add it to the block attributes
    await this.props.setAttributes( { categories: cats } );
    // then get the videos
    this.getVideos();
  }

  async getVideos() {
    const VideoModel = wp.api.models.Post.extend( {
      urlRoot: wpApiSettings.root + '/video',
      defaults: {
        type: 'video',
      },
    } );
    const VideoCollection = wp.api.collections.Posts.extend( {
      url: wpApiSettings.root + wpApiSettings.versionString + 'video',
      model: VideoModel,
    } );
    const videoCol = new VideoCollection;
    const vids = await videoCol.fetch( { data: { per_page: 100 } } );
    // utility function to get the video ID from a YouTube URL
    const getYouTubeID = url => {
      const match = url.match( /v=([^&]+)/ );
      return match[ 1 ];
    };
    // create an empty array to hold our categorized videos
    const videos = {};
    // for each published video
    vids.filter( v => 'publish' === v.status ).forEach( v => {
      // extract the necessary metadata
      const video = {
        id: v.id,
        link: v.link,
        title: v.title.rendered,
        excerpt: v.excerpt.rendered,
        categories: v.categories, // maybe leave out?
        url: v.acf.video_url,
        runtime: v.acf.video_runtime,
        subvideos: v.acf.video_repeater && v.acf.video_repeater.map( sv => ( {
          link: getYouTubeID( sv.subvideo_url ),
          runtime: sv.subvideo_runtime,
          title: sv.subvideo_title,
          thumb: sv.subvideo_custom_thumbnail.sizes.medium,
        } ) ),
        hubs: v.acf.which_hubs.map( wh => wh.ID ),
        thumb: v.uagb_featured_image_src.medium[ 0 ],
      };
      // and add it to the sub-array for that category
      v.categories.forEach( cat => {
        // unless it's "uncategorized"
        if ( 1 !== cat ) {
          if ( ! videos[ cat ] ) {
            videos[ cat ] = {};
          }
          videos[ cat ][ video.id ] = video;
        }
      } );
    } );
    this.setState( { videos } );
  }
  // console.log('videos:', this.state.videos); // eslint-disable-line

  async onChangeSelectedHub( value ) {
    const selectedHub = parseInt( value );
    const hub = this.state.hubs[ selectedHub ];
    this.setState( { hub, selectedHub } );
    // reset component attributes
    // create fresh category and video lists
    const categories = {};
    const videos = {};
    // for each category of videos
    for ( const cat in this.state.videos ) {
      categories[ cat ] = this.state.categories[ cat ];
      // filter out videos that are NOT assigned to this hub
      const vids = {};
      Object.values( this.state.videos[ cat ] ).forEach( v => {
        if ( 0 === selectedHub || v.hubs.includes( selectedHub ) ) {
          vids[ v.id ] = v;
        }
      } );
      // if there are still any videos left
      if ( Object.keys( vids ).length > 0 ) {
        // add them to the list of videos to be displayed in the block
        videos[ cat ] = vids;
      }
    }
    await this.props.setAttributes( {
      categories,
      selectedHub,
      videos,
    } );
  }

  renderTabs() {
    return Object.keys( this.props.attributes.videos ).map( id => {
      let out;
      const cat = this.props.attributes.categories[ id ] || false;
      if ( cat ) {
        out = {
          id,
          name: cat.slug,
          title: cat.name,
          className: `tab-${ id }`,
          videos: this.props.attributes.videos[ id ],
        };
      } else {
        out = {
          id,
          name: 'something',
          title: 'something',
          className: `tab-${ id }`,
          videos: [],
        };
      }
      return out;
    } );
  }

  renderTabContent( tab ) {
    const videos = Object.values( tab.videos ).map( v => {
      // declare a "sub" section to hold subvideos or the excerpt
      let sub;
      // do we have subvideos?
      if ( v.subvideos ) {
        // yes, so render content for them
        const subs = v.subvideos.map( sv => (
          <div className="subvid" key={ sv.link }>
            <a href={ v.link + '?skip_ahead=' + sv.link }>
              <img src={ sv.thumb } alt={ sv.title } />
            </a>
            <h1 dangerouslySetInnerHTML={ { __html: sv.title } } />
            <p>{ __( 'Length: ' ) + sv.runtime }</p>
          </div>
        ) );
        sub = (
          <div className="sub">
            <h2>{ __( 'or skip ahead:' ) }</h2>
            <div className="subvidsmask">
              <div className="subvids">
                { subs }
              </div>
            </div>
          </div>
        );
      } else {
        // no subvideos, so render excerpt
        sub = (
          <div className="sub">
            <h2>{ __( 'description:' ) }</h2>
            <div className="excerpt" dangerouslySetInnerHTML={ { __html: v.excerpt } } />
          </div>
        );
      }
      const hubs = this.props.attributes.hubs;
      const vhubs = v.hubs.map( h => hubs[ h ] ).join( ', ' );
      return (
        <section key={ v.id }>
          <div className="full">
            <a href={ v.link }>
              <img src={ v.thumb } alt={ v.title } />
            </a>
            <h1 dangerouslySetInnerHTML={ { __html: v.title + ' [Full Video]' } } />
            <p>{ __( 'Length: ' ) + v.runtime }</p>
            <p>{ __( 'Filed under: ' ) + vhubs }</p>
            <a href={ v.link } className="view-full-video-button">
              { __( 'View Full Video' ) }
            </a>
          </div>
          { sub }
        </section>
      );
    } );
    return (
      <div className="videos" key={ tab.id }>{ videos }</div>
    );
  }

  render() {
    // setup the topic selector dropdown
    const hubs = [ { value: 0, label: __( 'All Audiences' ) } ];
    if ( Object.keys( this.state.hubs ).length > 0 ) {
      Object.keys( this.state.hubs ).forEach( id => {
        hubs.push( { value: id, label: this.state.hubs[ id ] } );
      } );
    }
    // initialize output
    let output = __( 'Loading Videos...' );
    // do we have any videos to display?
    if ( Object.keys( this.props.attributes.videos ).length > 0 ) {
      // yes, create the tabs (should have category names)
      const tabs = this.renderTabs();
      output = (
        <TabPanel
          className="topics"
          activeClass="active-tab"
          key="topics-tabs"
          tabs={ tabs }
        >
          { this.renderTabContent }
        </TabPanel>
      );
    }
    return [
      !! this.props.isSelected && (
        <InspectorControls>
          <SelectControl
            value={ this.props.attributes.selectedHub }
            label={ __( 'Target Audience' ) }
            options={ hubs }
            onChange={ this.onChangeSelectedHub }
          />
        </InspectorControls>
      ),
      output,
    ];
  }
}

/**
 * Register: a Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'morphatic/if-incourage-topic-selector', {
  title: __( 'Topic Selector' ), // Block title.
  icon: 'video-alt', // Block icon → https://developer.wordpress.org/resource/dashicons/.
  category: 'widgets', // Block category
  attributes: {
    categories: {
      type: 'object',
      default: {},
    },
    hubs: {
      type: 'object',
      default: {},
    },
    selectedHub: {
      type: 'number',
      default: 0,
    },
    videos: {
      type: 'object',
      default: {},
    },
  },
  edit: TopicSelector,
  save: props => {
    const { categories, hubs, videos } = props.attributes;
    if ( Object.keys( videos ).length > 0 ) {
      // first generate the tabs
      const tabs = Object.keys( videos ).map( ( id, idx ) => {
        const cat = categories[ id ] || false;
        return (
          <button
            type="button"
            role="tab"
            key={ cat.slug }
            id={ cat.slug }
            className={ `components-button tab tab-${ idx }` + ( 0 === idx ? ' active-tab' : '' ) }
          >{ cat.name }</button>
        );
      } );
      const tabContainer = (
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="components-tab-panel__tabs"
        >
          { tabs }
        </div>
      );
      // then, generate the tabs content
      const content = Object.keys( videos ).map( ( tab, idx ) => {
        const vids = Object.values( videos[ tab ] ).map( v => {
          // declare a "sub" section to hold subvideos or the excerpt
          let sub;
          // do we have subvideos?
          if ( v.subvideos ) {
            // yes, so render content for them
            const subs = v.subvideos.map( sv => (
              <div className="subvid" key={ sv.link }>
                <a href={ v.link + '?skip_ahead=' + sv.link }>
                  <img src={ sv.thumb } alt={ sv.title } />
                </a>
                <h1 dangerouslySetInnerHTML={ { __html: sv.title } } />
                <p>{ __( 'Length: ' ) + sv.runtime }</p>
              </div>
            ) );
            sub = (
              <div className="sub">
                <h2>{ __( 'or skip ahead:' ) }</h2>
                <div className="subvidsmask">
                  <div className="subvids">
                    { subs }
                  </div>
                </div>
              </div>
            );
          } else {
            // no subvideos, so render excerpt
            sub = (
              <div className="sub">
                <h2>{ __( 'description:' ) }</h2>
                <div className="excerpt" dangerouslySetInnerHTML={ { __html: v.excerpt } } />
              </div>
            );
          }
          const vhubs = v.hubs.map( h => hubs[ h ] ).join( ', ' );
          return (
            <section key={ v.id }>
              <div className="full">
                <a href={ v.link }>
                  <img src={ v.thumb } alt={ v.title } />
                </a>
                <h1 dangerouslySetInnerHTML={ { __html: v.title + ' [Full Video]' } } />
                <p>{ __( 'Length: ' ) + v.runtime }</p>
                <p>{ __( 'Filed under: ' ) + vhubs }</p>
                <a href={ v.link } className="view-full-video-button">
                  { __( 'View Full Video' ) }
                </a>
              </div>
              { sub }
            </section>
          );
        } );
        return (
          <div
            className={ `videos tab-${ idx }` + ( 0 === idx ? ' active' : '' ) }
            key={ tab.id }>
            { vids }
          </div>
        );
      } );
      // finally export the tab panel
      return (
        <div className="topics">
          { tabContainer }
          { content }
        </div>
      );
    }
  },
} );
