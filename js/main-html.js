(function () {    
    $("#opcoes").hide();
    
    $("#url_moodle").val(localStorage.getItem("url"));
    $("#usuario").val(localStorage.getItem("user"));
    $("#senha").val(localStorage.getItem("password"));
    $("#service").val(localStorage.getItem("service"));
    $("#token").val(localStorage.getItem("token"));
    
    var moodle = "var global";
    
    $("#arquivo").change(function(event){
       openFile(event);
    });
    
    $("#processar").click(function(){
        var node = document.getElementById('output');        
        processaArquivo(moodle, node.innerText);
    });
        
    $("#conectar").click(function(){
        var conn = getConexaoMoodle();
        
        localStorage.setItem("url", conn.url);
        localStorage.setItem("user", conn.user);
        localStorage.setItem("password", conn.password);
        localStorage.setItem("service", conn.service);
        localStorage.setItem("token", conn.token);
        
        moodle = new Moodle(conn);
        if(moodle.getToken()){
            mostraOpcoes(moodle);
            localStorage.setItem("token", moodle.getToken());
        }
        else{
            alert("Não foi possível conectar!");
            $("#opcoes").hide();        
            $("#conexao").show();
        }
    });
    
})();


function openFile(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
        var text = reader.result;
        var node = document.getElementById('output');
        node.innerText = text;
    };
    reader.readAsText(input.files[0]);
};


function mostraOpcoes(moodle)
{    
    $("#conexao").hide();
    $("#opcoes").show();
    var select = document.getElementById("categoria");
    var categorias = moodle.getCategorias();
    for(var i in categorias){
        var option = document.createElement("option");
        option.text = categorias[i].name;
        option.value = categorias[i].id;
        select.add(option);
    }
}

function getConexaoMoodle()
{
    var conexao = {};
    conexao.url = $("#url_moodle").val();
    conexao.user = $("#usuario").val();
    conexao.password = $("#senha").val();
    conexao.service = $("#service").val();
    conexao.token = $("#token").val();

    return conexao;
}
