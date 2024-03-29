import { Injectable } from '@angular/core';
import { Game, HandEvent, HandJSON, Players } from './new-poker-game.service';

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  constructor() {
    null;
  }

  getHighlightedHands(
    gameRaw: HandJSON[],
    gameTransformed: Game,
    timerestrain: number,
  ): number[] {
    const gameList: HandJSON[] = [];
    for (let i = 0; i < gameRaw.length; i++) {
      gameList.push(gameRaw[i]);
    }
    this.addHandScores(gameList);
    const sortedGames = gameList
      .sort((a, b) => (b.highlight_score ?? 0) - (a.highlight_score ?? 0))
      .map((x) => ({ count: x.hand_count, score: x.highlight_score }));
    const highlights: number[] = [];
    let sumTimeConstant = 0;
    sortedGames.forEach((x) => {
      if (timerestrain > sumTimeConstant) {
        sumTimeConstant =
          sumTimeConstant + gameTransformed.hands[x.count].totalTimeconstant;
        highlights.push(x.count);
      }
    });

    const highlightHandIds = highlights.sort((a, b) => a - b);
    return highlightHandIds;
  }

  addHandScores(hands: HandJSON[]) {
    for (let i = 0; i < hands.length; i++) {
      const handData = hands[i];
      const defeatedPlayersNextHandOrUndefined = hands[i + 1]?.defeated_players;
      hands[i].highlight_score = this.getHandScore(
        handData,
        defeatedPlayersNextHandOrUndefined,
      );
    }
  }

  getHandScore(
    handData: HandJSON,
    defeatedPlayersNextHandOrUndefined?: Players[],
  ): number {
    let score = 0;

    if (this.anyElimination(handData, defeatedPlayersNextHandOrUndefined)) {
      score += 100000;
    }

    score += this.getPotSizeScore(handData);
    score += this.getOutplayScore(handData);

    return score;
  }

  anyElimination(
    handData: HandJSON,
    defeatedPlayersNextHandOrUndefined?: Players[],
  ): boolean {
    if (this.isLastHand(defeatedPlayersNextHandOrUndefined)) {
      return true;
    } else {
      return (
        handData.defeated_players.length !==
        defeatedPlayersNextHandOrUndefined?.length
      );
    }
  }

  isLastHand(defeatedPlayersNextHandOrUndefined: Players[] | undefined) {
    return defeatedPlayersNextHandOrUndefined === undefined;
  }

  getPotSizeScore(handData: HandJSON): number {
    const bigBlind = handData.hand_events[1].action;
    const rewards = handData.hand_events
      .filter((x) => x.type === 'reward')
      .map((x) => x.reward ?? 0);
    const potSize = rewards.filter((x) => x > 0).reduce((acc, x) => acc + x, 0);
    const potSizeInBigBlinds = potSize / bigBlind;
    return potSizeInBigBlinds * 1 + potSize * 0.001;
  }

  getOutplayScore(handData: HandJSON): number {
    const flopIndex = handData.hand_events.findIndex((x) => x.player == -1);
    if (flopIndex == -1) {
      return 0;
    }

    const postFlopEvents = handData.hand_events.slice(flopIndex);
    const foldActionIndexes = postFlopEvents.reduce(
      (res, x, idx) => (x.action === 0 ? res.concat([idx]) : res),
      new Array<number>(),
    );
    if (foldActionIndexes.length === 0) {
      return 0;
    }

    let outplayScore = 0;
    foldActionIndexes.forEach((idx) => {
      const playerid = postFlopEvents[idx].player;
      const foldingWinChance = postFlopEvents
        .filter((x) => x.player === playerid && x.type === 'win_chance')
        .pop()?.win_chance;
      outplayScore += (foldingWinChance ?? 0) * 100;
    });
    return outplayScore;
  }
}
