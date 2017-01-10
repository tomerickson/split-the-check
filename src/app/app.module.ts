import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DecimalFormatter } from './common/decimal-pipe.directive';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    DecimalFormatter],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
