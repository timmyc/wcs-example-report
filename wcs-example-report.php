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
		'title'  => __( 'Payments', 'wcs-example-report' ),
		'parent' => '/analytics/revenue',
		'path'   => '/analytics/payments',
	) );
}
add_action( 'admin_menu', 'wcs_example_report_register_pages', 12 );

/**
 * Registers the JS & CSS for the Dashboard
 */
function wcs_example_report_register_script() {
	// include API logic
	include_once( dirname( __FILE__ ) . '/inc/class-wcs-example-report-controller.php' );
	
	wp_register_script(
		'wc-admin-extension',
		plugins_url( 'js/dist/plugin.js', __FILE__ ),
		[ WC_ADMIN_APP, 'wc-components' ],
		filemtime( dirname( __FILE__ ) . '/js/dist/plugin.js' ),
		true
	);

	// API Fetch middlewares
	wp_add_inline_script(
		'wc-admin-extension',
		sprintf(
			'wcSettings.nonce =  "%s";',
			( wp_installing() && ! is_multisite() ) ? '' : wp_create_nonce( 'wp_rest' )
		),
		'after'
	);
	wp_add_inline_script(
		'wc-admin-extension',
		sprintf(
			'wcSettings.api_root = "%s";',
			esc_url_raw( get_rest_url() )
		),
		'after'
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
	wp_enqueue_style( 'wcs-example-report', plugins_url( 'js/style.css', __FILE__ ) );
}
add_action( 'admin_enqueue_scripts', 'wcs_example_report_enqueue_script' );


function wcs_example_report_setup_api() {
	if ( ! class_exists( 'WC_Connect_Loader' ) ) {
		return;
	}

	$api_controller_instance = new WCS_Example_Report_Controller();
	$api_controller_instance->register_routes();
}

add_action( 'rest_api_init', 'wcs_example_report_setup_api' );
