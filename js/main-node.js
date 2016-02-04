


var tedious    = require('tedious');
var mysql      = require('mysql');
var sequencial = require('sync');
var config     = require("./config.js");
var sync       = require('./sync-mentor-moodle.js');
var Moodle     = require("./moodle.js").Moodle;

require('events').EventEmitter.prototype._maxListeners = 500;
var connectionPostfix = mysql.createPool(config.configPostfix);
var cacheCursosUsuario = new Object(); // Map com id curso => arrayUsers.
var moodle = Moodle(config.configMoodle);



function processaCurso(curso)
{
    if (curso) {
        console.log(curso.nome + " - " + curso.codigoDisciplina + '-' + curso.codigoTurma);
        execultaProfessor(moodle, curso);
        execultaAlunos(moodle, curso);
        removeUsuariosAusentes(moodle, curso);
    }
}


function execultaProfessor(moodle, curso) {
    
    try {
        var professor = getEmail.sync(null, curso.prof);
        var pos = professor.nome.indexOf(' ');
        professor.sobrenome = professor.nome.substr(pos + 1);
        professor.nome = professor.nome.substr(0, pos);
        
        //console.log("professor;" + professor.nome + ';' + professor.sobrenome + ';' + professor.email + ";" + curso.prof);
        
        sync.addUsuario(moodle, ['professor', professor.nome, professor.sobrenome, professor.email, '123456'], function (erro, usr) {
            if (usr)
                moodle.inscreverUsuarioCurso(usr.id, curso.id, config.configMoodle.PERFIL_PROFESSOR, function (err, result) {});
        });
        if (!cacheCursosUsuario[curso.id]) {
            cacheCursosUsuario[curso.id] = new Object();
        }
        cacheCursosUsuario[curso.id][curso.prof] = true;
            
    } catch (erro) {
        console.error("execultaProfessor Error: " + erro + ", id_mentor: " + curso.prof);
    }
}

function execultaAlunos(moodle, curso) {
    var query = "SELECT DISTINCT AL_NOMALU, AL_ALUTEL \
    FROM \
        TB_MESTRE_DISCIPLINA, \
        TB_DISCIPLINA, \
        TB_ALUNO \
        WHERE \
            MD_CODALU = AL_CODALU \
            AND MD_CODDIS = DI_CODDIS \
            AND DI_DISTEL = '" + curso.codigoDisciplina +
            "' AND MD_CODTUR = '" + curso.codigoTurma +
            "' AND MD_ANOMAT = " + config.configMentor.ANO +
            " AND MD_SEQMAT = " + config.configMentor.SEMESTRE;
    var rowsA = getRowsFromMentor.sync(null, query);
    for (var i in rowsA) {
        var columns = rowsA[i];
        var idMentorAluno = columns[1].value.replace(/ /g, ''); // com trim
        var nomeAluno = columns[0].value;
        
        
        try {
            var email = getEmail.sync(null, idMentorAluno);
            if (email.email && email.email.indexOf('@') < 0) {
                console.error("Erro -  " + email.nome + '-' + idMentorAluno + '-' + email.email);
                continue;
            }
            //console.log("aluno;" + email.nome + ';' + email.email + ";" + idMentorAluno);
            var pos = email.nome.indexOf(' ');
            var primeironome = email.nome.substr(0, pos);
            var sobrenome = email.nome.substr(pos + 1);
            
            if ( ! cacheCursosUsuario[curso.id]) {
                cacheCursosUsuario[curso.id] = new Object();
            }
            cacheCursosUsuario[curso.id][idMentorAluno] = true;

            addAluno(moodle, curso, ['aluno', primeironome, sobrenome, email.email, '123456'], (i % config.configMoodle.CONEXAO_SIMULTANEA_MOODLE == 0));
            
        }
        catch (e) {
            console.error("Erro precessando aluno: " + nomeAluno + " idMentor:" + idMentorAluno + ', situação: ' + e);
        }
    }   
}

function removeUsuariosAusentes(moodle, curso)
{
    moodle.getUsuariosPorCurso(curso.id, function (erro, listUsuarios) {
        if (erro) {
            console.error("Erro removeUsuariosAusentes: " + erro + "\n Não foi possivel listar os usarios do curso: " + curso.nome + '-' + curso.codigoTurma);
            return;
        }        
        for (var i in listUsuarios) {
            var user = listUsuarios[i];
            var email = user.email;
            getIdMentor(email, function (erro, result) {
                if (!erro) {
                    var estaNoMentor = cacheCursosUsuario[curso.id][result.id_mentor];
                    if (cacheCursosUsuario[curso.id] && !estaNoMentor) {
                        moodle.removeUsuarioCurso(user.id, curso.id, function (erro, result) { });
                        console.log("Usuario: " + email + " removido do curso: " + curso.codigoDisciplina + "-" + curso.codigoTurma);
                    }
                }
            });
        }
    });
}

function addAluno(moodle, curso, arrayCampos, sincronizado) // se sincronizado===true então ele espera a inserção no moodle para continuar se não ele não espera
{
    if (sincronizado) {
        var usr = sync.addUsuario.sync(null, moodle, arrayCampos);
        if (usr) {
            moodle.inscreverUsuarioCurso(usr.id, curso.id, config.configMoodle.PERFIL_ESTUDANTE, function (erro, res) { });
        }
    } else {
        sync.addUsuario(moodle, arrayCampos, function (erro, usr) {
            if (usr) {
                moodle.inscreverUsuarioCurso(usr.id, curso.id, config.configMoodle.PERFIL_ESTUDANTE, function (erro, res) { });
            }
        });
    }
    
}

function getRowsFromMentor(sql, callback)
{
    var connection = new tedious.Connection(config.configMentor);
    connection.on('connect', function (err) {
        if (err)
            callback(err);
        else {
            var request = new tedious.Request(sql, function (err, rowCount) {
                connection.close();
            });
            request.on('doneInProc', function (rowCount, more, rows) {
                callback(null, rows)
            });                      
            connection.execSql(request);
        }
    });
}

function getEmail(idMentor, callback) {
    var query = 'SELECT username, name FROM mailbox WHERE id_mentor = ' + idMentor;
    connectionPostfix.query(query, function (err, rows, fields) {
        if (err)
            callback(err);

        if (rows && rows.length > 0) {
            callback(null, { email: rows[0].username, nome: rows[0].name } );
        }
        else {
            callback("email not found");
        }

        //connection.destroy();
    });
}

function getIdMentor(email, callback) {
    var query = "SELECT id_mentor, name FROM mailbox WHERE username='"+email+"'";
    connectionPostfix.query(query, function (err, rows, fields) {
        if (err)
            callback(err);
        
        if (rows && rows.length > 0) {
            callback(null, { email: rows[0].username, id_mentor: rows[0].id_mentor });
        }
        else {
            callback("email not found");
        }
    });
}




var arrayCursos = [];
moodle.conectar(function () {
    sequencial(function () {
        var query = "SELECT DISTINCT \
            DI_DESDIS, DI_DISTEL, MD_CODTUR, PF_CODPRO, CR_NOMCUR \
            FROM \
            TB_CURSO, \
                TB_GRADE, \
                TB_MESTRE_DISCIPLINA, \
                TB_DISCIPLINA \
            left outer join TB_GRADE_HORARIO_PROF on(DI_CODDIS = GP_CODDIS and GP_ANOMAT=" + config.configMentor.ANO + "  AND GP_SEQMAT = " + config.configMentor.SEMESTRE + " ) \
            left outer JOIN TB_PROFESSOR on(GP_CODPRO = PF_CODPRO), \
                TB_ALUNO \
            WHERE \
                MD_ANOMAT = " + config.configMentor.ANO + " \
                AND MD_SEQMAT = " + config.configMentor.SEMESTRE + " \
                AND MD_CODSIT = 1 \
                AND CR_CODCUR = GD_CODCUR \
                AND GD_CODGRA = MD_CODGRA \
                AND MD_CODDIS = DI_CODDIS \
                AND MD_CODALU = AL_CODALU \
                AND MD_CODRES <> 16 \
            ORDER BY \
                DI_DESDIS";      
        var rows = getRowsFromMentor.sync(null, query);

        for (var i in rows) {
            var columns = rows[i];
            curso = {
                nome: columns[0].value,
                codigoDisciplina: columns[1].value,
                codigoTurma: columns[2].value,
                prof: columns[3].value,
                categoria: columns[4].value,
            };
            try {
                var curso = sync.addCurso.sync(null, moodle, curso);//, function(curso){
                processaCurso(curso);
                            //});                            
            }
                        catch (e) {
                console.error("Erro: " + e);
            }
                        //if(i>1) break; // apenas para DEBUG
        }
        console.log('processados: ' + rows.length + ' cursos');
        
        setTimeout(function () { // aguarda a finalização das thread e exit.
            var array = process._getActiveHandles();
            var array2 = process._getActiveRequests();
            connectionPostfix.end(function (err) {
                            // all connections in the pool have ended
            });
            process.exit(0);
        }, 50000);
    });
});


/*var connection = new tedious.Connection(config.configMentor);
    connection.on('connect', function (err) {
        if (err)
            console.error(err);
        else {            
            
            var request = new tedious.Request(query, function (err, rowCount) {
                connection.close();
                
                sequencial(function () {
                    
                });
            });
            request.on('doneInProc', function (rowCount, more, rows) {
                for (var i in rows) {
                    var columns = rows[i];
                    arrayCursos[i] = {
                        nome: columns[0].value,
                        codigoDisciplina: columns[1].value,
                        codigoTurma: columns[2].value,
                        prof: columns[3].value,
                        categoria: columns[4].value,
                    };
                }
            });
            connection.execSql(request);
        }
    });
 * 
 * */