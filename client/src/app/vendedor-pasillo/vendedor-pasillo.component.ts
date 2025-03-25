import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../services/prodcuto-service.service';
import { NotificacionService } from '../services/notificacion-service.service';
import { Producto } from '../models/Producto';
import { Modal } from 'bootstrap';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';


@Component({
  selector: 'app-vendedor-pasillo',
  standalone: false,
  templateUrl: './vendedor-pasillo.component.html',
  styleUrl: './vendedor-pasillo.component.css',
})
export class VendedorPasilloComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  allProductos: Producto[] = [];

  searchTerm: string = '';
  filtroEstatus: string = 'todos';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;
  pages: number[] = [];

  searchType: string = 'nombre';
  precioMin: number = 0;
  precioMax: number = 1000;
  cargando: boolean = false;
  // Modal
  private modalEdicion: any;

  constructor(
    private productoService: ProductoService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.obtenerProductos().subscribe({
      next: (data) => {
        this.allProductos = data; // Store original data
        this.productos = [...data]; // Working copy
        this.aplicarFiltrosYBusqueda();
        this.calcularPaginacion();
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.notificacionService.mostrarError(
          'No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.'
        );
      },
    });
  }

  // Filtros y búsqueda
  aplicarFiltrosYBusqueda(): void {
    console.log('Aplicando filtros a:', this.productos); // Depuración

    // Crear una copia para no modificar el original
    let productosFiltrados = [...this.productos];

    // Filtrar por estatus
    if (this.filtroEstatus === "activo") {
      productosFiltrados = productosFiltrados.filter((p) =>
        p.estatus === "activo"
      );
    } else if (this.filtroEstatus === "inactivo") {
      productosFiltrados = productosFiltrados.filter((p) =>
        p.estatus === "inactivo"
      );
    }

    console.log('Productos filtrados:', productosFiltrados); // Depuración
    this.productosFiltrados = productosFiltrados;
    this.calcularPaginacion();
  }

  // Paginación
  calcularPaginacion(): void {
    this.totalPages = Math.ceil(
      this.productosFiltrados.length / this.itemsPerPage
    );
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    // Asegurar que la página actual es válida
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    // Obtener solo los productos para la página actual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.productosFiltrados = this.productosFiltrados.slice(
      startIndex,
      endIndex
    );
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.aplicarFiltrosYBusqueda();
    }
  }

  // Funciones de modales
  abrirModalEdicion(producto: Producto): void {
    this.productoSeleccionado = { ...producto }; // Crear copia para no modificar directo

    // Inicializar el modal
    const modalElement = document.getElementById('editarProductoModal');
    if (modalElement) {
      this.modalEdicion = new Modal(modalElement);
      this.modalEdicion.show();
    }
  }

  actualizarProducto(): void {
    if (this.productoSeleccionado) {
      // Validations
      if (
        this.productoSeleccionado.existencia_almacen < 0 ||
        this.productoSeleccionado.existencia_exhibe < 0 ||
        this.productoSeleccionado.stock_exhibe < 0 ||
        this.productoSeleccionado.cantidad_rellenar < 0
      ) {
        this.notificacionService.mostrarError(
          'Los valores no pueden ser negativos'
        );
        return;
      }

      // Additional validation for transfer quantity
      if (
        this.productoSeleccionado.cantidad_rellenar >
        this.productoSeleccionado.existencia_almacen
      ) {
        this.notificacionService.mostrarError(
          'No hay suficiente existencia en almacén'
        );
        return;
      }

      this.productoService
        .actualizarProducto(this.productoSeleccionado)
        .subscribe({
          next: (response) => {
            this.notificacionService.mostrarExito(
              'Producto actualizado exitosamente'
            );

            // Update the product in the local list
            const index = this.productos.findIndex(
              (p) =>
                p.codigo_barras === response.producto_actualizado.codigo_barras
            );
            if (index !== -1) {
              this.productos[index] = response.producto_actualizado;
              this.aplicarFiltrosYBusqueda();
            }

            // Close the modal
            if (this.modalEdicion) {
              this.modalEdicion.hide();
            }
          },
          error: (err) => {
            console.error('Error al actualizar producto:', err);
            this.notificacionService.mostrarError(
              'No se pudo actualizar el producto. Intente nuevamente.'
            );
          },
        });
    }
  }

  verDetalles(producto: Producto): void {
    // Implementar lógica para mostrar detalles del producto
    // Podría ser otro modal o navegar a una página de detalles
    console.log('Ver detalles del producto:', producto);
  }

  getImageUrl(imagePath: string): string {
    // If the path already starts with '/', return as is
    if (imagePath && imagePath.startsWith('/')) {
      return imagePath;
    }
    // Otherwise, ensure it has a leading slash
    return imagePath ? `/${imagePath}` : '';
  }

  // Manejador para errores de carga de imágenes
  onImageError(event: any): void {
    event.target.src = 'assets/images/producto-default.jpg';
  }

  getPlaceholderText(): string {
    switch (this.searchType) {
      case 'nombre':
        return 'Buscar por nombre...';
      case 'codigo':
        return 'Ingrese código de barras...';
      case 'marca':
        return 'Buscar por marca...';
      case 'tamanio':
        return 'Buscar por tamaño...';
      case 'pasillo':
        return 'Buscar por pasillo...';
      default:
        return 'Buscar producto...';
    }
  }

  buscarProductos(): void {
    // si el campo busqueda esta vacio y no se busca se reinica o restableme todos los porductos
    if (!this.searchTerm && this.searchType !== 'precio') {
      this.cargarProductos();
      return;
    }

    // validacion de precio
    if (this.searchType === 'precio') {
      // revisa numero invalidos
      if (isNaN(this.precioMin) || isNaN(this.precioMax)) {
        this.notificacionService.mostrarAdvertencia(
          'Ingrese valores numéricos válidos para el rango de precios'
        );
        return;
      }

      // valida el precio en el rango
      if (this.precioMin < 0 || this.precioMax < 0) {
        this.notificacionService.mostrarAdvertencia(
          'Los precios no pueden ser negativos'
        );
        return;
      }

      // verifica si el precio min es mayor al maximo
      if (this.precioMin >= this.precioMax) {
        this.notificacionService.mostrarAdvertencia(
          'El precio mínimo debe ser menor que el precio máximo'
        );
        return;
      }
    }

    this.cargando = true;
    let searchObservable: Observable<any>;

    switch (this.searchType) {
      case 'nombre':
        searchObservable = this.productoService.obtenerProductosPorNombre(
          this.searchTerm
        );
        break;
      case 'codigo':
        searchObservable = this.productoService
          .obtenerProductoPorCodigo(this.searchTerm)
          .pipe(
            map((producto) => [producto]),
            catchError((error) => {
              if (error.status === 404) {
                return of([]);
              }
              return throwError(() => error);
            })
          );
        break;
      case 'marca':
        console.log('Buscando marca:', this.searchTerm.trim());
        searchObservable = this.productoService.obtenerProductosPorMarca(
          this.searchTerm.trim()
        );
        break;
      case 'tamanio':
        searchObservable = this.productoService.obtenerProductosPorTamanio(
          this.searchTerm.trim()
        );
        break;
      case 'pasillo':
        // valida pasillo entrada
        if (!this.searchTerm || this.searchTerm.trim() === '') {
          this.notificacionService.mostrarAdvertencia(
            'Ingrese un número o nombre de pasillo válido'
          );
          this.cargando = false;
          return;
        }

        //comvierte a numero
        const pasilloTerm = !isNaN(Number(this.searchTerm))
          ? this.searchTerm.trim()
          : this.searchTerm.trim();

        searchObservable =
          this.productoService.obtenerProductosPorPasillo(pasilloTerm);
        break;
      case 'precio':
        searchObservable = this.productoService.obtenerProductosPorPrecio(
          this.precioMin,
          this.precioMax
        );
        break;
      default:
        // si no es valida carga todos los prodcuctos
        this.cargarProductos();
        return;
    }

    searchObservable.pipe(
      finalize(() => this.cargando = false)
    ).subscribe({
      next: (productos) => {
        console.log('Productos recibidos:', productos); // Depuración

        if (!productos || productos.length === 0) {
          this.notificacionService.mostrarInfo(
            "No se encontraron productos con los criterios de búsqueda"
          );
          // Mantener los productos actuales en lugar de borrarlos
        } else {
          // Asignar los productos recibidos
          this.productos = [...productos];

          // Aplicar filtros adicionales (como estado activo/inactivo)
          this.aplicarFiltrosYBusqueda();

          // Mensaje de éxito
          this.notificacionService.mostrarExito(
            `Se encontraron ${productos.length} productos`
          );
        }
      },
      error: (err) => {
        console.error(`Error al buscar productos por ${this.searchType}:`, err);
        this.notificacionService.mostrarError(
          `Error al buscar productos. Intente nuevamente.`
        );
      }
    });
  }

  onSearchTermChange(): void {
    // Si el campo de búsqueda está vacío, recargar productos
    if (!this.searchTerm.trim()) {
        this.cargarProductos();
        return;
    }

    // Para pasillo, esperar a que el usuario termine de escribir
    if (this.searchType === 'pasillo') {
        // Solo buscar si hay un valor completo de pasillo
        if (this.searchTerm.trim().length >= 1) {
            this.buscarProductosEnTiempoReal();
        }
    } else {
        // Para otros campos, comienza a buscar desde 2 caracteres
        if (this.searchTerm.trim().length >= 2) {
            this.buscarProductosEnTiempoReal();
        }
    }
}

buscarProductosEnTiempoReal(): void {
  let searchObservable: Observable<any>;

  switch (this.searchType) {
      case 'nombre':
          searchObservable = this.productoService.obtenerProductosPorNombre(
              this.searchTerm
          );
          break;
      case 'codigo':
          searchObservable = this.productoService
              .obtenerProductoPorCodigo(this.searchTerm)
              .pipe(
                  map((producto) => [producto]),
                  catchError((error) => {
                      if (error.status === 404) {
                          return of([]);
                      }
                      return throwError(() => error);
                  })
              );
          break;
      case 'marca':
          searchObservable = this.productoService.obtenerProductosPorMarca(
              this.searchTerm.trim()
          );
          break;
      case 'tamanio':
          searchObservable = this.productoService.obtenerProductosPorTamanio(
              this.searchTerm.trim()
          );
          break;
      case 'pasillo':
          if (!this.searchTerm || this.searchTerm.trim() === '') {
              return;
          }

          const pasilloTerm = this.searchTerm.trim();
          searchObservable = this.productoService.obtenerProductosPorPasillo(pasilloTerm);
          break;
      default:
          return;
  }

  searchObservable.subscribe({
      next: (productos) => {
          if (productos && productos.length > 0) {
              this.productos = [...productos];
              this.aplicarFiltrosYBusqueda();
          }
      },
      error: (err) => {
          console.error(`Error en búsqueda en tiempo real: ${err}`);
      }
  });
}

  onPriceInputChange(): void {
    // carga todos los procutos ti los campos de precio estan vacios
    if (
      (this.precioMin === 0 || this.precioMin === null) &&
      (this.precioMax === 0 || this.precioMax === null)
    ) {
      this.cargarProductos();
    }
  }

  resetFilters(): void {
    // restablce los datos originales sin llamdar a la API
    this.productos = [...this.allProductos];
    this.searchTerm = '';
    this.searchType = 'nombre';
    this.aplicarFiltrosYBusqueda();
  }
}
