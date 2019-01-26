/** @format */
/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import Report from './report';

addFilter( 'woocommerce-reports-list', 'payments', pages => {
	return [
		...pages,
		{
			report: 'payments',
			title: 'Payments',
			component: Report,
		},
	];
} );
