/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	EmptyContent,
	ReportFilters,
	TableCard,
	Chart,
	SummaryList,
	SummaryListPlaceholder,
	SummaryNumber,
} from '@woocommerce/components';
import {
	getAllowedIntervalsForQuery,
	getCurrentDates,
	getIntervalForQuery,
	getChartTypeForQuery,
} from '@woocommerce/date';
import { formatCurrency } from '@woocommerce/currency';
import { getNewPath } from '@woocommerce/navigation';
import { map, groupBy } from 'lodash';
import { moment, dateI18n } from '@wordpress/date';
import { Component, Fragment } from '@wordpress/element';
import { timeDay, timeWeek, timeMonth, timeYear } from 'd3-time';

/**
 * Internal dependencies
 */
import './style.scss';

class ExtensionReport extends Component {

	constructor() {
		super();
		this.state = {
			results: null,
			secondaryResults: null,
			loading: true,
		};
	}

	componentDidMount() {
		// This should be handled for us automagically, but the nonce wasn't working for me
		apiFetch.use( apiFetch.createNonceMiddleware( wcSettings.nonce ) );
		apiFetch.use( apiFetch.createRootURLMiddleware( wcSettings.api_root ) );
		this.fetchData();
	}

	componentDidUpdate( prevProps ) {
		const prevQuery = prevProps.query;
		const query = this.props.query;

		// If the dates have changed, fetch new data;
		if (
			( prevQuery.period !== query.period ) ||
			( prevQuery.compare !== query.compare ) ||
			( prevQuery.before !== query.before ) ||
			( prevQuery.after !== query.after )
		) {
			this.setState( { loading: true } );
			this.fetchData();
		}
	}

	fetchData() {
		const { primary, secondary } = getCurrentDates( this.props.query );
		// const endpoint = 'wc/v1/connect/stripe/transactions';
		const endpoint = 'wc/v4/reports/payments';
		const primaryPath = `${ endpoint }?beforeDate=${ +primary.before }&afterDate=${ +primary.after }`;
		const secondaryPath = `${ endpoint }?beforeDate=${ +secondary.before }&afterDate=${ +secondary.after }`;

		Promise.all( [
			apiFetch( { path: primaryPath } ),
			apiFetch( { path: secondaryPath } ),
		] ).then( ( [ { results }, { results: secondaryResults } ] ) => {
			this.setState( {
				results,
				secondaryResults,
				loading: false,
			} );
		} );
	}

	getHeadersContent() {
		return [
			{
				label: __( 'Amount', 'wc-admin' ),
				key: 'amount',
				required: true,
				isSortable: false,
				isNumeric: true,
			},
			{
				label: __( 'Type', 'wc-admin' ),
				key: 'type',
				required: false,
				isSortable: false,
				isNumeric: false,
			},
			{
				label: __( 'Description', 'wc-admin' ),
				key: 'description',
				required: false,
				isSortable: false,
				isNumeric: false,
			},
			{
				label: __( 'Date', 'wc-admin' ),
				key: 'created',
				required: true,
				defaultSort: true,
				isSortable: true,
			},
		];
	}

	getRowsContent() {
		const { results } = this.state;

		return map( results, row => {
			const {
				amount,
				type,
				description,
				created,
			} = row;

			return [
				{
					display: formatCurrency( amount / 100 ),
					value: amount / 100,
				},
				{
					display: type[ 0 ].toUpperCase() + type.slice( 1 ),
					value: type,
				},
				{
					display: description,
					value: description,
				},
				{
					display: dateI18n( 'Y-m-d H:i', moment( created * 1000 ) ),
					value: created * 1000,
				},
			];
		} );
	}

	renderTable() {
		const { loading } = this.state;
		const { query } = this.props;

		const rows = this.getRowsContent() || [];

		const headers = this.getHeadersContent();

		const tableQuery = {
			...query,
			orderby: query.orderby || 'date_start',
			order: query.order || 'asc',
		};
		console.log('query',query)
		return (
			<TableCard
				title={ __( 'Payments', 'wc-admin' ) }
				rows={ rows }
				totalRows={ rows.length }
				rowsPerPage={ 100 }
				headers={ headers }
				onQueryChange={ () => {} }
				query={ tableQuery }
				summary={ null }
				isLoading={ loading }
				downloadable
			/>
		);
	}

	renderChart() {
		const { path, query } = this.props;
		const { results, secondaryResults } = this.state;

		const transactions = results.filter( d => d.type === 'charge' || ( query.chart === 'net-volume' && d.type === 'refund' ) );
		const secondaryTransactions = secondaryResults.filter( d => d.type === 'charge' || ( query.chart === 'net-volume' && d.type === 'refund' ) );

		const currentInterval = getIntervalForQuery( query );
		const allowedIntervals = getAllowedIntervalsForQuery( query );
		const { primary, secondary } = getCurrentDates( query );
		const primaryKey = `${ primary.label } (${ primary.range })`;
		const secondaryKey = `${ secondary.label } (${ secondary.range })`;

		const bin =
			currentInterval === 'hour'    ? timeHour :
			currentInterval === 'day'     ? timeDay :
			currentInterval === 'week'    ? timeWeek :
			currentInterval === 'month'   ? timeMonth :
			currentInterval === 'quarter' ? timeMonth.every( 3 ) :
			currentInterval === 'year'    ? timeYear : null;

		const resultsByBin = groupBy( transactions, d => bin( d.created * 1000 ) );
		const secondaryResultsByBin = groupBy( secondaryTransactions, d => bin( d.created * 1000 ) );

		const secondaryRange = bin.range( secondary.after, secondary.before );
		const chartData = bin.range( primary.after, primary.before ).map( ( date, index ) => {
			const values = resultsByBin[ date ] || [];

			const secondaryDate = secondaryRange[ index ];
			const secondaryValues = secondaryResultsByBin[ secondaryDate ] || [];

			return {
				date,
				[ primaryKey ]: {
					labelDate: date,
					value: values.reduce( ( p, c ) => p + c.amount / 100, 0 ),
				},
				[ secondaryKey ]: {
					labelDate: secondaryDate,
					value: secondaryValues.reduce( ( p, c ) => p + c.amount / 100, 0 ),
				}
			};
		} );

		

		const selectedChart = query.chart === 'net-volume' ? {
			key: 'net_volume',
			label: 'Net Volume',
			type: 'currency',
		} : {
			key: 'gross_volume',
			label: 'Gross Volume',
			type: 'currency',
		};

		return (
			<Chart
				allowedIntervals={ allowedIntervals }
				data={ chartData }
				dateParser={ '%Y-%m-%dT%H:%M:%S' }
				interactiveLegend={ true }
				interval={ currentInterval }
				// isRequesting={ primaryData.isRequesting || secondaryData.isRequesting }
				// itemsLabel={ itemsLabel }
				// legendPosition={ legendPosition }
				mode={ /* mode || this.getChartMode() */ 'time-comparison' }
				path={ path }
				query={ query }
				showHeaderControls={ true }
				title={ selectedChart.label }
				// tooltipLabelFormat={ formats.tooltipLabelFormat }
				tooltipTitle={ selectedChart.label }
				tooltipValueFormat={ formatCurrency }
				type={ getChartTypeForQuery( query ) }
				valueType={ selectedChart.type }
				// xFormat={ formats.xFormat }
				// x2Format={ formats.x2Format }
				// yFormat={ }
			/>
		);
	}

	renderSummary() {
		const { loading, results, secondaryResults } = this.state;
		const { query, path } = this.props;

		if ( loading ) {
			return <SummaryListPlaceholder numberOfItems={ 2 } />;
		}

		const charges = results.filter( d => d.type === 'charge' );
		const secondaryCharges = secondaryResults.filter( d => d.type === 'charge' );
		const primaryGrossTotal = charges.reduce( ( p, c ) => p + c.amount / 100, 0 );
		const secondaryGrossTotal = secondaryCharges.reduce( ( p, c ) => p + c.amount / 100, 0 );

		const transactions = results.filter( d => d.type === 'charge' || d.type === 'refund' );
		const secondaryTransactions = secondaryResults.filter( d => d.type === 'charge' || d.type === 'refund' );
		const primaryNetTotal = transactions.reduce( ( p, c ) => p + c.amount / 100, 0 );
		const secondaryNetTotal = secondaryTransactions.reduce( ( p, c ) => p + c.amount / 100, 0 );

		const summaryNumbers = () => [
			<SummaryNumber
				key={ 'gross-volume' }
				delta={ secondaryGrossTotal && Math.round( ( primaryGrossTotal - secondaryGrossTotal ) / secondaryGrossTotal * 100 ) }
				href={ getNewPath( { chart: 'gross-volume' } ) }
				label={ 'Gross Volume' }
				prevLabel={
					'previous_period' === query.compare
						? __( 'Previous Period:', 'wc-admin' )
						: __( 'Previous Year:', 'wc-admin' )
				}
				prevValue={ formatCurrency( secondaryGrossTotal ) }
				selected={ ! query.chart || query.chart === 'gross-volume' }
				value={ formatCurrency( primaryGrossTotal ) }
			/>,
			<SummaryNumber
				key={ 'net-volume' }
				delta={ secondaryNetTotal && Math.round( ( primaryNetTotal - secondaryNetTotal ) / secondaryNetTotal * 100 ) }
				href={ getNewPath( { chart: 'net-volume' } ) }
				label={ 'Net Volume' }
				prevLabel={
					'previous_period' === query.compare
						? __( 'Previous Period:', 'wc-admin' )
						: __( 'Previous Year:', 'wc-admin' )
				}
				prevValue={ formatCurrency( secondaryNetTotal ) }
				selected={ query.chart === 'net-volume' }
				value={ formatCurrency( primaryNetTotal ) }
			/>,
		];

		return <SummaryList>{ summaryNumbers }</SummaryList>;
	}

	render() {
		const { loading, results } = this.state;
		const { path, query } = this.props;

		// if we aren't loading, and there are no results
		// show an EmptyContent message
		if ( ! loading && ! results.length ) {
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
				{ this.renderSummary() }
				{ ! loading ? this.renderChart() : null }
				{ this.renderTable() }
			</Fragment>
		);
	}
};

export default ExtensionReport;
