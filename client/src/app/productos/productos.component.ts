import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Producto, ProductoResponse } from '../services/cliente-service.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, catchError, takeUntil, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { environmentDos } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { obtenerProductosActivos } from '../../../../server/src/controllers/clienteControllers';
declare var bootstrap: any;

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  // Variables de entorno
  apiUrl = 'http://localhost:3000'; // Puedes cambiar esto por environment.apiUrl si lo tienes configurado

  // Variables para productos
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productoSeleccionado: Producto | null = null;

  // Variables para carga y errores
  cargando = false;
  errorCarga = false;
  mensajeError = '';

  // Variables para filtros
  mostrarFiltros = false;
  nombreBusqueda = '';
  codigoBusqueda = '';
  marcaSeleccionada = '';
  pasilloSeleccionado = '';
  precioMin = 0;
  precioMax = 2000;

  // Listas para opciones de filtros
  marcas: string[] = [];
  pasillos: string[] = [];
  tamanios: string[] = [];

  // Variables para paginación
  paginaActual = 1;
  elementosPorPagina = 12;
  totalPaginas = 1;

  // Variables para vista
  tipoVista = 'grid'; // 'grid' o 'list'
  cantidad = 1;

  // Modal
  modalDetalle: any;

  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.cargarProductos();
    setTimeout(() => {
      const modalElement = document.getElementById('detalleProductoModal');
      if (modalElement) {
        this.modalDetalle = new bootstrap.Modal(modalElement);
      }
    }, 500);
  }

  /**
   * Carga los productos desde el servicio
   */
  cargarProductos(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.clienteService.obtenerProductosActivos()
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          this.productos = response.lista;
          this.productosFiltrados = [...this.productos];
          this.calcularTotalPaginas();

          // Extraer valores únicos para filtros
          this.obtenerValoresUnicos();
        },
        error: (error) => {
          this.errorCarga = true;
          this.mensajeError = 'Error al cargar productos. Intente nuevamente.';
          console.error('Error cargando productos', error);
        }
      });
  }

  /**
   * Extrae valores únicos de las propiedades para los filtros
   */
  obtenerValoresUnicos(): void {
    // Obtener marcas únicas (filtrando valores undefined)
    this.marcas = [...new Set(this.productos
      .filter(producto => producto.marca)
      .map(producto => producto.marca))]
      .filter((marca): marca is string => marca !== undefined)
      .sort();

    // Obtener pasillos únicos (filtrando valores undefined)
    this.pasillos = [...new Set(this.productos
      .filter(producto => producto.pasillo)
      .map(producto => producto.pasillo))]
      .filter((pasillo): pasillo is string => pasillo !== undefined)
      .sort();

    // Obtener tamaños únicos (filtrando valores undefined)
    this.tamanios = [...new Set(this.productos
      .filter(producto => producto.tamanio)
      .map(producto => producto.tamanio))]
      .filter((tamanio): tamanio is string => tamanio !== undefined)
      .sort();
  }

  /**
   * Cambia la visibilidad del panel de filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Filtra productos por nombre
   */
  buscarPorNombre(): void {
    if (!this.nombreBusqueda) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService.obtenerProductosPorNombre(this.nombreBusqueda)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          this.productosFiltrados = response.lista;
          this.resetearPaginacion();
        },
        error: (error) => {
          console.error('Error buscando por nombre', error);
          // Fallback a búsqueda local si la API falla
          this.productosFiltrados = this.productos.filter(producto =>
            producto.nombre_producto.toLowerCase().includes(this.nombreBusqueda.toLowerCase())
          );
          this.resetearPaginacion();
        }
      });
  }

  /**
   * Filtra productos por código de barras
   */
  buscarPorCodigo(): void {
    if (!this.codigoBusqueda) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService.getProductByCodigo(this.codigoBusqueda)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          this.productosFiltrados = response.lista;
          this.resetearPaginacion();
        },
        error: (error) => {
          console.error('Error buscando por código', error);
          // Fallback a búsqueda local
          this.productosFiltrados = this.productos.filter(producto =>
            producto.codigo_barras.includes(this.codigoBusqueda)
          );
          this.resetearPaginacion();
        }
      });
  }

  /**
   * Filtra productos por marca
   */
  filtrarPorMarca(): void {
    if (!this.marcaSeleccionada) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService.obtenerProductosPorMarca(this.marcaSeleccionada)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          this.productosFiltrados = response.lista;
          this.resetearPaginacion();
        },
        error: (error) => {
          console.error('Error filtrando por marca', error);
          // Fallback a filtrado local
          this.aplicarFiltros();
        }
      });
  }

  /**
   * Actualiza el rango de precios y garantiza valores coherentes
   */
  actualizarRangoPrecio(): void {
    // Asegurar que el precio mínimo nunca sea mayor que el máximo
    if (this.precioMin > this.precioMax) {
      this.precioMax = this.precioMin;
    }
  }

  /**
   * Aplica filtros de precio usando la API
   */
  filtrarPorPrecio(): void {
    this.cargando = true;
    this.clienteService.obtenerProductosPorPrecio(this.precioMin, this.precioMax)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          this.productosFiltrados = response.lista;
          this.resetearPaginacion();
        },
        error: (error) => {
          console.error('Error filtrando por precio', error);
          // Fallback a filtrado local
          this.aplicarFiltros();
        }
      });
  }

  /**
   * Aplica todos los filtros activos (búsqueda local)
   */
  aplicarFiltros(): void {
    this.productosFiltrados = this.productos.filter(producto => {
      // Filtrar por nombre si hay término de búsqueda
      const nombreMatch = !this.nombreBusqueda ||
        producto.nombre_producto.toLowerCase().includes(this.nombreBusqueda.toLowerCase());

      // Filtrar por código si hay término de búsqueda
      const codigoMatch = !this.codigoBusqueda ||
        producto.codigo_barras.includes(this.codigoBusqueda);

      // Filtrar por marca seleccionada
      const marcaMatch = !this.marcaSeleccionada ||
        producto.marca === this.marcaSeleccionada;

      // Filtrar por pasillo seleccionado
      const pasilloMatch = !this.pasilloSeleccionado ||
        (producto.pasillo && producto.pasillo === this.pasilloSeleccionado);

      // Filtrar por rango de precio
      // Usamos el precio_pieza si existe, si no, usamos precio_kg
      const precio = producto.precio_pieza > 0 ? producto.precio_pieza :
                    (producto.precio_kg > 0 ? producto.precio_kg : 0);

      const precioMatch = precio >= this.precioMin && precio <= this.precioMax;

      // Todos los filtros deben coincidir
      return nombreMatch && codigoMatch && marcaMatch && pasilloMatch && precioMatch;
    });

    this.resetearPaginacion();
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros(): void {
    this.nombreBusqueda = '';
    this.codigoBusqueda = '';
    this.marcaSeleccionada = '';
    this.pasilloSeleccionado = '';
    this.precioMin = 0;
    this.precioMax = 2000;

    this.cargarProductos(); // Recargar todos los productos desde la API
  }

  // El resto de los métodos permanece igual que en el código que te proporcioné anteriormente

  cambiarVista(tipo: string): void {
    this.tipoVista = tipo;
  }

  verDetalles(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.cantidad = 1;

    setTimeout(() => {
      // Try to get the modal element
      const modalElement = document.getElementById('detalleProductoModal');

      // Check if modal instance already exists
      if (this.modalDetalle) {
        this.modalDetalle.show();
      }
      // If not, create a new modal instance
      else if (modalElement) {
        this.modalDetalle = new bootstrap.Modal(modalElement);
        this.modalDetalle.show();
      } else {
        console.error('Modal element not found');
      }
    }, 100);
  }

  incrementarCantidad(): void {
    if (this.cantidad < 100) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  resetearPaginacion(): void {
    this.paginaActual = 1;
    this.calcularTotalPaginas();
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginasMostradas = 5;

    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasMostradas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasMostradas - 1);

    if (fin - inicio + 1 < maxPaginasMostradas) {
      inicio = Math.max(1, fin - maxPaginasMostradas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    return paginas;
  }

  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  /**
 * Método general para filtrar productos basado en los filtros actuales
 */
filtrarProductos(): void {
  // Si hay una marca seleccionada, usar la API para filtrar
  if (this.marcaSeleccionada) {
    this.filtrarPorMarca();
    return;
  }

  // Si hay un rango de precios diferente del predeterminado, usar API de precios
  if (this.precioMin > 0 || this.precioMax < 2000) {
    this.filtrarPorPrecio();
    return;
  }

  // Si no hay filtros específicos, aplicar búsqueda local
  this.aplicarFiltros();
}
searchTerm: string = '';

// Add this method
buscarProductos(): void {
  if (!this.searchTerm.trim()) {
    this.limpiarFiltros();
    return;
  }

  this.nombreBusqueda = this.searchTerm.trim();
  this.buscarPorNombre();
}

}
