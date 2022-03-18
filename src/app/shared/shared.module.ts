import { NgModule} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

/* Extra */
import { TranslocoModule } from '@ngneat/transloco';
import { TranslocoDatePipe, TranslocoLocaleModule } from '@ngneat/transloco-locale';

/* Prime NG */
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { MenubarModule } from 'primeng/menubar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SlideMenuModule } from 'primeng/slidemenu';
import { TreeModule } from 'primeng/tree';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TreeTableModule } from 'primeng/treetable';
import { FieldsetModule } from 'primeng/fieldset';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { ImageModule } from 'primeng/image';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';

/* Own */
import { TranslocoExDatePipe } from './pipes/transloco-ex-date.pipe';
import { CustomValidator } from './directives/custom-validator.directive';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { CalendarLocaleService } from './services/calendar-locale.service';
import { LoaderService } from './services/loader.service';
import { ModalService } from './services/modal.service';
import { CoreModule } from '../core';
import { ListErrorsComponent } from './list-errors';
import { ShowAuthedDirective } from './directives/show-authed.directive';
import { DropdownPipe } from './pipes/dropdown.pipe';
import { ReplaceLineBreaksPipe } from './pipes/replace-line-breaks.pipe';
import { InputValidationComponent } from './input-validation';
import { InputTrimDirective } from './directives/input-trim.directive';

// import { InputTextComponent } from './input-text/input-text.component';
// import { InputTextAreaComponent } from './input-textarea/input-textarea.component';
// import { DropdownTreeComponent } from './dropdown-tree/dropdown-tree.component';
// import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
// import { InputDateComponent } from './input-date/input-date.component';
// import { ListboxComponent } from './listbox/listbox.component';
// import { DropdownComponent } from './dropdown/dropdown.component';
// import { MultiselectComponent } from './multiselect/multiselect.component';

// registerLocaleData(localeHU);

// const BOOTSTRAP_MODULES = [NgbPopoverModule];

const ANGULAR_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  FlexLayoutModule
];

const PRIMENG_MODULES = [
  AccordionModule,
  CardModule,
  PanelModule,
  ButtonModule,
  RadioButtonModule,
  ToastModule,
  MessageModule,
  MessagesModule,
  TableModule,
  CheckboxModule,
  ToggleButtonModule,
  CalendarModule,
  DropdownModule,
  OverlayPanelModule,
  InputTextModule,
  InputTextareaModule,
  PasswordModule,
  MenubarModule,
  BreadcrumbModule,
  SlideMenuModule,
  TreeModule,
  SidebarModule,
  DynamicDialogModule,
  ConfirmDialogModule,
  TooltipModule,
  ListboxModule,
  MultiSelectModule,
  TreeTableModule,
  FieldsetModule,
  TieredMenuModule,
  ProgressBarModule,
  ImageModule,
  ContextMenuModule,
  InputNumberModule,
  DialogModule,
  AutoCompleteModule
];

const EXTRA_MODULES = [
  TranslocoModule,
  TranslocoLocaleModule
];

 const SHARED_COMPONENTS = [
  ListErrorsComponent,
  InputValidationComponent
 ];

const SHARED_DIRECTIVES = [
   AutoFocusDirective,
   CustomValidator,
   ShowAuthedDirective,
   InputTrimDirective
];

const ANGULAR_PIPES = [
  DatePipe,
  TranslocoDatePipe
];
const SHARED_PIPES = [
  DropdownPipe,
  TranslocoExDatePipe,
  ReplaceLineBreaksPipe
  // EnumPipe,
  // MinuteSecondsPipe
];

const PRIMENG_SERVICES = [
  MessageService, 
  ConfirmationService,
  DialogService, 
  DynamicDialogConfig
];


const SHARED_SERVICES = [
  CalendarLocaleService,
  LoaderService,
  ModalService
];

// const DIALOGS = [
//   JogcimModositasComponent,
// ];

@NgModule({
  imports: [
    CoreModule, // TODO - it should throw error during import
    ANGULAR_MODULES,
    PRIMENG_MODULES,
    EXTRA_MODULES
    // BOOTSTRAP_MODULES
  ],
  exports: [
    ANGULAR_MODULES,
    PRIMENG_MODULES,
    EXTRA_MODULES,
    // BOOTSTRAP_MODULES,
    SHARED_COMPONENTS,
    SHARED_PIPES,
    SHARED_DIRECTIVES,
  ],
  declarations: [
    // DIALOGS,
    SHARED_COMPONENTS,
    SHARED_PIPES,
    SHARED_DIRECTIVES,
  ],
  providers: [
    ANGULAR_PIPES,
    SHARED_PIPES,
    PRIMENG_SERVICES
  ],
  // entryComponents: [
  //   DIALOGS,
  // ],
})

export class SharedModule {/*
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
        ngModule: SharedModule,
        providers: [
          // SHARED_GUARDS,
          PRIMENG_SERVICES,
          SHARED_SERVICES
        ]
    };
  }*/
}
