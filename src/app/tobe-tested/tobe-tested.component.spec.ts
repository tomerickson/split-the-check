import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TobeTestedComponent } from './tobe-tested.component';

describe('TobeTestedComponent', () => {
  let component: TobeTestedComponent;
  let fixture: ComponentFixture<TobeTestedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TobeTestedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TobeTestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
