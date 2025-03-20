import { TestBed } from '@angular/core/testing';

import { AlmacenistaService } from './almacenista.service';

describe('AlmacenistaService', () => {
  let service: AlmacenistaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlmacenistaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
