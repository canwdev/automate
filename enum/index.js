const serviceInitTime = new Date().getTime()

module.exports = {
  serviceInitTime,
  JWT_TOKEN: 'token_secret_j3478n68o23ui',
  JWT_TOKEN_EXPIRE: '7 days',
  CODE_TOKEN_EXPIRE: -900,
  CODE_CLIENT_FORBIDDEN: 403,
}
