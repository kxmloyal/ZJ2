// 全局状态管理
const JigState = {
  fixtures: [],
  filteredFixtures: [],
  currentPage: 1,
  itemsPerPage: 8,
  selectedFixtures: [],
  isSelectAll: false,
  filters: {
    status: 'all',
    type: 'all',
    search: ''
  }
};

// 初始化治具管理功能
async function initJigManagement() {
  // 加载治具列表
  await loadFixturesList();
  
  // 初始化模态框功能
  initModals();
  
  // 初始化筛选功能
  initFilters();
  
  // 初始化分页功能
  initPagination();
  
  // 初始化批量操作
  initBatchOperations();
  
  // 初始化导入功能
  initImportFunctionality();
  
  // 初始化导出功能
  initExportFunctionality();
}

// 加载治具列表
async function loadFixturesList() {
  const tableBody = document.getElementById('fixturesTableBody');
  
  // 显示加载状态
  tableBody.innerHTML = `
    <tr class="text-center">
      <td colspan="9" class="px-6 py-10 text-gray-500">
        <i class="fa fa-spinner fa-spin text-xl mb-2"></i>
        <p>正在加载数据...</p>
      </td>
    </tr>
  `;
  
  try {
    const fixtures = await getAllFixtures();
    JigState.fixtures = fixtures;
    JigState.filteredFixtures = [...fixtures];
    
    // 更新类型筛选下拉框
    populateTypeFilter();
    
    // 应用筛选
    applyFilters();
    
    // 更新计数
    document.getElementById('fixturesCount').textContent = fixtures.length;
    
    // 渲染表格
    renderFixturesTable();
  } catch (error) {
    tableBody.innerHTML = `
      <tr class="text-center">
        <td colspan="9" class="px-6 py-10 text-gray-500">
          <div class="flex flex-col items-center">
            <i class="fa fa-exclamation-triangle text-2xl text-warning mb-2"></i>
            <p>加载数据失败</p>
            <button onclick="loadFixturesList()" class="mt-2 text-primary hover:underline">重试</button>
          </div>
        </td>
      </tr>
    `;
    console.error('加载治具数据失败:', error);
  }
}

// 渲染治具表格
function renderFixturesTable() {
  const tableBody = document.getElementById('fixturesTableBody');
  const { filteredFixtures, currentPage, itemsPerPage } = JigState;
  
  // 计算分页
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredFixtures.slice(startIndex, endIndex);
  
  // 更新分页信息
  document.getElementById('currentPageText').textContent = currentPage;
  document.getElementById('endPageText').textContent = Math.min(endIndex, filteredFixtures.length);
  
  if (currentItems.length === 0) {
    tableBody.innerHTML = `
      <tr class="text-center">
        <td colspan="9" class="px-6 py-10 text-gray-500">
          <div class="flex flex-col items-center">
            <i class="fa fa-box-open text-2xl text-gray-300 mb-2"></i>
            <p>没有找到符合条件的治具</p>
            <button onclick="resetFilters()" class="mt-2 btn btn-secondary">
              <i class="fa fa-refresh mr-1"></i> 重置筛选条件
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  let html = '';
  currentItems.forEach(fixture => {
    const capacities = calculateCapacities(fixture);
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
    
    // 提前预警
    let warningClass = '';
    if (fixture.schedule > fixture.capacity * 0.8) {
      warningClass = 'bg-yellow-100';
    }
    
    // 检查是否被选中
    const isSelected = JigState.selectedFixtures.includes(fixture.id);
    
    html += `
      <tr class="fade-in hover:bg-gray-50 transition-colors duration-150 ${warningClass}">
        <td class="px-6 py-4 whitespace-nowrap">
          <input type="checkbox" class="fixture-checkbox rounded text-primary focus:ring-primary" data-id="${fixture.id}" ${isSelected ? 'checked' : ''}>
        </td>
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
        <td class="px-6 py-4 whitespace-nowrap">${fixture.location || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button class="status-badge ${statusClass} cursor-pointer" data-id="${fixture.id}" data-status="${fixture.status}">
            ${statusText}
          </button>
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
  
  // 绑定行内按钮事件
  bindRowActions();
}

// 绑定行内操作按钮事件
function bindRowActions() {
  // 查看按钮事件
  document.querySelectorAll('.viewFixtureBtn').forEach(button => {
    button.addEventListener('click', function() {
      const fixtureId = this.getAttribute('data-id');
      viewFixtureDetails(fixtureId);
    });
  });
  
  // 编辑按钮事件
  document.querySelectorAll('.editFixtureBtn').forEach(button => {
    button.addEventListener('click', function() {
      const fixtureId = this.getAttribute('data-id');
      openEditModal(fixtureId);
    });
  });
  
  // 删除按钮事件
  document.querySelectorAll('.deleteFixtureBtn').forEach(button => {
    button.addEventListener('click', function() {
      const fixtureId = this.getAttribute('data-id');
      openDeleteModal(fixtureId);
    });
  });
  
  // 状态标签点击事件
  document.querySelectorAll('.status-badge').forEach(badge => {
    badge.addEventListener('click', function() {
      const fixtureId = this.getAttribute('data-id');
      const currentStatus = this.getAttribute('data-status');
      changeFixtureStatus(fixtureId, currentStatus);
    });
  });
  
  // 复选框事件
  document.querySelectorAll('.fixture-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const fixtureId = this.getAttribute('data-id');
      if (this.checked) {
        JigState.selectedFixtures.push(fixtureId);
      } else {
        JigState.selectedFixtures = JigState.selectedFixtures.filter(id => id !== fixtureId);
      }
      
      // 更新全选状态
      updateSelectAllStatus();
      // 更新批量操作按钮状态
      updateBatchOperationsStatus();
    });
  });
}

// 初始化模态框功能
function initModals() {
  // 添加治具模态框
  const addModal = document.getElementById('addFixtureModal');
  const openAddButton = document.getElementById('addFixtureBtn');
  const closeAddButton = document.getElementById('closeAddModal');
  const cancelAddButton = document.getElementById('cancelAddFixture');
  const addForm = document.getElementById('addFixtureForm');
  
  // 打开添加模态框
  openAddButton.addEventListener('click', () => {
    addModal.classList.remove('hidden');
    addForm.reset();
  });
  
  // 关闭添加模态框
  closeAddButton.addEventListener('click', () => {
    addModal.classList.add('hidden');
  });
  
  cancelAddButton.addEventListener('click', () => {
    addModal.classList.add('hidden');
  });
  
  // 点击模态框外部关闭
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
      addModal.classList.add('hidden');
    }
  });
  
  // 添加治具表单提交
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
      id: document.getElementById('fixtureId').value,
      type: document.getElementById('fixtureType').value,
      capacity: parseInt(document.getElementById('fixtureCapacity').value),
      schedule: parseInt(document.getElementById('fixtureSchedule').value),
      location: document.getElementById('fixtureLocation').value,
      status: document.getElementById('fixtureStatus').value,
      description: document.getElementById('fixtureDescription').value,
      workingHoursPerDay: parseInt(document.getElementById('workingHoursPerDay').value),
      workingDaysPerMonth: parseInt(document.getElementById('workingDaysPerMonth').value)
    };
    
    // 模拟添加治具
    try {
      const response = await fetch('/api/fixtures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        addModal.classList.add('hidden');
        loadFixturesList();
      } else {
        console.error('添加治具失败');
      }
    } catch (error) {
      console.error('添加治具失败:', error);
    }
  });
  
  // 编辑治具模态框
  const editModal = document.getElementById('editFixtureModal');
  const closeEditButton = document.getElementById('closeEditModal');
  const cancelEditButton = document.getElementById('cancelEditFixture');
  const editForm = document.getElementById('editFixtureForm');
  
  // 关闭编辑模态框
  closeEditButton.addEventListener('click', () => {
    editModal.classList.add('hidden');
  });
  
  cancelEditButton.addEventListener('click', () => {
    editModal.classList.add('hidden');
  });
  
  // 点击模态框外部关闭
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.classList.add('hidden');
    }
  });
  
  // 编辑治具表单提交
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fixtureId = document.getElementById('editFixtureIdDisplay').value;
    const formData = {
      type: document.getElementById('editFixtureType').value,
      capacity: parseInt(document.getElementById('editFixtureCapacity').value),
      schedule: parseInt(document.getElementById('editFixtureSchedule').value),
      location: document.getElementById('editFixtureLocation').value,
      status: document.getElementById('editFixtureStatus').value,
      description: document.getElementById('editFixtureDescription').value,
      workingHoursPerDay: parseInt(document.getElementById('editWorkingHoursPerDay').value),
      workingDaysPerMonth: parseInt(document.getElementById('editWorkingDaysPerMonth').value)
    };
    
    try {
      const response = await fetch(`/api/fixtures/${fixtureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        editModal.classList.add('hidden');
        loadFixturesList();
      } else {
        console.error('编辑治具失败');
      }
    } catch (error) {
      console.error('编辑治具失败:', error);
    }
  });
  
  // 删除治具模态框
  const deleteModal = document.getElementById('deleteFixtureModal');
  const closeDeleteButton = document.getElementById('closeDeleteModal');
  const cancelDeleteButton = document.getElementById('cancelDeleteFixture');
  const confirmDeleteButton = document.getElementById('confirmDeleteFixture');
  
  // 关闭删除模态框
  closeDeleteButton.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
  });
  
  cancelDeleteButton.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
  });
  
  // 点击模态框外部关闭
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.add('hidden');
    }
  });
  
  // 确认删除治具
  confirmDeleteButton.addEventListener('click', async () => {
    const fixtureId = document.getElementById('deleteFixtureId').value;
    
    try {
      const response = await fetch(`/api/fixtures/${fixtureId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        deleteModal.classList.add('hidden');
        loadFixturesList();
      } else {
        console.error('删除治具失败');
      }
    } catch (error) {
      console.error('删除治具失败:', error);
    }
  });
}

// 初始化筛选功能
function initFilters() {
  const searchInput = document.getElementById('searchFixtures');
  const filterButton = document.getElementById('filterFixturesBtn');
  
  searchInput.addEventListener('input', () => {
    JigState.filters.search = searchInput.value;
    applyFilters();
  });
  
  filterButton.addEventListener('click', () => {
    // 这里可以实现更复杂的筛选逻辑
    applyFilters();
  });
}

// 初始化分页功能
function initPagination() {
  const prevButton = document.querySelector('.pagination .fa-chevron-left').parentNode;
  const nextButton = document.querySelector('.pagination .fa-chevron-right').parentNode;
  
  prevButton.addEventListener('click', () => {
    if (JigState.currentPage > 1) {
      JigState.currentPage--;
      renderFixturesTable();
    }
  });
  
  nextButton.addEventListener('click', () => {
    const { filteredFixtures, currentPage, itemsPerPage } = JigState;
    const totalPages = Math.ceil(filteredFixtures.length / itemsPerPage);
    if (currentPage < totalPages) {
      JigState.currentPage++;
      renderFixturesTable();
    }
  });
}

// 初始化批量操作
function initBatchOperations() {
  const selectAllCheckbox = document.getElementById('selectAllFixtures');
  
  selectAllCheckbox.addEventListener('change', () => {
    JigState.isSelectAll = selectAllCheckbox.checked;
    if (JigState.isSelectAll) {
      JigState.selectedFixtures = JigState.filteredFixtures.map(fixture => fixture.id);
    } else {
      JigState.selectedFixtures = [];
    }
    
    renderFixturesTable();
    updateBatchOperationsStatus();
  });
}

// 初始化导入功能
function initImportFunctionality() {
  const importButton = document.getElementById('importFixturesBtn');
  const importFileInput = document.getElementById('importFile');
  
  importButton.addEventListener('click', () => {
    importFileInput.click();
  });
  
  importFileInput.addEventListener('change', async () => {
    const file = importFileInput.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = JSON.parse(e.target.result);
          const response = await fetch('/api/fixtures/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            loadFixturesList();
          } else {
            console.error('导入治具数据失败');
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('导入治具数据失败:', error);
      }
    }
  });
}

// 初始化导出功能
async function initExportFunctionality() {
  const exportButton = document.getElementById('exportFixturesBtn');
  
  exportButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/fixtures/export');
      if (response.ok) {
        const data = await response.json();
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fixtures.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        console.error('导出治具数据失败');
      }
    } catch (error) {
      console.error('导出治具数据失败:', error);
    }
  });
}

// 应用筛选
function applyFilters() {
  const { status, type, search } = JigState.filters;
  
  JigState.filteredFixtures = JigState.fixtures.filter(fixture => {
    const statusMatch = status === 'all' || fixture.status === status;
    const typeMatch = type === 'all' || fixture.type === type;
    const searchMatch = search === '' || fixture.id.includes(search) || fixture.type.includes(search);
    
    return statusMatch && typeMatch && searchMatch;
  });
  
  JigState.currentPage = 1;
  renderFixturesTable();
}

// 重置筛选条件
function resetFilters() {
  JigState.filters = {
    status: 'all',
    type: 'all',
    search: ''
  };
  
  document.getElementById('searchFixtures').value = '';
  applyFilters();
}

// 更新全选状态
function updateSelectAllStatus() {
  const selectAllCheckbox = document.getElementById('selectAllFixtures');
  const { filteredFixtures, selectedFixtures } = JigState;
  
  JigState.isSelectAll = filteredFixtures.length > 0 && selectedFixtures.length === filteredFixtures.length;
  selectAllCheckbox.checked = JigState.isSelectAll;
}

// 更新批量操作按钮状态
function updateBatchOperationsStatus() {
  const { selectedFixtures } = JigState;
  
  // 这里可以根据选中的治具数量更新批量操作按钮的状态
}

// 查看治具详情
async function viewFixtureDetails(fixtureId) {
  try {
    const response = await fetch(`/api/fixtures/${fixtureId}`);
    if (response.ok) {
      const fixture = await response.json();
      // 这里可以实现查看治具详情的逻辑，例如弹出模态框显示详情
      console.log('查看治具详情:', fixture);
    } else {
      console.error('获取治具详情失败');
    }
  } catch (error) {
    console.error('获取治具详情失败:', error);
  }
}

// 打开编辑模态框
async function openEditModal(fixtureId) {
  try {
    const response = await fetch(`/api/fixtures/${fixtureId}`);
    if (response.ok) {
      const fixture = await response.json();
      const editModal = document.getElementById('editFixtureModal');
      const editForm = document.getElementById('editFixtureForm');
      
      document.getElementById('editFixtureIdDisplay').value = fixture.id;
      document.getElementById('editFixtureType').value = fixture.type;
      document.getElementById('editFixtureCapacity').value = fixture.capacity;
      document.getElementById('editFixtureSchedule').value = fixture.schedule;
      document.getElementById('editFixtureLocation').value = fixture.location;
      document.getElementById('editFixtureStatus').value = fixture.status;
      document.getElementById('editFixtureDescription').value = fixture.description;
      document.getElementById('editWorkingHoursPerDay').value = fixture.workingHoursPerDay;
      document.getElementById('editWorkingDaysPerMonth').value = fixture.workingDaysPerMonth;
      
      editModal.classList.remove('hidden');
    } else {
      console.error('获取治具详情失败');
    }
  } catch (error) {
    console.error('获取治具详情失败:', error);
  }
}

// 打开删除模态框
function openDeleteModal(fixtureId) {
  const deleteModal = document.getElementById('deleteFixtureModal');
  document.getElementById('deleteFixtureId').value = fixtureId;
  deleteModal.classList.remove('hidden');
}

// 更改治具状态
async function changeFixtureStatus(fixtureId, currentStatus) {
  let newStatus = '';
  if (currentStatus === 'normal') {
    newStatus = 'overloaded';
  } else if (currentStatus === 'overloaded') {
    newStatus = 'maintenance';
  } else {
    newStatus = 'normal';
  }
  
  try {
    const response = await fetch(`/api/fixtures/${fixtureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (response.ok) {
      loadFixturesList();
    } else {
      console.error('更改治具状态失败');
    }
  } catch (error) {
    console.error('更改治具状态失败:', error);
  }
}

// 页面加载完成后初始化治具管理功能
window.addEventListener('load', initJigManagement);