// 扩展DataService，增加更多模拟数据和功能
DataService = {
  // 获取治具统计数据
  async getFixtureStats() {
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
  
  // 获取所有治具列表（扩展版，包含更多字段和数据）
  async getAllFixtures() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { 
            id: 'F-001', 
            type: '测试治具', 
            capacity: 1200, 
            schedule: 1100, 
            location: 'A车间', 
            status: 'overloaded',
            description: '用于电子产品性能测试，可测试电压、电流等参数',
            createdAt: '2023-05-10T08:30:00Z',
            updatedAt: '2023-06-15T14:20:00Z'
          },
          { 
            id: 'F-002', 
            type: '冲压治具', 
            capacity: 800, 
            schedule: 650, 
            location: 'B车间', 
            status: 'normal',
            description: '用于金属件冲压成型，适用于厚度0.5-2mm的钢板',
            createdAt: '2023-05-12T09:15:00Z',
            updatedAt: '2023-06-10T11:30:00Z'
          },
          { 
            id: 'F-003', 
            type: '焊接治具', 
            capacity: 1500, 
            schedule: 900, 
            location: 'C车间', 
            status: 'normal',
            description: '自动化焊接设备配套治具，适用于不锈钢焊接',
            createdAt: '2023-05-08T10:45:00Z',
            updatedAt: '2023-06-05T09:45:00Z'
          },
          { 
            id: 'F-004', 
            type: '组装治具', 
            capacity: 600, 
            schedule: 580, 
            location: 'A车间', 
            status: 'overloaded',
            description: '用于精密部件组装定位，精度可达0.02mm',
            createdAt: '2023-05-15T13:20:00Z',
            updatedAt: '2023-06-18T16:40:00Z'
          },
          { 
            id: 'F-005', 
            type: '检测治具', 
            capacity: 900, 
            schedule: 450, 
            location: 'D车间', 
            status: 'maintenance',
            description: '用于产品尺寸检测，配备激光测量系统',
            createdAt: '2023-05-05T11:10:00Z',
            updatedAt: '2023-06-20T10:15:00Z'
          },
          { 
            id: 'F-006', 
            type: '测试治具', 
            capacity: 1000, 
            schedule: 850, 
            location: 'B车间', 
            status: 'normal',
            description: '高温环境测试专用治具，可承受-40至150摄氏度',
            createdAt: '2023-05-20T15:30:00Z',
            updatedAt: '2023-06-12T13:50:00Z'
          },
          { 
            id: 'F-007', 
            type: '冲压治具', 
            capacity: 750, 
            schedule: 700, 
            location: 'C车间', 
            status: 'normal',
            description: '小型零件冲压专用，生产效率高',
            createdAt: '2023-05-22T08:45:00Z',
            updatedAt: '2023-06-08T15:25:00Z'
          },
          { 
            id: 'F-008', 
            type: '焊接治具', 
            capacity: 1200, 
            schedule: 1000, 
            location: 'D车间', 
            status: 'overloaded',
            description: '大型结构件焊接治具，可同时处理3个工件',
            createdAt: '2023-05-18T14:10:00Z',
            updatedAt: '2023-06-19T09:10:00Z'
          },
          { 
            id: 'F-009', 
            type: '组装治具', 
            capacity: 950, 
            schedule: 600, 
            location: 'A车间', 
            status: 'normal',
            description: '模块化组装治具，可快速更换配件适应不同产品',
            createdAt: '2023-05-25T10:30:00Z',
            updatedAt: '2023-06-14T11:40:00Z'
          },
          { 
            id: 'F-010', 
            type: '检测治具', 
            capacity: 800, 
            schedule: 300, 
            location: 'B车间', 
            status: 'maintenance',
            description: '光学检测治具，用于检测表面缺陷',
            createdAt: '2023-05-28T16:20:00Z',
            updatedAt: '2023-06-21T14:30:00Z'
          }
        ]);
      }, 600);
    });
  },
  
  // 添加新治具
  async addFixture(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        const newFixture = {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        resolve(newFixture);
      }, 500);
    });
  },
  
  // 更新治具
  async updateFixture(id, data) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id,
          ...data,
          updatedAt: new Date().toISOString()
        });
      }, 500);
    });
  },
  
  // 删除治具
  async deleteFixture(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 300);
    });
  },
  
  // 导入治具
  async importFixtures(data, mode) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          imported: data.length,
          updated: mode === 'merge' ? Math.floor(data.length * 0.3) : 0,
          skipped: mode === 'ignore' ? Math.floor(data.length * 0.2) : 0
        });
      }, 1000);
    });
  }
};