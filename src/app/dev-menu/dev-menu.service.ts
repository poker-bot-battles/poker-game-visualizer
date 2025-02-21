
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

type MessageWithoutValue = 'LoadGame' | 'TimerFinished';
type MessageWithValue = 'SpeedChange';

type DevMenuMessageWithoutValue = {
  message: MessageWithoutValue;
  value?: never;
};

type DevMenuMessageWithValue = {
  message: MessageWithValue;
  value: any;
};

export type DevMenuMessage =
  | DevMenuMessageWithoutValue
  | DevMenuMessageWithValue;

@Injectable({
  providedIn: 'root',
})
export class devMenuService {
  private devSubject$ = new Subject<any>();

  constructor() { }

  sendTimerFinished() {
    const msg: DevMenuMessage = {
      message: 'TimerFinished',
    };
    this.devSubject$.next(msg);
  }

  sendSpeedChange(speed: number) {
    const msg: DevMenuMessage = {
      message: 'SpeedChange',
      value: speed,
    };
    this.devSubject$.next(msg);
  }

  onMsg(): Observable<any> {
    return this.devSubject$.asObservable();
  }
  sendLoadGame() {
    const msg: DevMenuMessage = {
      message: 'LoadGame',
    };
    this.devSubject$.next(msg);
  }

}
