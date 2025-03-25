import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  AlmacenistaService,
  Producto,
} from '../../../services/almacenista.service';
import {
  NgbCalendar,
  NgbDate,
  NgbDateStruct,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import {
  NgbDatepickerModule,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ProductExportService } from '../../../services/product-export-service.service';
import { PdfExportService } from '../../../services/pdf-export-service.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbModalModule,
    NgbDatepickerModule,
  ],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {
  // Lista de productos
  productos: Producto[] = [];
  productosOriginales: Producto[] = [];

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

  // Variables para filtros
  filtros = {
    textoBusqueda: '',
    codigoBarras: '',
    nombreProducto: '',
    marca: '',
    pasillo: '',
    tamano: '',
  };

  // Listas para los selectores de filtros
  marcasDisponibles: string[] = [];
  tamanosDisponibles: string[] = [];

  // Variable para filtros rápidos
  filtroRapido: string = '';

  // Contadores para los pills
  totalProductos: number = 0;
  productosActivos: number = 0;
  productosInactivos: number = 0;
  productosBajoStock: number = 0;

  // Control de vista
  vistaActual: string = 'grid'; // 'grid' o 'list'

  constructor(
    private almacenistaService: AlmacenistaService,
    private modalService: NgbModal,
    private productExportService: ProductExportService,
    private pdfExportService: PdfExportService
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
        this.productosOriginales = [...data];
        this.extraerOpcionesFiltros(data);
        this.actualizarContadoresFiltros(data);
        this.cargando = false;
        console.log(data);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error =
          'Error al cargar los productos. Por favor, intenta nuevamente.';
        this.cargando = false;
      },
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
      backdrop: 'static',
    });
  }

  // Método para cambiar de tab
  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }

  // Método para confirmar eliminación
  confirmarEliminar(): void {
    if (this.confirmacionEliminar && this.productoSeleccionado) {
      this.almacenistaService
        .eliminarProducto(this.productoSeleccionado.codigo_barras)
        .subscribe({
          next: () => {
            // Actualizar la lista de productos
            this.productos = this.productos.filter(
              (p) => p.codigo_barras !== this.productoSeleccionado.codigo_barras
            );

            // Cerrar el modal
            this.modalService.dismissAll();

            // Mostrar mensaje
            alert('Producto eliminado con éxito');
          },
          error: (err) => {
            console.error('Error al eliminar producto:', err);
            alert('Error al eliminar el producto');
          },
        });
    }
  }

  // Método para confirmar cambio de estatus
  confirmarCambioEstatus(): void {
    if (
      this.productoSeleccionado &&
      this.status &&
      this.productoSeleccionado.estatus !== this.status
    ) {
      this.almacenistaService
        .cambiarEstatus(this.productoSeleccionado.codigo_barras, this.status)
        .subscribe({
          next: (response) => {
            // Actualizar el producto en la lista
            const index = this.productos.findIndex(
              (p) => p.codigo_barras === this.productoSeleccionado.codigo_barras
            );
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
          },
        });
    }
  }
  // MODAL DE EDICIÓN
  abrirModalEdicion(producto: Producto, contenidoModal: any): void {
    this.productoSeleccionado = producto;
    this.nuevoPrecio = 0;
    this.nuevoRelleno = 0;
    this.fechaCaducidadStr = '';
    this.activeTabEdicion = 'precio';

    // Abrir el modal
    this.modalService.open(contenidoModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
  }

  cambiarTabEdicion(tab: string): void {
    this.activeTabEdicion = tab;
  }

  actualizarPrecio(): void {
    if (
      !this.productoSeleccionado ||
      !this.nuevoPrecio ||
      this.nuevoPrecio <= 0
    ) {
      console.error('Datos inválidos para actualizar precio');
      return;
    }

    // Verificar que el precio haya cambiado
    if (this.nuevoPrecio === this.productoSeleccionado.precio_pieza) {
      console.log('El precio no ha cambiado');
      return;
    }

    // Llamar al servicio para actualizar el precio
    this.almacenistaService
      .actualizarProducto(this.productoSeleccionado.codigo_barras, {
        nuevo_precio: this.nuevoPrecio,
      })
      .subscribe({
        next: (response) => {
          console.log('Precio actualizado:', response);

          // Actualizar el producto en la lista
          const index = this.productos.findIndex(
            (p) => p.codigo_barras === this.productoSeleccionado?.codigo_barras
          );
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
          alert(
            'Error al actualizar el precio: ' +
              (err.error?.message || err.message)
          );
        },
      });
  }

  actualizarExistencias(): void {
    if (
      !this.productoSeleccionado ||
      !this.nuevoRelleno ||
      this.nuevoRelleno <= 0 ||
      !this.fechaCaducidadStr
    ) {
      console.error('Datos inválidos para actualizar existencias');
      return;
    }

    // Convertir string a Date
    const fechaObj = new Date(this.fechaCaducidadStr);

    console.log(
      `Actualizando existencias del producto ${this.productoSeleccionado.codigo_barras}`
    );
    console.log(`Cantidad: ${this.nuevoRelleno}, Fecha Caducidad:`, fechaObj);

    // Llamar al servicio para actualizar existencias
    this.almacenistaService
      .actualizarExistencias(
        this.productoSeleccionado.codigo_barras,
        this.nuevoRelleno,
        fechaObj
      )
      .subscribe({
        next: (response) => {
          console.log('Existencias actualizadas:', response);

          // Actualizar el producto en la lista
          const index = this.productos.findIndex(
            (p) => p.codigo_barras === this.productoSeleccionado?.codigo_barras
          );
          if (index !== -1) {
            this.productos[index].existencia_almacen =
              response.producto_actualizado.existencia_almacen;
          }

          // Cerrar el modal
          this.modalService.dismissAll();

          // Mostrar mensaje
          alert('Existencias actualizadas con éxito');
        },
        error: (err) => {
          console.error('Error al actualizar existencias:', err);
          alert(
            'Error al actualizar existencias: ' +
              (err.error?.message || err.message)
          );
        },
      });
  }

  extraerOpcionesFiltros(productos: Producto[]): void {
    this.marcasDisponibles = [
      ...new Set(productos.filter((p) => p.marca).map((p) => p.marca)),
    ].sort();

    // Extraer tamaños únicos
    this.tamanosDisponibles = [
      ...new Set(productos.filter((p) => p.tamanio).map((p) => p.tamanio)),
    ].sort();
  }

  aplicarFiltros(): void {
    let productosFiltrados = [...this.productosOriginales];

    // Filtro por texto general (busca en código, nombre y marca)
    if (this.filtros.textoBusqueda.trim()) {
      const texto = this.filtros.textoBusqueda.toLowerCase().trim();
      productosFiltrados = productosFiltrados.filter(
        (p) =>
          (p.codigo_barras && p.codigo_barras.toLowerCase().includes(texto)) ||
          (p.nombre_producto &&
            p.nombre_producto.toLowerCase().includes(texto)) ||
          (p.marca && p.marca.toLowerCase().includes(texto))
      );
    }

    // Filtros específicos
    if (this.filtros.codigoBarras.trim()) {
      const codigoBarras = this.filtros.codigoBarras.trim();

      this.almacenistaService.obtenerProductoPorCodigo(codigoBarras).subscribe({
        next: (producto) => {
          if (producto) {
            // Si encontramos el producto exacto, lo mostramos
            this.productos = [producto];

            // Importante: aplicamos el resto de filtros si hay otros criterios
            if (this.hayOtrosFiltrosActivos()) {
              this.aplicarFiltrosAdicionales();
            }
          } else {
            // Si no hay resultado de API, procedemos con filtrado normal
            this.aplicarFiltrosLocales();
          }
        },
        error: () => {
          // En caso de error, recurrimos al filtrado local
          this.aplicarFiltrosLocales();
        }
      });
    } else {
      // Si no hay código de barras específico, aplicamos filtros normales
      this.aplicarFiltrosLocales();
    }

    if (this.filtros.nombreProducto.trim()) {
      productosFiltrados = productosFiltrados.filter(
        (p) =>
          p.nombre_producto &&
          p.nombre_producto
            .toLowerCase()
            .includes(this.filtros.nombreProducto.toLowerCase().trim())
      );
    }

    if (this.filtros.marca) {
      productosFiltrados = productosFiltrados.filter(
        (p) => p.marca === this.filtros.marca
      );
    }

    if (this.filtros.pasillo.trim()) {
      productosFiltrados = productosFiltrados.filter(
        (p) => p.pasillo && p.pasillo.toString() === this.filtros.pasillo.trim()
      );
    }

    if (this.filtros.tamano) {
      productosFiltrados = productosFiltrados.filter(
        (p) => p.tamanio === this.filtros.tamano
      );
    }

    // Actualizar la lista filtrada
    this.productos = productosFiltrados;
  }

  // Limpiar búsqueda general
  limpiarBusqueda(): void {
    this.filtros.textoBusqueda = '';
    this.aplicarFiltros();
  }

  // Limpiar todos los filtros
  limpiarTodosLosFiltros(): void {
    this.filtros = {
      textoBusqueda: '',
      codigoBarras: '',
      nombreProducto: '',
      marca: '',
      pasillo: '',
      tamano: '',
    };

    this.productos = [...this.productosOriginales];
  }

  actualizarContadoresFiltros(productos: Producto[]): void {
    this.totalProductos = productos.length;
    this.productosActivos = productos.filter(
      (p) => p.estatus === 'activo'
    ).length;
    this.productosInactivos = productos.filter(
      (p) => p.estatus === 'inactivo'
    ).length;
  }

  aplicarFiltroRapido(filtro: string): void {
    this.filtroRapido = filtro;

    if (filtro === 'activo') {
      this.productos = this.productosOriginales.filter(
        (p) => p.estatus === 'activo'
      );
    } else if (filtro === 'inactivo') {
      this.productos = this.productosOriginales.filter(
        (p) => p.estatus === 'inactivo'
      );
    } else {
      this.productos = [...this.productosOriginales];
    }

    this.filtros = {
      textoBusqueda: '',
      codigoBarras: '',
      nombreProducto: '',
      marca: '',
      pasillo: '',
      tamano: '',
    };
  }

  mostrarFiltros: boolean = false;

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  abrirModalDetalles(producto: Producto, contenidoModal: any): void {
    this.productoSeleccionado = producto;

    // Abrir el modal
    this.modalService.open(contenidoModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
  }

  tipoVista = 'grid'; // 'grid' o 'list'
  cantidad = 1;

  cambiarVista(tipo: string): void {
    this.tipoVista = tipo;
  }

  exportarExcel(): void {
    if (this.productos.length > 0) {
      this.productExportService.exportToExcel(
        this.productos,
        'Inventario_Productos'
      );
    } else {
      // Mostrar un mensaje al usuario de que no hay productos para exportar
      alert('No hay productos para exportar');
    }
  }

  exportarCsv(): void {
    if (this.productos.length > 0) {
      this.productExportService.exportToCsv(
        this.productos,
        'Inventario_Productos'
      );
    } else {
      // Mostrar un mensaje al usuario de que no hay productos para exportar
      alert('No hay productos para exportar');
    }
  }

  exportarPdf(): void {
    if (this.productos.length > 0) {
      this.pdfExportService.exportToPdf(this.productos, 'Inventario_Productos');
    } else {
      // Manejar caso de lista vacía
      alert('No hay productos para exportar');
    }
  }

  // Métodos auxiliares para mantener el código organizado
private hayOtrosFiltrosActivos(): boolean {
  return !!(
    this.filtros.textoBusqueda.trim() ||
    this.filtros.nombreProducto.trim() ||
    this.filtros.marca ||
    this.filtros.pasillo.trim() ||
    this.filtros.tamano
  );
}

private aplicarFiltrosLocales(): void {
  let productosFiltrados = [...this.productosOriginales];

  // Filtro por texto general (busca en código, nombre y marca)
  if (this.filtros.textoBusqueda.trim()) {
    const texto = this.filtros.textoBusqueda.toLowerCase().trim();
    productosFiltrados = productosFiltrados.filter(
      (p) =>
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(texto)) ||
        (p.nombre_producto && p.nombre_producto.toLowerCase().includes(texto)) ||
        (p.marca && p.marca.toLowerCase().includes(texto))
    );
  }

  // Filtros específicos
  if (this.filtros.codigoBarras.trim()) {
    const codigoBarras = this.filtros.codigoBarras.toLowerCase().trim();
    productosFiltrados = productosFiltrados.filter(
      (p) => p.codigo_barras && p.codigo_barras.toLowerCase().includes(codigoBarras)
    );
  }

  if (this.filtros.nombreProducto.trim()) {
    productosFiltrados = productosFiltrados.filter(
      (p) =>
        p.nombre_producto &&
        p.nombre_producto
          .toLowerCase()
          .includes(this.filtros.nombreProducto.toLowerCase().trim())
    );
  }

  if (this.filtros.marca) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.marca === this.filtros.marca
    );
  }

  if (this.filtros.pasillo.trim()) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.pasillo && p.pasillo.toString() === this.filtros.pasillo.trim()
    );
  }

  if (this.filtros.tamano) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.tamanio === this.filtros.tamano
    );
  }

  // Actualizar la lista filtrada
  this.productos = productosFiltrados;
}

private aplicarFiltrosAdicionales(): void {
  // Comenzamos con el producto único que obtuvimos de la API
  let productosFiltrados = [...this.productos];

  // Aplicamos los demás filtros
  if (this.filtros.textoBusqueda.trim()) {
    const texto = this.filtros.textoBusqueda.toLowerCase().trim();
    productosFiltrados = productosFiltrados.filter(
      (p) =>
        (p.codigo_barras && p.codigo_barras.toLowerCase().includes(texto)) ||
        (p.nombre_producto && p.nombre_producto.toLowerCase().includes(texto)) ||
        (p.marca && p.marca.toLowerCase().includes(texto))
    );
  }

  if (this.filtros.nombreProducto.trim()) {
    productosFiltrados = productosFiltrados.filter(
      (p) =>
        p.nombre_producto &&
        p.nombre_producto
          .toLowerCase()
          .includes(this.filtros.nombreProducto.toLowerCase().trim())
    );
  }

  if (this.filtros.marca) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.marca === this.filtros.marca
    );
  }

  if (this.filtros.pasillo.trim()) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.pasillo && p.pasillo.toString() === this.filtros.pasillo.trim()
    );
  }

  if (this.filtros.tamano) {
    productosFiltrados = productosFiltrados.filter(
      (p) => p.tamanio === this.filtros.tamano
    );
  }

  // Actualizar la lista filtrada
  this.productos = productosFiltrados;
}


}
