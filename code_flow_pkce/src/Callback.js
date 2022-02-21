import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";


/**
 *
 * Step 1. User does something that we need to access his/her resource.
 * Step 2. We generate code_verifier and code_challenge.
 * Step 3. We send authorization request to google for asking user to
 *         login google & give consent to access user's resource, along
 *         with code_challenge & code_challenge_method.
 * Step 4. Google Oauth server display UI for user to login & give consent.
 * Step 5. User login to google and give consent to access resource.
 * Step 6. Google redirects browser to callback URL, bringing with
 *         authorization code in URL.
 * Step 7. We send authorization code & code_verifier to token endpoint to
 *         get access token.
 * Step 8. We get access token, store it into localStorage
 * Step 9. We use access token to get user's resource.
 *
 */

const Callback = () => {
  const getAuthorizationCodeFromURL = () => {
    const params = new URLSearchParams(document.location.search)
    console.log('params from url query string', params);
    const state = params.get('state');
    if (window.localStorage.getItem('google_oauth2_state') !== state) {
        console.error('[Warning] Oauth2 state is not matched, possible CSRF attack.');
        return null;
    }
    const authorizationCode = params.get('code');
    return authorizationCode;
  };

  const getAccessTokenFromTokenEndpoint = async (authorizationCode) => {
    return new Promise((resolve, reject) => {
      window.fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authorizationCode,
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          redirect_uri: document.location.origin + '/callback',
          grant_type: 'authorization_code',
          code_verifier: window.sessionStorage.getItem('google_oauth2_code_verifier'),
        }),
      }).then(response => {
        return response.json();
      })
      .then(json => resolve(json.access_token))
      .catch((error) => { reject(error) });
    });
  };

  const storeAccessToken = (accessToken) => {
    if (window.localStorage && accessToken) {
        window.localStorage.setItem('google_oauth2_access_token', accessToken);
    }
  };

  const navigate = useNavigate();

  useEffect(async () => {
    // Step 6.
    const authorizationCode = getAuthorizationCodeFromURL();
    console.log('authorizationCode:', authorizationCode);
    if (authorizationCode) {
      // Step 7.
      const accessToken = await getAccessTokenFromTokenEndpoint(authorizationCode);
      // Step 8.
      storeAccessToken(accessToken);
    }
    navigate("/");
  }, [])

  return (
    <div className="App">
      Loading...
    </div>
  );
}

export default Callback;
