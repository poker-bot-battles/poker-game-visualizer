import { Component, OnDestroy, OnInit } from '@angular/core';
import { SyncService } from './sync.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css'],
})
export class SyncComponent implements OnInit, OnDestroy {
  subscription: Subscription | undefined;
  messages: any[] = [];
  public id = '';
  public status = 'idle';
  isPlaying = false;
  private LOCALSTORAGE_ID = 'ID';
  public debug = false;

  constructor(public service: SyncService) {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.subscription = this.service.onMessage().subscribe((message) => {
      this.handleMessage(message);
    });
    this.service.connect();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tableid = urlParams.get('table');
    this.service.sendMessage({
      cmd: 'connect',
      type: 'client',
      requested_id: tableid,
    });
  }

  private handleMessage(message: any) {
    if (message) {
      console.log(message);
      this.messages.push(message);
      if (message['cmd'] == 'ACK') {
        this.setId(message['clientId']);
      } else if (message['cmd'] == 'start') {
        this.status = 'start';
      }
    }
  }

  setId(id: string): void {
    this.service.id = id;
    localStorage.setItem(this.LOCALSTORAGE_ID, id);
  }

  getId(): string | null {
    return localStorage.getItem(this.LOCALSTORAGE_ID);
  }

  asStr() {
    return JSON.stringify(this.messages[this.messages.length - 1]);
  }
}
