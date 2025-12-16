import prisma from '../lib/prisma.ts'; // ← .js obligatoriu în ES Modules!

/**
 * GET ALL RECORDS - Toate înregistrările user-ului (cu vital signs)
 * GET /api/records?limit=30&sortBy=date
 */
const getAllRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 30, sortBy = 'date' } = req.query;

    const records = await prisma.healthRecord.findMany({
      where: { userId },
      orderBy: { [sortBy]: 'desc' },
      take: parseInt(limit),
      include: {
        // PĂSTRĂM INCLUDE pentru a aduce vitalSigns, dar ELIMINĂM SELECT
        vitalSigns: {
          orderBy: { timestamp: 'asc' }
        }
      } 
      // Am eliminat blocul select: {...}
    });

    res.json({
      count: records.length,
      records
    });

  } catch (error) {
    console.error('Get records error:', error);
    // Dacă eroarea persistă (deși nu ar trebui), vei vedea mesajul
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET ONE RECORD - Un singur record după ID (cu vital signs)
 * GET /api/records/:id
 */
const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const record = await prisma.healthRecord.findFirst({
      where: {
        id: parseInt(id),
        userId // asigură-te că record-ul aparține user-ului curent
      },
      include: {
        vitalSigns: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record });

  } catch (error) {
    console.error('Get record by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * CREATE RECORD - Adaugă înregistrare nouă (cu vital signs)
 * POST /api/records
 * Body: { 
 *   date?, weight?, steps?, sleepHours?, notes?,
 *   vitalSigns: [{ timeOfDay, heartRate, bloodPressureSystolic, bloodPressureDiastolic, ... }]
 * }
 */
const createRecord = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date, weight, steps, sleepHours, notes, vitalSigns } = req.body;

    // Validări de bază pentru record
    if (weight && weight <= 0) {
      return res.status(400).json({ error: 'Weight must be positive' });
    }
    if (steps && steps < 0) {
      return res.status(400).json({ error: 'Steps cannot be negative' });
    }
    if (sleepHours && (sleepHours < 0 || sleepHours > 24)) {
      return res.status(400).json({ error: 'Sleep hours must be between 0-24' });
    }

    // Validări pentru vital signs (dacă există)
    if (vitalSigns && Array.isArray(vitalSigns)) {
      for (const vital of vitalSigns) {
        if (vital.heartRate && (vital.heartRate < 30 || vital.heartRate > 250)) {
          return res.status(400).json({ error: 'Heart rate must be between 30-250 bpm' });
        }
        if (vital.bloodPressureSystolic && 
           (vital.bloodPressureSystolic < 70 || vital.bloodPressureSystolic > 200)) {
          return res.status(400).json({ error: 'Blood pressure systolic must be between 70-200' });
        }
        if (vital.bloodPressureDiastolic && 
           (vital.bloodPressureDiastolic < 40 || vital.bloodPressureDiastolic > 130)) {
          return res.status(400).json({ error: 'Blood pressure diastolic must be between 40-130' });
        }
        if (!vital.timeOfDay || !['morning', 'afternoon', 'evening', 'night'].includes(vital.timeOfDay)) {
          return res.status(400).json({ error: 'timeOfDay must be: morning, afternoon, evening, or night' });
        }
      }
    }

    // Creează record-ul cu vital signs
    const record = await prisma.healthRecord.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
        weight: weight ? parseFloat(weight) : null,
        steps: steps ? parseInt(steps) : null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        notes: notes || null,
        // Creează vital signs asociate (dacă există)
        vitalSigns: vitalSigns && Array.isArray(vitalSigns) ? {
          create: vitalSigns.map(vital => ({
            timestamp: vital.timestamp ? new Date(vital.timestamp) : new Date(),
            timeOfDay: vital.timeOfDay,
            heartRate: vital.heartRate ? parseInt(vital.heartRate) : null,
            bloodPressureSystolic: vital.bloodPressureSystolic ? parseInt(vital.bloodPressureSystolic) : null,
            bloodPressureDiastolic: vital.bloodPressureDiastolic ? parseInt(vital.bloodPressureDiastolic) : null,
            temperature: vital.temperature ? parseFloat(vital.temperature) : null,
            oxygenSaturation: vital.oxygenSaturation ? parseInt(vital.oxygenSaturation) : null,
            notes: vital.notes || null
          }))
        } : undefined
      },
      include: {
        vitalSigns: true
      }
    });

    res.status(201).json({
      message: 'Record created successfully',
      record
    });

  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * UPDATE RECORD - Modifică înregistrare existentă
 * PUT /api/records/:id
 * Body: { weight?, steps?, sleepHours?, notes? }
 * Note: Pentru a modifica vital signs, folosesc endpoint separat.
 */
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { weight, steps, sleepHours, notes } = req.body;

    // Verifică dacă record-ul există și aparține user-ului
    const existingRecord = await prisma.healthRecord.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Validări
    if (weight && weight <= 0) {
      return res.status(400).json({ error: 'Weight must be positive' });
    }

    // Update doar câmpurile trimise (Prisma ignoră undefined)
    const updatedRecord = await prisma.healthRecord.update({
      where: { id: parseInt(id) },
      data: {
        weight: weight !== undefined ? parseFloat(weight) : undefined,
        steps: steps !== undefined ? parseInt(steps) : undefined,
        sleepHours: sleepHours !== undefined ? parseFloat(sleepHours) : undefined,
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        vitalSigns: true
      }
    });

    res.json({
      message: 'Record updated successfully',
      record: updatedRecord
    });

  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE RECORD - Șterge înregistrare (cascade șterge și vital signs)
 * DELETE /api/records/:id
 */
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verifică dacă există și aparține user-ului
    const record = await prisma.healthRecord.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Șterge (cascade va șterge și vital signs automat)
    await prisma.healthRecord.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Record deleted successfully' });

  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET STATISTICS - Statistici (medii, max, min) incluzând vital signs
 * GET /api/records/statistics?period=week
 * period poate fi: week, month, year, all
 */
const getStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'month' } = req.query;

    // Calculează data de start în funcție de period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'all':
        startDate = new Date('1970-01-01');
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Ia toate records din perioada
    const records = await prisma.healthRecord.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      include: {
        vitalSigns: true
      }
    });

    if (records.length === 0) {
      return res.json({
        period,
        count: 0,
        statistics: null
      });
    }

    // Calculează statistici pentru record fields
    const weights = records.map(r => r.weight).filter(w => w !== null);
    const steps = records.map(r => r.steps).filter(s => s !== null);
    const sleepHours = records.map(r => r.sleepHours).filter(s => s !== null);

    // Extrage toate vital signs din toate records
    const allVitalSigns = records.flatMap(r => r.vitalSigns);
    
    const heartRates = allVitalSigns.map(v => v.heartRate).filter(h => h !== null);
    const systolicBP = allVitalSigns.map(v => v.bloodPressureSystolic).filter(b => b !== null);
    const diastolicBP = allVitalSigns.map(v => v.bloodPressureDiastolic).filter(b => b !== null);

    // Statistici per time of day
    const vitalsByTimeOfDay = {
      morning: allVitalSigns.filter(v => v.timeOfDay === 'morning'),
      afternoon: allVitalSigns.filter(v => v.timeOfDay === 'afternoon'),
      evening: allVitalSigns.filter(v => v.timeOfDay === 'evening'),
      night: allVitalSigns.filter(v => v.timeOfDay === 'night')
    };

    // Helper function pentru calcule
    const calculateStats = (arr) => {
      if (arr.length === 0) return null;
      return {
        average: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2),
        min: Math.min(...arr),
        max: Math.max(...arr),
        count: arr.length
      };
    };

    const calculateVitalStats = (vitals) => {
      const hrs = vitals.map(v => v.heartRate).filter(h => h !== null);
      const sys = vitals.map(v => v.bloodPressureSystolic).filter(b => b !== null);
      const dia = vitals.map(v => v.bloodPressureDiastolic).filter(b => b !== null);
      
      return {
        heartRate: calculateStats(hrs),
        bloodPressure: {
          systolic: calculateStats(sys),
          diastolic: calculateStats(dia)
        },
        count: vitals.length
      };
    };

    const statistics = {
      weight: calculateStats(weights),
      steps: calculateStats(steps),
      sleepHours: calculateStats(sleepHours),
      vitalSigns: {
        overall: {
          heartRate: calculateStats(heartRates),
          bloodPressure: {
            systolic: calculateStats(systolicBP),
            diastolic: calculateStats(diastolicBP)
          }
        },
        byTimeOfDay: {
          morning: calculateVitalStats(vitalsByTimeOfDay.morning),
          afternoon: calculateVitalStats(vitalsByTimeOfDay.afternoon),
          evening: calculateVitalStats(vitalsByTimeOfDay.evening),
          night: calculateVitalStats(vitalsByTimeOfDay.night)
        }
      }
    };

    res.json({
      period,
      recordsCount: records.length,
      vitalSignsCount: allVitalSigns.length,
      statistics
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * ADD VITAL SIGN - Adaugă un vital sign la un record existent
 * POST /api/records/:id/vitals
 * Body: { timeOfDay, heartRate, bloodPressureSystolic, bloodPressureDiastolic, ... }
 */
const addVitalSign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { timeOfDay, heartRate, bloodPressureSystolic, bloodPressureDiastolic, temperature, oxygenSaturation, notes } = req.body;

    // Verifică dacă record-ul există și aparține user-ului
    const record = await prisma.healthRecord.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Validări
    if (!timeOfDay || !['morning', 'afternoon', 'evening', 'night'].includes(timeOfDay)) {
      return res.status(400).json({ error: 'timeOfDay must be: morning, afternoon, evening, or night' });
    }

    const vitalSign = await prisma.vitalSign.create({
      data: {
        recordId: parseInt(id),
        timeOfDay,
        heartRate: heartRate ? parseInt(heartRate) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
        notes: notes || null
      }
    });

    res.status(201).json({
      message: 'Vital sign added successfully',
      vitalSign
    });

  } catch (error) {
    console.error('Add vital sign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * UPDATE VITAL SIGN - Modifică înregistrare existentă
 * PUT /api/records/recordID/vitals/:vitalId
 * body: { timeOfDay?, heartRate?, bloodPressureSystolic?, bloodPressureDiastolic?, temperature?, oxygenSaturation?, notes? }
 */
const updateVitalSign = async (req, res) => {
  try {
    const { recordId, vitalId } = req.params;
    const userId = req.user.userId;
    const { timeOfDay, heartRate, bloodPressureSystolic, bloodPressureDiastolic, temperature, oxygenSaturation, notes } = req.body;

    // Verifică ownership record
    const record = await prisma.healthRecord.findFirst({
      where: { id: parseInt(recordId), userId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Verifică dacă vital sign există
    const vital = await prisma.vitalSign.findFirst({
      where: { id: parseInt(vitalId), recordId: parseInt(recordId) }
    });

    if (!vital) {
      return res.status(404).json({ error: 'Vital sign not found' });
    }

    // Update vital sign
    const updatedVital = await prisma.vitalSign.update({
      where: { id: parseInt(vitalId) },
      data: {
        timeOfDay: timeOfDay || vital.timeOfDay,
        heartRate: heartRate !== undefined ? parseInt(heartRate) : vital.heartRate,
        bloodPressureSystolic: bloodPressureSystolic !== undefined ? parseInt(bloodPressureSystolic) : vital.bloodPressureSystolic,
        bloodPressureDiastolic: bloodPressureDiastolic !== undefined ? parseInt(bloodPressureDiastolic) : vital.bloodPressureDiastolic,
        temperature: temperature !== undefined ? parseFloat(temperature) : vital.temperature,
        oxygenSaturation: oxygenSaturation !== undefined ? parseInt(oxygenSaturation) : vital.oxygenSaturation,
        notes: notes !== undefined ? notes : vital.notes
      }
    });

    res.json({ message: 'Vital sign updated successfully', updatedVital });

  } catch (error) {
    console.error('Update vital sign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * DELETE VITAL SIGN - Șterge un vital sign
 * DELETE /api/records/:recordId/vitals/:vitalId
 */
const deleteVitalSign = async (req, res) => {
  try {
    const { recordId, vitalId } = req.params;
    const userId = req.user.userId;

    // Verifică ownership prin record
    const record = await prisma.healthRecord.findFirst({
      where: { id: parseInt(recordId), userId }
    });

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Verifică dacă vital sign-ul există și aparține record-ului
    const vitalSign = await prisma.vitalSign.findFirst({
      where: {
        id: parseInt(vitalId),
        recordId: parseInt(recordId)
      }
    });

    if (!vitalSign) {
      return res.status(404).json({ error: 'Vital sign not found' });
    }

    await prisma.vitalSign.delete({
      where: { id: parseInt(vitalId) }
    });

    res.json({ message: 'Vital sign deleted successfully' });

  } catch (error) {
    console.error('Delete vital sign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getStatistics,
  addVitalSign,
  updateVitalSign,
  deleteVitalSign
};