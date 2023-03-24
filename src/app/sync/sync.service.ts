import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable, timer, Subject, EMPTY } from 'rxjs';
import {
  retryWhen,
  tap,
  delayWhen,
  switchAll,
  catchError,
} from 'rxjs/operators';
export const RECONNECT_INTERVAL = environment.reconnectInterval;
export const TIME_ENDPOINT = environment.timeEndpoint;

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  public id: string | null = null;
}
