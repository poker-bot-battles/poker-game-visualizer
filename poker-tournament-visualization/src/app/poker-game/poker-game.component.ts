import { Component, OnChanges, OnInit } from '@angular/core';
import { Game, NewPokerGameService, Stage, Hand } from './new-poker-game.service';
import { TestPokerGameService } from './test-poker-game.service';
import { Subscription, interval } from 'rxjs';
import { SyncService, TIME_ENDPOINT } from '../sync/sync.service';
import { HttpClient } from '@angular/common/http';
import { HighlightService } from './highlight.service';
import { first, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-poker-game',
  templateUrl: './poker-game.component.html',
  styleUrls: ['./poker-game.component.css']
})
export class PokerGameComponent implements OnInit, OnChanges {
  syncSubscription: Subscription | undefined;
  highlightHandIds?: number[];
  secondsToSee: number = 15 * 60
  game: Game;
  stage: Stage;
  actionIdx: number = 0;
  handIdx: number = 0;
  isPlay: boolean = false;
  interestingHandIdx = 0;
  interestingHands: Hand[] = []
  endReached: boolean = false
  speed: number = 300
  showControls = false
  delay: number = 30 * 60 * 1000
  timeSubscription: Subscription | undefined;

  constructor(
    private newPokerGameService: NewPokerGameService,
    private testPokerGameService: TestPokerGameService,
    private highlightService: HighlightService,
    private httpClient: HttpClient,
    private syncService: SyncService) {
    this.game = this.newPokerGameService.getTransformedData()
    this.highlightHandIds = this.highlightService.getHighlightedHands(this.newPokerGameService.game, this.game, this.secondsToSee * 1000 / this.speed);
    this.handIdx = this.highlightHandIds[0];
    this.stage = Stage.Preflop;
  }

  ngOnInit(): void {
    console.log("COMP init poker game ... ")
    // use api endpoint to get the delay every 30 seconds
    this.startTimer();

  }
  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.timeSubscription = interval(20000).subscribe(() => {
      this.httpClient.get(TIME_ENDPOINT).pipe(first()).subscribe((data: any) => {
        console.log('COMP got time from api', data);
        
        var startTime = parseInt(data);
        const delay = (startTime * 1000 - Date.now());
        console.log('COMP starting in', delay / 1000 / 60, 'minutes');
        
        if (delay < 0) {
          setTimeout(() => {
            this.loadGame();
            this.stopTimer()
            console.log("COMP starting load and stopping timer ... ")
          }, delay-1000);

          setTimeout(() => {if (!this.isPlay) {
                          this.toggle()}}, delay)}
      });
    });
  }

  stopTimer() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }
  loadGame() {
    this.newPokerGameService.setNewGame(this.syncService.id);
        this
          .newPokerGameService
          .isLoading
          .pipe()
          .subscribe(() => {
            console.log("COMP finishing load ... ")
            this.game = this.newPokerGameService.getTransformedData()
            this.highlightHandIds = this.highlightService.getHighlightedHands(this.newPokerGameService.game, this.game, this.secondsToSee * 1000 / this.speed);
            this.handIdx = this.highlightHandIds[0];
            this.stage = Stage.Preflop;
          })
        }


  ngOnChanges(): void {
  }

  toggleControls(){
    this.showControls = !this.showControls
  }

  toggle() {
    this.isPlay = !this.isPlay;
    if (this.isPlay && this.game) {
      this.endReached = false;
      this.interestingHandIdx = 0;
      this.interestingHands = this.game.hands.filter(x => {
        if (this.highlightHandIds) {
          return this.highlightHandIds.includes(x.handId);
        } else {
          return false
        }
      });
      this.handSliderOnChange(this.interestingHands[this.interestingHandIdx].handId);
      this.movestep()

    }
  }

  movestep() {
    console.log(this.interestingHands[this.interestingHandIdx].steps[this.actionIdx].timeconstant * this.speed)
    setTimeout(() => {
      if (this.isPlay) {
        if (this.actionIdx < this.getMaxActions()) {
          this.sliderOnChange(this.actionIdx + 1);
        } else if (this.actionIdx == this.getMaxActions() && this.endReached) {
          this.interestingHandIdx += 1;
          this.endReached = false;
          if (this.highlightHandIds && this.interestingHandIdx < this.highlightHandIds.length) {
            this.handSliderOnChange(this.interestingHands[this.interestingHandIdx].handId);
          } else {
            this.handSliderOnChange(this.getMaxHands());
            this.sliderOnChange(this.getMaxActions());
            this.toggle();
          }
        } else {
          this.endReached = true;
        }
        if (this.isPlay) {
          this.movestep()
        }

      }
    }, this.interestingHands[this.interestingHandIdx].steps[this.actionIdx].timeconstant * this.speed);
  }

  setStage(val?: number): void {
    if (!this.game) {
      return
    }
    const newValue = val ?? this.actionIdx;
    let currentStage = Stage.Preflop;
    let stagelist = this.game.hands[this.handIdx].steps.slice(0, newValue + 1).filter(obj => obj.boardState?.stage != null)
    this.stage = stagelist.length > 0 ? stagelist[stagelist.length - 1].boardState!.stage! : currentStage;
  }

  getMaxActions(): number {
    if (!this.game) {
      return 0
    }
    const actions = this.game.hands[this.handIdx].steps.length - 1;
    return actions; // +1 for the show-down
  }

  sliderOnChange(val: any) {
    this.setStage(val)
    this.actionIdx = val
  }

  getMaxHands(): number {
    if (!this.game) {
      return 0
    }
    const hands = this.game.hands.length - 1;
    return hands; // +1 for the show-down
  }

  handSliderOnChange(val: any) {
    this.handIdx = val;
    this.actionIdx = 0;
  }
}

