import React from "react";
import { randomString } from './utils';

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

function App() {
  const [accessToken, ] = React.useState(() => window.localStorage.getItem("google_oauth2_access_token"));

  // Step 2.
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
      scope: "https://www.googleapis.com/auth/drive",
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

  // Step 6.
  const requestToUploadFile = () => {
    const googleOauth2AccessToken = window.localStorage.getItem("google_oauth2_access_token");
    const input = document.getElementById('file_input')

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=media', {
      method: 'POST',
      headers: {
        'Content-Type': input.files[0].type,
        'Content-Length': input.files[0].size,
        'Authorization': 'Bearer ' + googleOauth2AccessToken,
      },
      body: new Blob([input.files[0]]),
    }).then(() => {
      alert('You successfully upload your photo !');
    }).catch(() => {
      alert('Something went wrong');
    });
  };

  return (
    <div className="app">
      <div className="header">Contract Portal</div>
      <div className="body">
        {/* Step 1. */}
        {!accessToken ?
          <button onClick={googleOauth2SignIn}> Authorize to link your google drive </button> :
          <div>
            <div>Upload your contract</div>
            <input type="file" id="file_input" onChange={requestToUploadFile}/>
          </div>
        }
      </div>
      <div className="footer">This is a website for demonstrating OAuth 2.0 Implicit Flow with possible CSRF attack. <a href="https://github.com/barry800414/react-google-oauth-example">Github Repo</a></div>
    </div>

  );
}

export default App;
