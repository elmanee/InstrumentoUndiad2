import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService, Producto } from '../services/cliente-service.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, catchError, takeUntil, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { environmentDos } from '../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GestionProductoModalComponent } from '../gestion-producto-modal/gestion-producto-modal.component';

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
export class ProductosComponent implements OnInit, OnDestroy {
  // URL de la API para imágenes
  apiUrl = environmentDos.apiUrl || 'http://localhost:3000';

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  marcas: string[] = [];
  tamanios: string[] = [];

  // Variable para almacenar el producto seleccionado para ver detalles
  productoSeleccionado: Producto | null = null;

  // Variables para filtros
  nombreFiltro: string = '';
  marcaSeleccionada: string = '';
  tamanioSeleccionado: string = '';
  precioMinimo: number = 0;
  precioMaximo: number = 1000;

  // Variable para controlar errores de carga
  errorCarga: boolean = false;
  mensajeError: string = '';

  // Variable para controlar carga
  cargando: boolean = false;

  // Subjects para el debounce de búsqueda y destrucción del componente
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Seguimiento de suscripciones activas
  private activeSubscriptions: Subscription[] = [];

  constructor(
    private clienteService: ClienteService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.cargarProductos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.activeSubscriptions.forEach(sub => sub.unsubscribe());
  }

  // Método para manejar el evento de tecla en búsqueda
  onBuscarKeyUp(event: any): void {
    this.searchSubject.next(this.nombreFiltro);
  }

  // Método para filtrar por nombre
  filtrarPorNombre(): void {
    this.searchSubject.next(this.nombreFiltro);
  }

  // Método para filtrar por marca
  filtrarPorMarca(marca: string): void {
    if (!marca) {
      this.marcaSeleccionada = '';
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.marcaSeleccionada = marca;
    this.cargando = true;

    const sub = this.clienteService.obtenerProductosPorMarca(marca)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (response) => {
          this.productosFiltrados = response.lista;
          this.errorCarga = false;
        },
        error: (error) => {
          console.error('Error al filtrar por marca:', error);
          this.errorCarga = true;
          this.mensajeError = 'Error al buscar productos por marca.';
        }
      });

    this.activeSubscriptions.push(sub);
  }

  // Método para filtrar por tamaño
  filtrarPorTamanio(tamanio: string): void {
    if (!tamanio) {
      this.tamanioSeleccionado = '';
      this.productosFiltrados = [...this.productos];
      return;
    }

    this.tamanioSeleccionado = tamanio;
    this.cargando = true;

    const sub = this.clienteService.obtenerProductosPorTamanio(tamanio)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (response) => {
          this.productosFiltrados = response.lista;
          this.errorCarga = false;
        },
        error: (error) => {
          console.error('Error al filtrar por tamaño:', error);
          this.errorCarga = true;
          this.mensajeError = 'Error al buscar productos por tamaño.';
        }
      });

    this.activeSubscriptions.push(sub);
  }

  // Método para filtrar por precio
  filtrarPorPrecio(): void {
    this.cargando = true;

    const sub = this.clienteService.obtenerProductosPorPrecio(this.precioMinimo, this.precioMaximo)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (response) => {
          this.productosFiltrados = response.lista;
          this.errorCarga = false;
        },
        error: (error) => {
          console.error('Error al filtrar por precio:', error);
          this.errorCarga = true;
          this.mensajeError = 'Error al buscar productos por rango de precio.';
        }
      });

    this.activeSubscriptions.push(sub);
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.nombreFiltro = '';
    this.marcaSeleccionada = '';
    this.tamanioSeleccionado = '';
    this.precioMinimo = 0;
    this.precioMaximo = 1000;
    this.productosFiltrados = [...this.productos];
  }

  // Método para ver detalles de un producto
  verDetalles(producto: Producto): void {
    this.productoSeleccionado = producto;

    // Esperar a que el DOM se actualice con el producto seleccionado
    setTimeout(() => {
      // Inicializar y mostrar el modal usando Bootstrap
      const modalElement = document.getElementById('detalleProductoModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  }

  // Método para cerrar el modal de detalles del producto
  cerrarModal(resultado: boolean): void {
    // Para el modal Bootstrap nativo
    const modalElement = document.getElementById('detalleProductoModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Restablecer el producto seleccionado
    this.productoSeleccionado = null;
  }

  // Métodos adicionales ya existentes
  setupSearchDebounce(): void {
    const sub = this.searchSubject.pipe(
      debounceTime(500),
      takeUntil(this.destroy$),
      switchMap(searchTerm => {
        if (searchTerm.trim() === '') {
          return of({ lista: this.productos });
        }
        this.cargando = true;
        return this.clienteService.obtenerProductosPorNombre(searchTerm).pipe(
          catchError(error => {
            console.error('Error al filtrar por nombre:', error);
            this.errorCarga = true;
            this.mensajeError = 'Error al buscar productos por nombre.';
            return of({ lista: [] });
          }),
          finalize(() => this.cargando = false)
        );
      })
    ).subscribe(response => {
      this.productosFiltrados = response.lista;
    });

    this.activeSubscriptions.push(sub);
  }

  cargarProductos(): void {
    this.cargando = true;
    const sub = this.clienteService.obtenerProductosActivos()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (response) => {
          this.productos = response.lista;
          this.productosFiltrados = [...this.productos];
          this.extraerFiltros();
          this.errorCarga = false;
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.errorCarga = true;
          this.mensajeError = 'No se pudieron cargar los productos. Por favor, intente más tarde.';
        }
      });

    this.activeSubscriptions.push(sub);
  }

  extraerFiltros(): void {
    // Extraer marcas únicas
    this.marcas = [...new Set(this.productos.map(producto => producto.marca))];

    // Extraer tamaños únicos
    this.tamanios = [...new Set(this.productos.map(producto => producto.tamanio))];
  }

  // Para tener una URL completa para imágenes
  getImagenUrl(rutaImagen: string): string {
    if (!rutaImagen) {
      return 'assets/img/placeholder.png';
    }
    return this.apiUrl + rutaImagen;
  }

  // Métodos de gestión de productos
  abrirModalGestion(producto: Producto): void {
    const modalRef = this.modalService.open(GestionProductoModalComponent, {
      size: 'lg',
      centered: true
    });

    // Pasar datos al modal
    modalRef.componentInstance.producto = producto;

    // Manejar el resultado del modal
    modalRef.result.then(
      (resultado) => {
        if (resultado === 'eliminado' || resultado === 'estatus_cambiado') {
          // Actualizar la lista de productos
          this.cargarProductos();
        }
      },
      (razon) => {
        // Modal fue descartado
        console.log('Modal cancelado', razon);
      }
    );
  }
}

// Declare bootstrap para poder usarlo con TypeScript
declare var bootstrap: any;
