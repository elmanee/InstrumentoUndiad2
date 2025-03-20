import { TestBed } from '@angular/core/testing';

import { NotificacionServiceService } from './notificacion-service.service';

describe('NotificacionServiceService', () => {
  let service: NotificacionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificacionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
