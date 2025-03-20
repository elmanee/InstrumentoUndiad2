// notificacion-service.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notificacion {
  tipo: 'success' | 'danger' | 'warning' | 'info';
  mensaje: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificaciones: Notificacion[] = [];
  private notificacionesSubject = new Subject<Notificacion[]>();
  private contador = 0;

  notificaciones$ = this.notificacionesSubject.asObservable();

  constructor() { }

  /**
   * Muestra un mensaje de éxito.
   * @param mensaje El mensaje a mostrar
   */
  mostrarExito(mensaje: string): void {
    this.agregarNotificacion('success', mensaje);
  }

  /**
   * Muestra un mensaje de error.
   * @param mensaje El mensaje a mostrar
   */
  mostrarError(mensaje: string): void {
    this.agregarNotificacion('danger', mensaje);
  }

  /**
   * Muestra un mensaje de información.
   * @param mensaje El mensaje a mostrar
   */
  mostrarInfo(mensaje: string): void {
    this.agregarNotificacion('info', mensaje);
  }

  /**
   * Muestra un mensaje de advertencia.
   * @param mensaje El mensaje a mostrar
   */
  mostrarAdvertencia(mensaje: string): void {
    this.agregarNotificacion('warning', mensaje);
  }

  /**
   * Elimina una notificación por su ID.
   * @param id ID de la notificación a eliminar
   */
  eliminarNotificacion(id: number): void {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.notificacionesSubject.next(this.notificaciones);
  }

  private agregarNotificacion(tipo: 'success' | 'danger' | 'warning' | 'info', mensaje: string): void {
    const id = ++this.contador;
    const notificacion: Notificacion = { tipo, mensaje, id };
    this.notificaciones.push(notificacion);
    this.notificacionesSubject.next(this.notificaciones);

    // Auto-eliminar después de cierto tiempo
    setTimeout(() => {
      this.eliminarNotificacion(id);
    }, 5000);
  }
}
