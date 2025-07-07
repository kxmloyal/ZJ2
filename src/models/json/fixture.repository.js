const fs = require('fs-extra');
const path = require('path');
const config = require('../../../config/default.json');
const { v4: uuidv4 } = require('uuid');

// 数据文件路径
const dataPath = path.resolve(config.db.json.filePath);

// 确保数据目录存在
fs.ensureDirSync(path.dirname(dataPath));

// 初始化数据文件
async function initDataFile() {
  if (!await fs.pathExists(dataPath)) {
    await fs.writeJson(dataPath, []);
  }
}

// 读取所有数据
async function readAllData() {
  await initDataFile();
  return fs.readJson(dataPath);
}

// 写入所有数据
async function writeAllData(data) {
  await fs.writeJson(dataPath, data, { spaces: 2 });
}

// 查询所有治具
exports.findAll = async ({ page, limit, status, pagination }) => {
  const data = await readAllData();
  
  // 过滤状态
  let filteredData = data;
  if (status !== 'all') {
    filteredData = data.filter(item => item.status === status);
  }
  
  // 如果不需要分页，直接返回所有数据
  if (!pagination) {
    return filteredData;
  }
  
  // 计算分页
  const total = filteredData.length;
  const offset = (page - 1) * limit;
  const items = filteredData.slice(offset, offset + limit);
  
  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// 根据ID查询治具
exports.findById = async (id) => {
  const data = await readAllData();
  return data.find(item => item.id === id) || null;
};

// 创建治具
exports.create = async (data) => {
  const items = await readAllData();
  
  // 生成ID（如果未提供）
  const newItem = {
    id: data.id || `F-${Date.now().toString().slice(-6)}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  items.push(newItem);
  await writeAllData(items);
  
  return newItem;
};

// 批量创建治具
exports.bulkCreate = async (items) => {
  const existingItems = await readAllData();
  const newItems = [];
  const timestamp = new Date().toISOString();
  
  items.forEach(item => {
    const newItem = {
      id: item.id || `F-${Date.now().toString().slice(-6)}-${uuidv4().slice(-4)}`,
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    existingItems.push(newItem);
    newItems.push(newItem);
  });
  
  await writeAllData(existingItems);
  
  return {
    created: newItems.length,
    items: newItems
  };
};

// 更新治具
exports.update = async (id, data) => {
  const items = await readAllData();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // 更新治具数据
  items[index] = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  await writeAllData(items);
  return items[index];
};

// 删除治具
exports.delete = async (id) => {
  const items = await readAllData();
  const initialLength = items.length;
  
  // 过滤掉要删除的项目
  const filteredItems = items.filter(item => item.id !== id);
  
  // 如果数量没变，说明没有找到要删除的项目
  if (filteredItems.length === initialLength) {
    return false;
  }
  
  await writeAllData(filteredItems);
  return true;
};

// 获取统计数据
exports.getStatistics = async () => {
  const data = await readAllData();
  
  // 计算总数量
  const totalFixtures = data.length;
  
  // 计算各状态数量
  const statusCount = data.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  
  // 计算总产能和总排程
  const totals = data.reduce((acc, item) => {
    acc.capacity += item.capacity || 0;
    acc.schedule += item.schedule || 0;
    return acc;
  }, { capacity: 0, schedule: 0 });
  
  // 计算利用率
  const utilizationRate = totals.capacity > 0 
    ? Math.round((totals.schedule / totals.capacity) * 100) 
    : 0;
  
  return {
    totalFixtures,
    overloadedFixtures: statusCount.overloaded || 0,
    utilizationRate,
    totalOutput: totals.schedule
  };
};

// 获取产能趋势（模拟数据）
exports.getCapacityTrend = async (period) => {
  // 实际项目中应该从历史数据计算趋势
  // 这里使用模拟数据
  
  let labels, actual, planned;
  
  if (period === 'month') {
    // 月度数据
    labels = ['1月', '2月', '3月', '4月', '5月', '6月'];
    actual = [12000, 15000, 14500, 16800, 18200, 19500];
    planned = [11000, 14000, 15000, 16000, 17000, 18000];
  } else if (period === 'year') {
    // 年度数据
    labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    actual = [12000, 15000, 14500, 16800, 18200, 19500, 21000, 22500, 23000, 24500, 26000, 27500];
    planned = [11000, 14000, 15000, 16000, 17000, 18000, 20000, 21000, 22000, 23000, 25000, 26000];
  } else {
    // 默认周数据
    labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    actual = [1200, 1900, 1700, 2100, 1800, 900, 700];
    planned = [1500, 1500, 1500, 1500, 1500, 800, 500];
  }
  
  return { labels, actual, planned };
};

// 获取治具分布
exports.getDistribution = async () => {
  const data = await readAllData();
  
  // 按类型分组统计
  const typeCount = data.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  
  // 转换为图表所需格式
  return {
    labels: Object.keys(typeCount),
    data: Object.values(typeCount)
  };
};