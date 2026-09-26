const express = require('express');
const controller = require('../controllers/transactionController');
const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/analytics', controller.analytics);
router.get('/transactions', controller.list);
router.get('/transactions/:id', controller.getOne);
router.post('/transactions', controller.create);
router.put('/transactions/:id', controller.update);
router.delete('/transactions/:id', controller.remove);

module.exports = router;
