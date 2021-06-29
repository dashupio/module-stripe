
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, Elements, CardElement } from '@stripe/react-stripe-js';
import React, { useState } from 'react';

// create connect stripe pay
const ConnectStripePay = (props = {}) => {
  // stripe/elements
  const stripe = useStripe();
  const elements = useElements();

  // state
  const [error, setError] = useState(null);

  // on change
  const onChange = async (event) => {
    // check complete
    if (event.complete) {
      // props enable
      setError(null);

      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements.getElement(CardElement);
  
      // Use your card Element with other Stripe.js APIs
      const { error, token } = await stripe.createToken(cardElement);

      // check error
      if (error) {
        // set error
        setError(error.message);

        // return
        return;
      }

      // done
      props.setPayment({
        token : token.id,
      });
    } else if (event.error) {
      // set error
      setError(event.error.message);
    }
  };

  // jsx
  return (
    <div className="connect-stripe-pay">
        <CardElement
          id="stripe-card"
          onChange={ onChange }
        />
      { !!error && (
        <div className="alert alert-danger mt-3 mb-0">
          { error }
        </div>
      ) }
    </div>
  )
};

// consumer
const ConnectStripePayBase = (props = {}) => {
  // stripe
  const stripePromise = loadStripe(props.connect.client);
  
  // return jsx
  return (
    <Elements stripe={ stripePromise }>
      <ConnectStripePay { ...props } />
    </Elements>
  );
};

// export default
export default ConnectStripePayBase;