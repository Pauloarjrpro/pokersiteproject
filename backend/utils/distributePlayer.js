
const distributePlayers = async(n, m) => {
    // Ensure that n and m are positive integers
    if (typeof n !== 'number' || typeof m !== 'number' || n <= 0 || m <= 0) {
        return "Invalid input. Please provide positive integers for n and m.";
    }

    // Calculate the number of tables needed
    const numTables = Math.ceil(n / m);

    // Calculate the base number of players per table
    const basePlayersPerTable = Math.floor(n / numTables);

    // Calculate the number of tables that get the base number of players
    const tablesWithBasePlayers = n % numTables;

    // Distribute players to tables
    const playersPerTable = Array(numTables).fill(basePlayersPerTable).map((players, index) => {
        // Add 1 player to the first tablesWithBasePlayers tables
        if (index < tablesWithBasePlayers) {
            return players + 1;
        }
        return players;
    });

    return playersPerTable;
}

// Example usage:
// const n = 15; // Number of players
// const m = 7;  // Maximum players per table

// const result = distributePlayers(n, m);
// console.log(result);

module.exports = {
    distributePlayers
  };