const mysql = require('mysql2/promise');
const config = require('../../../config/default.json');

// 创建数据库连接池
const pool = mysql.createPool({
  host: config.db.mysql.host,
  user: config.db.mysql.user,
  password: config.db.mysql.password,
  database: config.db.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 查询所有治具
exports.findAll = async ({ page = 1, limit = 10, status = 'all', pagination = true }) => {
  let query = 'SELECT * FROM fixtures';
  const values = [];
  
  if (status !== 'all') {
    query += ' WHERE status = ?';
    values.push(status);
  }
  
  if (pagination) {
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    values.push(limit, offset);
  }
  
  const [rows] = await pool.execute(query, values);
  
  if (pagination) {
    const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM fixtures');
    const total = totalRows[0].total;
    const pages = Math.ceil(total / limit);
    
    return {
      items: rows,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }
  
  return rows;
};

// 根据ID查询治具
exports.findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM fixtures WHERE id = ?', [id]);
  return rows[0] || null;
};

// 创建治具
exports.create = async (data) => {
  const { id, type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth } = data;
  const newId = id || `ZJ-${data.model}-${Date.now().toString().slice(-6)}`;
  const createdAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  
  const [result] = await pool.execute(
    'INSERT INTO fixtures (id, type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [newId, type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth, createdAt, updatedAt]
  );
  
  return {
    id: newId,
    type,
    capacity,
    schedule,
    location,
    status,
    description,
    workingHoursPerDay,
    workingDaysPerMonth,
    createdAt,
    updatedAt
  };
};

// 批量创建治具
exports.bulkCreate = async (items) => {
  const newItems = [];
  const timestamp = new Date().toISOString();
  
  for (const item of items) {
    const { id, type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth } = item;
    const newId = id || `ZJ-${item.model}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000)}`;
    const createdAt = timestamp;
    const updatedAt = timestamp;
    
    await pool.execute(
      'INSERT INTO fixtures (id, type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth, createdAt, updatedAt]
    );
    
    newItems.push({
      id: newId,
      type,
      capacity,
      schedule,
      location,
      status,
      description,
      workingHoursPerDay,
      workingDaysPerMonth,
      createdAt,
      updatedAt
    });
  }
  
  return {
    created: newItems.length,
    items: newItems
  };
};

// 更新治具
exports.update = async (id, data) => {
  const { type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth } = data;
  const updatedAt = new Date().toISOString();
  
  const [result] = await pool.execute(
    'UPDATE fixtures SET type = ?, capacity = ?, schedule = ?, location = ?, status = ?, description = ?, workingHoursPerDay = ?, workingDaysPerMonth = ?, updatedAt = ? WHERE id = ?',
    [type, capacity, schedule, location, status, description, workingHoursPerDay, workingDaysPerMonth, updatedAt, id]
  );
  
  if (result.affectedRows === 0) {
    return null;
  }
  
  return {
    id,
    type,
    capacity,
    schedule,
    location,
    status,
    description,
    workingHoursPerDay,
    workingDaysPerMonth,
    updatedAt
  };
};

// 删除治具
exports.delete = async (id) => {
  const [result] = await pool.execute('DELETE FROM fixtures WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// 获取统计数据
exports.getStatistics = async () => {
  const [rows] = await pool.execute('SELECT COUNT(*) as totalFixtures, SUM(capacity) as capacity, SUM(schedule) as schedule FROM fixtures');
  const totalFixtures = rows[0].totalFixtures;
  const capacity = rows[0].capacity || 0;
  const schedule = rows[0].schedule || 0;
  
  const [statusRows] = await pool.execute('SELECT status, COUNT(*) as count FROM fixtures GROUP BY status');
  const statusCount = {};
  statusRows.forEach(row => {
    statusCount[row.status] = row.count;
  });
  
  const utilizationRate = capacity > 0 
    ? Math.round((schedule / capacity) * 100) 
    : 0;
  
  return {
    totalFixtures,
    overloadedFixtures: statusCount.overloaded || 0,
    utilizationRate,
    totalOutput: schedule
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
    actual = [12000, 15000, 1450