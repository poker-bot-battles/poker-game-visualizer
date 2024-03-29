import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PokerGameComponent } from './poker-game/poker-game.component';

const routes: Routes = [
  { path: '**', component: PokerGameComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      // { enableTracing: true } // <-- debugging purposes only)],
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
