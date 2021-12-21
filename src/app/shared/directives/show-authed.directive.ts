import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { User } from 'src/app/core/models';
import { SessionService } from 'src/app/core/services';

@Directive({ selector: '[appShowAuthed]' })
export class ShowAuthedDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private sessionService: SessionService,
    private viewContainer: ViewContainerRef
  ) {}

  condition: boolean;

  ngOnInit() {
    this.sessionService.user.subscribe(
      (user: User) => {
        console.log(`user: ${JSON.stringify(user)}`);
        if (this.sessionService.isAuthenticated() && this.condition || !this.sessionService.isAuthenticated() && !this.condition) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
        else {
          this.viewContainer.clear();
        }
      }
    );
  }

  @Input() set appShowAuthed(condition: boolean) {
    this.condition = condition;
  }

}
