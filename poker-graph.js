const express  = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

/*
Exemple CRUD amb Alumnes
sergi.grau@fje.edu
20.12.20 versio 1

query {
  obtenirAlumnes {
    codi
    nom
  }
}

query {
  obtenirAlumne(codi:"2") {
    codi
    nom
  }
}

mutation {
  esborrarAlumne(codi:"1")
  afegirAlumne(nom:"PERE") {
    codi
    nom
  }
}

mutation {
  modificarAlumne(codi:"3", nom:"sergi") {
    codi
    nom
  }
}
*/

const esquema = buildSchema(`

type Alumne {
  codi: ID!
  nom: String
}

type Jugador {
  nom: String
  diners: Int
  aposta: Int
  cartes: [[String]]
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
  obtenirAlumne(codi: ID!): Alumne
  obtenirAlumnes: [Alumne]
  informacioPartida(idPartida: ID!): datosPartida
}

type Mutation {
  iniciarJoc(idPartida: ID!, numJugadors: Int): String
  afegirAlumne(nom: String): Alumne
  modificarAlumne(codi: ID!, nom: String): Alumne
  esborrarAlumne(codi: ID!): Int
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
    obtenirAlumnes() {
        return alumnes;
    },
    obtenirAlumne: ( {codi} ) => {
        let alumne = alumnes.find(a => a.codi == codi);
        if (!alumne) throw new Error('cap Alumne amb codi ' + codi);
        return alumne; 
    },
    afegirAlumne: ({ nom }) => {
        // crea un codi aleatori
        let codi = require('crypto').randomBytes(10).toString('hex');
        let alumne = new Alumne(codi, nom);
        alumnes.push(alumne);
        return alumne;
    },
    modificarAlumne: ({ codi, nom }) => {
        let alumne = alumnes.find(a => a.codi == codi);
        alumne.nom = nom;
        return alumne;
    },
    esborrarAlumne: ({codi})=>{
        let alumne = alumnes.find(a => a.codi === codi);
        let index = alumnes.indexOf(alumne);
        alumnes.splice(index, 1);
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

//Classe que representa un Alumne
class Alumne {
    constructor(codi, nom) {
        this.codi = codi;
        this.nom = nom;
    }
}

// class Partida {
//   constructor(idPartida, datosPartida) {
//     this.idPartida = idPartida;
//     this.datosPartida = datosPartida;
//   }
// }

// class datosPartida {
//   constructor(ronda, pot, jugadors){
//     this.ronda = ronda;
//     this.pot = pot;
//     this.jugadors = jugadors;
//   }
// }

// class Cartes {
//   constructor(cartes){
//     this.cartes = cartes;
//   }
// }

// class Jugador {

//   constructor(nom, diners, aposta, cartes){
//     this.nom = nom;
//     this.diners = diners;
//     this.aposta = aposta;
//     this.cartes = cartes;
//   }
// }


// class PartidaConDatos {
//   constructor(){
//     this.partida = partida;
//   }
// }