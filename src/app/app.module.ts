import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MyCurrencyPipe } from './common/custom-currency.pipe';
import { MyCurrencyFormatterDirective } from './common/custom-currency.directive';
import { AppComponent } from './app.component';
import { OrderListComponent } from './order-list.component';
import { OrderComponent } from './order.component'

@NgModule({
  declarations: [
    AppComponent,
    OrderListComponent,
    OrderComponent,
    MyCurrencyPipe,
    MyCurrencyFormatterDirective],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],

  providers: [MyCurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
