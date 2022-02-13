import React from "react";
import { randomString } from './utils';

/**
 *
 * Step 1. Send authorization request to google for asking user to login google & give consent to access user's email.
 * Step 2. User login to google and give consent to access user's email.
 * Step 3. Google redirects browser to callback url, and send back access token.
 * Step 4. We get access token, store it into localStorage, and use it to get user's email.
 *
 */

function App() {
  const [user, setMyUser] = React.useState(null);

  // Step 1.
  const googleOauth2SignIn = () => {
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

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: document.location.origin + "/callback",
      scope: "https://www.googleapis.com/auth/userinfo.email",
      state,
      response_type: "token",
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

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  };

  // Step 4.
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

  const onGetMyUserInfo = () => {
    const googleOauth2AccessToken = window.localStorage.getItem("google_oauth2_access_token");
    if (!googleOauth2AccessToken) {
      googleOauth2SignIn();
    } else {
      requestToGetMyUserInfo();
    }
  };

  return (
    <div className="App">
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
