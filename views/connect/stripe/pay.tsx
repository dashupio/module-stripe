
import { loadStripe } from '@stripe/stripe-js';
import { Box, Alert, Stack, TextField, useTheme } from '@dashup/ui';
import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { useStripe, useElements, Elements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

// stripe input
const StripeInput = React.forwardRef(({ component : Component, inputRef, ...props }) => {
  // use ref
  const theme = useTheme();
  const elementRef = useRef();

  // imperi8tive handle
  useImperativeHandle(inputRef, () => ({
    focus : () => elementRef?.current?.focus,
  }));

  // return jsx
  return (
    <Component
      { ...props }
      options={ {
        style : {
          base : {
            color      : theme.palette.text.primary,
            fontSize   : '16px',
            lineHeight : '1.4375em', // 23px
            fontFamily : theme.typography.fontFamily,
          },
          invalid : {
            color : theme.palette.text.primary,
          },
        }
      } }
      onReady={ element => elementRef.current = element }
      onChange={ props.onStripe }
    />
  )
});

// create connect stripe pay
const ConnectStripePay = (props = {}) => {
  // stripe/elements
  const stripe = useStripe();
  const elements = useElements();

  // state
  const [state, setState] = useState({
    cardNumberComplete: false,
    expiredComplete: false,
    cvcComplete: false,
    cardNumberError: null,
    expiredError: null,
    cvcError: null
  });

  // state
  const [error, setError] = useState(null);
  
  // use effect
  useEffect(async () => {
    // find
    if ([state.cardNumberComplete, state.expiredComplete, state.cvcComplete].find((t) => !t)) return;

    // get elements
    setError(null);

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardNumberElement);

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
  }, [state.cardNumberComplete, state.expiredComplete, state.cvcComplete]);

  // on element change
  const onElementChange = (field, errorField) => ({
    complete,
    error = { message : null }
  }) => {
    setState({ ...state, [field]: complete, [errorField]: error.message });
  };

  // check state
  const { cardNumberError, expiredError, cvcError } = state;

  // jsx
  return (
    <Box>
      { !!error && (
        <Box mb={ 2 }>
          <Alert severity="error">{ error }</Alert>
        </Box>
      ) }
      <TextField
        label="Card Number"
        error={ !!cardNumberError }
        required
        fullWidth
        InputProps={ {
          inputComponent : StripeInput,
          inputProps : {
            onStripe  : onElementChange('cardNumberComplete', 'cardNumberError'),
            component : CardNumberElement
          },
        } }
        InputLabelProps={ {
          shrink : true,
        } }
        helperText={ cardNumberError }
      />
      <Stack spacing={ 2 } direction="row" alignItems="center">
        <TextField
          sx={ {
            flex : 2,
          } }
          label="Card Expiry"
          error={ !!expiredError }
          required
          fullWidth
          InputProps={ {
            inputComponent : StripeInput,
            inputProps : {
              onStripe  : onElementChange('expiredComplete', 'expiredError'),
              component : CardExpiryElement
            },
          } }
          InputLabelProps={ {
            shrink : true,
          } }
          helperText={ expiredError }
        />
        <TextField
          sx={ {
            flex : 1,
          } }
          label="Card CVC"
          error={ !!cvcError }
          required
          fullWidth
          InputProps={ {
            inputComponent : StripeInput,
            inputProps : {
              onStripe  : onElementChange('cvcComplete', 'cvcError'),
              component : CardCvcElement
            },
          } }
          InputLabelProps={ {
            shrink : true,
          } }
          helperText={ cvcError }
        />
      </Stack>
    </Box>
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