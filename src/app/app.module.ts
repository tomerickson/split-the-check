import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import { NgbModule} from "@ng-bootstrap/ng-bootstrap";
import "hammerjs";
import {MyCurrencyPipe} from "./common/custom-currency.pipe";
import {MyCurrencyFormatterDirective} from "./common/custom-currency.directive";
import {AppComponent} from "./app.component";
import {OrderListComponent} from "./order-list.component";
import {OrderComponent} from "./order.component";
import {HeaderService} from "./header.service";
import {OrderService} from "./order.service";
import {ItemListComponent} from "./item-list.component";
import {ItemComponent} from "./item.component";
import { OrderTotalsComponent } from './order-totals/order-totals.component';

@NgModule({
  declarations: [
    AppComponent,
    OrderListComponent,
    OrderComponent,
    ItemListComponent,
    ItemComponent,
    MyCurrencyPipe,
    MyCurrencyFormatterDirective,
    OrderTotalsComponent],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
  NgbModule.forRoot()],

  providers: [MyCurrencyPipe, HeaderService, OrderService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
