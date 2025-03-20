import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../services/cliente-service.service';
import { AlmacenistaService } from '../services/almacenista.service';

@Component({
  selector: 'app-gestion-producto-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './gestion-producto-modal.component.html',
  styleUrls: ['./gestion-producto-modal.component.css']
})
export class GestionProductoModalComponent implements OnInit {
  @Input() producto!: Producto;

  // Activating the 'eliminar' tab by default
  activeTab: string = 'eliminar';

  constructor(
    public activeModal: NgbActiveModal,
    private productoService: AlmacenistaService
  ) { }

  ngOnInit(): void {
    // Default tab is already set in the property declaration
  }

  // Method to close the modal
  cerrarModal(resultado: boolean | string | null): void {
    this.activeModal.close(resultado);
  }

  // Method to confirm deletion
  confirmarEliminacion(): void {
    this.productoService.eliminarProducto(this.producto.codigo_barras)
      .subscribe({
        next: () => this.cerrarModal('eliminado'),
        error: (err: any) => this.mostrarError(err, 'eliminar')
      });
  }

  // Method to change the product status - using the correct service method
    cambiarEstatus(): void {
      // Toggle the current status
      const nuevoEstatus = !this.producto.estatus;

      // Use the correct method from AlmacenistaService
      // Assuming the method is called 'cambiarEstatus'
      this.productoService.cambiarEstatus(this.producto.codigo_barras, nuevoEstatus)
        .subscribe({
          next: () => this.cerrarModal('estatus_cambiado'),
          error: (err: any) => this.mostrarError(err, 'cambiar el estatus de')
        });
    }

  // Helper methods for UI classes
  getAlertClass(): string {
    return this.producto.estatus ? 'alert-warning' : 'alert-info';
  }

  getButtonClass(): string {
    return this.producto.estatus ? 'btn-warning' : 'btn-primary';
  }

  getButtonIcon(): string {
    return this.producto.estatus ? 'fa-ban' : 'fa-check-circle';
  }

  // Method to show errors
  mostrarError(error: any, accion: string): void {
    console.error(`Error al ${accion} el producto:`, error);
    // You could implement more user-friendly error handling here
  }
}
