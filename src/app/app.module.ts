import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {AppComponent} from "./app.component";
import {OrderListComponent} from "./order-list/order-list.component";
import {OrderComponent} from "./order/order.component";
import {ItemListComponent} from "./item-list/item-list.component";
import {ItemComponent} from "./item/item.component";
import {OrderTotalsComponent} from './order-totals/order-totals.component';
import {environment} from "../environments/environment";
import {AngularFireModule} from "angularfire2";
import {AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireDatabaseModule} from "angularfire2/database"
import {DataStoreService} from "./data-store/data-store.service";
import {DataProviderService} from "./data-provider/data-provider.service";
import {OrderService} from "./order-service/order-service.service";
import { SettingsComponent } from './settings/settings.component';
// import { MockComponent } from './mock/mock.component';

@NgModule({

  declarations: [
    AppComponent,
    OrderListComponent,
    OrderComponent,
    ItemListComponent,
    ItemComponent,
    OrderTotalsComponent,
    SettingsComponent
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule],


  providers: [DataStoreService, DataProviderService, OrderService],
  bootstrap: [/*MockComponent,*/ AppComponent]
})
export class AppModule {
}
