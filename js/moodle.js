
module.exports.Moodle = function (configConection) {
    return new Moodle(configConection);
};


var Moodle = function(connection) {
    this.connection = connection;
    
    this.callRequestFunc = function(func, param, callback){
        var url = connection.url+"/webservice/rest/server.php?wstoken="+connection.token+"&wsfunction="+func+"&moodlewsrestformat=json"+(param?"&"+param:"");
        requestServidor(url, callback);
    }
    
    this.conectar = function(callback){
        var url = connection.url+"/login/token.php?username="+connection.user+"&password="+connection.password+"&service="+connection.service;
        requestServidor(url, function (error, result){
            if (!error) {
                connection.token = result.token;
            }
            callback(error, result);
        });
    }

    this.getToken = function(){
        return this.connection.token;
    }
    
    this.getCategorias = function(nome, callback){
        var categorias = this.callRequestFunc("core_course_get_categories", "criteria[0][key]=name&criteria[0][value]="+nome, callback);
    }
    
    this.criarCategoria = function (nome, callback){        
        this.callRequestFunc("core_course_create_categories", "categories[0][name]="+nome, callback);
    }
    
    this.getCursos = function(search, callback){
        this.callRequestFunc("core_course_search_courses", "criterianame=search&criteriavalue="+search, callback);
    }

    this.criarCurso = function(curso, callback){        
        var param = "courses[0][fullname]="+curso.nome+"&courses[0][shortname]="+curso.codigoDisciplina+'-'+curso.codigoTurma+"&courses[0][categoryid]="+curso.categoriaId+"&courses[0][numsections]=1";
        this.callRequestFunc("core_course_create_courses", param, callback);
    }
    
    this.criarUsuario = function(usuario, callback){
        var param = "users[0][username]="+usuario.email+"&users[0][password]="+usuario.senha+"&users[0][auth]=pop3&users[0][firstname]="+usuario.nome+"&users[0][lastname]="+usuario.sobrenome+"&users[0][email]="+usuario.email;
        this.callRequestFunc("core_user_create_users", param, callback);
    }
    
    this.atualizaUsuario = function(usuario, callback){
        var param = "users[0][id]="+usuario.id+"&users[0][username]="+usuario.email+"&users[0][password]="+usuario.senha+"&users[0][auth]=pop3&users[0][firstname]="+usuario.nome+"&users[0][lastname]="+usuario.sobrenome+"&users[0][email]="+usuario.email;
        this.callRequestFunc("core_user_update_users", param, callback);
    }
    
    this.getUsuario = function(email, callback){
        var param = "criteria[0][key]=email&criteria[0][value]="+email;
        this.callRequestFunc("core_user_get_users", param, callback);
    }
    
    this.getUsuariosPorCurso = function (id_curso, callback){
        var param = "courseid=" + id_curso;
        this.callRequestFunc("core_enrol_get_enrolled_users", param, callback);
    }
    
    this.inscreverUsuarioCurso = function(idUsuario, idCurso, idRole, callback){ // idRole, 3: professor, 5: estudante
        var param = "enrolments[0][roleid]="+idRole+"&enrolments[0][userid]="+idUsuario+"&enrolments[0][courseid]="+idCurso;
        this.callRequestFunc("enrol_manual_enrol_users", param, callback);
    }

    this.removeUsuarioCurso = function (idUsuario, idCurso, callback){
        var param = "enrolments[0][userid]=" + idUsuario + "&enrolments[0][courseid]=" + idCurso;
        this.callRequestFunc("enrol_manual_unenrol_users", param, callback);
    }
};



var http = require('http');
function requestServidor(url, callback){
    //var pos = url.indexOf('/');
    var req = http.get(encodeURI( url ), function(response) {
        // Continuously update stream with data
        var body = '';//{ error: "Erro na conexão com o servidor!" };
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var error;
            var dados; 
            try {
                dados = JSON.parse(body);
            } catch (e) {
                error = e+'\n'+body;
            }
            if (dados) {
                if (dados.error) {
                    error = dados.error;
                } else if (dados.debuginfo) {
                    error = dados.debuginfo;
                } else if (dados.message) {
                    error = dados.message;
                }
            }
            if (error || typeof callback != "function") {
                error = url + '\n' + error;
                //console.error("callback is not a functions: "+error);
            }
            callback(error, dados);
        });
    });
    
    req.on('error', function (e) {
        console.error('\n' +url);
        console.log('problem with request: ' + e.message);
    });

    req.end();
}