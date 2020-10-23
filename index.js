// require first
const { Module } = require('@dashup/module');

// import base
const StripeConnect = require('./connects/stripe');

/**
 * export module
 */
class StripeModule extends Module {
  
  /**
   * registers dashup structs
   *
   * @param {*} register 
   */
  register(fn) {
    // register payments
    fn('connect', StripeConnect);
  }
}

// create new
module.exports = new StripeModule();
