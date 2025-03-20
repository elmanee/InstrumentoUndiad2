// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlmacenistaComponent } from './features/almacenista/almacenista.component';
import { InventarioComponent } from './features/almacenista/inventario/inventario.component';
import { AgregarProductoComponent } from './features/almacenista/agregar-producto/agregar-producto.component';

const routes: Routes = [
  { path: 'almacenista', component: AlmacenistaComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'agregar-producto', component: AgregarProductoComponent },
  { path: '', redirectTo: '/almacenista', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
