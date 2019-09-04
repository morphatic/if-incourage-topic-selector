/**
 * Frontend JavaScript for adding interaction to the
 * tabs container, etc.
 */
( ( $ ) => {
  // utility to determine if an element is overflown
  $.fn.overflown = function() {
    const el = this[ 0 ];
    return el.scrollWidth > el.clientWidth;
  };

  // utility to scroll something continuously while the mouse is down
  let scrolling = false;
  const scroll = ( el, dir ) => {
    const amt = dir === 'right' ? '+=3px' : '-=3px';
    el.animate( { scrollLeft: amt }, 10, () => {
      if ( scrolling ) {
        scroll( el, dir );
      }
    } );
  };

  // get a handles for frequently-used elements
  const container = $( '.wp-block-morphatic-if-incourage-topic-selector.topics' );
  const tabs = $( '.components-tab-panel__tabs', container );
  const tabScrollLeft = $( '.tabs-scroll-left', container );
  const tabScrollRight = $( '.tabs-scroll-right', container );
  const scrollMax = tabs.get( 0 ).scrollWidth - tabs.get( 0 ).clientWidth;

  ( () => {
    console.log( tabs.get( 0 ).scrollWidth, tabs.get( 0 ).clientWidth );
    let bsw = 0;
    let bcw = 0;
    let w = 0;
    tabs.children().each( ( i, b ) => {
      console.log( b.scrollWidth, b.clientWidth, $( b ).width() );
      bsw += b.scrollWidth;
      bcw += b.clientWidth;
      w += $( b ).width();
    } );
    console.log( bsw, bcw, w );
    console.log( tabs.width(), tabs.children( 'button' ).width() );
  } )();

  const updateScrollButtonVisibility = () => {
    // show the scroll left button, if necessary
    if ( tabs.scrollLeft() > 0 && tabScrollLeft.is( ':not(:visible)' ) ) {
      tabScrollLeft.show( 500 );
    }
    // hide the scroll left button, if necessary
    if ( tabs.scrollLeft() === 0 && tabScrollLeft.is( ':visible' ) ) {
      tabScrollLeft.hide( 500 );
    }
    // show the scroll right button, if necessary
    if ( tabs.scrollLeft() < scrollMax && tabScrollRight.is( ':not(:visible)' ) ) {
      tabScrollRight.show( 500 );
    }
    // hide the scroll right button, if necessary
    if ( tabs.scrollLeft() === scrollMax && tabScrollRight.is( ':visible' ) ) {
      tabScrollRight.hide( 500 );
    }
  };

  updateScrollButtonVisibility();

  // setup scroll behaviors for the tab container
  tabs.on( 'scroll', updateScrollButtonVisibility );

  tabScrollLeft
    .mousedown( () => {
      scrolling = true;
      scroll( tabs, 'left' );
    } )
    .mouseup( () => {
      scrolling = false;
    } );

  tabScrollRight
    .mousedown( () => {
      scrolling = true;
      scroll( tabs, 'right' );
    } )
    .mouseup( () => {
      scrolling = false;
    } );

  // handle tab clicks
  $( '.wp-block-morphatic-if-incourage-topic-selector .components-button' ).on( 'click', function() {
    // get the tab id
    const id = '.' + $( this ).attr( 'class' ).match( /tab-\d+/ )[ 0 ];
    // unset `active-tab` on other buttons and set it on the clicked button
    $( this ).siblings().removeClass( 'active-tab' );
    $( this ).addClass( 'active-tab' );
    // make the selected category's videos visible
    $( '.videos', container ).removeClass( 'active' );
    $( id, container ).addClass( 'active' );
  } );

  // hide the subvid scrollers if necessary
  ( () => {
    $( '.subvids-scroll', container ).each( ( i, svs ) => {
      if ( $( svs ).siblings( '.subvid' ).length > 2 ) {
        $( svs ).css( 'visibility', 'visible' );
      }
    } );
  } )();
  $( '.subvids-scroll-left', container ).on( 'click', function() {
    $( this ).parent().animate( { scrollLeft: '-=230px' } );
  } );

  $( '.subvids-scroll-right', container ).on( 'click', function() {
    $( this ).parent().animate( { scrollLeft: '+=230px' } );
  } );
} )( jQuery );
