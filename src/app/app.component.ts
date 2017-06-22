import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent {
  showIntro: boolean;

  constructor() {
    this.showIntro = true;
  }

  toggleIntro() {
    this.showIntro = !this.showIntro;
  }
}


