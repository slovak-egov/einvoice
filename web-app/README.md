# E-invoice web UI

## Development

Set env vars (e.g. in `client/.env`), e.g.
```text
REACT_APP_APISERVER_URL=http://localhost:8081
REACT_APP_UPVS_LOGIN_URL=https://dev.upvs.einvoice.mfsr.sk/login?callback=http://localhost:3000/login-callback
REACT_APP_LOGOUT_CALLBACK_URL=http://localhost:3000/logout-callback
```

Then run hot server.
```shell script
cd client
npm install
npm start
```
