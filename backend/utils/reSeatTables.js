
const reSeatTables = async(tables, balancedTables) => {

    let temp = [];
    for (let index = 0; index < tables.length; index++) {
        const count = tables[index].users.filter(t => !t.bot).length;

        let balancedCount = 0;

        if(balancedTables.length > index){
            balancedCount = balancedTables[index];
        } 
        
        if(count > balancedCount){
            
        }
        
    }

    return playersPerTable;
}

// Example usage:
// const n = 15; // Number of players
// const m = 7;  // Maximum players per table

// const result = distributePlayers(n, m);
// console.log(result);

module.exports = {
    reSeatTables
  };