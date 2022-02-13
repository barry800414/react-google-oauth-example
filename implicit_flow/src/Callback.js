import React, { useEffect } from "react";
import { parseURLHash } from "./utils";
import { useNavigate } from "react-router-dom";

/**
 *
 * Step 1. Send authorization request to google for asking user to login google & give consent to access user's email.
 * Step 2. User login to google and give consent to access user's email.
 * Step 3. Google redirects browser to callback url, and send back access token.
 * Step 4. We get access token, store it into localStorage, and use it to get user's email.
 *
 */

const Callback = () => {
  const getAccessTokenFromCallback = () => {
    const params = parseURLHash();
    console.log('params from url hash', params);
    const state = params.state;
    if (window.localStorage.getItem('google_oauth2_state') !== state) {
        console.error('[Warning] Oauth2 state is not matched, possible CSRF attack.');
        return null;
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

  // Step 3
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
