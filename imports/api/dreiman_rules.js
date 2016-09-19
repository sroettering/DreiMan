export const Dreiman = {
  // determines if a player is a dreiman in this round
  determineDreiman: (die1, die2, currentPlayer, players) => {
    const sum = die1 + die2;
    let player = players[currentPlayer];

    // dreimanCount can max be 2 after these ifs
    if(sum === 3) player.dreimanCount++;
    if(die1 === 3) player.dreimanCount++;
    if(die2 === 3) player.dreimanCount++;
  },
  // function for distributing gulps to neighbours
  handleNeighbours: (die1, die2, currentPlayer, players) => {
    const sum = die1 + die2;
    const numPlayers = players.length;

    // 5 or 7? left player drinks
    if(sum === 5 || sum === 7) {
      const leftNeighbour = (currentPlayer + 1) % numPlayers;
      players[leftNeighbour].currentGulps = players[leftNeighbour].currentGulps + 1;
    }

    // 9 or 11? right player drinks
    if(sum === 9 || sum === 11) {
      // the currentPlayer index has to be shifted around one time, because -1 % numPlayers = -1
      const rightNeighbour = (currentPlayer + numPlayers - 1) % numPlayers;
      players[rightNeighbour].currentGulps = players[rightNeighbour].currentGulps + 1;
    }
  },
  // function for distributing gulps to all dreiman
  handleDreiman: (die1, die2, players) => {
    const sum = die1 + die2;

    // if sum is 3, neither die1 nor die2 can be 3.
    // if both dice are 3, every dreiman drinks twice!
    if(sum === 3) {
      for(let i = 0; i < players.length; i++) {
        // for every player add the amount of threes rolled in the dreiman-round
        players[i].currentGulps = players[i].currentGulps + players[i].dreimanCount;
      }
    }

    if(die1 === 3) {
      for(let i = 0; i < players.length; i++) {
        // for every player add the amount of threes rolled in the dreiman-round
        players[i].currentGulps = players[i].currentGulps + players[i].dreimanCount;
      }
    }

    if(die2 === 3) {
      for(let i = 0; i < players.length; i++) {
        // for every player add the amount of threes rolled in the dreiman-round
        players[i].currentGulps = players[i].currentGulps + players[i].dreimanCount;
      }
    }
  },
}
