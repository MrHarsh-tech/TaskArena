const express = require('express');
const router = express.Router();
const { 
  getChallenges, 
  getChallengeById, 
  createChallenge, 
  submitAttempt,
  updateChallenge,
  archiveChallenge
} = require('../controllers/challengeController');
const { protect, instructor } = require('../middleware/auth');

router.get('/', getChallenges);
router.get('/:id', getChallengeById);
router.post('/', protect, instructor, createChallenge);
router.post('/:id/attempt', protect, submitAttempt);
router.put('/:id', protect, instructor, updateChallenge);
router.delete('/:id', protect, instructor, archiveChallenge);

module.exports = router;
