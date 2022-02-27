const express  = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const esquema = buildSchema(`

type Jugador {
  nom: String
  diners: Int
  aposta: Int
  cartes: [[String]]
  ronda: Int
  torn: Int
  pot: Int
  igualarAposta: Int
  apostaJugador: Int
}

type datosPartida{
  ronda: Int
  pot: Int
  jugadors: [Jugador]
  baralla: [String]
  torn: Int
}

type Partida {
  idPartida: ID!
  datosPartida: datosPartida
}

type PartidaConDatos {
  partida: [Partida]
}

type Query {
  informacioPartida(idPartida: ID!): datosPartida
  interficieUsuari(idPartida: ID!, idJugador: Int): Jugador
}

type Mutation {
  iniciarJoc(idPartida: ID!, numJugadors: Int): String
  apostaJugador(idPartida: ID!, quantitat: Int): String
  tirarCarta(idPartida: ID!, descartes: [Int]): String
  obtenerCarta(idPartida: ID!): String
  abandonarPartida(idPartida: ID!): String
  acabarJoc(idPartida: ID!): String
}
`);

// aquesta arrel té una funció per a cada endpoint de l'API

let partides = new Map();

const arrel = {
    iniciarJoc: ( {idPartida, numJugadors} ) => {
      let barajaInglesa = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
      let palo = ["corazones", "rombos", "tréboles", "picas"];
      let cartesPoker = []; //Aquí se almacenan todas las cartas con su palo.
      for (let i = 0; i < 52; i++) { //bucle que establece un palo en cada num de carta.
          cartesPoker[i] = barajaInglesa[i - (13 * Math.floor(i / 13))] + " de " + palo[Math.floor(i / 13)];
      }
      partides.set(idPartida,
          {   
              ronda: 3,
              pot:0,
              jugadors: new Array(parseInt(numJugadors)).fill(0).map(
                  function(element, index){
                      return { 
                          nom: "jugador" + (index + 1),
                          diners: 1000,
                          aposta: 0,
                          cartes: new Array(5).fill(0).map(
                              function(element) {
                                  return cartesPoker.splice(Math.floor(Math.random()*cartesPoker.length),1); 
                              }
                          )
                      };
                  }
              ), 
              baralla:[...cartesPoker],
              torn: 0
          }
      );
      console.log("Jugador final: " + JSON.stringify([...partides],null, 4));
      return 'Partida creada correctamente';
    },
    informacioPartida( {idPartida} ){
      let tmp = partides.get(idPartida); //tmp, porque graphql no lee Map, no puedes hacer get directamente
      return tmp;
    },
    interficieUsuari( {idPartida, idJugador} ){
      let partida = partides.get(idPartida);
      let tmp = {
          cartes: partida.jugadors[idJugador].cartes,
          ronda: partida.ronda,
          torn: partida.torn,
          pot: partida.pot,
          diners: partida.jugadors[idJugador].diners,
          igualarAposta: Math.max(...partida.jugadors.map(x => x.aposta)),
          apostaJugador: partida.jugadors[idJugador].aposta
      };
      return tmp;
    },
    apostaJugador( {idPartida, quantitat} ){
      let partida = partides.get(idPartida);
      if (partida.ronda == 1 || partida.ronda == 3) {
        let jugadors = partida.jugadors;
        let indexJugador = partida.torn;
        if(quantitat > jugadors[indexJugador].diners){
            return "No pots apostar més dels diners que tens";
        }else{
            if (quantitat + jugadors[indexJugador].aposta >= jugadors[(indexJugador - 1 < 0 ? jugadors.length - 1 : indexJugador - 1)].aposta) {
                jugadors[indexJugador].aposta += parseInt(quantitat);
                jugadors[indexJugador].diners -= parseInt(quantitat);
                partida.pot += parseInt(quantitat);
                partida.torn = indexJugador + 1 > jugadors.length - 1? 0: indexJugador + 1;
                if (jugadors[indexJugador].aposta == jugadors[indexJugador + 1 > jugadors.length - 1? 0: indexJugador + 1].aposta) {
                    partida.ronda--;
                    if (partida.ronda == 0) {
                        partides.delete(idPartida);
                        return "Ha acabat el joc";
                    }
                }
                return "aposta feta";
            } else {
                return "Error en la aposta";
            }
        }
      } else {
        return "és moment de cambiar cartes";
      }
    },
    tirarCarta( {idPartida, descartes} ){
      let partida = partides.get(idPartida);
      let indexJugador = partida.torn;
      let cartes = partida.jugadors[indexJugador].cartes;
      descartes.forEach(d => {
          delete cartes[d];
      });
      partida.jugadors[indexJugador].cartes = cartes.filter(n=>n);
      return "S'han esborrat les cartes ---> " + descartes;
    },
    obtenerCarta( {idPartida} ){
      let partida = partides.get(idPartida);
      let indexJugador = partida.torn;
      let cartes = partida.jugadors[indexJugador].cartes;
      let jugadors = partida.jugadors;
      if (partida.ronda == 2) {    
          for (let i = 0, max = cartes.length; i < (5 - max); i++) {
              partides.get(idPartida).jugadors[indexJugador].cartes.push(partides.get(idPartida).baralla.splice(Math.floor(Math.random()*partides.get(idPartida).baralla.length),1));
          }
          if (partida.torn == partida.jugadors.length - 1) {
              partida.ronda--;
          }
          partida.torn = indexJugador + 1 > jugadors.length - 1? 0: indexJugador + 1;
          partida.jugadors[indexJugador].aposta = 0;
          return "Cartes obtenides";
      } else {
        return"és moment de fer apostes";
      }
    },
    abandonarPartida( {idPartida} ){
      let partida = partides.get(idPartida);
      let indexJugador = partida.torn;
      if(partida.jugadors.length == 2){
          partides.delete(idPartida);
        return "L'últim jugador guanya el joc";
      } else {
        return "Has abandonat el joc" + partida.jugadors.splice(indexJugador,1);
      }
    },
    acabarJoc( {idPartida} ){
      partides.delete(idPartida);
      return "Ha acabat el joc";
    }
};

const app = express();
app.use('/graphql', graphqlHTTP({
    schema: esquema,
    rootValue: arrel,
    graphiql: true,
}));
app.listen(4000);
console.log('Executant servidor GraphQL API a http://localhost:4000/graphql');
