
import React from 'react';
import dotProp from 'dot-prop';

// stripe view
const ConnectStripeView = (props = {}) => {

  // return jsx
  return (
    <div className="card">
      <div className="card-body">
        <button className={ `btn btn-${['active', 'succeeded'].includes(props.payment?.status) ? 'success' : 'danger'} me-2` }>
          <i className="fab fa-stripe" />
        </button>
        Payment to <b className="me-1">Stripe</b>for<b className="mx-1">{ `$${((dotProp.get(props.payment, 'amount.0') || 0) - (dotProp.get(props.payment, 'discount.0') || 0)).toFixed(2)}` } { dotProp.get(props.payment, 'amount.1') || 'USD' } { dotProp.get(props.payment, 'amount.2') ? props.payment.amount[2] : '' }</b> { props.payment.status }.
      </div>
    </div>
  );
}

// export default
export default ConnectStripeView;