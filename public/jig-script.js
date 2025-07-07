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
function initJigManagement() {
  // 加载治具列表
  loadFixturesList();
  
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
function loadFixturesList() {
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
  
  DataService.getAllFixtures().then(fixtures => {
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
  }).catch(error => {
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
  });
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
    
    // 检查是否被选中
    const isSelected = JigState.selectedFixtures.includes(fixture.id);
    
    html += `
      <tr class="fade-in hover:bg-gray-50 transition-colors duration-150">
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
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
      id: document.getElementById('fixtureId').value,
      type: document.getElementById('fixtureType').value,
      capacity: parseInt(document.getElementById('fixtureCapacity').value),
      schedule: parseInt(document.getElementById('fixtureSchedule').value),
      location: document.getElementById('fixtureLocation').value,
      status: document.getElementById('fixtureStatus').value,
      description: document.getElementById('fixtureDescription').value
    };
    
    // 模拟添加治具
    addFixture(formData);
    addModal.classList.add('hidden');
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
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fixtureId = document.getElementById('editFixtureId').value;
    const formData = {
      type: document.getElementById('editFixtureType').value,
      capacity: parseInt(document.getElementById('editFixtureCapacity').value),
      schedule: parseInt(document.getElementById('editFixtureSchedule').value),
      location: document.getElementById('editFixtureLocation').value,
      status: document.getElementById('editFixtureStatus').value,
      description: document.getElementById('editFixtureDescription').value
    };
    
    // 模拟更新治具
    updateFixture(fixtureId, formData);
    editModal.classList.add('hidden');
  });
  
  // 删除确认模态框
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const closeDeleteConfirmButton = document.getElementById('closeDeleteConfirmModal');
  const cancelDeleteButton = document.getElementById('cancelDeleteFixture');
  const confirmDeleteButton = document.getElementById('confirmDeleteFixture');
  
  // 关闭删除确认模态框
  closeDeleteConfirmButton.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
  });
  
  cancelDeleteButton.addEventListener('click', () => {
    deleteConfirmModal.classList.add('hidden');
  });
  
  // 确认删除
  confirmDeleteButton.addEventListener('click', () => {
    const fixtureId = JigState.selectedFixtures[0];
    deleteFixture(fixtureId);
    deleteConfirmModal.classList.add('hidden');
  });
}

// 初始化筛选功能
function initFilters() {
  const searchInput = document.getElementById('fixtureSearch');
  const statusFilter = document.getElementById('fixtureFilter');
  const typeFilter = document.getElementById('fixtureTypeFilter');
  
  searchInput.addEventListener('input', () => {
    JigState.filters.search = searchInput.value;
    applyFilters();
  });
  
  statusFilter.addEventListener('change', () => {
    JigState.filters.status = statusFilter.value;
    applyFilters();
  });
  
  typeFilter.addEventListener('change', () => {
    JigState.filters.type = typeFilter.value;
    applyFilters();
  });
}

// 初始化分页功能
function initPagination() {
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  
  prevPageBtn.addEventListener('click', () => {
    if (JigState.currentPage > 1) {
      JigState.currentPage--;
      renderFixturesTable();
    }
  });
  
  nextPageBtn.addEventListener('click', () => {
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
  const batchOperationsBtn = document.getElementById('batchOperationsBtn');
  const batchOperationsMenu = document.getElementById('batchOperationsMenu');
  const batchDeleteBtn = document.getElementById('batchDeleteBtn');
  const batchExportBtn = document.getElementById('batchExportBtn');
  const batchMaintenanceBtn = document.getElementById('batchMaintenanceBtn');
  
  batchOperationsBtn.addEventListener('click', () => {
    batchOperationsMenu.classList.toggle('hidden');
  });
  
  batchDeleteBtn.addEventListener('click', () => {
    if (JigState.selectedFixtures.length > 0) {
      openDeleteConfirmModal();
    }
  });
  
  batchExportBtn.addEventListener('click', () => {
    if (JigState.selectedFixtures.length > 0) {
      const selectedFixtures = JigState.fixtures.filter(fixture => JigState.selectedFixtures.includes(fixture.id));
      exportFixtures(selectedFixtures);
    }
  });
  
  batchMaintenanceBtn.addEventListener('click', () => {
    if (JigState.selectedFixtures.length > 0) {
      JigState.selectedFixtures.forEach(fixtureId => {
        changeFixtureStatus(fixtureId, 'maintenance');
      });
      showNotification('操作成功', '选中的治具已标记为维护中');
    }
  });
  
  document.addEventListener('click', (event) => {
    if (!batchOperationsBtn.contains(event.target) && !batchOperationsMenu.contains(event.target)) {
      batchOperationsMenu.classList.add('hidden');
    }
  });
}

// 初始化导入功能
function initImportFunctionality() {
  const importFileInput = document.getElementById('importFile');
  
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          importFixtures(data);
        } catch (error) {
          showNotification('导入失败', '文件格式不正确，请上传有效的JSON文件');
        }
      };
      reader.readAsText(file);
    }
  });
}

// 初始化导出功能
function initExportFunctionality() {
  const exportFixturesBtn = document.getElementById('exportFixturesBtn');
  
  exportFixturesBtn.addEventListener('click', () => {
    exportFixtures(JigState.fixtures);
  });
}

// 应用筛选条件
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
  updatePaginationButtons();
}

// 更新类型筛选下拉框
function populateTypeFilter() {
  const typeFilter = document.getElementById('fixtureTypeFilter');
  const types = [];
  
  JigState.fixtures.forEach(fixture => {
    if (!types.includes(fixture.type)) {
      types.push(fixture.type);
    }
  });
  
  types.sort().forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

// 更新全选状态
function updateSelectAllStatus() {
  const selectAllCheckbox = document.getElementById('selectAllFixtures');
  const fixtureCheckboxes = document.querySelectorAll('.fixture-checkbox');
  
  JigState.isSelectAll = fixtureCheckboxes.length > 0 && Array.from(fixtureCheckboxes).every(checkbox => checkbox.checked);
  selectAllCheckbox.checked = JigState.isSelectAll;
  
  // 更新批量操作按钮状态
  updateBatchOperationsStatus();
}

// 更新批量操作按钮状态
function updateBatchOperationsStatus() {
  const batchOperationsBtn = document.getElementById('batchOperationsBtn');
  const batchDeleteBtn = document.getElementById('batchDeleteBtn');
  const batchExportBtn = document.getElementById('batchExportBtn');
  const batchMaintenanceBtn = document.getElementById('batchMaintenanceBtn');
  
  if (JigState.selectedFixtures.length > 0) {
    batchOperationsBtn.disabled = false;
    batchDeleteBtn.disabled = false;
    batchExportBtn.disabled = false;
    batchMaintenanceBtn.disabled = false;
  } else {
    batchOperationsBtn.disabled = true;
    batchDeleteBtn.disabled = true;
    batchExportBtn.disabled = true;
    batchMaintenanceBtn.disabled = true;
  }
}

// 查看治具详情
function viewFixtureDetails(fixtureId) {
  const fixture = JigState.fixtures.find(f => f.id === fixtureId);
  if (fixture) {
    // 这里可以实现查看详情的具体逻辑，例如弹出模态框显示详情
    console.log('查看治具详情:', fixture);
  }
}

// 打开编辑模态框
function openEditModal(fixtureId) {
  const fixture = JigState.fixtures.find(f => f.id === fixtureId);
  if (fixture) {
    const editModal = document.getElementById('editFixtureModal');
    const editFixtureId = document.getElementById('editFixtureId');
    const editFixtureIdDisplay = document.getElementById('editFixtureIdDisplay');
    const editFixtureType = document.getElementById('editFixtureType');
    const editFixtureCapacity = document.getElementById('editFixtureCapacity');
    const editFixtureSchedule = document.getElementById('editFixtureSchedule');
    const editFixtureLocation = document.getElementById('editFixtureLocation');
    const editFixtureStatus = document.getElementById('editFixtureStatus');
    const editFixtureDescription = document.getElementById('editFixtureDescription');
    
    editFixtureId.value = fixture.id;
    editFixtureIdDisplay.value = fixture.id;
    editFixtureType.value = fixture.type;
    editFixtureCapacity.value = fixture.capacity;
    editFixtureSchedule.value = fixture.schedule;
    editFixtureLocation.value = fixture.location;
    editFixtureStatus.value = fixture.status;
    editFixtureDescription.value = fixture.description;
    
    editModal.classList.remove('hidden');
  }
}

// 打开删除模态框
function openDeleteModal(fixtureId) {
  JigState.selectedFixtures = [fixtureId];
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  deleteConfirmModal.classList.remove('hidden');
}

// 打开删除确认模态框
function openDeleteConfirmModal() {
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  deleteConfirmModal.classList.remove('hidden');
}

// 更改治具状态
function changeFixtureStatus(fixtureId, currentStatus) {
  let newStatus = '';
  if (currentStatus === 'normal') {
    newStatus = 'maintenance';
  } else if (currentStatus === 'maintenance') {
    newStatus = 'normal';
  }
  
  DataService.updateFixture(fixtureId, { status: newStatus }).then(() => {
    loadFixturesList();
    showNotification('操作成功', '治具状态已更新');
  }).catch(error => {
    showNotification('操作失败', '更新治具状态时出现错误');
    console.error('更新治具状态失败:', error);
  });
}

// 添加治具
function addFixture(data) {
  DataService.addFixture(data).then(() => {
    loadFixturesList();
    showNotification('操作成功', '治具已成功添加');
  }).catch(error => {
    showNotification('操作失败', '添加治具时出现错误');
    console.error('添加治具失败:', error);
  });
}

// 更新治具
function updateFixture(id, data) {
  DataService.updateFixture(id, data).then(() => {
    loadFixturesList();
    showNotification('操作成功', '治具信息已更新');
  }).catch(error => {
    showNotification('操作失败', '更新治具信息时出现错误');
    console.error('更新治具信息失败:', error);
  });
}

// 删除治具
function deleteFixture(id) {
  DataService.deleteFixture(id).then(() => {
    JigState.selectedFixtures = [];
    loadFixturesList();
    showNotification('操作成功', '治具已成功删除');
  }).catch(error => {
    showNotification('操作失败', '删除治具时出现错误');
    console.error('删除治具失败:', error);
  });
}

// 导入治具
function importFixtures(data) {
  DataService.importFixtures(data, 'merge').then(result => {
    loadFixturesList();
    showNotification('导入成功', `导入了 ${result.imported} 条记录，更新了 ${result.updated} 条记录，跳过了 ${result.skipped} 条记录`);
  }).catch(error => {
    showNotification('导入失败', '导入治具时出现错误');
    console.error('导入治具失败:', error);
  });
}

// 导出治具
function exportFixtures(fixtures) {
  const jsonData = JSON.stringify(fixtures, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fixtures.json';
  a.click();
  
  URL.revokeObjectURL(url);
}

// 显示通知提示
function showNotification(title, message) {
  const notification = document.getElementById('notification');
  const notificationTitle = document.getElementById('notificationTitle');
  const notificationMessage = document.getElementById('notificationMessage');
  
  notificationTitle.textContent = title;
  notificationMessage.textContent = message;
  
  notification.classList.remove('hidden');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// 重置筛选条件
function resetFilters() {
  JigState.filters = {
    status: 'all',