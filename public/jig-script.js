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
    
    // 获取表单数据
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
  const deleteModal = document.getElementById('deleteConfirmModal');
  const closeDeleteButton = document.getElementById('cancelDelete');
  const confirmDeleteButton = document.getElementById('confirmDelete');
  
  // 关闭删除模态框
  closeDeleteButton.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
  });
  
  // 点击模态框外部关闭
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.add('hidden');
    }
  });
  
  // 确认删除
  confirmDeleteButton.addEventListener('click', () => {
    const fixtureId = document.getElementById('deleteFixtureId').value;
    deleteFixture(fixtureId);
    deleteModal.classList.add('hidden');
  });
}

// 打开编辑模态框
function openEditModal(fixtureId) {
  const fixture = JigState.fixtures.find(f => f.id === fixtureId);
  if (!fixture) return;
  
  // 填充表单数据
  document.getElementById('editFixtureId').value = fixture.id;
  document.getElementById('editFixtureIdDisplay').value = fixture.id;
  document.getElementById('editFixtureType').value = fixture.type;
  document.getElementById('editFixtureCapacity').value = fixture.capacity;
  document.getElementById('editFixtureSchedule').value = fixture.schedule;
  document.getElementById('editFixtureLocation').value = fixture.location || '';
  document.getElementById('editFixtureStatus').value = fixture.status;
  document.getElementById('editFixtureDescription').value = fixture.description || '';
  
  // 显示模态框
  document.getElementById('editFixtureModal').classList.remove('hidden');
}

// 打开删除模态框
function openDeleteModal(fixtureId) {
  const fixture = JigState.fixtures.find(f => f.id === fixtureId);
  if (!fixture) return;
  
  // 设置要删除的ID
  document.getElementById('deleteFixtureId').value = fixtureId;
  
  // 更新确认消息
  document.getElementById('deleteConfirmMessage').textContent = 
    `您确定要删除治具 ${fixture.id}（${fixture.type}）吗？此操作无法撤销。`;
  
  // 显示模态框
  document.getElementById('deleteConfirmModal').classList.remove('hidden');
}

// 初始化筛选功能
function initFilters() {
  // 搜索框筛选
  const searchInput = document.getElementById('fixtureSearch');
  searchInput.addEventListener('input', function() {
    JigState.filters.search = this.value.toLowerCase();
    JigState.currentPage = 1; // 重置到第一页
    applyFilters();
  });
  
  // 状态筛选
  const statusFilter = document.getElementById('fixtureFilter');
  statusFilter.addEventListener('change', function() {
    JigState.filters.status = this.value;
    JigState.currentPage = 1; // 重置到第一页
    applyFilters();
  });
  
  // 类型筛选
  const typeFilter = document.getElementById('fixtureTypeFilter');
  typeFilter.addEventListener('change', function() {
    JigState.filters.type = this.value;
    JigState.currentPage = 1; // 重置到第一页
    applyFilters();
  });
  
  // 全选复选框
  const selectAllCheckbox = document.getElementById('selectAllFixtures');
  selectAllCheckbox.addEventListener('change', function() {
    if (this.checked) {
      // 全选当前页的治具
      JigState.selectedFixtures = JigState.filteredFixtures.map(fixture => fixture.id);
    } else {
      // 取消全选
      JigState.selectedFixtures = [];
    }
    
    // 更新复选框状态
    updateCheckboxStates();
    // 更新批量操作按钮状态
    updateBatchOperationsStatus();
  });
}

// 填充类型筛选下拉框
function populateTypeFilter() {
  const typeFilter = document.getElementById('fixtureTypeFilter');
  const types = [...new Set(JigState.fixtures.map(fixture => fixture.type))];
  
  // 保存当前选中值
  const currentValue = typeFilter.value;
  
  // 清除现有选项（保留"全部类型"）
  while (typeFilter.options.length > 1) {
    typeFilter.remove(1);
  }
  
  // 添加类型选项
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
  
  // 恢复选中值
  if (types.includes(currentValue)) {
    typeFilter.value = currentValue;
  } else {
    typeFilter.value = 'all';
  }
}

// 应用筛选条件
function applyFilters() {
  const { fixtures, filters } = JigState;
  
  // 应用筛选
  let filtered = [...fixtures];
  
  // 状态筛选
  if (filters.status !== 'all') {
    filtered = filtered.filter(fixture => fixture.status === filters.status);
  }
  
  // 类型筛选
  if (filters.type !== 'all') {
    filtered = filtered.filter(fixture => fixture.type === filters.type);
  }
  
  // 搜索筛选
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(fixture => 
      fixture.id.toLowerCase().includes(searchTerm) || 
      fixture.type.toLowerCase().includes(searchTerm) ||
      (fixture.location && fixture.location.toLowerCase().includes(searchTerm))
    );
  }
  
  // 更新筛选后的列表
  JigState.filteredFixtures = filtered;
  
  // 重新渲染表格
  renderFixturesTable();
  // 更新分页控件
  updatePagination();
}

// 初始化分页功能
function initPagination() {
  // 上一页按钮
  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (JigState.currentPage > 1) {
      JigState.currentPage--;
      renderFixturesTable();
      updatePagination();
    }
  });
  
  // 下一页按钮
  document.getElementById('nextPageBtn').addEventListener('click', () => {
    const totalPages = getTotalPages();
    if (JigState.currentPage < totalPages) {
      JigState.currentPage++;
      renderFixturesTable();
      updatePagination();
    }
  });
}

// 更新分页控件
function updatePagination() {
  const totalPages = getTotalPages();
  const paginationContainer = document.getElementById('paginationNumbers');
  
  // 清空现有页码
  paginationContainer.innerHTML = '';
  
  // 计算显示的页码范围
  let startPage = Math.max(1, JigState.currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // 调整范围，确保显示5个页码
  if (endPage - startPage < 4 && totalPages >= 5) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // 添加页码按钮
  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement('button');
    button.className = `relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium pagination-number ${i === JigState.currentPage ? 'z-10 bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-50'}`;
    button.textContent = i;
    button.setAttribute('data-page', i);
    
    button.addEventListener('click', () => {
      JigState.currentPage = i;
      renderFixturesTable();
      updatePagination();
    });
    
    paginationContainer.appendChild(button);
  }
  
  // 更新按钮状态
  document.getElementById('prevPageBtn').classList.toggle('opacity-50', JigState.currentPage === 1);
  document.getElementById('nextPageBtn').classList.toggle('opacity-50', JigState.currentPage === totalPages);
}

// 获取总页数
function getTotalPages() {
  return Math.ceil(JigState.filteredFixtures.length / JigState.itemsPerPage);
}

// 初始化批量操作
function initBatchOperations() {
  const batchButton = document.getElementById('batchOperationsBtn');
  const batchMenu = document.getElementById('batchOperationsMenu');
  
  // 切换批量操作菜单
  batchButton.addEventListener('click', (e) => {
    e.stopPropagation();
    batchMenu.classList.toggle('hidden');
  });
  
  // 点击其他地方关闭菜单
  document.addEventListener('click', () => {
    batchMenu.classList.add('hidden');
  });
  
  // 批量删除
  document.getElementById('batchDeleteBtn').addEventListener('click', () => {
    batchMenu.classList.add('hidden');
    
    if (JigState.selectedFixtures.length === 0) return;
    
    // 更新确认消息
    document.getElementById('deleteConfirmMessage').textContent = 
      `您确定要删除选中的 ${JigState.selectedFixtures.length} 个治具吗？此操作无法撤销。`;
    
    // 设置要删除的ID（用逗号分隔表示批量删除）
    document.getElementById('deleteFixtureId').value = JigState.selectedFixtures.join(',');
    
    // 显示模态框
    document.getElementById('deleteConfirmModal').classList.remove('hidden');
  });
  
  // 批量导出
  document.getElementById('batchExportBtn').addEventListener('click', () => {
    batchMenu.classList.add('hidden');
    exportSelectedFixtures();
  });
  
  // 批量标记为维护中
  document.getElementById('batchMaintenanceBtn').addEventListener('click', () => {
    batchMenu.classList.add('hidden');
    batchSetMaintenanceStatus();
  });
  
  // 全选按钮状态更新
  updateSelectAllStatus();
  // 批量操作按钮状态更新
  updateBatchOperationsStatus();
}

// 更新全选按钮状态
function updateSelectAllStatus() {
  const visibleCount = JigState.filteredFixtures.length;
  const selectedCount = JigState.selectedFixtures.length;
  
  const selectAllCheckbox = document.getElementById('selectAllFixtures');
  selectAllCheckbox.checked = visibleCount > 0 && selectedCount === visibleCount;
  selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < visibleCount;
}

// 更新复选框状态
function updateCheckboxStates() {
  document.querySelectorAll('.fixture-checkbox').forEach(checkbox => {
    const fixtureId = checkbox.getAttribute('data-id');
    checkbox.checked = JigState.selectedFixtures.includes(fixtureId);
  });
}

// 更新批量操作按钮状态
function updateBatchOperationsStatus() {
  const hasSelection = JigState.selectedFixtures.length > 0;
  const batchButtons = document.querySelectorAll('#batchOperationsMenu button');
  
  batchButtons.forEach(button => {
    if (hasSelection) {
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.removeAttribute('disabled');
    } else {
      button.classList.add('opacity-50', 'cursor-not-allowed');
      button.setAttribute('disabled', 'disabled');
    }
  });
}

// 初始化导入功能
function initImportFunctionality() {
  const importFileInput = document.getElementById('importFile');
  const importModal = document.getElementById('importConfirmModal');
  const importFileInfo = document.getElementById('importFileInfo');
  const importFileName = document.getElementById('importFileName');
  const importFileSize = document.getElementById('importFileSize');
  const removeImportFileBtn = document.getElementById('removeImportFile');
  const confirmImportBtn = document.getElementById('confirmImport');
  const closeImportBtn = document.getElementById('closeImportModal');
  const cancelImportBtn = document.getElementById('cancelImport');
  
  // 打开导入模态框
  importFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        // 显示文件信息
        importFileName.textContent = file.name;
        importFileSize.textContent = formatFileSize(file.size);
        importFileInfo.classList.remove('hidden');
        
        // 启用导入按钮
        confirmImportBtn.removeAttribute('disabled');
        
        // 显示模态框
        importModal.classList.remove('hidden');
      } else {
        showNotification('错误', '请上传JSON格式的文件', 'error');
        importFileInput.value = '';
      }
    }
  });
  
  // 移除选中文件
  removeImportFileBtn.addEventListener('click', () => {
    importFileInput.value = '';
    importFileInfo.classList.add('hidden');
    confirmImportBtn.setAttribute('disabled', 'disabled');
  });
  
  // 关闭导入模态框
  closeImportBtn.addEventListener('click', () => {
    importModal.classList.add('hidden');
    importFileInput.value = '';
    importFileInfo.classList.add('hidden');
    confirmImportBtn.setAttribute('disabled', 'disabled');
  });
  
  cancelImportBtn.addEventListener('click', () => {
    importModal.classList.add('hidden');
    importFileInput.value = '';
    importFileInfo.classList.add('hidden');
    confirmImportBtn.setAttribute('disabled', 'disabled');
  });
  
  // 点击模态框外部关闭
  importModal.addEventListener('click', (e) => {
    if (e.target === importModal) {
      importModal.classList.add('hidden');
      importFileInput.value = '';
      importFileInfo.classList.add('hidden');
      confirmImportBtn.setAttribute('disabled', 'disabled');
    }
  });
  
  // 确认导入
  confirmImportBtn.addEventListener('click', () => {
    const file = importFileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedData)) {
          throw new Error('导入的数据必须是数组格式');
        }
        
        // 获取导入模式
        const importMode = document.querySelector('input[name="importMode"]:checked').value;
        
        // 处理导入数据
        processImportedData(importedData, importMode);
        
        // 关闭模态框并重置
        importModal.classList.add('hidden');
        importFileInput.value = '';
        importFileInfo.classList.add('hidden');
        confirmImportBtn.setAttribute('disabled', 'disabled');
        
        // 显示成功通知
        showNotification('导入成功', `成功导入 ${importedData.length} 个治具数据`, 'success');
      } catch (error) {
        showNotification('导入失败', `解析文件时出错: ${error.message}`, 'error');
      }
    };
    reader.readAsText(file);
  });
}

// 处理导入的数据
function processImportedData(importedData, mode) {
  // 过滤有效的治具数据
  const validData = importedData.filter(item => 
    item.id && item.type && typeof item.capacity === 'number' && typeof item.schedule === 'number'
  );
  
  // 根据导入模式处理数据
  switch (mode) {
    case 'replace':
      // 替换现有数据
      JigState.fixtures = validData;
      break;
      
    case 'merge':
      // 合并数据（存在则更新，不存在则添加）
      validData.forEach(newItem => {
        const existingIndex = JigState.fixtures.findIndex(item => item.id === newItem.id);
        if (existingIndex >= 0) {
          // 更新现有项
          JigState.fixtures[existingIndex] = {
            ...JigState.fixtures[existingIndex],
            ...newItem,
            updatedAt: new Date().toISOString()
          };
        } else {
          // 添加新项
          JigState.fixtures.push({
            ...newItem,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
      break;
      
    case 'ignore':
      // 忽略已有数据（只添加新数据）
      validData.forEach(newItem => {
        const exists = JigState.fixtures.some(item => item.id === newItem.id);
        if (!exists) {
          JigState.fixtures.push({
            ...newItem,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
      break;
  }
  
  // 重置状态并重新加载
  JigState.selectedFixtures = [];
  JigState.currentPage = 1;
  applyFilters();
  populateTypeFilter();
  renderFixturesTable();
  updatePagination();
}

// 初始化导出功能
function initExportFunctionality() {
  const exportButton = document.getElementById('exportFixturesBtn');
  exportButton.addEventListener('click', () => {
    exportAllFixtures();
  });
}

// 导出所有治具
function exportAllFixtures() {
  // 准备导出数据（只包含必要字段）
  const exportData = JigState.fixtures.map(fixture => ({
    id: fixture.id,
    type: fixture.type,
    capacity: fixture.capacity,
    schedule: fixture.schedule,
    location: fixture.location || '',
    status: fixture.status,
    description: fixture.description || ''
  }));
  
  downloadJsonFile(exportData, `fixtures-export-${new Date().toISOString().slice(0,10)}.json`);
}

// 导出选中的治具
function exportSelectedFixtures() {
  if (JigState.selectedFixtures.length === 0) return;
  
  // 准备导出数据
  const exportData = JigState.fixtures
    .filter(fixture => JigState.selectedFixtures.includes(fixture.id))
    .map(fixture => ({
      id: fixture.id,
      type: fixture.type,
      capacity: fixture.capacity,
      schedule: fixture.schedule,
      location: fixture.location || '',
      status: fixture.status,
      description: fixture.description || ''
    }));
  
  downloadJsonFile(exportData, `fixtures-selected-${new Date().toISOString().slice(0,10)}.json`);
}

// 下载JSON文件
function downloadJsonFile(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  showNotification('导出成功', `已导出 ${data.length} 个治具数据`, 'success');
}

// 显示通知
function showNotification(title, message, type = 'success') {
  const notification = document.getElementById('notification');
  const notificationTitle = document.getElementById('notificationTitle');
  const notificationMessage = document.getElementById('notificationMessage');
  const notificationIcon = document.getElementById('notificationIcon');
  
  // 设置通知内容
  notificationTitle.textContent = title;
  notificationMessage.textContent = message;
  
  // 设置图标
  notificationIcon.className = '';
  if (type === 'success') {
    notificationIcon.className = 'flex-shrink-0 text-success';
    notificationIcon.innerHTML = '<i class="fa fa-check-circle text-xl"></i>';
  } else if (type === 'error') {
    notificationIcon.className = 'flex-shrink-0 text-danger';
    notificationIcon.innerHTML = '<i class="fa fa-exclamation-circle text-xl"></i>';
  } else if (type === 'warning') {
    notificationIcon.className = 'flex-shrink-0 text-warning';
    notificationIcon.innerHTML = '<i class="fa fa-exclamation-triangle text-xl"></i>';
  } else if (type === 'info') {
    notificationIcon.className = 'flex-shrink-0 text-primary';
    notificationIcon.innerHTML = '<i class="fa fa-info-circle text-xl"></i>';
  }
  
  // 显示通知
  notification.classList.remove('hidden');
  notification.classList.add('fade-in');
  
  // 3秒后自动关闭
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
  
  // 手动关闭按钮
  document.getElementById('closeNotification').addEventListener('click', () => {
    notification.classList.add('hidden');
  });
}

// 添加治具
function addFixture(data) {
  // 检查ID是否已存在
  const idExists = JigState.fixtures.some(fixture => fixture.id === data.id);
  if (idExists) {
    showNotification('添加失败', `治具编号 ${data.id} 已存在`, 'error');
    return;
  }
  
  // 添加新治具
  const newFixture = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  JigState.fixtures.push(newFixture);
  
  // 刷新列表
  applyFilters();
  populateTypeFilter();
  renderFixturesTable();
  updatePagination();
  
  showNotification('添加成功', `已成功添加治具 ${data.id}`, 'success');
}

// 更新治具
function updateFixture(id, data) {
  const index = JigState.fixtures.findIndex(fixture => fixture.id === id);
  if (index === -1) {
    showNotification('更新失败', '未找到指定治具', 'error');
    return;
  }
  
  // 更新治具数据
  JigState.fixtures[index] = {
    ...JigState.fixtures[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  // 刷新列表
  applyFilters();
  populateTypeFilter();
  renderFixturesTable();
  
  showNotification('更新成功', `已成功更新治具 ${id}`, 'success');
}

// 删除治具
function deleteFixture(id) {
  // 检查是否是批量删除
  const isBatch = id.includes(',');
  
  if (isBatch) {
    const idsToDelete = id.split(',');
    JigState.fixtures = JigState.fixtures.filter(fixture => !idsToDelete.includes(fixture.id));
    JigState.selectedFixtures = [];
    showNotification('删除成功', `已成功删除 ${idsToDelete.length} 个治具`, 'success');
  } else {
    JigState.fixtures = JigState.fixtures.filter(fixture => fixture.id !== id);
    showNotification('删除成功', `已成功删除治具 ${id}`, 'success');
  }
  
  // 刷新列表
  applyFilters();
  populateTypeFilter();
  renderFixturesTable();
  updatePagination();
  updateSelectAllStatus();
  updateBatchOperationsStatus();
}

// 改变治具状态
function changeFixtureStatus(fixtureId, currentStatus) {
  const fixture = JigState.fixtures.find(f => f.id === fixtureId);
  if (!fixture) return;
  
  // 确定新状态（循环切换）
  let newStatus;
  if (currentStatus === 'normal') {
    newStatus = 'overloaded';
  } else if (currentStatus === 'overloaded') {
    newStatus = 'maintenance';
  } else {
    newStatus = 'normal';
  }
  
  // 更新状态文本映射
  const statusTextMap = {
    'normal': '正常',
    'overloaded': '超载',
    'maintenance': '维护中'
  };
  
  if (confirm(`确定要将治具 ${fixture.id} 的状态从 ${statusTextMap[currentStatus]} 改为 ${statusTextMap[newStatus]} 吗？`)) {
    // 更新状态
    fixture.status = newStatus;
    fixture.updatedAt = new Date().toISOString();
    
    // 刷新列表
    applyFilters();
    renderFixturesTable();
    
    showNotification('状态更新', `治具 ${fixture.id} 状态已更新为 ${statusTextMap[newStatus]}`, 'success');
  }
}

// 批量设置为维护中状态
function batchSetMaintenanceStatus() {
  if (JigState.selectedFixtures.length === 0) return;
  
  if (confirm(`确定要将选中的 ${JigState.selectedFixtures.length} 个治具标记为维护中吗？`)) {
    JigState.fixtures.forEach(fixture => {
      if (JigState.selectedFixtures.includes(fixture.id)) {
        fixture.status = 'maintenance';
        fixture.updatedAt = new Date().toISOString();
      }
    });
    
    // 清空选择
    JigState.selectedFixtures = [];
    updateCheckboxStates();
    updateSelectAllStatus();
    updateBatchOperationsStatus();
    
    // 刷新列表
    applyFilters();
    renderFixturesTable();
    
    showNotification('状态更新', `已将 ${JigState.selectedFixtures.length} 个治具标记为维护中`, 'success');
  }
}

// 查看治具详情
function viewFixtureDetails(id) {
  const fixture = JigState.fixtures.find(f => f.id === id);
  if (!fixture) return;
  
  // 在实际应用中，这里可以打开详情模态框或跳转到详情页
  alert(`治具详情：\n\nID: ${fixture.id}\n类型: ${fixture.type}\n产能: ${fixture.capacity}\n排程: ${fixture.schedule}\n位置: ${fixture.location || '未设置'}\n状态: ${getStatusText(fixture.status)}\n描述: ${fixture.description || '无'}`);
}

// 重置筛选条件
function resetFilters() {
  document.getElementById('fixtureSearch').value = '';
  document.getElementById('fixtureFilter').value = 'all';
  document.getElementById('fixtureTypeFilter').value = 'all';
  
  JigState.filters = {
    status: 'all',
    type: 'all',
    search: ''
  };
  
  JigState.currentPage = 1;
  applyFilters();
}

// 更新批量操作按钮状态
function updateBatchOperationsStatus() {
  const hasSelection = JigState.selectedFixtures.length > 0;
  const batchButtons = document.querySelectorAll('#batchOperationsMenu button');
  
  batchButtons.forEach(button => {
    if (hasSelection) {
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.removeAttribute('disabled');
    } else {
      button.classList.add('opacity-50', 'cursor-not-allowed');
      button.setAttribute('disabled', 'disabled');
    }
  });
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'normal': '正常',
    'overloaded': '超载',
    'maintenance': '维护中'
  };
  return statusMap[status] || status;
}