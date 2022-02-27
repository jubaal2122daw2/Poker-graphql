let codi = document.getElementById("codiPartida");
let jugadors = document.getElementById("numjugadors");
let enviarcodi = document.getElementById("bEnviarcodi");
let idJugador = document.getElementById('idJugador');
let verCartas = document.getElementById('verCartas');
let bApuesta = document.getElementById('bApuesta');
let numApuesta = document.getElementById('numApuesta');
let verinfoPartida = document.getElementById('verInfoPartida');
let numDescartar = document.getElementById('numDescartar');
let bDescartar = document.getElementById('bDescartar');
let bRobar = document.getElementById('bRobar');
let bAbandonar = document.getElementById('bAbandonar');
let acabar = document.getElementById('acabarPartida');

enviarcodi.addEventListener("click", iniciarPartida, false);
verCartas.addEventListener("click", verCartasJugador, false);
bApuesta.addEventListener("click", hacerApuesta, false);
bDescartar.addEventListener("click", descartarCartas, false);
bRobar.addEventListener("click", robarCarta, false);
bAbandonar.addEventListener("click", abandonarPartida, false);
verinfoPartida.addEventListener("click", infoPartida, false);
acabar.addEventListener("click", acabarPartida, false);



function iniciarPartida() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
    query: `mutation{\r\n  iniciarJoc(idPartida:${codi.value}, numJugadors:${jugadors.value})\r\n}`,
    variables: {}
    })

    if (jugadors.value < 6) {
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: graphql,
            redirect: 'follow'
            };
        
            fetch("http://localhost:4000/graphql", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }else{
        let nouElement = document.createElement('h3');
        nouElement.innerHTML = "No puedes jugar una partida con más de 5 jugadores";
        principal.appendChild(nouElement);

        setTimeout(x => {
            fetch('/', {
                method: 'GET',
            }).then(() => {
                window.location.reload();
            })
        }, 5000);
    }
    
}

function verCartasJugador() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var graphql = JSON.stringify({
      query: `query{\r\n  interficieUsuari(idPartida:${codi.value}, idJugador:${idJugador.value}){\r\n    cartes\r\n    ronda\r\n    torn\r\n    pot\r\n    diners\r\n    igualarAposta\r\n    apostaJugador\r\n    \r\n  }\r\n}`,
      variables: {}
    })
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow'
    };
    
    fetch("http://localhost:4000/graphql", requestOptions)
      .then(response => response.text())
      .then(result => console.log(JSON.parse(result)))
      .catch(error => console.log('error', error));
}

function hacerApuesta() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
    query: `mutation{\r\n  apostaJugador(idPartida: ${codi.value}, quantitat: ${numApuesta.value})\r\n}`,
    variables: {}
    })
    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow'
    };

    fetch("http://localhost:4000/graphql", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result + ' ' + numApuesta.value))
    .catch(error => console.log('error', error));
}

function infoPartida() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
    query: `query{\r\n  informacioPartida(idPartida:${codi.value}){\r\n    ronda\r\n    pot\r\n    jugadors{\r\n      nom\r\n      diners\r\n      aposta\r\n      cartes \r\n    }\r\n    baralla\r\n    torn\r\n  }\r\n}`,
    variables: {}
    })
    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: graphql,
    redirect: 'follow'
    };

    fetch("http://localhost:4000/graphql", requestOptions)
    .then(response => response.text())
    .then(result => console.log(JSON.parse(result)))
    .catch(error => console.log('error', error));
}

function descartarCartas() {
    let selected = [];
        for (let option of document.getElementById('numDescartar').options)
        {
            if (option.selected) {
                selected.push(parseInt(option.value));
            }
        }
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var graphql = JSON.stringify({
    query: `mutation{\r\n  tirarCarta(idPartida:${codi.value}, descartes:[${selected}])\r\n  \r\n}`,
    variables: {}
    })
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: graphql,
        redirect: 'follow'
    };

    fetch("http://localhost:4000/graphql", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

}

function robarCarta(){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var graphql = JSON.stringify({
      query: `mutation{\r\n  obtenerCarta(idPartida:${codi.value})\r\n}`,
      variables: {}
    })
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow'
    };
    
    fetch("http://localhost:4000/graphql", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
}

function abandonarPartida(){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var graphql = JSON.stringify({
      query: `mutation{\r\n  abandonarPartida(idPartida:${codi.value})\r\n}`,
      variables: {}
    })
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow'
    };
    
    fetch("http://localhost:4000/graphql", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
}

function acabarPartida(){
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var graphql = JSON.stringify({
      query: `mutation{\r\n  acabarJoc(idPartida:${codi.value})\r\n}`,
      variables: {}
    })
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow'
    };
    
    fetch("http://localhost:4000/graphql", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
}