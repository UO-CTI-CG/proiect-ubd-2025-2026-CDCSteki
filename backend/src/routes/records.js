import express from 'express';
import {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getStatistics,
  addVitalSign,
  updateVitalSign,
  deleteVitalSign
} from '../controllers/recordController.js';
import authenticateToken from '../middleware/auth.js';
import { apiProtection, arcjetMiddleware } from '../config/arcjet.js';

const router = express.Router();

router.use(authenticateToken);
router.use(arcjetMiddleware(apiProtection));

/**
 * @route GET /api/records/statistics
 * @desc Obține statistici (medii, min, max)
 * @access Private
 * @query period - week, month, year, all
 */
router.get('/statistics', getStatistics);

/**
 * @route GET /api/records
 * @desc Obține toate înregistrările utilizatorului
 * @access Private
 * @query limit, sortBy
 */
router.get('/', getAllRecords);

/**
 * @route GET /api/records/:id
 * @desc Obține o înregistrare specifică
 * @access Private
 */
router.get('/:id', getRecordById);

/**
 * @route POST /api/records
 * @desc Creează înregistrare nouă cu semne vitale opționale
 * @access Private
 */
router.post('/', createRecord);

/**
 * @route PUT /api/records/:id
 * @desc Actualizează înregistrare (doar daily metrics)
 * @access Private
 */
router.put('/:id', updateRecord);

/**
 * @route DELETE /api/records/:id
 * @desc Șterge înregistrare și semnele vitale asociate
 * @access Private
 */
router.delete('/:id', deleteRecord);

/**
 * @route POST /api/records/:id/vitals
 * @desc Adaugă un semn vital la un record existent
 * @access Private
 */
router.post('/:id/vitals', addVitalSign);

/**
 * @route PUT /api/records/:recordId/vitals/:vitalId
 * @desc Actualizează un semn vital existent
 * @access Private
 */
router.put('/:recordId/vitals/:vitalId', updateVitalSign);

/**
 * @route DELETE /api/records/:recordId/vitals/:vitalId
 * @desc Șterge un semn vital specific
 * @access Private
 */
router.delete('/:recordId/vitals/:vitalId', deleteVitalSign);

export default router;