// 用户认证相关功能
async function login(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('登录失败:', error);
    return false;
  }
}

function logout() {
  localStorage.removeItem('token');
  // 重定向到登录页面
  window.location.href = 'login.html';
}

// 检查用户是否已登录
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    // 重定向到登录页面
    window.location.href = 'login.html';
  }
}

// 页面加载完成后检查用户是否已登录
window.addEventListener('load', checkAuth);

// 退出登录按钮事件
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}