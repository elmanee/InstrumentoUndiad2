import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionStockComponentComponent } from './notificacion-stock-component.component';

describe('NotificacionStockComponentComponent', () => {
  let component: NotificacionStockComponentComponent;
  let fixture: ComponentFixture<NotificacionStockComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificacionStockComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificacionStockComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
