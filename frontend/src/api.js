// Re-export all Firebase functions
// Die Komponenten können weiterhin `import * as api from './api'` verwenden
export {
  getConfig,
  updateConfig,
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
  deleteResult,
  getRankings
} from './firebase';
