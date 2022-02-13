
export const randomString = () => {
    // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    const length = 64;
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const generateCodeVerifierAndCodeChallenge = async (codeChallengeMethod) => {
    if (codeChallengeMethod !== 'S256') {
        return {};
    }
    const codeVerifier = randomString();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge };
}

async function generateCodeChallenge(codeVerifier) {
    var digest = await crypto.subtle.digest("SHA-256",
      new TextEncoder().encode(codeVerifier));

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

// Parse hash string
// ref: https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow?hl=en#oauth-2.0-endpoints_2
export const parseURLHash = () => {
    const fragmentString = location.hash.substring(1);
    const params = {};
    const regex = /([^&=]+)=([^&]*)/g
    let m = regex.exec(fragmentString);
    while (m) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      m = regex.exec(fragmentString);
    }
    return params;
}