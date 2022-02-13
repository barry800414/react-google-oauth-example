
export const randomString = () => {
    if (window.crypto) {
        return crypto.randomUUID();
    } else {
        // https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
        const length = 32;
        let result           = '';
        const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
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