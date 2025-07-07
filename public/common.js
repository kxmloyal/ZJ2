// Tailwind配置
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: '#1E293B',
        light: '#F8FAFC'
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  }
}

// 模拟数据服务
const DataService = {
  // 获取治具统计数据
  async getFixtureStats() {
    // 实际项目中应替换为API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalFixtures: 48,
          utilizationRate: 78,
          overloadedFixtures: 5,
          totalOutput: 12580
        });
      }, 500);
    });
  },
  
  // 获取产能趋势数据
  async getCapacityTrend() {
    // 实际项目中应替换为API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          actual: [1200, 1900, 1700, 2100, 1800, 900, 700],
          planned: [1500, 1500, 1500, 1500, 1500, 800, 500]
        });
      }, 600);
    });
  },
  
  // 获取治具类型分布
  async getFixtureTypeDistribution() {
    // 实际项目中应替换为API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          labels: ['测试治具', '冲压治具', '焊接治具', '组装治具', '检测治具'],
          data: [12, 8, 15, 7, 6]
        });
      }, 500);
    });
  },
  
  // 获取治具状态列表
  async getFixtureStatusList() {
    // 实际项目中应替换为API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'F-001', type: '测试治具', capacity: 1200, schedule: 1100, utilization: 91.7, status: 'overloaded' },
          { id: 'F-002', type: '冲压治具', capacity: 800, schedule: 650, utilization: 81.2, status: 'normal' },
          { id: 'F-003', type: '焊接治具', capacity: 1500, schedule: 900, utilization: 60.0, status: 'normal' },
          { id: 'F-004', type: '组装治具', capacity: 600, schedule: 580, utilization: 96.7, status: 'overloaded' },
          { id: 'F-005', type: '检测治具', capacity: 900, schedule: 450, utilization: 50.0, status: 'normal' }
        ]);
      }, 700);
    });
  },
  
  // 获取所有治具列表
  async getAllFixtures() {
    // 实际项目中应替换为API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 'F-001', type: '测试治具', capacity: 1200, schedule: 1100, location: 'A车间', status: 'active' },
          { id: 'F-002', type: '冲压治具', capacity: 800, schedule: 650, location: 'B车间', status: 'active' },
          { id: 'F-003', type: '焊接治具', capacity: 1500, schedule: 900, location: 'C车间', status: 'active' },
          { id: 'F-004', type: '组装治具', capacity: 600, schedule: 580, location: 'A车间', status: 'active' },
          { id: 'F-005', type: '检测治具', capacity: 900, schedule: 450, location: 'D车间', status: 'maintenance' },
          { id: 'F-006', type: '测试治具', capacity: 1000, schedule: 850, location: 'B车间', status: 'active' },
          { id: 'F-007', type: '冲压治具', capacity: 750, schedule: 700, location: 'C车间', status: 'active' },
          { id: 'F-008', type: '焊接治具', capacity: 1200, schedule: 1000, location: 'D车间', status: 'overloaded' }
        ]);
      }, 600);
    });
  }
};