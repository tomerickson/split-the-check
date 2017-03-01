import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {MaterialModule} from "@angular/material";
import "hammerjs";
import {MyCurrencyPipe} from "./common/custom-currency.pipe";
import {MyCurrencyFormatterDirective} from "./common/custom-currency.directive";
import {AppComponent} from "./app.component";
import {OrderListComponent} from "./order-list.component";
import {OrderComponent} from "./order.component";
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
    MaterialModule],

  providers: [MyCurrencyPipe, OrderService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
