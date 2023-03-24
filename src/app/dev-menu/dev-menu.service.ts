
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class devMenuService {
  private devSubject$ = new Subject<any>();

  constructor() { }

  sendTimerFinished() {
    this.devSubject$.next("TimerFinished");
  }

  onMsg(): Observable<any> {
    return this.devSubject$.asObservable();
  }
  sendLoadGame() {
    this.devSubject$.next("LoadGame");
  }

}
