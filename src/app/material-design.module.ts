import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule, MatDialogModule, MatExpansionModule, MatGridListModule,
  MatIconModule,
} from '@angular/material';
import { DialogsService } from './dialogs/dialogs.service';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { MatInputModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { MatRadioModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material';

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
  , MatMenuModule
  , MatRadioModule
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
