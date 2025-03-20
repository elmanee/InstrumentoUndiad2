import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlmacenistaService, Producto } from '../../../services/almacenista.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
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

  constructor(private almacenistaService: AlmacenistaService) { }

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

  // Método para determinar el estado de un producto basado en su stock
  getEstadoProducto(producto: Producto): string {
    if (!producto.stock_exhibe || producto.stock_exhibe <= 0) {
      return 'Agotado';
    } else if (producto.stock_exhibe < 10) {
      return 'Bajo';
    } else {
      return 'Disponible';
    }
  }

  // Método para determinar la clase CSS según el estado
  getClaseEstado(producto: Producto): string {
    const estado = this.getEstadoProducto(producto);

    switch (estado) {
      case 'Agotado':
        return 'bg-danger';
      case 'Bajo':
        return 'bg-warning';
      case 'Disponible':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  // Método para eliminar un producto
  eliminarProducto(codigoBarras: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.almacenistaService.eliminarProducto(codigoBarras).subscribe({
        next: () => {
          // Filtrar el producto eliminado de la lista
          this.productos = this.productos.filter(p => p.codigo_barras !== codigoBarras);
          alert('Producto eliminado con éxito');
        },
        error: (err) => {
          console.error('Error al eliminar producto:', err);
          alert('Error al eliminar el producto');
        }
      });
    }
  }


}
