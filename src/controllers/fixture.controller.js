const fixtureService = require('../services/fixture.service');

// 获取所有治具
exports.getAllFixtures = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const result = await fixtureService.getAllFixtures({
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 根据ID获取治具
exports.getFixtureById = async (req, res, next) => {
  try {
    const fixture = await fixtureService.getFixtureById(req.params.id);
    
    if (!fixture) {
      return res.status(404).json({ error: '治具不存在' });
    }
    
    res.json(fixture);
  } catch (error) {
    next(error);
  }
};

// 创建新治具
exports.createFixture = async (req, res, next) => {
  try {
    const newFixture = await fixtureService.createFixture(req.body);
    res.status(201).json(newFixture);
  } catch (error) {
    next(error);
  }
};

// 更新治具
exports.updateFixture = async (req, res, next) => {
  try {
    const updatedFixture = await fixtureService.updateFixture(req.params.id, req.body);
    
    if (!updatedFixture) {
      return res.status(404).json({ error: '治具不存在' });
    }
    
    res.json(updatedFixture);
  } catch (error) {
    next(error);
  }
};

// 删除治具
exports.deleteFixture = async (req, res, next) => {
  try {
    const result = await fixtureService.deleteFixture(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: '治具不存在' });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// 导入治具
exports.importFixtures = async (req, res, next) => {
  try {
    const result = await fixtureService.importFixtures(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 导出治具
exports.exportFixtures = async (req, res, next) => {
  try {
    const data = await fixtureService.exportFixtures();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="fixtures.json"');
    res.json(data);
  } catch (error) {
    next(error);
  }
};

// 获取统计数据
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await fixtureService.getStatistics();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// 获取产能趋势
exports.getCapacityTrend = async (req, res, next) => {
  try {
    const trend = await fixtureService.getCapacityTrend(req.query.period || 'week');
    res.json(trend);
  } catch (error) {
    next(error);
  }
};

// 获取治具分布
exports.getFixtureDistribution = async (req, res, next) => {
  try {
    const distribution = await fixtureService.getFixtureDistribution();
    res.json(distribution);
  } catch (error) {
    next(error);
  }
};