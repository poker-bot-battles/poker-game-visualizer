import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokerGameModule } from './poker-game/poker-game.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { SyncModule } from './sync/sync.module';
import { HttpClientModule } from '@angular/common/http';
import { DevMenuModule } from './dev-menu/dev-menu.module';
import { FormsModule  } from '@angular/forms';
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PokerGameModule,
    BrowserAnimationsModule,
    MatSliderModule,
    SyncModule,
    HttpClientModule,
    DevMenuModule,
    FormsModule,
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
