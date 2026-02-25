
  // Function to balance players among tables with a max seat constraint
  const balancePlayersWithMaxSeats = async (players, seatsPerTable) => {
    // Sort players by skill level (you can customize the sorting criteria)
    const sortedPlayers = players.sort((a, b) => a.user_id - b.user_id);
  
    // Initialize an array of tables with empty player lists
    const tables = Array.from({ length: Math.ceil(players.length / seatsPerTable) }, () => []);
  
    // Distribute players among tables while respecting the max seat constraint
    sortedPlayers.forEach((player, index) => {
      const tableIndex = index % tables.length;
      tables[tableIndex].push(player);
    });
  
    return tables;
  };
  
  module.exports = {
    balancePlayersWithMaxSeats
  };

