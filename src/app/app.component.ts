import {Component} from "@angular/core";
import {Header} from "./model/";
import {OrderService} from "./order.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})

export class AppComponent {
  /* data to model */
  header: Header;
  changeBasis: number;
  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  constructor(public service: OrderService) {
    this.header = service.getHeader();
    this.changeBasis = this.header.changeBasis;
  }

}
