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
  public id: string = '';
  public status: string = 'idle';
  isPlaying: boolean = false;
  private LOCALSTORAGE_ID = "ID"
  public debug = false;

  constructor(public service: SyncService) { }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  ngOnInit(): void {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const tableid = urlParams.get('table');
    //set id to tableid if it is set
    if (tableid) {
      console.log("COMP tableid is set to ", tableid);
      this.setId(tableid);
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
