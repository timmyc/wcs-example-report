/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Card, ReportFilters, TableCard, TablePlaceholder } from '@woocommerce/components';
import { map } from 'lodash';
import { moment, dateI18n } from '@wordpress/date';
import { Component } from '@wordpress/element';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

class ExtensionReport extends Component {

	constructor() {
		super();
		this.state = {
			labels: null,
		};
	}

	componentDidMount() {
		// This should be handled for us automagically, but the nonce wasn't working for me
		apiFetch.use( apiFetch.createNonceMiddleware( wcSettings.nonce ) );
		apiFetch.use( apiFetch.createRootURLMiddleware( wcSettings.api_root ) );
		apiFetch( { path: 'wc/v3/reports/labels' } ).then( labels => {
			this.setState( { labels } );
		} );
	}

	getHeadersContent() {
		return [
			{
				label: __( 'Date', 'wc-admin' ),
				key: 'date_start',
				required: true,
				defaultSort: true,
				isSortable: true,
			},
			{
				label: __( 'Order', 'wc-admin' ),
				key: 'orders_count',
				required: false,
				isSortable: true,
			},
			{
				label: __( 'Price', 'wc-admin' ),
				key: 'gross_revenue',
				required: true,
				isSortable: true,
				isNumeric: true,
			},
			{
				label: __( 'Service', 'wc-admin' ),
				key: 'refunds',
				required: false,
				isSortable: true,
				isNumeric: true,
			},
		];
	}

	getRowsContent() {
		const { labels } = this.state;

		return map( labels, row => {
			const {
				created,
				order_id,
				rate,
				service_name,
			} = row;

			// wc-admin has a util for `getAdminLink` might be nice to get a similar util into core
			const orderLink = (
				<a href={ '/wp-admin/post.php?action=edit&post=' + order_id }>
					{ order_id }
				</a>
			);

			const order_date = moment( created );
			return [
				{
					display: dateI18n( 'Y-n-d H:i', order_date ),
					value: created,
				},
				{
					display: orderLink,
					value: order_id,
				},
				{
					// wc-admin has some currency helpers
					// TODO: make these available to extension developers
					display: rate,
					value: rate,
				},
				{
					display: service_name,
					value: service_name,
				},
			];
		} );
	}

	renderPlaceholder() {
		const headers = this.getHeadersContent();
		return ( 
			<Card
				title={ __( 'Shipping Labels', 'wc-admin' ) }
				className="wcs-example-report-placeholder"
			>
				<TablePlaceholder caption={ __( 'Shipping Labels', 'wc-admin' ) } headers={ headers } />
			</Card>
		);
	}

	renderTable() {
		const { query } = this.props;

		const rows = this.getRowsContent() || [];

		const headers = this.getHeadersContent();

		const tableQuery = {
			...query,
			orderby: query.orderby || 'date_start',
			order: query.order || 'asc',
		};
		return (
			<TableCard
				title={ __( 'Shipping Labels', 'wc-admin' ) }
				rows={ rows }
				totalRows={ rows.length }
				rowsPerPage={ 100 }
				headers={ headers }
				onQueryChange={ () => {} }
				query={ tableQuery }
				summary={ null }
			/>
		);
	}

	render() {
		const { labels } = this.state;
		return (
			<Fragment>
				<ReportFilters path={ this.props.path } />
				{ labels ? this.renderTable() : this.renderPlaceholder() }
			</Fragment>
		);
	}
};

export default ExtensionReport;
