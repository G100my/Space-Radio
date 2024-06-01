import type { AuthParams } from 'shared'

export function generateAuthParams(path: string): AuthParams {
  return {
    client_id: import.meta.env.VITE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_BASE_URI + path,
  }
}
