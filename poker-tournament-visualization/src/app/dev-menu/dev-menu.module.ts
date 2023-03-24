import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevMenuComponent } from './dev-menu.component';
import { NewPokerGameService } from '../poker-game/new-poker-game.service';
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [DevMenuComponent],
  exports: [DevMenuComponent],
  imports: [CommonModule, FormsModule],
  providers: [NewPokerGameService],
})
export class DevMenuModule {}
