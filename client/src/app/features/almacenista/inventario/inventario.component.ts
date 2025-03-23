import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlmacenistaService, Producto } from '../../../services/almacenista.service';
import { NgbModal, NgbDate, NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule, NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbModalModule,
    NgbDatepickerModule
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  // Lista de productos
  productos: Producto[] = [];

  // Estado de carga
  cargando: boolean = true;

  // Mensaje de error
  error: string | null = null;

  //modal de eliminacion
  productoSeleccionado: Producto | any = null;
  confirmacionEliminar = false;
  status = '';
  activeTab = 'eliminar';

  //variables para modal de edicion
  productoSeleccionados: Producto | null = null;
  activeTabEdicion = 'precio'; // 'precio' o 'almacen'
  nuevoPrecio: number | undefined = 0;
  nuevoRelleno: number = 0;

  fechaCaducidadStr: string = '';
  minFechaCaducidadStr: string = '';

  constructor(
    private almacenistaService: AlmacenistaService,
    private modalService: NgbModal,
  ) {
    const hoy = new Date();
  const minFecha = new Date();
  minFecha.setDate(hoy.getDate() + 15);

  // Convertir a formato string YYYY-MM-DD para input type="date"
  this.minFechaCaducidadStr = minFecha.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarProductos();
  }



  // Método para cargar los productos
  cargarProductos(): void {
    this.cargando = true;
    this.error = null;

    this.almacenistaService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
        console.log(data)
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'Error al cargar los productos. Por favor, intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  // Método para formatear correctamente la URL de la imagen
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    // Eliminar comillas al principio y al final si existen
    let cleanPath = imagePath.replace(/^\"|\"$/g, '');

    // Asegúrate de que la ruta comience con "/" si no lo hace
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    return cleanPath;
  }

// Método para abrir el modal con NgbModal
abrirModalEliminar(producto: any, contenidoModal: any): void {
  this.productoSeleccionado = producto;
  this.confirmacionEliminar = false;
  this.status = producto.estatus || 'activo';
  this.activeTab = 'eliminar';

  // Abrir el modal
  this.modalService.open(contenidoModal, {
    centered: true,
    backdrop: 'static'
  });
}

// Método para cambiar de tab
cambiarTab(tab: string): void {
  this.activeTab = tab;
}

// Método para confirmar eliminación
confirmarEliminar(): void {
  if (this.confirmacionEliminar && this.productoSeleccionado) {
    this.almacenistaService.eliminarProducto(this.productoSeleccionado.codigo_barras).subscribe({
      next: () => {
        // Actualizar la lista de productos
        this.productos = this.productos.filter(p => p.codigo_barras !== this.productoSeleccionado.codigo_barras);

        // Cerrar el modal
        this.modalService.dismissAll();

        // Mostrar mensaje
        alert('Producto eliminado con éxito');
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
        alert('Error al eliminar el producto');
      }
    });
  }
}

// Método para confirmar cambio de estatus
confirmarCambioEstatus(): void {
  if (this.productoSeleccionado && this.status && this.productoSeleccionado.estatus !== this.status) {
    this.almacenistaService.cambiarEstatus(this.productoSeleccionado.codigo_barras, this.status).subscribe({
      next: (response) => {
        // Actualizar el producto en la lista
        const index = this.productos.findIndex(p => p.codigo_barras === this.productoSeleccionado.codigo_barras);
        if (index !== -1) {
          this.productos[index].estatus = this.status;
        }

        // Cerrar el modal
        this.modalService.dismissAll();

        // Mostrar mensaje
        alert('Estatus del producto actualizado con éxito');
      },
      error: (err) => {
        console.error('Error al cambiar estatus del producto:', err);
        alert('Error al cambiar el estatus del producto');
      }
    });
  }
}
  // MODAL DE EDICIÓN
  abrirModalEdicion(producto: Producto, contenidoModal: any): void {
    this.productoSeleccionado = producto;
    this.nuevoPrecio = 0 ;
    this.nuevoRelleno = 0;
    this.fechaCaducidadStr = '';
    this.activeTabEdicion = 'precio';

    // Abrir el modal
    this.modalService.open(contenidoModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  cambiarTabEdicion(tab: string): void {
    this.activeTabEdicion = tab;
  }

  actualizarPrecio(): void {
    if (!this.productoSeleccionado || !this.nuevoPrecio || this.nuevoPrecio <= 0) {
      console.error('Datos inválidos para actualizar precio');
      return;
    }

    // Verificar que el precio haya cambiado
    if (this.nuevoPrecio === this.productoSeleccionado.precio_pieza) {
      console.log('El precio no ha cambiado');
      return;
    }


    // Llamar al servicio para actualizar el precio
    this.almacenistaService.actualizarProducto(
      this.productoSeleccionado.codigo_barras,
      { nuevo_precio: this.nuevoPrecio }
    ).subscribe({
      next: (response) => {
        console.log('Precio actualizado:', response);

        // Actualizar el producto en la lista
        const index = this.productos.findIndex(p => p.codigo_barras === this.productoSeleccionado?.codigo_barras);
        if (index !== -1) {
          this.productos[index].precio_pieza = this.nuevoPrecio;
        }

        // Cerrar el modal
        this.modalService.dismissAll();

        // Mostrar mensaje
        alert('Precio actualizado con éxito');
      },
      error: (err) => {
        console.error('Error al actualizar precio:', err);
        alert('Error al actualizar el precio: ' + (err.error?.message || err.message));
      }
    });
  }

  actualizarExistencias(): void {
    if (!this.productoSeleccionado || !this.nuevoRelleno || this.nuevoRelleno <= 0 || !this.fechaCaducidadStr) {
      console.error('Datos inválidos para actualizar existencias');
      return;
    }

    // Convertir string a Date
    const fechaObj = new Date(this.fechaCaducidadStr);

    console.log(`Actualizando existencias del producto ${this.productoSeleccionado.codigo_barras}`);
    console.log(`Cantidad: ${this.nuevoRelleno}, Fecha Caducidad:`, fechaObj);

    // Llamar al servicio para actualizar existencias
    this.almacenistaService.actualizarExistencias(
      this.productoSeleccionado.codigo_barras,
      this.nuevoRelleno,
      fechaObj
    ).subscribe({
      next: (response) => {
        console.log('Existencias actualizadas:', response);

        // Actualizar el producto en la lista
        const index = this.productos.findIndex(p => p.codigo_barras === this.productoSeleccionado?.codigo_barras);
        if (index !== -1) {
          this.productos[index].existencia_almacen = response.producto_actualizado.existencia_almacen;
        }

        // Cerrar el modal
        this.modalService.dismissAll();

        // Mostrar mensaje
        alert('Existencias actualizadas con éxito');
      },
      error: (err) => {
        console.error('Error al actualizar existencias:', err);
        alert('Error al actualizar existencias: ' + (err.error?.message || err.message));
      }
    });
  }

}
