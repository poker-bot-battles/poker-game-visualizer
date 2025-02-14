import { Component, OnChanges, OnInit } from '@angular/core';
import {
  Game,
  NewPokerGameService,
  Stage,
  Hand,
} from './new-poker-game.service';
import { TestPokerGameService } from './test-poker-game.service';
import { Subscription, interval } from 'rxjs';
import { SyncService, TIME_ENDPOINT } from '../sync/sync.service';
import { HttpClient } from '@angular/common/http';
import { HighlightService } from './highlight.service';
import { first } from 'rxjs/operators';
import { DevMenuMessage, devMenuService } from '../dev-menu/dev-menu.service';

@Component({
  selector: 'app-poker-game',
  templateUrl: './poker-game.component.html',
  styleUrls: ['./poker-game.component.css'],
})
export class PokerGameComponent implements OnInit, OnChanges {
  syncSubscription: Subscription | undefined;
  highlightHandIds?: number[];
  secondsToSee: number = 15 * 60;
  game: Game;
  stage: Stage;
  actionIdx = 0;
  handIdx = 0;
  isPlay = false;
  interestingHandIdx = 0;
  interestingHands: Hand[] = [];
  endReached = false;
  speed: number; // milliseconds pr. action
  defaultSpeed = 300; // milliseconds pr. action (multiplied by some constant based on the stage - see new-poker-game.service.ts)
  fastForwardSpeed = 100; // milliseconds pr. action (not multiplied by any constant)
  absoluteFastestSpeedDoNotExceed = 25; // milliseconds pr. action (not multiplied by any constant)
  fastForwarding = false;
  showControls = false;
  timeSubscription: Subscription | undefined;

  constructor(
    private newPokerGameService: NewPokerGameService,
    private testPokerGameService: TestPokerGameService,
    private highlightService: HighlightService,
    private httpClient: HttpClient,
    private syncService: SyncService,
    private devMenuService: devMenuService,
  ) {
    this.game = this.newPokerGameService.getTransformedData();
    this.speed = this.defaultSpeed;
    this.highlightHandIds = [];
    this.handIdx = 0;
    this.stage = Stage.Preflop;
  }

  ngOnInit(): void {
    console.log('COMP init poker game ... ');
    // use api endpoint to get the delay every 30 seconds
    this.startTimer();
    // subscribe to the dev menu service
    this.devMenuService.onMsg().subscribe((msg: DevMenuMessage) => {
      const { message } = msg;
      if (message == 'TimerFinished') {
        this.toggle();
      } else if (message == 'LoadGame') {
        this.loadGame();
      } else if (message == 'SpeedChange') {
        const { value } = msg;
        this.defaultSpeed = value;
      }
    });
  }
  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.timeSubscription = interval(10000).subscribe(() => {
      this.httpClient
        .get(TIME_ENDPOINT)
        .pipe(first())
        .subscribe((data: any) => {
          console.log('COMP got time from api', data);

          const startTime = parseInt(data);
          const delay = startTime - Date.now();
          console.log('COMP starting in', delay / 1000 / 60, 'minutes');

          if (delay < 0) {
            setTimeout(() => {
              this.loadGame();
              this.stopTimer();
              console.log('COMP starting load and stopping timer ... ');
            }, delay - 1000);

            setTimeout(() => {
              if (!this.isPlay) {
                this.toggle();
              }
            }, delay);
          }
        });
    });
  }

  loadGame() {
    const id = this.syncService.id;
    if (id) {
      this.newPokerGameService.setNewGame(id);
    } else {
      this.newPokerGameService.setNewGame('1'); // default
    }
    this.newPokerGameService.isLoading.pipe().subscribe(async () => {
      console.log('COMP finishing load ... ');
      this.game = await this.newPokerGameService.getTransformedData();
      this.speed = this.defaultSpeed;
      this.highlightHandIds = this.highlightService.getHighlightedHands(
        this.newPokerGameService.game,
        this.game,
        (this.secondsToSee * 1000) / this.defaultSpeed,
      );
      this.handIdx = 0;
    });
  }

  stopTimer() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  ngOnChanges(): void {
    null;
  }

  isPreviewGame(): boolean {
    return (this.highlightHandIds?.length ?? 0) === 0;
  }

  toggleControls() {
    this.showControls = !this.showControls;
  }

  getTimeForAction(handIdx: number, actionIdx: number) {
    console.log('COMP getTimeForAction', handIdx, this.highlightHandIds);
    if (this.isPreviewGame() || this.highlightHandIds?.includes(handIdx)) {
      this.fastForwarding = false;
      return (
        this.game.hands[handIdx].steps[actionIdx].timeconstant *
        this.defaultSpeed
      );
    } else {
      if (this.fastForwarding) {
        return Math.max(this.speed * 0.9, this.absoluteFastestSpeedDoNotExceed);
      }
      this.fastForwarding = true;
      return this.fastForwardSpeed;
    }
  }

  toggle() {
    this.isPlay = !this.isPlay;
    if (this.isPlay && this.game) {
      this.endReached = false;
      if (
        this.isPreviewGame() ||
        this.highlightHandIds?.includes(this.handIdx)
      ) {
        this.fastForwarding = false;
        this.speed = this.defaultSpeed;
      } else {
        if (this.fastForwarding) {
          this.speed = Math.max(
            this.speed * 0.9,
            this.absoluteFastestSpeedDoNotExceed,
          );
        } else {
          this.fastForwarding = true;
          this.speed = this.fastForwardSpeed;
        }
      }
      this.movestep();
    }
  }

  movestep() {
    setTimeout(() => {
      if (this.isPlay) {
        if (this.actionIdx < this.getMaxActions()) {
          this.sliderOnChange(this.actionIdx + 1);
        } else if (this.actionIdx == this.getMaxActions() && this.endReached) {
          const newHandIdx = this.handIdx + 1;
          this.endReached = false;
          if (
            this.isPreviewGame() ||
            (this.highlightHandIds &&
              this.interestingHandIdx < this.highlightHandIds.length)
          ) {
            if (this.highlightHandIds?.includes(newHandIdx)) {
              this.fastForwarding = false;
              this.speed = this.defaultSpeed;
            } else {
              if (this.fastForwarding) {
                this.speed = Math.max(
                  this.speed * 0.9,
                  this.absoluteFastestSpeedDoNotExceed,
                );
              } else {
                this.fastForwarding = true;
                this.speed = this.fastForwardSpeed;
              }
            }
            this.handSliderOnChange(newHandIdx);
          } else {
            this.handSliderOnChange(this.getMaxHands());
            this.sliderOnChange(this.getMaxActions());
            this.toggle();
          }
        } else {
          this.endReached = true;
        }
        if (this.isPlay) {
          this.movestep();
        }
      }
    }, this.getTimeForAction(this.handIdx, this.actionIdx));
  }

  setStage(val?: number): void {
    if (!this.game) {
      return;
    }
    const newValue = val ?? this.actionIdx;
    const currentStage = Stage.Preflop;
    const stagelist = this.game.hands[this.handIdx].steps
      .slice(0, newValue + 1)
      .filter((obj) => obj.boardState?.stage != null);
    this.stage =
      stagelist.length > 0
        ? stagelist[stagelist.length - 1].boardState!.stage!
        : currentStage;
  }

  getMaxActions(): number {
    if (!this.game) {
      return 0;
    }
    const actions = this.game.hands[this.handIdx].steps.length - 1;
    return actions; // +1 for the show-down
  }

  sliderOnChange(val: any) {
    this.setStage(val);
    this.actionIdx = val;
  }

  getMaxHands(): number {
    if (!this.game) {
      return 0;
    }
    const hands = this.game.hands.length - 1;
    return hands; // +1 for the show-down
  }

  handSliderOnChange(val: any) {
    this.handIdx = val;
    this.actionIdx = 0;
  }
}
