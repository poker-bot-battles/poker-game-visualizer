import { Component, OnChanges, OnInit } from '@angular/core';
import {
  Game,
  NewPokerGameService,
  Stage,
  Hand,
} from './new-poker-game.service';
import { TestPokerGameService } from './test-poker-game.service';
import { Subscription } from 'rxjs';
import { SyncService } from '../sync/sync.service';
import { HighlightService } from './highlight.service';
import { first } from 'rxjs/operators';
import { devMenuService } from '../dev-menu/dev-menu.service';

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
  endReached: boolean = false;
  speed: number; // milliseconds pr. action
  defaultSpeed: number = 300; // milliseconds pr. action (multiplied by some constant based on the stage - see new-poker-game.service.ts)
  fastForwardSpeed: number = 100; // milliseconds pr. action (not multiplied by any constant)
  fastForwarding: boolean = false;
  showControls = false;

  constructor(
    private newPokerGameService: NewPokerGameService,
    private testPokerGameService: TestPokerGameService,
    private highlightService: HighlightService,
    private syncService: SyncService,
    private devMenuService: devMenuService
  ) {
    this.game = this.newPokerGameService.getTransformedData();
    this.speed = this.defaultSpeed;
    this.highlightHandIds = this.highlightService.getHighlightedHands(
      this.newPokerGameService.game,
      this.game,
      (this.secondsToSee * 1000) / this.defaultSpeed
    );
    this.handIdx = 0;
    this.stage = Stage.Preflop;
  }

  ngOnInit(): void {
    //subscribe to the dev menu service
    this.devMenuService.onMsg().subscribe((msg) => {
      if (msg == "TimerFinished") {
        this.toggle();
      } else if (msg == "LoadGame") {
        this.loadGame();
      }
    })

    this.syncSubscription = this.syncService
      .onMessage()
      .subscribe((message) => {
        if (message && message['cmd'] == 'start') {
          console.log('will start when loading is done ... ');

          if (this.newPokerGameService.isLoading) {
            this.newPokerGameService.isLoading.pipe(first()).subscribe(() => {
              console.log('starting after waiting ... ');
              if (!this.isPlay) {
                this.toggle();
              }
            });
          } else {
            console.log('already loaded starting now ... ');
            if (!this.isPlay) {
              this.toggle();
            }
          }
        } else if (message && message['cmd'] == 'load') {
          if (this.isPlay) {
            this.toggle();
          }
          console.log('load instruction ... ');
          const jsonnr = this.syncService.id;
          const jsonToPlay = 'table-' + jsonnr + '.json';
          console.log(jsonToPlay);
          console.log('after logging json');
          this.newPokerGameService.setNewGame(jsonToPlay);
          this.loadGame();

        }
      });
  }

  loadGame() {
    this.newPokerGameService.isLoading.pipe().subscribe(() => {
      console.log('finishing load ... ');
      this.game = this.newPokerGameService.getTransformedData();
      this.highlightHandIds = this.highlightService.getHighlightedHands(
        this.newPokerGameService.game,
        this.game,
        (this.secondsToSee * 1000) / this.speed,
      );
      this.handIdx = this.highlightHandIds[0];
      this.stage = Stage.Preflop;
    });
  }

  ngOnChanges(): void {}

  toggleControls() {
    this.showControls = !this.showControls;
  }

  getTimeForAction(handIdx: number, actionIdx: number) {
    if (this.highlightHandIds?.includes(handIdx)) {
      this.fastForwarding = false;
      return (
        this.game.hands[handIdx].steps[actionIdx].timeconstant *
        this.defaultSpeed
      );
    } else {
      this.fastForwarding = true;
      return this.fastForwardSpeed;
    }
  }

  toggle() {
    this.isPlay = !this.isPlay;
    if (this.isPlay && this.game) {
      this.endReached = false;
      if (this.highlightHandIds?.includes(this.handIdx)) {
        this.fastForwarding = false;
        this.speed = this.defaultSpeed;
      } else {
        this.fastForwarding = true;
        this.speed = this.fastForwardSpeed;
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
            this.highlightHandIds &&
            this.interestingHandIdx < this.highlightHandIds.length
          ) {
            if (this.highlightHandIds.includes(newHandIdx)) {
              this.fastForwarding = false;
              this.speed = this.defaultSpeed;
            } else {
              this.fastForwarding = true;
              this.speed = this.fastForwardSpeed;
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
