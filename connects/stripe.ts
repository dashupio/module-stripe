
// import connect interface
import Stripe from 'stripe';
import { Struct, Query } from '@dashup/module';

/**
 * build address helper
 */
export default class StripeConnect extends Struct {
  /**
   * construct stripe connector
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);

    // bind methods
    this.payAction = this.payAction.bind(this);
    this.saveAction = this.saveAction.bind(this);
  }

  /**
   * returns connect type
   */
  get type() {
    // return connect type label
    return 'stripe';
  }

  /**
   * returns connect type
   */
  get title() {
    // return connect type label
    return 'Stripe';
  }

  /**
   * returns connect icon
   */
  get icon() {
    // return connect icon label
    return 'fab fa-stripe';
  }

  /**
   * returns connect data
   */
  get data() {
    // return connect data
    return {
      protected : ['secret'],
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      pay    : 'connect/stripe/pay',
      view   : 'connect/stripe/view',
      config : 'connect/stripe/config',
    };
  }

  /**
   * returns connect actions
   */
  get actions() {
    // return connect actions
    return {
      pay  : this.payAction,
      save : this.saveAction,
    };
  }

  /**
   * returns category list for connect
   */
  get categories() {
    // return array of categories
    return ['checkout'];
  }

  /**
   * returns connect descripton for list
   */
  get description() {
    // return description string
    return 'Stripe Connector';
  }

  /**
   * pay action
   *
   * @param param0 
   * @param connect 
   * @param order 
   * @param payment 
   */
  async payAction(opts, connect, order, payment) {
    // query pages where
    const page = await new Query(opts, 'page').findById(opts.page);

    // get fields
    const [orderForm, productForm] = await new Query(opts, 'page').findByIds([page.get('data.order.form'), page.get('data.product.form')]);

    // load products
    const titleField = (productForm.get('data.fields') || []).find((f) => f.uuid === page.get('data.product.title'));
    const orderField = (orderForm.get('data.fields') || []).find((f) => f.uuid === page.get('data.order.field'));
    const productField = (productForm.get('data.fields') || []).find((f) => f.uuid === page.get('data.product.field'));

    // order products
    const orderDiscount = order[orderField.name || orderField.uuid].discount;
    const orderProducts = order[orderField.name || orderField.uuid].products;

    // products
    const products = await new Query({
      ...opts,

      page : productForm.get('data.model'),
      form : productForm.get('_id'),
    }, 'model').findByIds(orderProducts.map((product) => {
      // set id
      const id = (product.product || {})._id ? product.product._id : product.product;

      // return id
      return id;
    }));

    // subscriptions
    const subscriptions = [...(orderProducts)].filter((product) => {
      // set id
      const id = (product.product || {})._id ? product.product._id : product.product;

      // actual product
      const actualProduct = products.find((p) => p.get('_id') === id);

      // get type
      return actualProduct.get(`${productField.name || productField.uuid}.type`) === 'subscription';
    });

    // normal products
    const normals = [...(orderProducts)].filter((product) => {
      // set id
      const id = (product.product || {})._id ? product.product._id : product.product;

      // actual product
      const actualProduct = products.find((p) => p.get('_id') === id);

      // get type
      return actualProduct.get(`${productField.name || productField.uuid}.type`) !== 'subscription';
    });

    // normal total
    const normalTotal = normals.reduce((accum, product) => {
      // set id
      const id = (product.product || {})._id ? product.product._id : product.product;

      // actual product
      const actualProduct = products.find((p) => p.get('_id') === id);

      // price
      return accum + parseFloat((parseFloat(actualProduct.get(`${productField.name || productField.uuid}.price`) || 0) * parseInt(product.count || 0)).toFixed(2));
    }, 0);

    // create stripe
    const stripe = Stripe(connect.secret);

    // Create a Customer:
    const customer = await stripe.customers.create({
      email  : order[orderField.name || orderField.name].information.email,
      source : payment.value.token,
    });

    // payments
    const payments = [];
    
    // charge
    if (normalTotal) {
      // check discount
      const normalDiscount = orderDiscount ? parseFloat(orderDiscount.type === 'percent' ? (parseFloat(orderDiscount.value) / 100) * normalTotal : orderDiscount.value) : 0;

      // normal charge
      const charge = await stripe.charges.create({
        amount   : parseInt(`${(normalTotal - normalDiscount) * 100}`, 10),
        currency : (payment.currency || 'usd').toLowerCase(),
        metadata : {
          page    : page.get('_id'),
          order   : order._id,
          connect : payment.uuid,
        },
        customer      : customer.id,
        description   : `Order #${order._id}`,
        receipt_email : order[orderField.name || orderField.name].information.email,
      });

      // push payments
      payments.push({
        id       : charge.id,
        type     : 'normal',
        status   : charge.status,
        amount   : [normalTotal, (payment.currency || 'USD').toUpperCase()],
        discount : [normalDiscount, (payment.currency || 'USD').toUpperCase()],
        customer : customer.id,
      });
    }

    // intervals
    const intervals = {
      'weekly'       : ['week', 1],
      'annually'     : ['year', 1],
      'monthly'      : ['month', 1],
      'quarterly'    : ['month', 3],
      'semiannually' : ['month', 6],
    };

    // subscriptions
    await Promise.all(subscriptions.map(async (subscription) => {
      // set id
      const id = (subscription.product || {})._id ? subscription.product._id : subscription.product;

      // actual product
      const actualProduct = products.find((p) => p.get('_id') === id);
      const actualPrice = parseFloat((parseFloat(actualProduct.get(`${productField.name || productField.uuid}.price`) || 0) * parseInt(subscription.count || 0)).toFixed(2));
      const actualInterval = intervals[actualProduct.get(`${productField.name || productField.uuid}.period`) || 'monthly'];

      // check discount
      const actualDiscount = orderDiscount ? parseFloat(orderDiscount.type === 'percent' ? (parseFloat(orderDiscount.value) / 100) * actualPrice : orderDiscount.value) : 0;

      // let
      let product;

      // try/catch get product
      try {
        product = await stripe.products.retrieve(actualProduct.get('_id'));
      } catch (e) {}

      // create stripe product
      if (!product) product = await stripe.products.create({
        id   : actualProduct.get('_id'),
        name : actualProduct.get(`${titleField.name || titleField.uuid}`),
      });

      // price
      const currentPrices = (await stripe.prices.list({
        limit   : 100,
        product : product.id,
      })).data;

      // find price
      const price = currentPrices.find((p) => p.unit_amount === parseInt(`${(actualPrice - actualDiscount) * 100}`, 10) && p.recurring.interval === actualInterval[0] && p.recurring.interval_count === actualInterval[1]) || await stripe.prices.create({
        product   : product.id,
        currency  : (payment.currency || 'usd').toLowerCase(),
        recurring : {
          interval       : actualInterval[0],
          interval_count : actualInterval[1],
        },
        unit_amount : parseInt(`${(actualPrice - actualDiscount) * 100}`, 10),
      });

      // create subscription
      const stripeSubscription = await stripe.subscriptions.create({
        items : [
          {
            price    : price.id,
            quantity : subscription.count,
          },
        ],
        customer : customer.id,
      });

      // push payment
      payments.push({
        id       : stripeSubscription.id,
        type     : 'subscription',
        status   : stripeSubscription.status,
        amount   : [actualPrice, (payment.currency || 'USD').toUpperCase(), actualProduct.get(`${productField.name || productField.uuid}.period`) || 'monthly'],
        discount : [actualDiscount, (payment.currency || 'USD').toUpperCase(), actualProduct.get(`${productField.name || productField.uuid}.period`) || 'monthly'],
        customer : customer.id,
      })
    }));

    // return payments
    return { payments };
  }

  /**
   * action method
   *
   * @param param0 
   * @param connect 
   * @param data 
   */
  async saveAction({ req, dashup, connect : oldConnect }, connect) {
    // check dashup
    if (!dashup) return;

    // check secret
    if (connect.secret === 'SECRET') {
      // secret
      connect.secret = oldConnect.secret;
    }

    // return connect
    return { connect };
  }
}