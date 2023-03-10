import { Component, OnInit, OnDestroy  } from '@angular/core';
import { NewPokerGameService } from '../poker-game/new-poker-game.service';
import { HttpClient } from '@angular/common/http';
import { devMenuService } from './dev-menu.service';

export interface TimestampJSON {
  timestamp: number;
}

@Component({
  selector: 'dev-menu',
  templateUrl: './dev-menu.component.html',
  styleUrls: ['./dev-menu.component.css']
})
export class DevMenuComponent implements OnInit, OnDestroy  {
  public showMenu: boolean = false;
  public activeJSON: string = "";
  public timestamp: string = "";
  public countdown: number = 0;
  private timerInterval: any;
  private syncInterval: any;

  public jsonUrl: string = "";
  public syncUrl: string = "";

  constructor(
      private newPokerGameService: NewPokerGameService,
      private devMenuService: devMenuService,
      private http: HttpClient
    ) {

  }

  ngOnInit(): void {
    //auto sync every 10 seconds
    this.syncInterval = setInterval(() => {
      this.getRemoteSyncTime();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  loadJsonFile(event: Event):void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      if (fileList[0].type == "application/json") {
        this.newPokerGameService.setNewGameFromJSON(fileList[0]);
        this.devMenuService.sendLoadGame();
        this.activeJSON = fileList[0].name;
      }
    }
  }

  loadJsonUrl():void {
    if (!this.jsonUrl || this.jsonUrl == "") return;
    console.log("Getting: ",this.jsonUrl);
    this.activeJSON = this.jsonUrl;
    this.newPokerGameService.setNewGameFromURL(this.jsonUrl);
    this.devMenuService.sendLoadGame();

  }

  toggleMenu():void {
    this.showMenu = !this.showMenu;
  }


  // Get Timestamp from server and set countdown
  async getRemoteSyncTime(): Promise<void> {
    if (!this.syncUrl || this.syncUrl == "") return;
    this.http.get<TimestampJSON>(this.syncUrl)
      .subscribe(data => {
        if (!data["timestamp"]) return;
        let date = new Date(+data["timestamp"]);
        //console.log("Got new Timestamp: ", date.toLocaleString("dk-DK"));
        if (date.toLocaleString("dk-DK") == this.timestamp) return;
        console.log("Setting new Timestamp")
        this.timestamp = date.toLocaleString("dk-DK");
        this.setCountdown(date);
      })
  }

  setCountdown(startTime: Date): void {
    if (this.getTimeDiff(startTime) < 0) {
      this.countdown = -1;
    } else {
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        let diff = this.getTimeDiff(startTime);
        this.countdown = Math.floor(diff / 1000);

        if (this.countdown <= 0) {
          clearInterval(this.timerInterval);
          this.devMenuService.sendTimerFinished();
        }
      });
    }
  }

  private getTimeDiff(startTime: Date): number {
    let now = new Date();
    let diff = startTime.getTime() - now.getTime();
    return diff;
  }
}
