import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/models';
import { SessionService } from 'src/app/core/services';

@Directive({ selector: '[appShowAuthed]' })
export class ShowAuthedDirective implements OnInit, OnDestroy {
  constructor(
    private templateRef: TemplateRef<any>,
    private sessionService: SessionService,
    private viewContainer: ViewContainerRef
  ) {}

  private subscriptions: Subscription[] = [];
  private condition: boolean;

  ngOnInit() {
    this.subscriptions.push(this.sessionService.user.subscribe(
      (user: User) => {
        console.log(`show-authed.directive/user: ${JSON.stringify(user)}`);
        this.viewContainer.clear();
        if (this.sessionService.isAuthenticated() && this.condition || !this.sessionService.isAuthenticated() && !this.condition) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      }
    ));
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  @Input() set appShowAuthed(condition: boolean) {
    this.condition = condition;
  }

}
