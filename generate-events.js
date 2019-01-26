#!/usr/bin/env node

const NUM_EVENTS = 10000;
const SECONDS_BETWEEN_EVENTS = 5000;

// External dependencies
const { randomNormal, randomExponential } = require( 'd3-random' );
const { scaleLog } = require( 'd3-scale' );

// Built-in dependencies
const fs = require( 'fs' );

const lambda = scaleLog().domain( [ NUM_EVENTS, 1 ] ).range( [ SECONDS_BETWEEN_EVENTS, 1000 ] );
const randomPeriod = ( index ) => Math.round( randomExponential( 1 / lambda( index ) )() );

const randomAmountGenerator = randomNormal( 0, 12 );
const randomAmount = () => Math.round( Math.abs( randomAmountGenerator() ) * 100 ) + 1;

const endTime = Math.round( Date.now() / 1000 );
let totalPeriod = 0;
const events = [];

for ( let i = NUM_EVENTS; i > 0; i-- ) {
    const type = Math.random() > 0.08 ? 'charge' : 'refund';
    const created = endTime - ( totalPeriod += randomPeriod( i ) );
    const amount = randomAmount();

    events.push( {
        created,
        amount: type === 'charge' ? amount : -amount,
        description: `Event #${ i }`,
        type,
    } );
}

fs.writeFileSync( 'assets/events.json', JSON.stringify( events.reverse() ) );
