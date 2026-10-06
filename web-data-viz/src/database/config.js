var mysql = require("mysql2");

// CONEXÃO DO BANCO MYSQL SERVER
var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
};

function descreverConfig() {
    return mySqlConfig.host + ":" + mySqlConfig.port +
        " | banco: " + mySqlConfig.database +
        " | usuário: " + mySqlConfig.user;
}

// TESTA A CONEXÃO ASSIM QUE O SERVIDOR SOBE
function testarConexao() {
    var conexao = mysql.createConnection(mySqlConfig);

    conexao.connect(function (erro) {
        if (erro) {
            console.log("\n❌ NÃO FOI POSSÍVEL CONECTAR AO MySQL");
            console.log("   Destino: " + descreverConfig());
            console.log("   Erro: " + erro.code + " - " + erro.message + "\n");
            return;
        }
        console.log("\n✅ CONEXÃO COM O MySQL REALIZADA COM SUCESSO");
        console.log("   Destino: " + descreverConfig() + "\n");
        conexao.end();
    });
}

function executar(instrucao) {

    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (produção OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);

        conexao.connect(function (erro) {
            if (erro) {
                console.log("\n❌ FALHA AO CONECTAR NO MySQL");
                console.log("   Destino: " + descreverConfig());
                console.log("   Erro: " + erro.code + " - " + erro.message + "\n");
                return reject(erro);
            }

            console.log("\n✅ Conectado ao MySQL (" + descreverConfig() + ")");

            conexao.query(instrucao, function (erro, resultados) {
                conexao.end();

                if (erro) {
                    console.log("\n❌ ERRO AO EXECUTAR A INSTRUÇÃO SQL");
                    console.log("   Instrução: " + instrucao);
                    console.log("   Erro: " + (erro.sqlMessage || erro.message) + "\n");
                    return reject(erro);
                }

                console.log(resultados);
                resolve(resultados);
            });
        });

        conexao.on("error", function (erro) {
            console.log("\n❌ ERRO NO MySQL SERVER: " + (erro.sqlMessage || erro.message) + "\n");
        });
    });
}

testarConexao();

module.exports = {
    executar
};
