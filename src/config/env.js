// Importation du module dotenv pour charger les variables d'environnement depuis un fichier .env
const dotenv = require('dotenv');
// Chargement des variables d'environnement dans process.env
dotenv.config();

// Liste des variables d'environnement requises pour l'application
const requiredEnvVars = [
  'MONGODB_URI',      // URI pour la connexion à MongoDB
  'MONGODB_DB_NAME',  // Nom de la base de données MongoDB
  'REDIS_URI'         // URI pour la connexion à Redis
];

// Fonction pour valider la présence des variables d'environnement requises
function validateEnv() {
  // Vérifie quelles variables sont manquantes
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  // Si des variables sont manquantes, lever une erreur descriptive
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}\n` +
      'Please check your .env file or environment configuration.' // Message pour guider l'utilisateur
    );
  }
}

// Appel de la fonction pour valider les variables d'environnement
validateEnv();

// Exportation des configurations pour les utiliser dans d'autres parties de l'application
module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,       // URI MongoDB récupérée des variables d'environnement
    dbName: process.env.MONGODB_DB_NAME // Nom de la base de données MongoDB récupéré des variables d'environnement
  },
  redis: {
    uri: process.env.REDIS_URI // URI Redis récupérée des variables d'environnement
  },
  port: process.env.PORT || 3000 // Port de l'application, par défaut 3000 si non défini
};
