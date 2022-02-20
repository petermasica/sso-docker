const kerberos = require('kerberos');
const ActiveDirectory = require('activedirectory');

const getGroupMembershipForUser = require('./getGroupMembershipForUser');

/**
 * This is a Kerberos based Single Sign On middleware initializer
 * The middleware will authenticate a user via their SPNEGO
 * and pass the username and groups the user belongs to
 * on to the req object under the 'AD' property
 *
 * @param config Information needed for Active Directory & Kerberos connection configuration
 * @param config.url The url of AD server, e.g. 'ldap://DC01.lab.local'
 * @param config.baseDN AD domain, such as 'dc=lab,dc=local'
 * @param config.username Username followed by domain name, such as 'web@lab.local'
 * @param config.password Password, e.g. 'Admin123'
 * @param config.service Service name, e.g. 'HTTP@web.lab.local'
 */
const initializeSSOMiddleware =
  config => async (req, res, next) => {
    try {
      console.log('* sso middleware *');
      const { authorization } = req.headers;
      console.log('* authorization *', authorization);

      // If authorization header doesn't exist, return with WWWW-Authenticate Negotiate.
      // This will get the browser to automatically respond with a SPNEGO ticket, if the
      // browser is chrome then the service may need to be whitelisted, as it won't return
      // a SPNEGO ticket by default.
      if (!authorization) {
        res.set('WWW-Authenticate', 'Negotiate');
        return res.status(401).send();
      }

      // Gets our SPNEGO ticket
      const ticket = authorization.substring(10);

      // Starts the server side kerberos authentication context
      const server = await kerberos.initializeServer(
        config.service
      );
      console.log('* server *', server);

      // Performs the authentication using the SPNEGO ticket & the configured kerberos keytab
      await server.step(ticket);

      const { username } = server;
      const activeDirectory = new ActiveDirectory(config);

      // Retrieves groups the user belongs to
      const groups = await getGroupMembershipForUser(
        username,
        activeDirectory
      );

      // Passes the data
      req.AD = { groups, username };

      next();
    } catch (err) {
      console.error('Something failed: ' + err);
      res.status(403).send();
    }
  };

module.exports = initializeSSOMiddleware;
