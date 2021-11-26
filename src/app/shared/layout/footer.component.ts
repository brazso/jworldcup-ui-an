import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  today: number = Date.now();

  @Input() frontendVersion: string;
  @Input() backendVersion: string;

  ngOnInit(): void {
  }


}
