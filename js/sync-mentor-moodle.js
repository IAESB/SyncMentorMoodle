

module.exports = {
    addCurso: addCurso,
    addUsuario: addUsuario
};


function addCurso(moodle, curso, callback)
{
    var busca = moodle.getCursos.sync(moodle, curso.codigoDisciplina + '-' + curso.codigoTurma); // busca o curso se exite
    if (busca && busca.total === 0) { // se não existe insere
        if (isNaN(curso.categoria)) {
            var categoria = moodle.getCategorias.sync(moodle, curso.categoria);
            if (categoria.length === 0) {  // se a categoria não existe então cria-se
                categoria = moodle.criarCategoria.sync(moodle, curso.categoria);
            }
            curso.categoriaId = categoria[0].id;
        }
        busca = moodle.criarCurso.sync(moodle, curso);
        curso.id = busca[0].id;
    }else{
        curso.id = busca.courses[0].id;
    }
    callback(null, curso);
}

function addUsuario(moodle, usuario)
{
    var busca = moodle.getUsuario.sync(moodle, usuario.email);
    if(busca && busca.users.length === 0){        
        var criado = moodle.criarUsuario.sync(moodle, usuario);
        usuario.id = criado[0].id;
    }
    else{
        usuario.id = busca.users[0].id;
        moodle.atualizaUsuario.sync(moodle, usuario);
    }
    return usuario;
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
