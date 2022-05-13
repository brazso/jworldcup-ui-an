import { RxStompService } from './rx-stomp.service';
import { rxStompConfig } from 'rx-stomp.config';

export function rxStompServiceFactory() {
  const rxStompService = new RxStompService();
  rxStompService.stompErrors$.subscribe(res => { 
    console.log(`res: ${JSON.stringify(res)}`)
  });
  rxStompService.configure(rxStompConfig);
  rxStompService.activate();
  console.log(`rxStompServiceFactory: active: ${rxStompService.active}`);
  console.log(`rxStompServiceFactory: connected: ${rxStompService.connected()}`);

  return rxStompService;
}
