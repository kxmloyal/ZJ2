const express = require('express');
const router = express.Router();
const fixtureController = require('../controllers/fixture.controller');

// 治具相关路由
router.get('/fixtures', fixtureController.getAllFixtures);
router.get('/fixtures/:id', fixtureController.getFixtureById);
router.post('/fixtures', fixtureController.createFixture);
router.put('/fixtures/:id', fixtureController.updateFixture);
router.delete('/fixtures/:id', fixtureController.deleteFixture);
router.post('/fixtures/import', fixtureController.importFixtures);
router.get('/fixtures/export', fixtureController.exportFixtures);

// 统计数据相关路由
router.get('/statistics', fixtureController.getStatistics);
router.get('/statistics/trend', fixtureController.getCapacityTrend);
router.get('/statistics/distribution', fixtureController.getFixtureDistribution);

module.exports = router;