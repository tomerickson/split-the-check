import { MdDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <md-card>
      <md-card-header>
        <p>{{ title }}</p>
      </md-card-header>
      <md-card-content>
        <p [innerHTML]="message"></p>
        <button type="button" md-raised-button
                (click)="dialogRef.close(true)">OK
        </button>
        <button type="button" md-button
                (click)="dialogRef.close()">Cancel
        </button>
      </md-card-content>
    </md-card>`,
})
export class ConfirmDialogComponent {

  public title: string;
  public message: string;

  constructor(public dialogRef: MdDialogRef<ConfirmDialogComponent>) {

  }
}
