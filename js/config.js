var configMentor = {
    ANO: 2016,
    SEMESTRE: 1,
    userName: 'leitor',
    password: 'SoSeiLer',
    server: '192.168.9.232',
    options: {
        database: 'mentor', 
        port: '4304',
        rowCollectionOnDone: true,
        requestTimeout: 15000,
        connectTimeout: 15000
    }
};
var configPostfix = {
    host     : 'localhost',
    port     : '3306',
    user     : 'root',
    password : 'root',
    database : 'postfix',
    connectionLimit : 50,
    connectTimeout: 15000,
    waitForConnections: true
};
var configMoodle = {
    url        : 'http://aep.fasb.edu.br',
    user       : 'admin', 
    password   : 'Aep2016@dmin',     
    service    : 'mentor_sync',  
    PERFIL_ESTUDANTE: 5,
    PERFIL_PROFESSOR: 3,
    CONEXAO_SIMULTANEA_MOODLE: 50, // Define quantas conexoes seram criadas ao mesmo tempo no moodle, um numero muito alto pode derrubar o servidor, um numero muito baixo vai demorar de mais a sincronia.    
};

module.exports = {    
    configMentor: configMentor,
    configMoodle: configMoodle,
    configPostfix: configPostfix,
};