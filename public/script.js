// 渲染图表
function renderCharts() {
  // 产能趋势图表
  DataService.getCapacityTrend().then(data => {
    const ctx = document.getElementById('capacityTrendChart').getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '实际产能',
            data: data.actual,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: '计划产能',
            data: data.planned,
            borderColor: '#94A3B8',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              drawBorder: false
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  });
  
  // 治具类型分布图表
  DataService.getFixtureTypeDistribution().then(data => {
    const ctx = document.getElementById('fixtureTypeChart').getContext('2d');
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6'
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        cutout: '70%'
      }
    });
  });
}

// 加载统计数据
function loadStatistics() {
  DataService.getFixtureStats().then(stats => {
    document.getElementById('totalFixtures').textContent = stats.totalFixtures;
    document.getElementById('utilizationRate').textContent = `${stats.utilizationRate}%`;
    document.getElementById('overloadedFixtures').textContent = stats.overloadedFixtures;
    document.getElementById('totalOutput').textContent = stats.totalOutput.toLocaleString();
  });
}

// 加载治具状态列表
function loadFixtureStatusList() {
  const tableBody = document.getElementById('fixtureStatusTable');
  
  DataService.getFixtureStatusList().then(fixtures => {
    if (fixtures.length === 0) {
      tableBody.innerHTML = `
        <tr class="text-center">
          <td colspan="7" class="px-6 py-10 text-gray-500">
            <i class="fa fa-box-open text-2xl text-gray-300 mb-2"></i>
            <p>没有找到治具数据</p>
          </td>
        </tr>
      `;
      return;
    }
    
    let html = '';
    fixtures.forEach(fixture => {
      // 确定状态样式
      let statusClass = '';
      let statusText = '';
      let progressClass = '';
      
      if (fixture.status === 'overloaded') {
        statusClass = 'status-overloaded';
        statusText = '超载';
        progressClass = 'progress-overloaded';
      } else if (fixture.status === 'maintenance') {
        statusClass = 'status-maintenance';
        statusText = '维护中';
        progressClass = 'progress-maintenance';
      } else {
        statusClass = 'status-normal';
        statusText = '正常';
        progressClass = 'progress-normal';
      }
      
      html += `
        <tr class="fade-in">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="font-medium text-gray-900">${fixture.id}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${fixture.type}</td>
          <td class="px-6 py-4 whitespace-nowrap">${fixture.capacity}</td>
          <td class="px-6 py-4 whitespace-nowrap">${fixture.schedule}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="w-full mr-2">
                <div class="progress-bar">
                  <div class="progress-value ${progressClass}" style="width: ${fixture.utilization}%"></div>
                </div>
              </div>
              <span class="text-sm font-medium">${fixture.utilization}%</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="status-badge ${statusClass}">
              ${statusText}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="#" class="text-primary hover:text-primary/80 mr-3">查看</a>
            <a href="#" class="text-gray-500 hover:text-gray-700">编辑</a>
          </td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = html;
  });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 加载统计数据
  loadStatistics();
  
  // 加载治具状态列表
  loadFixtureStatusList();
});