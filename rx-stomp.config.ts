import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { environment } from 'src/environments/environment';

export const rxStompConfig: RxStompConfig = {
  // Which server?
  brokerURL: environment.be_socket,

  // Headers
  // Typical keys: login, passcode, host
  connectHeaders: {
    login: 'guest',
    passcode: 'guest',
    // "X-XSRF-TOKEN": this.getCookie("XSRF-TOKEN")
  },

  // How often to heartbeat?
  // Interval in milliseconds, set to 0 to disable
  heartbeatIncoming: 0, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  // Wait in milliseconds before attempting auto reconnect
  // Set to 0 to disable
  // Typical value 500 (500 milli seconds)
  reconnectDelay: 200,

  // Will log diagnostics on console
  // It can be quite verbose, not recommended in production
  // Skip this key to stop logging to console
  debug: (msg: string): void => {
    if (!environment.production) {
      console.log(new Date(), msg);
    }
  },

  beforeConnect: (client: RxStomp) : void => {
    console.log(`beforeConnect`);
  },

  logRawCommunication: true
};
