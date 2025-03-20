import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProductoModalComponent } from './gestion-producto-modal.component';

describe('GestionProductoModalComponent', () => {
  let component: GestionProductoModalComponent;
  let fixture: ComponentFixture<GestionProductoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionProductoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProductoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
