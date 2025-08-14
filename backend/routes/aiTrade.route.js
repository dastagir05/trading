const express = require('express');
const router = express.Router();
const {
  getAllAiTrades,
  getAiTradeById,
  getAiTradeStats,
  getAiTradesBySentiment,
  getAiTradesByRiskLevel,
  getAiTradesBySymbol,
  addNoteToAiTrade,
  updateAiTradeStatus,
  getAiTradePerformanceReport,
  forceProcessSuggestions
} = require('../controllers/aiTrade.controller');

// Get all AI trades with optional filtering
router.get('/', getAllAiTrades);

// Get AI trade statistics
router.get('/stats', getAiTradeStats);

// Get AI trade by ID
router.get('/:id', getAiTradeById);

// Get AI trades by sentiment
router.get('/sentiment/:sentiment', getAiTradesBySentiment);

// Get AI trades by risk level
router.get('/risk/:riskLevel', getAiTradesByRiskLevel);

// Get AI trades by symbol
router.get('/symbol/:symbol', getAiTradesBySymbol);

// Get AI trade performance report
router.get('/report/performance', getAiTradePerformanceReport);

// Add note to AI trade
router.post('/:id/notes', addNoteToAiTrade);

// Update AI trade status
router.patch('/:id/status', updateAiTradeStatus);

// Force process AI trade suggestions (admin endpoint)
router.post('/force-process', forceProcessSuggestions);

// Generate fresh trade suggestions (admin endpoint)
router.post('/generate-fresh', async (req, res) => {
  try {
    const { generateFreshTradeSuggestions } = require('../aiTradeSugg/generateFreshTrades');
    const result = await generateFreshTradeSuggestions();
    res.json({ 
      success: true, 
      message: 'Fresh trade suggestions generated successfully', 
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
