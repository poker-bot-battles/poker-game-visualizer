/* eslint-disable linebreak-style */
/* eslint-disable require-jsdoc */
import * as core from '@angular/core';

@core.Component({
  selector: 'app-fast-forward-icon',
  templateUrl: './fast-forward-icon.component.html',
  styleUrls: ['./fast-forward-icon.component.css'],
})
export class FastForwardIconComponent implements core.OnInit, core.OnChanges {
  @core.Input() fastForwarding: boolean;

  constructor() {
    this.fastForwarding = true;
  }

  ngOnInit(): void {}

  ngOnChanges(changes: { [fastForwarding: string]: core.SimpleChange }): void {
    //console.log('card group changes');
    //console.log(JSON.stringify(changes));
    if (changes['fastForwarding']) {
      this.fastForwarding = changes['fastForwarding'].currentValue;
    }
  }
}
