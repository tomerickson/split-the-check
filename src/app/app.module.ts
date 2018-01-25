import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'
import { MaterialDesignModule } from './material-design.module';
import { AppComponent } from './app.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderComponent } from './order/order.component';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemComponent } from './item/item.component';
import { OrderTotalsComponent } from './order-totals/order-totals.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database'
import { DataStoreService } from './data-store/data-store.service';
import { DataProviderService } from './data-provider/data-provider.service';
import { ValidationService } from './validation.service';
import { SettingsComponent } from './settings/settings.component';
import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { InputComponent } from './input/input.component';
import { TestComponent } from './test.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { TobeTestedComponent } from './tobe-tested/tobe-tested.component';
import { Helpers, Session } from './model';

export const appRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'test',
    component: TestComponent
  },
  {
    path: '', redirectTo: '/home', pathMatch: 'full'
  }
];

export function initializer(service: DataStoreService) {
  return () => service.initialize();
}

@NgModule({

  declarations: [
    AppComponent,
    OrderListComponent,
    OrderComponent,
    ItemListComponent,
    ItemComponent,
    OrderTotalsComponent,
    SettingsComponent,
    TestComponent,
    ControlMessagesComponent,
    InputComponent,
    HeaderComponent,
    HomeComponent,
    TobeTestedComponent
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // RouterModule.forRoot(appRoutes, {enableTracing: true}),
    MaterialDesignModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule],

  providers: [DataStoreService, DataProviderService, Helpers, ValidationService],

  bootstrap: [AppComponent]
})
export class AppModule {
}

