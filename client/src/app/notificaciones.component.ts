// notificaciones.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificacionService, Notificacion } from './services/notificacion-service.service';

@Component({
  selector: 'app-notificaciones',
  template: `
    <div class="notificaciones-container">
      <div *ngFor="let notificacion of notificaciones"
           class="alert alert-{{notificacion.tipo}} alert-dismissible fade show"
           role="alert">
        {{notificacion.mensaje}}
        <button type="button" class="btn-close" (click)="cerrarNotificacion(notificacion.id)" aria-label="Cerrar"></button>
      </div>
    </div>
  `,
  styles: [`
    .notificaciones-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
    }

    .alert {
      margin-bottom: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in;
    }

    .alert-success {
      border-left: 4px solid #198754;
    }

    .alert-danger {
      border-left: 4px solid #dc3545;
    }

    .alert-warning {
      border-left: 4px solid #ffc107;
    }

    .alert-info {
      border-left: 4px solid #0dcaf0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 576px) {
      .notificaciones-container {
        left: 10px;
        right: 10px;
        max-width: calc(100% - 20px);
      }
    }
  `]
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  private subscription: Subscription | null = null;

  constructor(private notificacionService: NotificacionService) { }

  ngOnInit(): void {
    this.subscription = this.notificacionService.notificaciones$.subscribe(
      notificaciones => {
        this.notificaciones = notificaciones;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  cerrarNotificacion(id: number): void {
    this.notificacionService.eliminarNotificacion(id);
  }
}
