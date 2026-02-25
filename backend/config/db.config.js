module.exports = {
    // HOST:"13.53.216.3",
    HOST:"127.0.0.1",
    USER:"root",
    PASSWORD:"",
    DB:"txpoker",
    dialect:"mysql",
    pool:{
        max:5,
        min:0,
        acquire:30000,
        idle:10000,
    }
}