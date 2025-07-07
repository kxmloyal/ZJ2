// 加载治具列表
function loadFixturesList() {
  const tableBody = document.getElementById('fixturesTableBody');
  
  DataService.getAllFixtures().then(fixtures => {
    document.getElementById('fixturesCount').textContent = fixtures.length;
    
    if (fixtures.length === 0) {
      tableBody.innerHTML = `
        <tr class="text-center">
          <td colspan="8" class="px-6 py-10 text-gray-500">
            <i class="fa fa-box-open text-2xl text-gray-300 mb-2"></i>
            <p>没有找到治具数据</p>
            <button id="addFirstFixture" class="mt-4 btn btn-primary">
              <i class="fa fa-plus mr-2"></i> 添加第一个治具
            </button>
          </td>
        </tr>
      `;
      
      // 添加第一个治具按钮事件
      document.getElementById('addFirstFixture').addEventListener('click', () => {
        document.getElementById('addFixtureModal').classList.remove('hidden');
      });
      
      return;
    }
    
    let html = '';
    fixtures.forEach(fixture => {
      // 计算利用率
      const utilization = ((fixture.schedule / fixture.capacity) * 100).toFixed(1);
      
      // 确定状态样式和文本
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
                  <div class="progress-value ${progressClass}" style="width: ${utilization}%"></div>
                </div>
              </div>
              <span class="text-sm font-medium">${utilization}%</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${fixture.location}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="status-badge ${statusClass}">
              ${statusText}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="viewFixtureBtn text-primary hover:text-primary/80 mr-3" data-id="${fixture.id}">查看</button>
            <button class="editFixtureBtn text-gray-500 hover:text-gray-700 mr-3" data-id="${fixture.id}">编辑</button>
            <button class="deleteFixtureBtn text-danger hover:text-danger/80" data-id="${fixture.id}">删除</button>
          </td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = html;
    
    // 绑定按钮事件
    bindFixtureActions();
  });
}

// 绑定治具操作按钮事件
function bindFixtureActions() {
  // 查看按钮事件
  document.querySelectorAll('.viewFixtureBtn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const fixtureId = this.getAttribute('data-id');
      // 查看治具详情逻辑
      alert(`查看治具 ${fixtureId} 的详情`);
    });
  });
  
  // 编辑按钮事件
  document.querySelectorAll('.editFixtureBtn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const fixtureId = this.getAttribute('data-id');
      // 编辑治具逻辑
      alert(`编辑治具 ${fixtureId}`);
    });
  });
  
  // 删除按钮事件
  document.querySelectorAll('.deleteFixtureBtn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const fixtureId = this.getAttribute('data-id');
      
      if (confirm(`确定要删除治具 ${fixtureId} 吗？`)) {
        // 删除治具逻辑
        alert(`删除治具 ${fixtureId}`);
        // 实际项目中删除后应重新加载列表
        // loadFixturesList();
      }
    });
  });
}

// 初始化添加治具模态框
function initAddFixtureModal() {
  const modal = document.getElementById('addFixtureModal');
  const openButton = document.getElementById('addFixtureBtn');
  const closeButton = document.getElementById('closeAddModal');
  const cancelButton = document.getElementById('cancelAddFixture');
  const form = document.getElementById('addFixtureForm');
  
  // 打开模态框
  openButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
  
  // 关闭模态框
  closeButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    form.reset();
  });
  
  cancelButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    form.reset();
  });
  
  // 点击模态框外部关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      form.reset();
    }
  });
  
  // 表单提交
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
      id: document.getElementById('fixtureId').value,
      type: document.getElementById('fixtureType').value,
      capacity: parseInt(document.getElementById('fixtureCapacity').value),
      schedule: parseInt(document.getElementById('fixtureSchedule').value),
      location: document.getElementById('fixtureLocation').value,
      status: document.getElementById('fixtureStatus').value
    };
    
    // 模拟提交表单
    alert('治具添加成功！');
    modal.classList.add('hidden');
    form.reset();
    
    // 实际项目中添加后应重新加载列表
    // loadFixturesList();
  });
}

// 初始化搜索和筛选功能
function initSearchAndFilter() {
  const searchInput = document.getElementById('fixtureSearch');
  const filterSelect = document.getElementById('fixtureFilter');
  
  // 搜索功能
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    // 实际项目中应根据搜索词筛选表格数据
    console.log(`搜索: ${searchTerm}`);
  });
  
  // 筛选功能
  filterSelect.addEventListener('change', function() {
    const filterValue = this.value;
    // 实际项目中应根据筛选值过滤表格数据
    console.log(`筛选: ${filterValue}`);
  });
}

// 初始化导入导出功能
function initImportExport() {
  const importButton = document.getElementById('importFixturesBtn');
  const exportButton = document.getElementById('exportFixturesBtn');
  
  // 导入功能
  importButton.addEventListener('click', () => {
    alert('导入治具数据');
    // 实际项目中应打开文件选择对话框
  });
  
  // 导出功能
  exportButton.addEventListener('click', () => {
    alert('导出治具数据');
    // 实际项目中应生成并下载导出文件
  });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 初始化添加治具模态框
  initAddFixtureModal();
  
  // 初始化搜索和筛选功能
  initSearchAndFilter();
  
  // 初始化导入导出功能
  initImportExport();
});