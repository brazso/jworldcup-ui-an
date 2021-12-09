import { Component, Input, OnInit } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { BackendService } from 'src/app/core/services';
import { GenericResponse } from 'src/app/core/models/common';
import pkg from 'package.json';

@Component({
  selector: 'app-layout-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  today: number = Date.now();

  frontendVersion: string;
  backendVersion: string;

  constructor(
    private translocoService: TranslocoService,
    private backendService: BackendService
    ) {
  }

  ngOnInit(): void {
    // wait until translation is being loaded
    this.translocoService.selectTranslation().subscribe(
      (translation: Translation) => {
        this.setupFrontendBackendVersions();
      }
    );
  }

  private setupFrontendBackendVersions(): void {
    this.frontendVersion = pkg.version;
    this.backendService.getBackendVersion().subscribe(
      (value: GenericResponse<string>) => {
        this.backendVersion = value.data as string;
      }
    );
  }
}
