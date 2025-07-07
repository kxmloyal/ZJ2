const config = require('../../config/default.json');

// 根据配置选择数据存储方式
let repository;
if (config.db.type === 'mysql') {
  repository = require('./mysql/fixture.repository');
} else {
  repository = require('./json/fixture.repository');
}

// 查询所有治具
exports.findAll = async ({ page = 1, limit = 10, status = 'all', pagination = true }) => {
  return repository.findAll({ page, limit, status, pagination });
};

// 根据ID查询治具
exports.findById = async (id) => {
  return repository.findById(id);
};

// 创建治具
exports.create = async (data) => {
  return repository.create(data);
};

// 批量创建治具
exports.bulkCreate = async (data) => {
  return repository.bulkCreate(data);
};

// 更新治具
exports.update = async (id, data) => {
  return repository.update(id, data);
};

// 删除治具
exports.delete = async (id) => {
  return repository.delete(id);
};

// 获取统计数据
exports.getStatistics = async () => {
  return repository.getStatistics();
};

// 获取产能趋势
exports.getCapacityTrend = async (period) => {
  return repository.getCapacityTrend(period);
};

// 获取治具分布
exports.getDistribution = async () => {
  return repository.getDistribution();
};