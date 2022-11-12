// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  be_root: "http://localhost:8090/jworldcup",
  be_socket: "ws://localhost:15674/ws",
  be_socket_user: "jworldcup",
  be_socket_passcode: "jworldcup",
  //ui_root: `${window.location.protocol}://${window.location.host}`, // http://localhost:4200
  with_credentials: true,
  recaptcha_site_key: "6LcEctMiAAAAAKzVnpnO64slgTWVEpMSkm3_aGC8"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
