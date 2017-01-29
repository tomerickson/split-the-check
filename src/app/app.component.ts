import {Component} from "@angular/core";
import {Header} from "./model/";
import {ChangeBasis} from "./model/change-basis";
import {TipBasis} from "./model/tip-basis";
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

  /* Tip Basis dropdown values */
  tipBases: Array<TipBasis> = [{value: 0, description: 'Gross'},
    {value: 1, description: 'Net'}];

  /* Change Basis dropdown values */

  changeBases: Array<ChangeBasis> = [{value: .01, description: 'Penny'},
    {value: .05, description: 'Nickel'},
    {value: .10, description: 'Dime'},
    {value: .25, description: 'Quarter'},
    {value: 1, description: 'Dollar'}]

  tipValues: any;

  constructor(service: OrderService) {
    this.header = service.getHeader();
    this.changeBasis = this.header.changeBasis;
  }

  reCalc(event: any) {
    console.log('recalc!' + this.header.changeBasis);
    console.log(event);
  }
}
