import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatRadioModule,
  MatTabsModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';
import { DialogsService } from './dialogs/dialogs.service';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

const MATERIAL_MODULES = [
  CommonModule
  , MatButtonModule
  , MatCardModule
  , MatChipsModule
  , MatDialogModule
  , MatExpansionModule
  , MatGridListModule
  , MatIconModule
  , MatInputModule
  , MatListModule
  , MatMenuModule
  , MatRadioModule
  , MatTabsModule
  , MatTableModule
  , MatToolbarModule
  , MatTooltipModule
];

@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
  declarations: [ConfirmDialogComponent, SafeHtmlPipe],
  providers: [DialogsService],
  entryComponents: [ConfirmDialogComponent]
})

export class MaterialDesignModule {
}
