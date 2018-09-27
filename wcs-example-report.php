<?php
/**
 * Plugin Name: WooCommerce Services Example Report
 */

/**
* Register menu pages for the Dashboard and Analytics sections
*/
function wcs_example_report_register_pages() {
	if ( ! function_exists( 'wc_admin_register_page' ) ) {
		return;
	}

	wc_admin_register_page( array(
		'title'  => __( 'Labels', 'wcs-example-report' ),
		'parent' => '/analytics',
		'path'   => '/analytics/wcs-labels',
	) );
}
add_action( 'admin_menu', 'wcs_example_report_register_pages', 12 );

/**
 * Registers the JS & CSS for the Dashboard
 */
function wcs_example_report_register_script() {
	wp_register_script(
		'wc-admin-extension',
		plugins_url( 'js/plugin.js', __FILE__ ),
		[ WC_ADMIN_APP, 'wc-components' ],
		filemtime( dirname( __FILE__ ) . '/js/plugin.js' ),
		true
	);
}
add_action( 'init', 'wcs_example_report_register_script' );

/**
 * Load the assets on the Dashboard page
 */
function wcs_example_report_enqueue_script(){
	if ( ! wc_admin_is_admin_page() ) {
		return;
	}

	wp_enqueue_script( 'wc-admin-extension' );
}
add_action( 'admin_enqueue_scripts', 'wcs_example_report_enqueue_script' );
