import {Component} from '@angular/core';
import {DataStoreService} from "./data-store/data-store.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  service: DataStoreService;
  showIntro: boolean;

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  toggleIntro() {
    this.showIntro = !this.showIntro;
    this.service.toggleShowIntro(this.showIntro);
  }
}


