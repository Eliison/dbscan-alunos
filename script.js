// ====================================
// BANCO DE DADOS
// ====================================

const bancoDeDados = [

    {nota: 9.5, faltas: 1, participacao:"alta", perfil:"Excelente"},
    {nota: 9.0, faltas: 2, participacao:"alta", perfil:"Excelente"},
    {nota: 8.8, faltas: 3, participacao:"alta", perfil:"Excelente"},

    {nota: 7.5, faltas: 5, participacao:"media", perfil:"Bom"},
    {nota: 7.0, faltas: 6, participacao:"media", perfil:"Bom"},
    {nota: 7.8, faltas: 4, participacao:"alta", perfil:"Bom"},

    {nota: 6.0, faltas: 8, participacao:"media", perfil:"Regular"},
    {nota: 5.8, faltas: 9, participacao:"baixa", perfil:"Regular"},
    {nota: 6.2, faltas: 10, participacao:"media", perfil:"Regular"},

    {nota: 3.5, faltas: 15, participacao:"baixa", perfil:"Recuperacao"},
    {nota: 4.0, faltas: 18, participacao:"baixa", perfil:"Recuperacao"},
    {nota: 3.8, faltas: 20, participacao:"baixa", perfil:"Recuperacao"}

];

// ====================================
// CODIFICAÇÃO
// ====================================

function codificarParticipacao(valor){

    if(valor === "baixa") return 0;
    if(valor === "media") return 1;
    if(valor === "alta") return 2;

}

// ====================================
// NORMALIZAÇÃO
// ====================================

function normalizarAluno(aluno){

    return [

        aluno.nota / 10,
        aluno.faltas / 20,
        codificarParticipacao(aluno.participacao) / 2

    ];

}

// ====================================
// DISTÂNCIA
// ====================================

function distancia(a,b){

    let soma = 0;

    for(let i=0;i<a.length;i++){

        soma += Math.pow(a[i]-b[i],2);

    }

    return Math.sqrt(soma);

}

// ====================================
// DBSCAN
// ====================================

function dbscan(dados, eps, minPts){

    const grupos = [];
    const visitado = new Array(dados.length).fill(false);
    const grupoDoPonto = new Array(dados.length).fill(-1);

    function encontrarVizinhos(indice){

        const vizinhos = [];

        for(let i=0;i<dados.length;i++){

            if(distancia(dados[indice],dados[i]) <= eps){

                vizinhos.push(i);

            }

        }

        return vizinhos;
    }

    function expandirGrupo(indice,vizinhos,grupoAtual){

        grupos[grupoAtual].push(indice);
        grupoDoPonto[indice] = grupoAtual;

        for(let i=0;i<vizinhos.length;i++){

            const vizinho = vizinhos[i];

            if(!visitado[vizinho]){

                visitado[vizinho] = true;

                const novosVizinhos =
                encontrarVizinhos(vizinho);

                if(novosVizinhos.length >= minPts){

                    vizinhos =
                    vizinhos.concat(novosVizinhos);

                }

            }

            if(grupoDoPonto[vizinho] === -1){

                grupos[grupoAtual].push(vizinho);
                grupoDoPonto[vizinho] = grupoAtual;

            }

        }

    }

    for(let i=0;i<dados.length;i++){

        if(visitado[i]) continue;

        visitado[i] = true;

        const vizinhos =
        encontrarVizinhos(i);

        if(vizinhos.length >= minPts){

            const grupoAtual = grupos.length;

            grupos.push([]);

            expandirGrupo(
                i,
                vizinhos,
                grupoAtual
            );

        }

    }

    return {
        grupos,
        grupoDoPonto
    };

}

// ====================================
// PERFIL MAIS COMUM
// ====================================

function perfilMaisComum(indices){

    const contagem = {};

    indices.forEach(i=>{

        const perfil = bancoDeDados[i].perfil;

        contagem[perfil] =
        (contagem[perfil] || 0) + 1;

    });

    let perfilFinal = "";
    let maior = 0;

    for(let perfil in contagem){

        if(contagem[perfil] > maior){

            maior = contagem[perfil];
            perfilFinal = perfil;

        }

    }

    return perfilFinal;

}

// ====================================
// CLASSIFICAÇÃO
// ====================================

function classificarAluno(){

    const aluno = {

        nota:Number(
            document.getElementById("nota").value
        ),

        faltas:Number(
            document.getElementById("faltas").value
        ),

        participacao:
        document.getElementById(
            "participacao"
        ).value

    };

    const dadosNormalizados =
    bancoDeDados.map(normalizarAluno);

    const alunoNormalizado =
    normalizarAluno(aluno);

    const todosOsDados = [
        ...dadosNormalizados,
        alunoNormalizado
    ];

    const resultado =
    dbscan(todosOsDados,0.25,2);

    const indiceAluno =
    todosOsDados.length - 1;

    const grupoAluno =
    resultado.grupoDoPonto[indiceAluno];

    let perfil;

    if(grupoAluno === -1){

        perfil = "Aluno fora do padrão";

    }else{

        const indicesGrupo =
        resultado.grupos[grupoAluno]
        .filter(i => i !== indiceAluno);

        perfil =
        perfilMaisComum(indicesGrupo);

    }

    document.getElementById(
        "resultado"
    ).innerHTML = `

        <strong>Perfil:</strong>
        ${perfil}<br><br>

        <strong>Nota:</strong>
        ${aluno.nota}<br>

        <strong>Faltas:</strong>
        ${aluno.faltas}<br>

        <strong>Participação:</strong>
        ${aluno.participacao}

    `;

}