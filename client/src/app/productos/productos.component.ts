import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ClienteService,
  Producto,
  ProductoResponse,
} from '../services/cliente-service.service';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  switchMap,
  catchError,
  takeUntil,
  finalize,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { environmentDos } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { obtenerProductosActivos } from '../../../../server/src/controllers/clienteControllers';
declare var bootstrap: any;


interface FiltrosProducto {
  tamano: string;
  marca: string;
  pasillo: string;
  codigoBarras: string;
  nombreProducto: string;
}


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],
})
export class ProductosComponent implements OnInit {
  // Variables de entorno
  apiUrl = 'http://localhost:3000'; // Puedes cambiar esto por environment.apiUrl si lo tienes configurado

  filtros: FiltrosProducto = {
    tamano: '',
    marca: '',
    pasillo: '',
    codigoBarras: '',
    nombreProducto: ''
  };

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
  marcasDisponibles: string[] = [];
  pasillos: string[] = [];
  tamanios: string[] = [];
  tamanosDisponibles: string[] = [];

  // Variables para paginación
  paginaActual = 1;
  elementosPorPagina = 12;
  totalPaginas = 1;

  // Variables para vista
  tipoVista = 'grid'; // 'grid' o 'list'
  cantidad = 1;

  // Modal
  modalDetalle: any;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarProductos();
    setTimeout(() => {
      const modalElement = document.getElementById('detalleProductoModal');
      if (modalElement) {
        this.modalDetalle = new bootstrap.Modal(modalElement);
      }
    }, 500);
  }


  cargarProductos(): void {
    this.cargando = true;
    this.errorCarga = false;

    this.clienteService
      .obtenerProductosActivos()
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
        },
      });
  }

  obtenerValoresUnicos(): void {
    // Existing code for marcas and pasillos...

    this.tamanios = [
      ...new Set(
        this.productos
          .filter((producto) => producto.tamanio)
          .map((producto) => producto.tamanio)
      ),
    ]
      .filter((tamanio): tamanio is string => tamanio !== undefined)
      .sort();

    // Copy to tamanosDisponibles
    this.tamanosDisponibles = [...this.tamanios];
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  buscarPorNombre(): void {
    if (!this.nombreBusqueda) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService
      .obtenerProductosPorNombre(this.nombreBusqueda)
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
          this.productosFiltrados = this.productos.filter((producto) =>
            producto.nombre_producto
              .toLowerCase()
              .includes(this.nombreBusqueda.toLowerCase())
          );
          this.resetearPaginacion();
        },
      });
  }

  buscarPorCodigo(): void {
    if (!this.filtros.codigoBarras) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService
      .getProductByCodigo(this.filtros.codigoBarras)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (response: ProductoResponse) => {
          if (response && response.lista) {
            this.productosFiltrados = response.lista;
            this.resetearPaginacion();
          } else {
            console.error('Formato de respuesta inesperado:', response);
            // Use the existing method
            this.aplicarFiltros();
          }
        },
        error: (error) => {
          console.error('Error buscando por código', error);
          // Fallback a búsqueda local
          this.productosFiltrados = this.productos.filter((producto) =>
            producto.codigo_barras.includes(this.filtros.codigoBarras)
          );
          this.resetearPaginacion();
        },
      });
  }

  filtrarPorMarca(): void {
    if (!this.marcaSeleccionada) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService
      .obtenerProductosPorMarca(this.marcaSeleccionada)
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
        },
      });
  }


  actualizarRangoPrecio(): void {
    // Asegurar que el precio mínimo nunca sea mayor que el máximo
    if (this.precioMin > this.precioMax) {
      this.precioMax = this.precioMin;
    }
  }

  filtrarPorPrecio(): void {
    this.cargando = true;
    this.clienteService
      .obtenerProductosPorPrecio(this.precioMin, this.precioMax)
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
        },
      });
  }

  filtrarPorTamanio(): void {
    if (!this.filtros.tamano) {
      this.limpiarFiltros();
      return;
    }

    this.cargando = true;
    this.clienteService
      .obtenerProductosPorTamanio(this.filtros.tamano)
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
          console.error('Error filtrando por tamaño', error);
          // Fallback a filtrado local
          this.productosFiltrados = this.productos.filter(
            (producto) => producto.tamanio === this.filtros.tamano
          );
          this.resetearPaginacion();
        },
      });
  }

  aplicarFiltros(): void {
    // Si hay filtro específico de tamaño, usamos ese método
    if (this.filtros.tamano) {
      this.filtrarPorTamanio();
      return;
    }

    if (this.filtros.marca) {
      this.filtrarPorMarca();
      return;
    }

    if (this.precioMin > 0 || this.precioMax < 2000) {
      this.filtrarPorPrecio();
      return;
    }

    // Aplicar filtros localmente
    this.productosFiltrados = this.productos.filter((producto) => {
      // Filtrar por nombre si hay término de búsqueda
      const nombreMatch =
        !this.filtros.nombreProducto ||
        producto.nombre_producto
          .toLowerCase()
          .includes(this.filtros.nombreProducto.toLowerCase());

      // Filtrar por código si hay término de búsqueda
      const codigoMatch =
        !this.filtros.codigoBarras ||
        producto.codigo_barras.includes(this.filtros.codigoBarras);

      // Filtrar por marca seleccionada
      const marcaMatch =
        !this.filtros.marca || producto.marca === this.filtros.marca;

      // Filtrar por pasillo seleccionado
      const pasilloMatch =
        !this.filtros.pasillo ||
        (producto.pasillo && producto.pasillo === this.filtros.pasillo);

      // Filtrar por tamaño seleccionado
      const tamanioMatch =
        !this.filtros.tamano || producto.tamanio === this.filtros.tamano;

      // Filtrar por rango de precio
      // Usamos el precio_pieza si existe, si no, usamos precio_kg
      const precio =
        producto.precio_pieza > 0
          ? producto.precio_pieza
          : producto.precio_kg > 0
          ? producto.precio_kg
          : 0;

      const precioMatch = precio >= this.precioMin && precio <= this.precioMax;

      // Todos los filtros deben coincidir
      return (
        nombreMatch && codigoMatch && marcaMatch && pasilloMatch &&
        tamanioMatch && precioMatch
      );
    });

    this.resetearPaginacion();
  }

  limpiarTodosLosFiltros(): void {
    this.limpiarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = {
      tamano: '',
      codigoBarras: '',
      nombreProducto: '',
      marca: '',
      pasillo: ''
    };

    this.precioMin = 0;
    this.precioMax = 2000;

    this.cargarProductos();
  }

  cambiarVista(tipo: string): void {
    this.tipoVista = tipo;
  }

  verDetalles(producto: Producto): void {
    this.productoSeleccionado = producto;
    this.cantidad = 1;

    setTimeout(() => {
      const modalElement = document.getElementById('detalleProductoModal');

      if (this.modalDetalle) {
        this.modalDetalle.show();
      }
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
    this.totalPaginas = Math.ceil(
      this.productosFiltrados.length / this.elementosPorPagina
    );
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

    let inicio = Math.max(
      1,
      this.paginaActual - Math.floor(maxPaginasMostradas / 2)
    );
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


  filtrarProductos(): void {
    if (this.marcaSeleccionada) {
      this.filtrarPorMarca();
      return;
    }

    if (this.precioMin > 0 || this.precioMax < 2000) {
      this.filtrarPorPrecio();
      return;
    }

    this.aplicarFiltros();
  }

  searchTerm: string = '';

  buscarProductos(): void {
    if (!this.searchTerm.trim()) {
      this.limpiarFiltros();
      return;
    }

    this.nombreBusqueda = this.searchTerm.trim();
    this.buscarPorNombre();
  }
}
