<?php
/**
 * Plugin Name: inCourage Topic Selector
 * Plugin URI: https://github.com/morphatic/if-incourage-topic-selector
 * Description: A "Select a Topic" block widget for the inCourage website.
 * Author: Morgan Benton
 * Author URI: https://morphatic.com/
 * Version: 1.0.0
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
