// 加载治具状态列表
async function loadFixtureStatusList() {
  const tableBody = document.getElementById('fixtureStatusTable');
  
  try {
    const fixtures = await getAllFixtures();
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
      const capacities = calculateCapacities(fixture);
      const utilization = ((fixture.schedule / fixture.capacity) * 100).toFixed(1);
      
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
      
      // 提前预警
      let warningClass = '';
      if (fixture.schedule > fixture.capacity * 0.8) {
        warningClass = 'bg-yellow-100';
      }
      
      html += `
        <tr class="fade-in ${warningClass}">
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
                  <div class="progress-value ${progressClass}" style="width: ${utilization}%"></div>
                </div>
              </div>
              <span class="text-sm font-medium">${utilization}%</span>
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
  } catch (error) {
    tableBody.innerHTML = `
      <tr class="text-center">
        <td colspan="7" class="px-6 py-10 text-gray-500">
          <div class="flex flex-col items-center">
            <i class="fa fa-exclamation-triangle text-2xl text-warning mb-2"></i>
            <p>加载数据失败</p>
            <button onclick="loadFixtureStatusList()" class="mt-2 text-primary hover:underline">重试</button>
          </div>
        </td>
      </tr>
    `;
    console.error('加载治具数据失败:', error);
  }
}

// 页面加载完成后加载治具状态列表
window.addEventListener('load', loadFixtureStatusList);