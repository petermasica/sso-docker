const express = require('express');

const initializeSSOMiddleware = require('./src/sso');

const PORT = 3000;

const app = express();

const sso = initializeSSOMiddleware({
  url: 'ldap://openldap',
  baseDN: 'dc=lab,dc=local',
  username: 'cn=admin,dc=lab,dc=local',
  password: 'admin',
  service: 'HTTP@web.lab.local',
});

// Your login endpoint where you authenticate using Kerberos against Active Directory
// and ideally issue your own token, so that you don't contact AD for every single api call
app.get('/login', sso, (req, res) => {
  const { AD } = req;

  console.log('* AD data *', AD);

  res.status(200).send("SSO Test - You're Logged In! :)");
});

app.listen(PORT, () => {
  console.log(`The server is listening on port ${PORT}`);
});
