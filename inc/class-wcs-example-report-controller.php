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
	protected $namespace = 'wc/v3';
	protected $rest_base = 'reports/labels';


	const LABELS_TRANSIENT_KEY = 'wcs_label_reports';

	private function compare_label_dates_desc( $label_a, $label_b ) {
		return $label_b['created'] - $label_a['created'];
	}

	private function get_all_labels() {
		global $wpdb;
		$query = "SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = 'wc_connect_labels'";
		$db_results = $wpdb->get_results( $query );
		$results = array();

		foreach ( $db_results as $meta ) {
			$labels = maybe_unserialize( $meta->meta_value );
			
			if ( empty( $labels ) ) {
				continue;
			}

			foreach ( (array) $labels as $label ) {
				$results[] = array_merge( $label, array( 'order_id' => $meta->post_id ) );
			}
		}

		usort( $results, array( $this, 'compare_label_dates_desc' ) );

		return $results;
	}

	private function query_labels( $request ) {
		$results = [];
		$all_labels =  get_transient( self::LABELS_TRANSIENT_KEY );
		if ( false === $all_labels ) {
			$all_labels = $this->get_all_labels();
			//set transient with ttl of 30 minutes
			set_transient( self::LABELS_TRANSIENT_KEY, $all_labels, 1800 );
		}

		// translate timestamps to JS timestapms
		// hard coding some timestamps for now, will change in the next PR
		$start_date = isset( $request[ 'start_date' ] ) ? $request[ 'start_date' ] : 1535453404000;
		$end_date = isset( $request[ 'end_date' ] ) ? $request[ 'end_date' ] : 1535653406000;

		$results = array();
		foreach ( (array) $all_labels as $label ) {
			$created = $label['created'];
			if ( $created > $end_date ) {
				continue;
			}

			//labels are sorted in descending order, so if we reached the end, break the loop
			if ( $created < $start_date ) {
				break;
			}

			if ( isset( $label['error'] ) || //ignore the error labels
				! isset( $label['rate'] ) ) { //labels where purchase hasn't completed for any reason
				continue;
			}

			//ignore labels with complete refunds
			if ( isset( $label['refund'] ) ) {
				$refund = ( array ) $label['refund'];
				if ( isset( $refund['status'] ) && 'completed' === $refund['status'] ) {
					continue;
				}
			}

			$results[] = $label;
		}
		
		return $results;
	}

	/**
	 * Register routes.
	 *
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_labels' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
		) );
	}

	/**
	 * Return a list of labels matching the query args
	 *
	 * @return array Of WP_Error or WP_REST_Response.
	 */
	public function get_labels( $request ) {
		$response = $this->query_labels( $request );

		return $response;
	}

}