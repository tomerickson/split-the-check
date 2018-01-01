import { } from 'jasmine';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';
import { DataProviderService } from './data-provider.service';
import { AngularFireModule } from 'angularfire2';
import { environment } from '../../environments/environment';
import { AngularFireAuthModule } from 'angularfire2/auth';

describe('DataProviderService', () => {

    let db: AngularFireDatabase = null;
    let service: DataProviderService = null;

    beforeAll(() => {

        TestBed.configureTestingModule({
            imports: [
                AngularFireModule.initializeApp(environment.firebaseConfig),
                AngularFireAuthModule,
                AngularFireDatabaseModule
            ],
            providers: [DataProviderService, {
                provide: AngularFireDatabase
            }]

        })
        .compileComponents();

        service = new DataProviderService(TestBed.get('provider', AngularFireDatabase));
        inject([DataProviderService, AngularFireDatabase], (svc: DataProviderService) => {
            db = service.db;
            service = svc;
        });
    });

    beforeEach(() => {
    });

    it('the service should exist', () => {
        expect(service).toBeTruthy();
    });
    /*
    it('should instantiate the service', inject([DataProviderService, AngularFireDatabase],
        (service: DataProviderService) => {
            this.service = service;
            expect<any>(service).toBeTruthy();
        }));

       //  it('should return an Observable<any[]>', inject([]))*/
});
