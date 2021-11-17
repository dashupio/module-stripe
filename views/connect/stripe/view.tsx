
import React from 'react';
import dotProp from 'dot-prop';
import { TextField, InputAdornment, Icon, Button } from '@dashup/ui';

// stripe view
const ConnectStripeView = (props = {}) => {

  // return jsx
  return (
    
    <TextField
      label="Stripe Payment"
      value={ `$${((dotProp.get(props.payment, 'amount.0') || 0) - (dotProp.get(props.payment, 'discount.0') || 0)).toFixed(2)} ${dotProp.get(props.payment, 'amount.1') || 'USD'} ${dotProp.get(props.payment, 'amount.2') ? props.payment.amount[2] : ''}` }
      fullWidth
      InputProps={ {
        readOnly       : true,
        startAdornment : (
          <InputAdornment position="start">
            <Icon type="fab" icon="stripe" fixedWidth />
          </InputAdornment>
        ),
        endAdornment : (
          <>
            <InputAdornment position="end">
              <Button color={ ['active', 'succeeded'].includes(props.payment?.status) ? 'success' : 'error' }>
                { props.payment.status }
              </Button>
            </InputAdornment>
          </>
        )
      } }
    />
  );
}

// export default
export default ConnectStripeView;