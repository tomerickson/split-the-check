import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MyCurrencyPipe } from './common/custom-currency.pipe';
import { MyCurrencyFormatterDirective } from './common/custom-currency.directive';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
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
