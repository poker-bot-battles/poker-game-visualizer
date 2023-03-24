/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
import * as core from '@angular/core';

@core.Component({
  selector: 'app-card-group',
  templateUrl: './card-group.component.html',
  styleUrls: ['./card-group.component.css'],
})
export class CardGroupComponent implements core.OnInit, core.OnChanges {
  @core.Input() cards: string[] = [];
  @core.Input() overlap = false;
  cardsToShow: string[] = [];

  constructor() {
    null;
  }

  ngOnInit(): void {
    null;
  }

  ngOnChanges(): void {
    this.cardsToShow = this.cards.map(this.mapToAsset).map(this.mapToPath);
  }

  mapToAsset(card: string): string {
    const rank = card[0] == 'T' ? 10 : card[0];
    const suit = card[1].toUpperCase();
    return rank + suit;
  }
  mapToPath(mapToPath: string): string {
    return `assets/cards/${mapToPath}.svg`;
  }
}
