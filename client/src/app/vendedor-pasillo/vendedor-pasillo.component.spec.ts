import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendedorPasilloComponent } from './vendedor-pasillo.component';

describe('VendedorPasilloComponent', () => {
  let component: VendedorPasilloComponent;
  let fixture: ComponentFixture<VendedorPasilloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendedorPasilloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendedorPasilloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
