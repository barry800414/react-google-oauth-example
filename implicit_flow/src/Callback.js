import React, { useEffect } from "react";
import { parseURLHash } from "./utils";
import { useNavigate } from "react-router-dom";

/**
 *
 * Step 1. User does something that we need to access his/her resource.
 * Step 2. We send authorization request to google for asking user to login google & give consent to access user's resource.
 * Step 3. Google Oauth server display UI for user to login & give consent.
 * Step 4. User login to google and give consent to access resource.
 * Step 5. Google redirects browser to callback URL, bringing with access token in URL.
 * Step 6. We get access token, store it into localStorage, and use it to access user's resource.
 *
 */

const Callback = () => {
  const getAccessTokenFromCallback = () => {
    const params = parseURLHash();
    console.log('params from url hash', params);
    const state = params.state;
    if (window.localStorage.getItem('google_oauth2_state') !== state) {
        console.error('[Warning] Oauth2 state is not matched, possible CSRF attack.');
        // Purposely remove verification for demo purpose
        // return null;
    }
    const accessToken = params.access_token;
    return accessToken;
  };

  const storeAccessToken = (accessToken) => {
    if (window.localStorage && accessToken) {
        window.localStorage.setItem('google_oauth2_access_token', accessToken);
    }
  };

  const navigate = useNavigate();

  // Step 5
  useEffect(() => {
    const accessToken = getAccessTokenFromCallback();
    storeAccessToken(accessToken);
    navigate("/");
  }, [])

  return (
    <div className="App">
      Loading...
    </div>
  );
}

export default Callback;
