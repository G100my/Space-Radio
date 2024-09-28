const GeneralErrors = {
  BAD_REQUEST: 'Bad request',
  INVALID_QUERY: 'Invalid query',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Not found',
}

const DbRefErrors = {
  SPACE_NOT_FOUND: 'Space not found',
  SITE_NOT_FOUND: 'Site not found',
}

const AuthErrors = {
  NO_AUTHORIZATION_HEADER: 'No Authorization header',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN_EMAIL: 'Invalid token email',
  INVALID_TOKEN_SIGNATURE: 'Invalid token signature',
  FAILED_TO_VERIFY_TOKEN: 'Failed to verify token',
  NO_TOKEN: 'No token',
}

const SpotifyErrors = {
  NO_ACTIVE_DEVICE: 'No active device',
  FAILED_TO_ADD_QUEUE: 'Failed to add queue to current host',
}

export default {
  GENERAL: GeneralErrors,
  AUTH: AuthErrors,
  SPOTIFY: SpotifyErrors,
  DB_REF: DbRefErrors,
}
