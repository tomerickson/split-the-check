import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() showIntro;
  iconClass: string;

  constructor(public service: DataStoreService) {
    console.log('enter header.constructor');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }


  toggleIntro(value) {
    this.service.showIntro = value;
    console.log('exiting header.toggleIntro');
  }
}
