import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';

@NgModule({
  imports: [
    SharedModule,
    ChatRoutingModule
  ],
  declarations: [
    ChatComponent
  ]
})
export class ChatModule { }
