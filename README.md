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

WebService do Moodle
--------------------
Para haver uma cenexao com o moodle é necessario que seu webservice esteja ativado e devidamente configurado, para isso na página:
> Administração do site => Plugins => Plugins => Serviços da Web => Resumo

Aqui você vai encontrar varios itens a serem seguidos para habilitar o WebService, somente os itens 1, 2, 5 e 6 são necessarios, os outros são recomendados para uma melhor segurança.
* 1. Habilitar web services, habilite e salve a mudança
* 2. Ative somente o 'Protocolo REST'
* 5. Adicione um novo serviço, o campo Nome breve iremos usar no arquivo config.js
* 6. Adicione as seguintes funções ao serviço:
	* core_course_get_categories
	* core_course_create_categories
	* core_course_search_courses
	* core_course_create_courses
	* core_user_create_users
	* core_user_get_users
	* core_enrol_get_enrolled_users
	* enrol_manual_enrol_users
	* enrol_manual_unenrol_users

Executar
--------
Agora basta rodar com o comando:
- nodejs js/main-node.js
