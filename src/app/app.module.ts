import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import "hammerjs";
import {AppComponent} from "./app.component";
import {OrderListComponent} from "./order-list/order-list.component";
import {OrderComponent} from "./order/order.component";
import {ItemListComponent} from "./item-list/item-list.component";
import {ItemComponent} from "./item/item.component";
import {OrderTotalsComponent} from './order-totals/order-totals.component';
import {SelectOnFocusDirective} from "./selectonfocus.directive";
import {environment} from "../environments/environment";
import {AngularFireModule} from "angularfire2";
import {AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireDatabaseModule} from "angularfire2/database"
import {DataProviderService} from "./data-provider/data-provider.service";
import { MockComponent } from './mock/mock.component';
import {DataStoreService} from "./data-store/data-store.service";

@NgModule({

  declarations: [
    AppComponent,
    OrderListComponent,
    OrderComponent,
    ItemListComponent,
    ItemComponent,
    OrderTotalsComponent,
    MockComponent],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],


  providers: [DataStoreService, DataProviderService, SelectOnFocusDirective],
  bootstrap: [/*MockComponent*/ AppComponent]
})
export class AppModule {
}
