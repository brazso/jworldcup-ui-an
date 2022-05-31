import { RxStompService } from './rx-stomp.service';
import { rxStompConfig } from 'rx-stomp.config';

export function rxStompServiceFactory() {
  const rxStompService = new RxStompService();
  rxStompService.stompErrors$.subscribe(res => { 
    console.log(`rx-stomp-service-faxtory/res: ${JSON.stringify(res)}`)
  });
  rxStompService.configure(rxStompConfig);
  rxStompService.activate();
  console.log(`rx-stomp-service-faxtory/active: ${rxStompService.active}`);
  console.log(`rx-stomp-service-faxtory/connected: ${rxStompService.connected()}`);

  return rxStompService;
}
