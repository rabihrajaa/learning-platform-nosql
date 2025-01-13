// Importation des services nécessaires pour interagir avec MongoDB et Redis
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

/**
 * Fonction pour créer un étudiant dans la base de données.
 * 
 * @param {Object} req - La requête HTTP contenant les données de l'étudiant dans req.body.
 * @param {Object} res - La réponse HTTP.
 */
async function createStudent(req, res) {
  try {
    // Insère les données de l'étudiant dans la collection "students" de MongoDB
    const student = await mongoService.insertOne('students', req.body);
    // Renvoie une réponse avec le nouvel étudiant créé
    res.status(201).json(student);
  } catch (error) {
    // Log de l'erreur et envoi d'une réponse d'erreur au client
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
}

/**
 * Fonction pour récupérer un étudiant par son identifiant.
 * 
 * @param {Object} req - La requête HTTP contenant l'identifiant de l'étudiant dans req.params.id.
 * @param {Object} res - La réponse HTTP.
 */
async function getStudent(req, res) {
  try {
    const studentId = req.params.id; // Récupère l'identifiant de l'étudiant depuis les paramètres de la requête

    // Vérifie si les données de l'étudiant sont déjà en cache dans Redis
    const cachedStudent = await redisService.getCachedData(`student:${studentId}`);
    if (cachedStudent) {
      // Si les données sont en cache, les renvoyer directement
      return res.json(cachedStudent);
    }

    // Si les données ne sont pas en cache, les récupérer depuis MongoDB
    const student = await mongoService.findOneById('students', studentId);
    if (!student) {
      // Si l'étudiant n'existe pas, renvoyer une réponse 404
      return res.status(404).json({ error: 'Student not found' });
    }

    // Mettre en cache les données de l'étudiant pour une utilisation future
    await redisService.cacheData(`student:${studentId}`, student);
    res.json(student); // Renvoyer les données de l'étudiant
  } catch (error) {
    // Log de l'erreur et envoi d'une réponse d'erreur au client
    console.error('Error getting student:', error);
    res.status(500).json({ error: 'Failed to get student' });
  }
}

/**
 * Fonction pour récupérer les cours d'un étudiant avec pagination.
 * 
 * @param {Object} req - La requête HTTP contenant l'identifiant de l'étudiant et les paramètres de pagination.
 * @param {Object} res - La réponse HTTP.
 */
async function getStudentCourses(req, res) {
  try {
    const studentId = req.params.id; // Récupère l'identifiant de l'étudiant depuis les paramètres de la requête

    // Récupère les cours liés à l'étudiant dans la collection "enrollments"
    const courses = await mongoService.findWithPagination(
      'enrollments', // Collection dans MongoDB
      { studentId }, // Filtrer les cours par identifiant d'étudiant
      req.query.page, // Numéro de la page (optionnel)
      req.query.limit // Nombre de résultats par page (optionnel)
    );

    res.json(courses); // Renvoyer les cours sous forme de réponse JSON
  } catch (error) {
    // Log de l'erreur et envoi d'une réponse d'erreur au client
    console.error('Error getting student courses:', error);
    res.status(500).json({ error: 'Failed to get student courses' });
  }
}

// Exportation des fonctions pour être utilisées dans les routes
module.exports = {
  createStudent,
  getStudent,
  getStudentCourses
};
