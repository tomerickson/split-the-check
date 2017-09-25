import { MdDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `<h2 md-dialog-title>{{title}}</h2>
      <div mat-dialog-content [innerHTML]="message"></div>
      <div mat-dialog-actions>
        <button md-dialog-close md-raised-button
                (click)="dialogRef.close(true)">OK
        </button>
        <button md-button
                (click)="dialogRef.close()">Cancel
        </button>
      </div>`,
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  public title: string;
  public message: string;

  constructor(public dialogRef: MdDialogRef<ConfirmDialogComponent>) {

  }
}
