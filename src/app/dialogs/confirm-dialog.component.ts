import { MatDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `<h2 matDialogTitle>{{title}}</h2>
      <div mat-dialog-content [innerHTML]="message"></div>
      <div mat-dialog-actions>
        <button matDialogClose mat-raised-button
                (click)="dialogRef.close(true)">OK
        </button>
        <button mat-button
                (click)="dialogRef.close()">Cancel
        </button>
      </div>`,
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  public title: string;
  public message: string;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {

  }
}
