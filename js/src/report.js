/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Card, EmptyContent, ReportFilters, TableCard, TablePlaceholder } from '@woocommerce/components';
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
			loading: true,
		};
	}

	componentDidMount() {
		// This should be handled for us automagically, but the nonce wasn't working for me
		apiFetch.use( apiFetch.createNonceMiddleware( wcSettings.nonce ) );
		apiFetch.use( apiFetch.createRootURLMiddleware( wcSettings.api_root ) );
		const { afterDate, beforeDate } = this.props;
		this.fetchLabelData( afterDate, beforeDate );
	}

	componentDidUpdate( prevProps ) {
		const prevQuery = prevProps.query;
		const query = this.props.query;

		// If the dates have changed, fetch new data;
		if (
			( prevQuery.before !== query.before ) ||
			( prevQuery.after !== query.after )
		) {
			this.setState( { loading: true } );
			this.fetchLabelData();
		}
	}

	fetchLabelData() {
		const { beforeDate, afterDate } = this.getDatesFromQuery();
		const labelsEndpoint = `wc/v3/reports/labels?beforeDate=${ beforeDate }&afterDate=${ afterDate }`;

		apiFetch( { path: labelsEndpoint } ).then( labels => {
			this.setState( {
				labels: labels,
				loading: false,
			} );
		} );
	}

	// TODO: we need to expose the util method that does this from wc-admin
	getDatesFromQuery() {
		const { query } = this.props;
		
		// the current report defaults to the last 7 days
		let afterDate = moment().subtract( 7, 'days' ).endOf( 'day' ).valueOf();
		let beforeDate = moment().startOf( 'day' ).valueOf();

		if ( query.before ) {
			beforeDate = moment( query.before ).endOf( 'day' ).valueOf();
		}

		if ( query.after ) {
			afterDate = moment( query.after ).startOf( 'day' ).valueOf();
		}

		return { beforeDate, afterDate }
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
				isSortable: false,
				isNumeric: true,
			},
			{
				label: __( 'Price', 'wc-admin' ),
				key: 'gross_revenue',
				required: true,
				isSortable: false,
				isNumeric: true,
			},
			{
				label: __( 'Service', 'wc-admin' ),
				key: 'refunds',
				required: false,
				isSortable: false,
				isNumeric: false,
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
		const { loading, labels } = this.state;
		const { path, query } = this.props;

		// if we aren't loading, and there are no labels
		// show an EmptyContent message
		if ( ! loading && ! labels.length ) {
			return (
				<Fragment>
					<ReportFilters query={ query } path={ path } />
					<EmptyContent
						title={ __( 'No results could be found for this date range.', 'wc-admin' ) }
						actionLabel={ __( 'View Orders', 'wc-admin' ) }
						actionURL='/wp-admin/edit.php?post_type=shop_order'
					/>
				</Fragment>
			);
		}

		return (
			<Fragment>
				<ReportFilters path={ path } query={ query } />
				{ ! loading ? this.renderTable() : this.renderPlaceholder() }
			</Fragment>
		);
	}
};

export default ExtensionReport;
