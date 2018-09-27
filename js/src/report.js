/** @format */
/**
 * External dependencies
 */
import { Card, ReportFilters } from '@woocommerce/components';
import { Fragment } from '@wordpress/element';
import { map } from 'lodash';

const ExtensionReport = ( { query } ) => {
	return (
		<Fragment>
			<ReportFilters />
			<Card title="Extension">
				<p>
					This is a report specific to an extension. This card is imported from{' '}
					<code>wc-admin</code>. The ReportFilters above is also imported from <code>wc-admin</code>,
					and can be used to update query params.
				</p>
				<p>The current query params are:</p>
				<blockquote>
				{ map( query, ( val, key ) => (
					<div key={ key }>
						<strong>{ key }</strong> { val }
					</div>
				) ) }
				</blockquote>
			</Card>
		</Fragment>
	);
};

export default ExtensionReport;
