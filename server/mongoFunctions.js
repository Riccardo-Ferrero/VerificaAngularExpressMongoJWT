//pastebin.com/GjKMTqeF
"use strict";

/*
 * ============================================================
 *  MODULO: MongoFunctions
 *  Gestisce tutte le operazioni sul database MongoDB.
 *  Espone un'istanza della classe (Singleton) pronta all'uso.
 * ============================================================
 */

const mongo = require("mongodb");
const mongoClient = mongo.MongoClient;

// Stringa di connessione al server MongoDB locale
const CONNECTIONSTRING = "mongodb://127.0.0.1:27017";

// ============================================================
//  Classe MongoFunctions
//  Raggruppa i metodi CRUD e il metodo di login
// ============================================================
class MongoFunctions {

    // ----------------------------------------------------------
    //  Metodo PRIVATO di connessione (non esposto all'esterno)
    //  Crea la connessione al DB e restituisce la collection
    //  tramite callback(errConn, collection, client)
    // ----------------------------------------------------------
    #setConnection(nomeDb, nomeCollection, callback) {
        // Oggetto errore: codeErr=-1 significa nessun errore
        let errConn = { codeErr: -1, message: "" };

        // Tentiamo la connessione (restituisce una Promise)
        mongoClient.connect(CONNECTIONSTRING)
            .then((client) => {
                // Connessione riuscita: selezioniamo db e collection
                console.log("MongoDB: connessione OK");
                const db = client.db(nomeDb);
                const coll = db.collection(nomeCollection);
                callback(errConn, coll, client);
            })
            .catch((err) => {
                // Connessione fallita
                console.error("Errore connessione MongoDB: " + err);
                errConn.codeErr = 503;
                errConn.message = "Errore di connessione al server MongoDB";
                callback(errConn, null, null);
            });
    }

    // ----------------------------------------------------------
    //  FIND - Recupera tutti i documenti che corrispondono
    //  alla query (oggetto filtro).
    //  callback(errData, array_dati)
    // ----------------------------------------------------------
    find(nomeDb, nomeCollection, query, callback) {
        this.#setConnection(nomeDb, nomeCollection, (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, []);

            coll.find(query).toArray()
                .then((data) => {
                    console.log("Find OK - documenti trovati: " + data.length);
                    callback({ codeErr: -1, message: "" }, data);
                })
                .catch((err) => {
                    console.error("Errore find: " + err);
                    callback({ codeErr: 500, message: "Errore nella query di ricerca" }, []);
                })
                .finally(() => conn.close());
        });
    }

    // ----------------------------------------------------------
    //  FIND LOGIN - Cerca un utente per username e controlla
    //  la password in chiaro.
    //  callback(errData, documento_utente)
    // ----------------------------------------------------------
    findLogin(req, nomeDb, nomeCollection, query, callback) {
        this.#setConnection(nomeDb, nomeCollection, (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, {});

            coll.findOne(query)
                .then((data) => {
                    let errData;
                    if (data === null) {
                        // Nessun utente trovato con quell'username
                        errData = { codeErr: 401, message: "Username inesistente!" };
                    } else if (req.body.password !== data.pwd) {
                        // Password non corrisponde
                        errData = { codeErr: 401, message: "Password errata!" };
                    } else {
                        // Login corretto
                        errData = { codeErr: -1, message: "" };
                    }
                    callback(errData, data);
                })
                .catch((err) => {
                    console.error("Errore findLogin: " + err);
                    callback({ codeErr: 500, message: "Errore durante la query di login" }, {});
                })
                .finally(() => conn.close());
        });
    }

    // ----------------------------------------------------------
    //  FIND OPTIONS - Come find() ma con ordinamento e limite.
    //  sort:  oggetto di ordinamento  (es. { cognome: 1 } = A→Z)
    //  limit: numero massimo di risultati (0 = nessun limite)
    //  callback(errData, array_dati)
    // ----------------------------------------------------------
    findOptions(nomeDb, nomeCollection, query, sort, limit, callback) {
        this.#setConnection(nomeDb, nomeCollection, (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, []);

            // Costruiamo il cursore applicando ordinamento e limite
            let cursore = coll.find(query).sort(sort);
            if (limit > 0) cursore = cursore.limit(limit);

            cursore.toArray()
                .then((data) => {
                    console.log("FindOptions OK - documenti trovati: " + data.length);
                    callback({ codeErr: -1, message: "" }, data);
                })
                .catch((err) => {
                    console.error("Errore findOptions: " + err);
                    callback({ codeErr: 500, message: "Errore nella query con opzioni" }, []);
                })
                .finally(() => conn.close());
        });
    }

    // ----------------------------------------------------------
    //  INSERT - Inserisce un nuovo documento nella collection.
    //  callback(errData, risultato_inserimento)
    // ----------------------------------------------------------
    insert(nomeDb, nomeCollection, documento, callback) {
        this.#setConnection(nomeDb, nomeCollection, (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, {});

            coll.insertOne(documento)
                .then((result) => {
                    console.log("Insert OK - id: " + result.insertedId);
                    callback({ codeErr: -1, message: "" }, result);
                })
                .catch((err) => {
                    console.error("Errore insert: " + err);
                    callback({ codeErr: 500, message: "Errore nell'inserimento del documento" }, {});
                })
                .finally(() => conn.close());
        });
    }

    // ----------------------------------------------------------
    //  UPDATE - Aggiorna un documento esistente.
    //  filter: condizione di ricerca  (es. { _id: ObjectId(...) })
    //  update: dati da modificare     (es. { $set: { nome: "..." } })
    //  callback(errData, risultato_aggiornamento)
    // ----------------------------------------------------------
    update(nomeDb, nomeCollection, filter, update, callback) {
        this.#setConnection(nomeDb, nomeCollection, (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, {});

            coll.updateOne(filter, update)
                .then((result) => {
                    console.log("Update OK - modificati: " + result.modifiedCount);
                    callback({ codeErr: -1, message: "" }, result);
                })
                .catch((err) => {
                    console.error("Errore update: " + err);
                    callback({ codeErr: 500, message: "Errore nell'aggiornamento del documento" }, {});
                })
                .finally(() => conn.close());
        });
    }

    // ----------------------------------------------------------
    //  DELETE - Elimina un documento dalla collection.
    //  filter: condizione di ricerca  (es. { _id: ObjectId(...) })
    //  callback(errData, risultato_eliminazione)
    // ----------------------------------------------------------
    delete(nomeDb, nomeCollection, filter, callback) {
        this.#setConnection(nomeDb, nomeCollection, (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, {});

            coll.deleteOne(filter)
                .then((result) => {
                    console.log("Delete OK - eliminati: " + result.deletedCount);
                    callback({ codeErr: -1, message: "" }, result);
                })
                .catch((err) => {
                    console.error("Errore delete: " + err);
                    callback({ codeErr: 500, message: "Errore nell'eliminazione del documento" }, {});
                })
                .finally(() => conn.close());
        });
    }

    // ----------------------------------------------------------
    //  AGGREGATE - Esegue una pipeline di aggregazione MongoDB.
    //  pipeline: array di stage (es. $match, $group, $sort ...)
    //  callback(errData, array_risultati)
    // ----------------------------------------------------------
    aggregate(nomeDb, nomeCollection, pipeline, callback) {
        this.#setConnection(nomeDb, nomeCollection, async (errConn, coll, conn) => {
            if (errConn.codeErr !== -1) return callback(errConn, []);
            try {
                const data = await coll.aggregate(pipeline).toArray();
                console.log("Aggregate OK - risultati: " + data.length);
                callback({ codeErr: -1, message: "" }, data);
            } catch (err) {
                console.error("Errore aggregate: " + err);
                callback({ codeErr: 500, message: "Errore nella pipeline di aggregazione" }, []);
            } finally {
                await conn.close();
            }
        });
    }
}

// Esportiamo un'unica istanza (pattern Singleton)
module.exports = new MongoFunctions();