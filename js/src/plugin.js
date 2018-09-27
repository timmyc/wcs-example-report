/** @format */
/**
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import Report from './report';

addFilter( 'woocommerce-reports-list', 'wcs-labels/labels', pages => {
	return [
		...pages,
		{
			report: 'wcs-labels',
			title: 'Labels',
			component: Report,
		},
	];
} );
