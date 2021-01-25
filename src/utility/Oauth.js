const getImplicitGrantToken = function () {
  // var stateKey = 'spotify_auth_state';
  var client_id = import.meta.env.VITE_CLIENT_ID
  // fix me
  var redirect_uri = 'http://localhost:3000/'

  // localStorage.setItem(stateKey);
  var scope = `user-top-read user-read-private user-read-email user-modify-playback-state user-read-currently-playing user-read-playback-state user-read-playback-position streaming`

  // var state = window.location.hash

  var url = 'https://accounts.spotify.com/authorize'
  url += '?response_type=token'
  url += '&client_id=' + encodeURIComponent(client_id)
  url += '&scope=' + encodeURIComponent(scope)
  url += '&redirect_uri=' + encodeURIComponent(redirect_uri)
  // url += '&state=' + encodeURIComponent(state.substring(1))

  window.location = url
}

export { getImplicitGrantToken }
