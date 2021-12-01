import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { User, UserService } from 'src/app/core';

@Directive({ selector: '[appShowAuthed]' })
export class ShowAuthedDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private userService: UserService,
    private viewContainer: ViewContainerRef
  ) {}

  condition: boolean;

  ngOnInit() {
    this.userService.user.subscribe(
      (user: User) => {
        if (this.userService.isAuthenticated() && this.condition || !this.userService.isAuthenticated() && !this.condition) {
          // console.log(`hello: this.userService.getUser()=${JSON.stringify(this.userService.getUser())}`)
          // console.log(`hello: this.userService.isAuthenticated()=${this.userService.isAuthenticated()}`);
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      }
    );
  }

  @Input() set appShowAuthed(condition: boolean) {
    this.condition = condition;
  }

}
