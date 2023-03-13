import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
export const RECONNECT_INTERVAL = environment.reconnectInterval;
export const TIME_ENDPOINT = environment.timeEndpoint;

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  public id: string | null = null;
}
