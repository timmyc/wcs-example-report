/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Card, ReportFilters } from '@woocommerce/components';
import { Component } from '@wordpress/element';
import { Fragment } from '@wordpress/element';

class ExtensionReport extends Component {

	componentDidMount() {
		// This should be handled for us automagically, but the nonce wasn't working for me
		apiFetch.use( apiFetch.createNonceMiddleware( wcSettings.nonce ) );
		apiFetch.use( apiFetch.createRootURLMiddleware( wcSettings.api_root ) );
		apiFetch( { path: 'wc/v3/reports/labels' } ).then( labels => {
			console.log( labels );
		} );
	}

	render() {
		console.log( 'render', this.props );
		return (
			<Fragment>
				<ReportFilters path={ this.props.path } />
				<Card title="Extension">
					<p>
						This is a report specific to an extension. This card is imported from{' '}
						<code>wc-admin</code>. The ReportFilters above is also imported from <code>wc-admin</code>,
						and can be used to update query params.
					</p>
				</Card>
			</Fragment>
		);
	}
};

export default ExtensionReport;
