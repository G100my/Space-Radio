import type { AuthParams } from 'shared'

/**
 *
 * @param hash start with '#'
 * @returns
 */
export function generateAuthParams(hash: string): AuthParams {
  return {
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_BASE_URI + hash,
  }
}
