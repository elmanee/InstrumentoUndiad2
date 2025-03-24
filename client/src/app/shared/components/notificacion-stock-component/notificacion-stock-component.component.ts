import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, interval, Subscription } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { NotificacionService } from '../../../services/notificacion-service.service';
import { Producto } from '../../../models/Producto';

@Component({
  selector: 'app-notificacion-stock',
  templateUrl: './notificacion-stock-component.component.html',
  styleUrls: ['./notificacion-stock-component.component.css']
})
export class NotificacionStockComponent{

}
