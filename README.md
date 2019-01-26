# example-payments-report

This repository is an example of how to add a custom React-built report to the new WooCommerce Admin feature plugin - [wc-admin](https://github.com/woocommerce/wc-admin), *forked from @timmyc's [original example](https://github.com/timmyc/wcs-example-report)*.

It adds an Analytics » Payments screen, with a report that includes summary numbers, a chart, and a list of transactions. Displays generated data loaded from a new REST endpoint, which can be initialized with `npm run generate-events`.

## Requirements
To run this code locally, you will need to be running WooCommerce 3.5 or newer, the `wc-admin` feature plugin, and Gutenberg.
