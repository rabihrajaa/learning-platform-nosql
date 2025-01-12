// Importation des modules nécessaires
const { MongoClient } = require('mongodb'); // Client pour interagir avec MongoDB
const redis = require('redis'); // Client pour interagir avec Redis
const config = require('./env'); // Importation des configurations (URI et autres paramètres)

// Variables pour stocker les connexions MongoDB et Redis, ainsi que la base de données MongoDB
let mongoClient, redisClient, db;

// Fonction pour connecter à MongoDB
async function connectMongo() {
  try {
    // Création du client MongoDB avec des options de configuration
    mongoClient = new MongoClient(config.mongodb.uri, {
      useNewUrlParser: true, // Utilise le nouveau parser pour analyser l'URI
      useUnifiedTopology: true, // Active le mode de gestion unifié des topologies
      serverSelectionTimeoutMS: 5000, // Temps limite pour se connecter au serveur
      maxPoolSize: 10 // Limite le nombre maximum de connexions dans le pool
    });

    // Connexion au serveur MongoDB
    await mongoClient.connect();
    // Sélection de la base de données spécifiée dans la configuration
    db = mongoClient.db(config.mongodb.dbName);
    console.log('MongoDB connected successfully'); // Message de confirmation
    return db; // Retourne la base de données connectée
  } catch (error) {
    // Gestion des erreurs en cas d'échec de connexion
    console.error('MongoDB connection error:', error);
    throw error; // Relance l'erreur pour qu'elle soit gérée ailleurs
  }
}

// Fonction pour connecter à Redis
async function connectRedis() {
  try {
    // Création du client Redis avec des options de configuration
    redisClient = redis.createClient({
      url: config.redis.uri, // URI pour se connecter à Redis
      retry_strategy: function (options) {
        // Stratégie de reconnexion en cas d'échec
        if (options.total_retry_time > 1000 * 60 * 60) {
          // Si le temps total de reconnexion dépasse 1 heure, arrêter
          return new Error('Retry time exhausted');
        }
        // Temps d'attente entre deux tentatives (augmente progressivement)
        return Math.min(options.attempt * 100, 3000);
      }
    });

    // Connexion au serveur Redis
    await redisClient.connect();
    console.log('Redis connected successfully'); // Message de confirmation
    return redisClient; // Retourne le client Redis connecté
  } catch (error) {
    // Gestion des erreurs en cas d'échec de connexion
    console.error('Redis connection error:', error);
    throw error; // Relance l'erreur pour qu'elle soit gérée ailleurs
  }
}

// Fonction pour fermer les connexions MongoDB et Redis
async function closeConnections() {
  try {
    // Fermer la connexion Redis si elle existe
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed'); // Message de confirmation
    }
    // Fermer la connexion MongoDB si elle existe
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed'); // Message de confirmation
    }
  } catch (error) {
    // Gestion des erreurs en cas d'échec de fermeture des connexions
    console.error('Error closing connections:', error);
    throw error; // Relance l'erreur pour qu'elle soit gérée ailleurs
  }
}

// Exportation des fonctions et des getters pour accéder aux connexions
module.exports = {
  connectMongo, // Fonction pour connecter à MongoDB
  connectRedis, // Fonction pour connecter à Redis
  closeConnections, // Fonction pour fermer les connexions
  getDb: () => db, // Getter pour récupérer la base de données MongoDB
  getRedis: () => redisClient // Getter pour récupérer le client Redis
};
