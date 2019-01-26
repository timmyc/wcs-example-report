<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WC_REST_Reports_V2_Controller' ) ) {
    return;
}

if ( class_exists( 'WCS_Example_Report_Controller' ) ) {
	return;
}

/**
 * REST API Settings controller class.
 *
 * @package WooCommerce/API
 */
class WCS_Example_Report_Controller extends WC_REST_Reports_V2_Controller {

	/**
	 * WP REST API namespace/version.
	 */
	protected $namespace = 'wc/v4';
	protected $rest_base = 'reports/payments';

	const TRANSIENT_KEY = 'payments_report';

	private function query_payments( $request ) {
		$results = [];
		$all_results = false;//get_transient( self::TRANSIENT_KEY );
		if ( false === $all_results ) {
			$json = file_get_contents( __DIR__ . '/../assets/events.json' );
			$all_results = json_decode( $json, true );
			//set transient with ttl of 30 minutes
			set_transient( self::TRANSIENT_KEY, $all_results, 1800 );
		}

		$start_date = isset( $request[ 'afterDate' ] ) ? (int) $request[ 'afterDate' ] : 1535453404000;
		$end_date = isset( $request[ 'beforeDate' ] ) ? (int) $request[ 'beforeDate' ] : 1535653406000;

		$results = array();
		foreach ( (array) $all_results as $result ) {
			$created = (int) $result['created'] * 1000;
			if ( $created < $start_date ) {
				continue;
			}
			if ( $created >= $end_date ) {
				continue;
			}

			$results[] = $result;
		}
		
		return array( 'results' => $results );
	}

	/**
	 * Register routes.
	 *
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_payments' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
		) );
	}

	/**
	 * Return a list of payments matching the query args
	 *
	 * @return array Of WP_Error or WP_REST_Response.
	 */
	public function get_payments( $request ) {
		$response = $this->query_payments( $request );

		return $response;
	}

}