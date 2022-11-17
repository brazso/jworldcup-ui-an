export const environment = {
  production: true,
  be_root: "https://worldcup.zematix.hu/jworldcup-api",
  be_socket: "wss://worldcup.zematix.hu/ws",
  be_socket_user: "jworldcup",
  be_socket_passcode: "jworldcup", // being overwritten in docker/frontend/Dockerfile but it is still a security hole!
  with_credentials: true,
  recaptcha_site_key: "6LcEctMiAAAAAKzVnpnO64slgTWVEpMSkm3_aGC8"
};
