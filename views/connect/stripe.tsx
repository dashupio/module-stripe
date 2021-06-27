
// import react
import React from 'react';

// connect sheets
const ConnectStripe = (props = {}) => {

  // return jsx
  return (
    <div className="card mb-3">
      <div className="card-header">
        <b>Stripe Connector</b>
      </div>
      <div className="card-body">

        <div className="mb-3">
          <label className="form-label">
            Client ID
          </label>
          <input className="form-control" name="client-id" ref="client-id" value={ props.connect.client } onChange={ (e) => props.setConnect('client', e.target.value) } />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Client Secret
          </label>
          <input className="form-control" name="client-secret" ref="client-secret" value={ props.connect.secret } onChange={ (e) => props.setConnect('secret', e.target.value) } />
        </div>

      </div>
    </div>
  );
};

// export default
export default ConnectStripe;