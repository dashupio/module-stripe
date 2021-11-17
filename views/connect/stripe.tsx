
// import react
import React from 'react';
import { TextField } from '@dashup/ui';

// connect sheets
const ConnectStripe = (props = {}) => {

  // return jsx
  return (
    <>
      <TextField
        value={ props.connect.client }
        label="Client ID"
        onChange={ (e) => props.setConnect('client', e.target.value) }
        fullWidth
      />
      <TextField
        value={ props.connect.secret }
        label="Client ID"
        onChange={ (e) => props.setConnect('secret', e.target.value) }
        fullWidth
      />
    </>
  );
};

// export default
export default ConnectStripe;