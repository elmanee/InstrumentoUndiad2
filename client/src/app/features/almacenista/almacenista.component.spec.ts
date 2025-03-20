import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlmacenistaComponent } from './almacenista.component';

describe('AlmacenistaComponent', () => {
  let component: AlmacenistaComponent;
  let fixture: ComponentFixture<AlmacenistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlmacenistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlmacenistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
