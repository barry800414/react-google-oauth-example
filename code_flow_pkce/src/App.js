import React from "react";
import { randomString, generateCodeVerifierAndCodeChallenge } from './utils';

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

function App() {
  const [user, setMyUser] = React.useState(null);

  const googleOauth2SignIn = async () => {
    // Google's OAuth 2.0 endpoint for requesting an access token
    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";

    // Create element to open OAuth 2.0 endpoint in new window.
    const form = document.createElement("form");
    form.setAttribute("method", "GET"); // Send as a GET request.
    form.setAttribute("action", oauth2Endpoint);

    // For preventing CSRF attacks. ref:
    // https://blog.techbridge.cc/2017/02/25/csrf-introduction/
    // https://auth0.com/docs/secure/attack-protection/state-parameters
    const state = randomString();
    window.localStorage.setItem('google_oauth2_state', state);


    // Step 2.
    // PKCE: Generate code_verifier, code_challenge, and code_challenge_method.
    const codeChallengeMethod = 'S256';
    const { codeVerifier, codeChallenge } = await generateCodeVerifierAndCodeChallenge(codeChallengeMethod);
    window.sessionStorage.setItem('google_oauth2_code_verifier', codeVerifier);

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: document.location.origin + "/callback",
      scope: "https://www.googleapis.com/auth/userinfo.email",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      response_type: "code",
      include_granted_scopes: "true",
    };

    // Add form parameters as hidden input values.
    for (let p in params) {
      const input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", p);
      input.setAttribute("value", params[p]);
      form.appendChild(input);
    }

    // Step 3.
    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  };

  // Step 9.
  const requestToGetMyUserInfo = () => {
    const googleOauth2AccessToken = window.localStorage.getItem("google_oauth2_access_token");
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': 'Bearer ' + googleOauth2AccessToken
      }
    }).then((response) => {
      return response.json();
    }).then((json) => {
      setMyUser(json);
    });
  }

  const onGetMyUserInfo = async () => {
    const googleOauth2AccessToken = window.localStorage.getItem("google_oauth2_access_token");
    if (!googleOauth2AccessToken) {
      await googleOauth2SignIn();
    } else {
      requestToGetMyUserInfo();
    }
  };

  return (
    <div className="App">
      {/* Step 1. */}
      <button onClick={onGetMyUserInfo}>Get my user info from Google</button>
      {user &&
        <div>
          <div>email: {user.email}</div>
          <div>id: {user.id}</div>
          <img src={user.picture} />
        </div>
      }
    </div>
  );
}

export default App;
