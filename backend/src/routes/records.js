import express from 'express';
import {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getStatistics,
  addVitalSign,
  deleteVitalSign
} from '../controllers/recordController.js';
import authenticateToken from '../middleware/auth.js';
import { apiProtection, arcjetMiddleware } from '../config/arcjet.js';

const router = express.Router();

/**
 * RUTE PENTRU HEALTH RECORDS
 * Base path: /api/records
 * TOATE rutele necesită autentificare (token) + protecție Arcjet moderată
 */

// Aplică middleware de autentificare pentru TOATE rutele
router.use(authenticateToken);

// Aplică Arcjet protecție moderată (100 req/oră)
// Opțional: poți comenta linia asta dacă vrei doar protecție pe login/register
router.use(arcjetMiddleware(apiProtection));

/**
 * @route   GET /api/records/statistics
 * @desc    Obține statistici (medii, min, max) incluzând vital signs
 * @access  Private
 * @query   ?period=week|month|year|all
 * @returns { period, recordsCount, vitalSignsCount, statistics }
 * 
 * IMPORTANT: Aceasta trebuie să fie ÎNAINTEA rutei /:id
 * Altfel Express va crede că "statistics" e un ID!
 */
router.get('/statistics', getStatistics);

/**
 * @route   GET /api/records
 * @desc    Obține toate înregistrările utilizatorului (cu vital signs)
 * @access  Private
 * @query   ?limit=30&sortBy=date
 * @returns { count, records[] }
 */
router.get('/', getAllRecords);

/**
 * @route   GET /api/records/:id
 * @desc    Obține o înregistrare specifică după ID (cu vital signs)
 * @access  Private
 * @params  id (number)
 * @returns { record }
 */
router.get('/:id', getRecordById);

/**
 * @route   POST /api/records
 * @desc    Creează înregistrare nouă (cu vital signs opționale)
 * @access  Private
 * @body    { 
 *            date?, weight?, steps?, sleepHours?, notes?,
 *            vitalSigns?: [{ timeOfDay, heartRate, bloodPressureSystolic, bloodPressureDiastolic, ... }]
 *          }
 * @returns { message, record }
 */
router.post('/', createRecord);

/**
 * @route   PUT /api/records/:id
 * @desc    Actualizează înregistrare existentă (doar metadata: weight, steps, etc.)
 * @access  Private
 * @params  id (number)
 * @body    { weight?, steps?, sleepHours?, notes? }
 * @returns { message, record }
 */
router.put('/:id', updateRecord);

/**
 * @route   DELETE /api/records/:id
 * @desc    Șterge înregistrare (cascade șterge și vital signs asociate)
 * @access  Private
 * @params  id (number)
 * @returns { message }
 */
router.delete('/:id', deleteRecord);

// ============================================
// VITAL SIGNS ENDPOINTS
// ============================================

/**
 * @route   POST /api/records/:id/vitals
 * @desc    Adaugă un vital sign la un record existent
 * @access  Private
 * @params  id (number) - recordId
 * @body    { 
 *            timeOfDay: "morning"|"afternoon"|"evening"|"night",
 *            heartRate?, bloodPressureSystolic?, bloodPressureDiastolic?,
 *            temperature?, oxygenSaturation?, notes?
 *          }
 * @returns { message, vitalSign }
 * 
 * Exemplu:
 * POST /api/records/5/vitals
 * { "timeOfDay": "morning", "heartRate": 72, "bloodPressureSystolic": 120, "bloodPressureDiastolic": 80 }
 */
router.post('/:id/vitals', addVitalSign);

/**
 * @route   PUT /api/records/:recordId/vitals/:vitalId
 * @desc    Actualizează un vital sign existent
 * @access  Private
 * @params  recordId (number), vitalId (number)
 * @body    { 
 *            timeOfDay?, heartRate?, bloodPressureSystolic?, bloodPressureDiastolic?,
 *            temperature?, oxygenSaturation?, notes?
 *          }
 * @returns { message, vitalSign }
 * 
 * Exemplu:
 * PUT /api/records/5/vitals/12
 * { "heartRate": 75, "notes": "After workout" }
 */
import { updateVitalSign } from '../controllers/recordController.js';
router.put('/:recordId/vitals/:vitalId', updateVitalSign);

/**
 * @route   DELETE /api/records/:recordId/vitals/:vitalId
 * @desc    Șterge un vital sign specific
 * @access  Private
 * @params  recordId (number), vitalId (number)
 * @returns { message }
 * 
 * Exemplu:
 * DELETE /api/records/5/vitals/12
 */
router.delete('/:recordId/vitals/:vitalId', deleteVitalSign);

export default router;