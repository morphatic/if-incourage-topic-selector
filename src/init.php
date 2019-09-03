<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since   1.0.0
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Gutenberg block assets for both frontend + backend.
 *
 * Assets enqueued:
 * 1. blocks.style.build.css - Frontend + Backend.
 * 2. blocks.build.js - Backend.
 * 3. blocks.editor.build.css - Backend.
 *
 * @uses {wp-blocks} for block type registration & related functions.
 * @uses {wp-element} for WP Element abstraction — structure of blocks.
 * @uses {wp-i18n} to internationalize the block's text.
 * @uses {wp-editor} for WP editor styles.
 * @since 1.0.0
 */
function if_incourage_topic_selector_block_assets() { // phpcs:ignore
	global $wp_post_types;
	$wp_post_types[ 'hub' ]->show_in_rest = true;
	$wp_post_types[ 'hub' ]->rest_base = 'hub';
	$wp_post_types[ 'hub' ]->rest_controller_class = 'WP_REST_Posts_Controller';
	$wp_post_types[ 'video' ]->show_in_rest = true;
	$wp_post_types[ 'video' ]->rest_base = 'video';
	$wp_post_types[ 'video' ]->rest_controller_class = 'WP_REST_Posts_Controller';

	// Register block styles for both frontend + backend.
	wp_register_style(
		'if_incourage_topic_selector-style-css',
		plugins_url( 'dist/blocks.style.build.css', dirname( __FILE__ ) ),
		[ 'wp-editor' ],
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: File modification time.
	);

	// Register block editor script for backend.
	wp_register_script(
		'if_incourage_topic_selector-block-js',
		plugins_url( 'dist/blocks.build.js', dirname( __FILE__ ) ),
		[ 'wp-blocks', 'wp-components', 'wp-i18n', 'wp-editor', 'wp-element' ],
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: File modification time.
		true // Enqueue the script in the footer.
	);

	// Register block editor styles for backend.
	wp_register_style(
		'if_incourage_topic_selector-block-editor-css',
		plugins_url( 'dist/blocks.editor.build.css', dirname( __FILE__ ) ),
		[ 'wp-edit-blocks' ],
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.editor.build.css' ) // Version: File modification time.
	);

	// WP Localized globals. Use dynamic PHP stuff in JavaScript via `ifitsGlobal` object.
	wp_localize_script(
		'if_incourage_topic_selector-block-js',
		'ifitsGlobal', // Array containing dynamic data for a JS Global.
		[
			'pluginDirPath' => plugin_dir_path( __DIR__ ),
			'pluginDirUrl'  => plugin_dir_url( __DIR__ ),
			// Add more data here that you want to access from `ifitsGlobal` object.
		]
	);

	/**
	 * Register Gutenberg block on server-side.
	 *
	 * Register the block on server-side to ensure that the block
	 * scripts and styles for both frontend and backend are
	 * enqueued when the editor loads.
	 *
	 * @link https://wordpress.org/gutenberg/handbook/blocks/writing-your-first-block-type#enqueuing-block-scripts
	 * @since 1.16.0
	 */
	register_block_type(
		'morphatic/block-if-incourage-topic-selector', [
			'style'         => 'if_incourage_topic_selector-style-css',        // front and admin
			'editor_script' => 'if_incourage_topic_selector-block-js',         // editor only
			'editor_style'  => 'if_incourage_topic_selector-block-editor-css', // editor only
		]
	);
}

// Hook: Block assets.
add_action( 'init', 'if_incourage_topic_selector_block_assets' );

function if_incourage_topic_selector_enqueue_frontend_scripts() {
	wp_enqueue_script(
		'if_incourage_topic_selector-frontend-js',
		plugins_url( 'src/block/frontend.js', dirname( __FILE__ ) ),
		[ 'jquery' ],
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: File modification time.
		true // Enqueue the script in the footer.
	);
}

add_action( 'wp_enqueue_scripts', 'if_incourage_topic_selector_enqueue_frontend_scripts' );
