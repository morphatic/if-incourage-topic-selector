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

  // get a handles for frequently-used elements
  const container = $( '.wp-block-morphatic-if-incourage-topic-selector.topics' );
  const tabs = $( '.components-tab-panel__tabs', container );
  // const tabScrollLeft = $( '.tab-scroll-left', container );
  // const tabScrollRight = $( '.tab-scroll-right', container );

  // setup scroll behaviors for the tab container
  tabs.on( 'scroll', function() {

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
} )( jQuery );
