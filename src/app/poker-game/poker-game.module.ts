import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokerGameComponent } from './poker-game.component';
import { PokerGameService } from './poker-game.service';
import { PokerTableComponent } from '../poker-table/poker-table.component';
import { PokerPlayerComponent } from '../poker-player/poker-player.component';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { FormsModule } from '@angular/forms';
import { PokerActionComponent } from '../poker-action/poker-action.component';
import { CardGroupComponent } from '../card-group/card-group.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { StackerComponent } from '../stacker/stacker.component';
import { ChipsComponent } from '../chips/chips.component';
import { NewPokerGameService } from './new-poker-game.service';
import { SyncModule } from '../sync/sync.module';
import { DevMenuModule } from '../dev-menu/dev-menu.module';
import { FastForwardIconComponent } from '../fast-forward-icon/fast-forward-icon.component';

@NgModule({
  declarations: [
    PokerGameComponent,
    PokerTableComponent,
    PokerPlayerComponent,
    PokerActionComponent,
    CardGroupComponent,
    StackerComponent,
    ChipsComponent,
    FastForwardIconComponent,
  ],
  imports: [
    CommonModule,
    MatSliderModule,
    MatGridListModule,
    FormsModule,
    SyncModule,
    DevMenuModule,
  ],
  exports: [PokerGameComponent],
  providers: [PokerGameService, NewPokerGameService],
})
export class PokerGameModule {}
