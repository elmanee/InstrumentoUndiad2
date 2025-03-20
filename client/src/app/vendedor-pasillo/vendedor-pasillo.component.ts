import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../services/prodcuto-service.service';
import { NotificacionService } from '../services/notificacion-service.service';
import { Producto } from '../models/Producto';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-vendedor-pasillo',
  standalone: false,
  templateUrl: './vendedor-pasillo.component.html',
  styleUrl: './vendedor-pasillo.component.css'
})
export class VendedorPasilloComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  productoSeleccionado: any = null;
  searchTerm: string = '';
  filtroEstatus: string = 'todos';

  // Modal
  private modalEdicion: any;

  constructor(
    private productoService: ProductoService,
    private notificacionService: NotificacionService
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.notificacionService.mostrarError('No se pudieron cargar los productos');
      }
    });
  }

  getImageUrl(imagePath: string): string {
    // If the path already starts with '/', return as is
    if (imagePath && imagePath.startsWith('/')) {
      return imagePath;
    }
    // Otherwise, ensure it has a leading slash
    return imagePath ? `/${imagePath}` : '';
  }

  aplicarFiltros(): void {
    // Filtrar por estatus
    let resultados = [...this.productos];

    if (this.filtroEstatus === 'activo') {
      resultados = resultados.filter(p => p.estatus === 'activo');
    } else if (this.filtroEstatus === 'inactivo') {
      resultados = resultados.filter(p => p.estatus === 'inactivo');
    }

    // Búsqueda por término
    if (this.searchTerm?.trim()) {
      const termino = this.searchTerm.toLowerCase();
      resultados = resultados.filter(p =>
        p.nombre_producto?.toLowerCase().includes(termino) ||
        p.codigo_barras?.toLowerCase().includes(termino)
      );
    }

    this.productosFiltrados = resultados;
  }

  abrirModalEdicion(producto: any): void {
    this.productoSeleccionado = { ...producto };

    const modalElement = document.getElementById('editarProductoModal');
    if (modalElement) {
      this.modalEdicion = new Modal(modalElement);
      this.modalEdicion.show();
    }
  }

  // Manejador para errores de carga de imágenes
  onImageError(event: any): void {
    event.target.src = 'assets/images/producto-default.jpg';
  }

  actualizarProducto(): void {
    if (!this.productoSeleccionado) return;

    // Create an object with just the fields you want to update
    const productoActualizado = {
      codigo_barras: this.productoSeleccionado.codigo_barras,
      existencia_exhibe: this.productoSeleccionado.existencia_exhibe,
      stock_exhibe: this.productoSeleccionado.stock_exhibe,
      cantidad_rellenar: this.productoSeleccionado.cantidad_rellenar
    };

    this.productoService.actualizarProducto(this.productoSeleccionado).subscribe({
      next: (response) => {
        const index = this.productos.findIndex(p => p.codigo_barras === this.productoSeleccionado.codigo_barras);
        if (index !== -1) {
          this.productos[index] = response;
          this.aplicarFiltros();
        }

        this.notificacionService.mostrarExito('Producto actualizado correctamente');

        if (this.modalEdicion) {
          this.modalEdicion.hide();
        }
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.notificacionService.mostrarError('Error al actualizar el producto');
      }
    });
  }
}
