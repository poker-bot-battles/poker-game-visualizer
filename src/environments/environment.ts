// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const baseUrl = 'https://api.pokerbot.dk';

export const environment = {
  production: false,
  dataEndpoint: `${baseUrl}/data/`, // testrunde1/run-20220424-214441-0.json
  timeEndpoint: `${baseUrl}/get-time`,
  botEndpoint: `${baseUrl}/bots/`,
  reconnectInterval: 2000,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
