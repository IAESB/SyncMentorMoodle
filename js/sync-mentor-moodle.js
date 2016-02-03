

module.exports = {
    addCurso: addCurso,
    addUsuario: addUsuario
};


function addCurso(moodle, curso, callback)
{
    var busca = moodle.getCursos.sync(moodle, curso.codigoDisciplina + '-' + curso.codigoTurma); // busca o curso se exite
    if (busca && busca.total === 0) { // se não existe insere
        var categoria = moodle.getCategorias.sync(moodle, curso.categoria);
        if (categoria.length === 0) {  // se a categoria não existe então cria-se
            categoria = moodle.criarCategoria.sync(moodle, curso.categoria);
        }
        curso.categoria = categoria[0].id;
        busca = moodle.criarCurso.sync(moodle, curso);
        curso.id = busca[0].id;
    }else{
        curso.id = busca.courses[0].id;
    }
    callback(null, curso);
}

function addUsuario(moodle, campos, callback)
{
    moodle.getUsuario(campos[3], function(erro, usuario){        
        if(usuario && usuario.users.length === 0){
            usuario = {
                nome: campos[1],
                sobrenome: campos[2],
                email: campos[3],
                senha: campos[4]
            };
            moodle.criarUsuario(usuario, function (erro, result) {
                if (!erro) {
                    usuario.id = result[0].id;
                    callback(null, usuario);
                } else {
                    callback(null, null);
                }
            });
        }
        else if( ! erro) {
            usuario = usuario.users[0];
            callback(null, usuario);
        }
        else {
            callback(null, null);
        }
    });
}



/*
function processaArquivo(moodle, fileConteudo, idCategoria, idPerfilProfessor, idPerfilAluno)
{
    var linhas = fileConteudo.split("\n");
    var curso;
    for(var j in linhas){
        var colunas = linhas[j].split(";");
        if(colunas[0]==="curso"){
            curso = addCurso(moodle, colunas, idCategoria);
        }else if(colunas[0]==="professor"){
            var usr = addUsuario(moodle, colunas);
            moodle.inscreverUsuarioCurso(usr.id, curso.id, idPerfilProfessor);
        }else if(colunas[0]==="aluno"){
            var usr = addUsuario(moodle, colunas);
            moodle.inscreverUsuarioCurso(usr.id, curso.id, idPerfilAluno);
        }         
    }
}*/
