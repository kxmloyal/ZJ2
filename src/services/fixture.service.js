const fixtureModel = require('../models/fixture.model');
const { cache } = require('../utils/cache');

// 获取所有治具
exports.getAllFixtures = async ({ page, limit, status }) => {
  // 尝试从缓存获取
  const cacheKey = `fixtures:${page}:${limit}:${status}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 从数据库获取
  const result = await fixtureModel.findAll({ page, limit, status });
  
  // 存入缓存，有效期10分钟
  cache.set(cacheKey, result, 600);
  
  return result;
};

// 根据ID获取治具
exports.getFixtureById = async (id) => {
  // 尝试从缓存获取
  const cacheKey = `fixture:${id}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 从数据库获取
  const fixture = await fixtureModel.findById(id);
  
  if (fixture) {
    // 存入缓存，有效期30分钟
    cache.set(cacheKey, fixture, 1800);
  }
  
  return fixture;
};

// 创建新治具
exports.createFixture = async (data) => {
  const newFixture = await fixtureModel.create(data);
  
  // 清除相关缓存
  clearFixturesCache();
  
  return newFixture;
};

// 更新治具
exports.updateFixture = async (id, data) => {
  const updatedFixture = await fixtureModel.update(id, data);
  
  if (updatedFixture) {
    // 清除相关缓存
    clearFixturesCache();
    cache.del(`fixture:${id}`);
  }
  
  return updatedFixture;
};

// 删除治具
exports.deleteFixture = async (id) => {
  const result = await fixtureModel.delete(id);
  
  if (result) {
    // 清除相关缓存
    clearFixturesCache();
    cache.del(`fixture:${id}`);
  }
  
  return result;
};

// 导入治具
exports.importFixtures = async (data) => {
  const result = await fixtureModel.bulkCreate(data);
  
  // 清除相关缓存
  clearFixturesCache();
  
  return result;
};

// 导出治具
exports.exportFixtures = async () => {
  return await fixtureModel.findAll({ pagination: false });
};

// 获取统计数据
exports.getStatistics = async () => {
  // 尝试从缓存获取
  const cacheKey = 'statistics';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 计算统计数据
  const stats = await fixtureModel.getStatistics();
  
  // 存入缓存，有效期5分钟
  cache.set(cacheKey, stats, 300);
  
  return stats;
};

// 获取产能趋势
exports.getCapacityTrend = async (period) => {
  // 尝试从缓存获取
  const cacheKey = `trend:${period}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 获取趋势数据
  const trend = await fixtureModel.getCapacityTrend(period);
  
  // 存入缓存，有效期30分钟
  cache.set(cacheKey, trend, 1800);
  
  return trend;
};

// 获取治具分布
exports.getFixtureDistribution = async () => {
  // 尝试从缓存获取
  const cacheKey = 'distribution';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  // 获取分布数据
  const distribution = await fixtureModel.getDistribution();
  
  // 存入缓存，有效期1小时
  cache.set(cacheKey, distribution, 3600);
  
  return distribution;
};

// 清除治具列表缓存
function clearFixturesCache() {
  // 清除所有治具列表相关缓存
  const keys = cache.keys();
  keys.forEach(key => {
    if (key.startsWith('fixtures:')) {
      cache.del(key);
    }
  });
  
  // 清除统计相关缓存
  cache.del('statistics');
  cache.del('distribution');
  cache.keys().forEach(key => {
    if (key.startsWith('trend:')) {
      cache.del(key);
    }
  });
}