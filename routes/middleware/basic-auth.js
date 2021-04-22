/**
 * basicAuth 中间件
 */
export function basicAuth(req, res, next) {

  const auth = { login: 'admin', password: 'password' } // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, pwd] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && pwd && login === auth.login && pwd === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message
}
