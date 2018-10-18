# wcs-example-report

This repository is an example of how to add a custom React-built report to the new WooCommerce Admin feature plugin - [wc-admin](https://github.com/woocommerce/wc-admin).

## Shipping Labels Report

The example report chosen was to convert the existing Shipping Labels Report from the WooCommerce Services Extension into a wc-admin report:

__Old Report__
The existing report is built using a mixture of a php-generated ty the emplate, and a bit of jQuery:

![Old Shipping Labels Report](https://user-images.githubusercontent.com/22080/47129294-90e25e00-d249-11e8-9f78-c8f572c2284d.png)

__New Report__
The new report built as an example in this repository uses the latet base React Components from WordPress/Gutenberg project along side Woo-specific React components built by the `wc-admin` team:

![New Report](https://user-images.githubusercontent.com/22080/47129475-431a2580-d24a-11e8-933a-0d7f1c35a988.png)

I tried to chunk up the development in easy-to-follow steps in each closed pull request. In the PR notes I also tried to detail each change included, as to make all the steps clear.

So [check out the closed PRs in order](https://github.com/timmyc/wcs-example-report/pulls?q=is%3Apr+is%3Aclosed+sort%3Acreated-asc) to see how the example report was built.

__Requirements__
To run this code locally, you will need to be running WooCommerce 3.5 or newer, the `wc-admin` feature plugin, WooComerce Services, and Gutenberg.
