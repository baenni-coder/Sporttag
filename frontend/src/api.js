// Re-export all Firebase functions
// Die Komponenten können weiterhin `import * as api from './api'` verwenden
export {
  getConfig,
  updateConfig,
  verifyAdminPassword,
  getDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
  getGroups,
  createGroup,
  createGroupsBulk,
  deleteGroup,
  getResults,
  submitResult,
  updateResult,
  deleteResult,
  getRankings,
  resetResults,
  resetAll
} from './firebase';
