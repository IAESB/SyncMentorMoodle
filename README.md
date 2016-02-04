# SyncMentorMoodle
Sincroniza a base do moodle com o mentor

Este aplicativo quando execultado lista todos os cursos do mentor e insere no moodle, para cada curso iserido ele busca o respectivo professor e insere um novo usuario para ele e o associa ao referido curso,
logo apos ele tras do mentor todos os alunos desse curso cria um novo usuario para cada um dele e o associa ao curso. 
Todo o codigo foi escrito em JavaScript e rodo em cima do Node.js

Instalação
----------
Para instalação antes verefique os sequintes pre requisitos: nodejs, npm, node-mysql, node-tedious, node-sync. Para instala-los no ubuntu rode:
- sudo apt-get install nodejs npm unzip -y

Baixe o projeto, descompacte e entre na pasta:
- wget https://github.com/IAESB/SyncMentorMoodle/archive/master.zip
- unzip master.zip
- cd SyncMentorMoodle-master

Instale dependecias adicionais:
- npm install tedious mysql sync

Configuração
------------
Exitem três coisas a serem configuradas: a conexao com a base do mentor, a conexão com a base de email e a conexao com o web service do moodle. Para isso
entre no arquivo js/config.js e altere os seguintes parametros:
```ruby
var configMentor = {
    ANO: 2015,
    SEMESTRE: 2,
    userName: 'user',
    password: 'passww',
    server: 'local.db',
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
    password   : 'passworddd',     
    service    : 'mentor_sync',  
    PERFIL_ESTUDANTE: 5,
    PERFIL_PROFESSOR: 3,
    CONEXAO_SIMULTANEA_MOODLE: 50, // Define quantas conexoes seram criadas ao mesmo tempo no moodle, um numero muito alto pode derrubar o servidor, um numero muito baixo vai demorar de mais a sincronia.    
};
```

Executar
--------
Agora basta rodar com o comando:
- nodejs js/main-node.js
