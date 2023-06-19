/*
    npm config set strict-ssl false // Caso computador da fieb

    npm install express

    npm install axios

    npm install ejs

    npm install sequelize

    npm install mysql2
*/


/* criar o objeto/mpdulo express */
var express  = require("express")

/* executar o objeto express */
var aplicacao = express()

/* Modulo axios */
const axios = require('axios')

/* Fazer o include do modulo router */
const rotas = require("./routes/router")

/* criar o objeto bodyParser para ler os dados do formulario*/
const bodyParser = require('body-parser')
const usuario = require("./database/produtos.js")
const pontoColeta = require("./database/pontoColeta.js")
/*
express.json() analisa os dados do formulario que  ficam no corpo de solicitação (POST),
também chamado de request de entrada, para ser enviado ao servidor web
 */
aplicacao.use(express.json())

/* utiliza o objeto rotas que define os caminhos das páginas*/
aplicacao.use('/', rotas)

/* bodyParser serve para trabalhar com os dados vindo do formulario, ou seja, ele transforma
e formata esse pacote de dados para o formato de objeto Javacript
 */
aplicacao.use(bodyParser.urlencoded({extended:false}))

/* include (utilizar) um arquivo externo */
aplicacao.use(express.static(__dirname +'/public'))

/* desmontrar que será utilizado o objeto ejs para interpretarvo template HTML no servidor web */
aplicacao.set('view engine', 'ejs')

aplicacao.post('/add_usuario', function(req,res){

    let cadSenha = req.body.senhaUsuario
    let cadConfirmaSenha = req.body.senhaConfirmaUsuario
    let valNome = req.body.nomeUsuario
    let valEmail = req.body.emailUsuario 
    let valTel = req.body.telUsuario
    let valCpf = req.body.cpfUsuario 
    let valCep = req.body.cepUsuario 
    var msg = ""
    console.log("#########")
    console.log("Senha : "+cadSenha)
    console.log("Confirma senha : "+cadConfirmaSenha)
    console.log("#########")

    
    if(cadSenha != cadConfirmaSenha)
    {
        msg = "Senhas diferentes, por favor coloque novamente"
        valNome = valNome
        valEmail = valEmail 
        valCpf = valCpf 
        valCep = valCep
        res.render('../views/npr/cadastro_att.ejs', {valTel:valTel, msg : msg, valNome : valNome, valEmail : valEmail, valCpf : valCpf, valCep : valCep})
    }
    else {
        usuario.create ({
            nome_usuario : req.body.nomeUsuario,
            email_usuario : req.body.emailUsuario,
            tel_usuario : req.body.telUsuario,
            cpf_usuario : req.body.cpfUsuario,
            cep_usuario : req.body.cepUsuario,
            // comple_end_usuario : req.body.compleEndUsuario,
            // num_end_usuario : req.body.numEndUsuario, 
            senha_usuario : req.body.senhaUsuario,
            // confirma_senha_usuario : req.body.usuarioConfirmaSenha,
            foto_usuario : req.body.fotoPerfil,
    
        }).then(function(){  
    
            //Se tudo estiver certo
            res.render('../views/npr/homecelular.ejs')
        }).catch(function(erro){
            res.send("Houve um " + erro)
            
       })
    }
   
})


/*FUNCIONAL DA CONSULTA DE CEP  GPT CODE*/
aplicacao.post('/add_ponto_coleta', function(req, res) {
    var ponto_cep = req.body.enderecoCepPontocoleta;
    const cep = ponto_cep.replace('-', '');
    var msg = [];
    var tipoEletronico = req.body.lixoEletronico;
    var tipoOrganico = req.body.lixoOrganico;
    var tipoOleo = req.body.lixoOleo;
    var tipoReciclavel = req.body.lixoReciclavel;
    var tipoPonto = []
    var msg_email = ""
    var criar = 0;
    if(tipoEletronico != undefined)
    {
        tipoPonto.push("Eletronico")
        
    }

    if(tipoOrganico != undefined)
    {
        tipoPonto.push("Organico")
    }

    if(tipoOleo != undefined)
    {
        tipoPonto.push("Oléo")
    }

    if(tipoReciclavel != undefined)
    {
        tipoPonto.push("Reciclavel")
    }

    // Verificação de usuario e senha para confirmação de cadastro

    let logusuario = req.body.endEmailUsuario
    let senha = req.body.endSenhaUsuario

    usuario.findOne({ where : {email_usuario : logusuario, senha_usuario : senha}}).then(tabelaUsuario => {
        if (tabelaUsuario != null ) // Se usuario e senha estiver correto
        {
            console.log("################################")
            console.log("################################")
            console.log("################################")
            console.log("Usuario encontrado no banco de dados")
            console.log("Email: "+ tabelaUsuario.email_usuario)
            console.log("Senha : "+ tabelaUsuario.senha_usuario)
            console.log("################################")
            console.log("################################")
            console.log("################################")


            ///

            console.log("Tipo de coleta : "+tipoPonto)
  
            // Faça uma chamada à API de análise de CEP
            axios
              .get(`https://viacep.com.br/ws/` + cep + `/json/`)
              .then(response => {
                const data = response.data;
          
                if (data.erro) {
                  console.log("_____________");
                  console.log("CEP INVÁLIDO");
                  console.log("_____________");
                  msg.push("CEP inválido");
                  console.log(cep)
                  console.log(msg);
                  return res.render("../views/npr/cadastro_pontocoleta.ejs", { msg: msg, msg_email : msg_email });
                }
          
                // Faça o que desejar com os dados da API
                // Por exemplo, você pode armazenar os dados em seu banco de dados MySQL
                // ou retorná-los como resposta para o cliente
                console.log(data);
                // res.json(data.bairro); // Retorna os dados do CEP como resposta
          
                var valEndBairro = data.bairro;
                var valEndRua = data.logradouro;
                var valEndCidade = data.localidade;
                var valEndNum = req.body.enderecoNumPontocoleta;
          
                pontoColeta
                  .create({
                    // end_coleta : req.body.enderecoPontocoleta,
                    end_email_usuario: req.body.endEmailUsuario,
                    end_cep_coleta: req.body.enderecoCepPontocoleta,
                    end_rua_coleta: valEndRua,
                    end_num_coleta: valEndNum,
                    end_bairro_coleta: valEndBairro, // Usando o valor do bairro retornado pela API
                    end_cidade_coleta: valEndCidade,
                    end_imagem_coleta: req.body.enderecoImagemPontocoleta,
                    // nome_ponto_coleta: req.body.enderecoNomePontocoleta,
                    end_ponto_referencia: req.body.enderecoPontoReferencia,
                    tipo_coleta : tipoPonto,
                  })
                  .then(function() {
                    res.render('../views/npr/homecelular.ejs');
                  })
                  .catch(function(erro) {
                    res.send('Houve um erro: ' + erro);
                  });
              })
              .catch(error => {
                console.error(error);
                console.log("______________");
                console.log("ERRO AO CONSULTAR CEP");
                console.log(cep)
                console.log("______________");
                msg.push("Erro ao consultar CEP");
                console.log(msg);
                res.render("../views/npr/cadastro_pontocoleta.ejs", { msg: msg, msg_email });
              });
        } 


        else  // Se usuario e senha estiver incorreto
        {
            console.log("################################")
            console.log("################################")
            console.log("################################")
            console.log("Usuario nao encontrado no banco de dados")
            console.log("################################")
            console.log("################################")
            console.log("################################")
            var msg_email = "Email ou senha incorretos"
            criar = 1
            res.render('../views/npr/cadastro_pontocoleta.ejs', {msg_email : msg_email, msg : msg})
        }
    })

  });
  
///




aplicacao.post('/verificaLogin', function(req,res){
    var usuariologin = req.body.emaillogin
    var senha = req.body.senhalogin

    var erros = []

    // Verificação dos campos de login 
    if(usuariologin.length < 1 || usuariologin == undefined || usuariologin == null)
    {
        erros.push("Usuario inválido")
    }

    if(senha.length < 1 || senha == undefined || senha == null)
    {
        erros.push("Senha inválida")    
    }

    if (senha.length < 6)
    {
        erros.push("A senha deve ter 6 digitos")    
    }

    if(erros.length > 0)
    {
        res.render("../views/npr/logincelular.ejs", {erros : erros, usuariologin : usuariologin})
    }


    // Validação do banco de dados
    let usuariolog = req.body.emaillogin 
    let senhalog = req.body.senhalogin
 



    usuario.findOne({ where : {email_usuario : usuariolog, senha_usuario : senhalog}}).then(tabelaUsuario => {
        if (tabelaUsuario != null) // Caso o usuario seja encontrado no banco de dados
        {
            console.log("################################")
            console.log("################################")
            console.log("################################")
            console.log("Usuario encontrado no banco de dados")
            console.log("Email: "+ tabelaUsuario.email_usuario)
            console.log("Senha : "+ tabelaUsuario.senha_usuario)
            console.log("Imagem : "+ tabelaUsuario.foto_usuario)
            console.log("################################")
            console.log("################################")
            console.log("################################")
            
            if (tabelaUsuario.email_usuario === usuariolog && tabelaUsuario.senha_usuario === senhalog) // Se estiver correto ira para a página de perfil
            {
                let nomeUsuario = tabelaUsuario.nome_usuario // Puxa o nome do usuario cadastrado no banco
                let fotoUsuario = tabelaUsuario.foto_usuario // Puxa a foto do usuario cadastrado no banco
                let cpfUsuario = tabelaUsuario.cpf_usuario // Puxa o CPF do usuario cadastrado no bancoS
                let emailUsuario = tabelaUsuario.email_usuario // Puxa o EMAIL do usuario cadastrado no banco
                let cepUsuario = tabelaUsuario.cep_usuario // Puxa o CEP do usuario cadastrado no banco
                let telUsuario = tabelaUsuario.tel_usuario // Puxa o TELEFONE do usuario cadastrado no banco

                if (fotoUsuario == null || fotoUsuario == "")
                {
                    fotoUsuario = "perfil_default.png"
                }
                res.render("../views/npr/perfil.ejs", {nomeUsuario : nomeUsuario, fotoUsuario : fotoUsuario, cpfUsuario : cpfUsuario, emailUsuario : emailUsuario, cepUsuario : cepUsuario, telUsuario : telUsuario   })
            }
            else { // Se estiver fora do banco de dados sera enviado um erro 
                erros.push("Sem permissao. Usuario ou senha nao cadastrado")
                res.render("../views/npr/logincelular.ejs", { erros: erros, usuariologin: usuariologin });

            }
        }
        else { // Se estiver fora do banco de dados sera enviado um erro 
            erros.push("Sem permissao. Usuario/senha Incorretos")
            res.render("../views/npr/logincelular.ejs", { erros: erros, usuariologin: usuariologin });

        }
    })

})

//res.render('sucesso.ejs')


aplicacao.get('/listaPontos', function(req, res) {
    console.log("#######################");
    console.log("ENVIANDO PONTO DE COLETA PARA A TABELA");

    pontoColeta.findAll({
        attributes: ['end_rua_coleta', 'end_num_coleta', 'end_bairro_coleta', 'end_cidade_coleta', 'end_imagem_coleta', 'end_ponto_referencia', 'tipo_coleta'] // qual coluna será puxada 
    }).then(pontoColeta => {
        const valoresEndRuaColeta = pontoColeta.map(ponto => ponto.end_rua_coleta);
        const valoresEndNumColeta = pontoColeta.map(ponto => ponto.end_num_coleta);
        const valoresEndBairroColeta = pontoColeta.map(ponto => ponto.end_bairro_coleta);
        const valoresEndCidadeColeta = pontoColeta.map(ponto => ponto.end_cidade_coleta);
        const valoresEndFotoColeta = pontoColeta.map(ponto => ponto.end_imagem_coleta);
        const valoresPontoReferencia = pontoColeta.map(ponto => ponto.end_ponto_referencia);
        const valoresTipoPontoColeta = pontoColeta.map(ponto => ponto.tipo_coleta);
        if(valoresEndRuaColeta != null)
        {
            console.log("RUA : "+valoresEndRuaColeta)
            console.log("NUM : "+valoresEndNumColeta)
            console.log("BAIRRO : "+valoresEndBairroColeta)
            console.log("CIDADE : "+valoresEndCidadeColeta)
            console.log("TIPO: "+valoresTipoPontoColeta)
            console.log("PONTO DE REFERENCIA: "+valoresPontoReferencia)
            console.log("IMAGEM : "+valoresEndFotoColeta)            
            res.render('../views/npr/lista_pontos.ejs', {nomeLista : valoresPontoReferencia,ruaLista : valoresEndRuaColeta, numLista : valoresEndNumColeta, bairroLista : valoresEndBairroColeta, cidadeLista : valoresEndCidadeColeta, pontoColeta : pontoColeta, imagemLista : valoresEndFotoColeta, tipoLista : valoresTipoPontoColeta})
        } else {
            console.log("Não encontro a rua")
        }

    });
});


/* servidor web fica na escuta da solicitação do cliente (computador q possui navegador) na  porta 3000 */
aplicacao.listen(3000, function(req, res) {
    console.log("Opa recebi sua solicitação. Tmj!")
})