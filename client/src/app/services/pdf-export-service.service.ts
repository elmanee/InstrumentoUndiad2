import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Producto } from '../../app//services/almacenista.service'; 

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  /**
   * Exporta lista de productos a PDF
   * @param productos Array de productos a exportar
   * @param nombreArchivo Nombre del archivo PDF
   */
  exportToPdf(productos: Producto[], nombreArchivo: string = 'inventario_productos'): void {
    // Validar que existan productos
    if (!productos || productos.length === 0) {
      console.warn('No hay productos para exportar');
      return;
    }

    // Crear nueva instancia de jsPDF
    const doc = new jsPDF('landscape');

    // Configurar encabezado del documento
    doc.setFontSize(18);
    doc.text('Inventario de Productos', 14, 22);

    // Configurar fecha de generación
    const fechaGeneracion = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaGeneracion}`, 14, 30);

    // Preparar datos para la tabla
    const tableColumn = [
      'Código Barras',
      'Nombre Producto',
      'Categoría',
      'Precio Caja',
      'Precio Pieza',
      'Existencia Almacén',
      'Existencia Exhibición'
    ];

    const tableRows = productos.map(producto => [
      this.convertToSafeString(producto.codigo_barras),
      this.convertToSafeString(producto.nombre_producto),
      this.convertToSafeString(producto.categoria),
      this.formatCurrency(this.safeNumberValue(producto.precio_caja)),
      this.formatCurrency(this.safeNumberValue(producto.precio_pieza)),
      this.safeNumberValue(producto.existencia_almacen),
      this.safeNumberValue(producto.existencia_exhibe)
    ]);

    // Generar tabla con autoTable
    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.pages.length - 1;
        const pageNumber = data.pageNumber;

        doc.setFontSize(10);
        doc.text(
          `Página ${pageNumber} de ${pageCount} - Total Productos: ${productos.length}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Descargar PDF
    doc.save(`${nombreArchivo}_${fechaGeneracion}.pdf`);
  }

  /**
   * Convierte cualquier valor a una cadena segura
   * @param value Valor a convertir
   * @returns Valor formateado como cadena
   */
  private convertToSafeString(value: any): string {
    // Manejar casos especiales
    if (value === null || value === undefined) return 'N/A';

    // Si ya es una cadena, usar método trim
    if (typeof value === 'string') {
      return value.trim() !== '' ? value.trim() : 'N/A';
    }

    // Convertir otros tipos a cadena
    return String(value).trim() || 'N/A';
  }

  /**
   * Formatea un valor numérico de manera segura
   * @param value Valor a formatear
   * @returns Valor formateado o 0
   */
  private safeNumberValue(value?: number): number {
    return value !== undefined && !isNaN(value) ? value : 0;
  }

  /**
   * Formatea un valor de moneda
   * @param value Valor a formatear
   * @returns Cadena formateada de moneda
   */
  private formatCurrency(value: number): string {
    return `$${value.toFixed(2)}`;
  }
}
