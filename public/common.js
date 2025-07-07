// 获取所有治具列表（扩展版，包含更多字段和数据）
async function getAllFixtures() {
  try {
    const response = await fetch('/api/fixtures');
    if (!response.ok) {
      throw new Error('获取治具数据失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取治具数据失败:', error);
    return [];
  }
}

// 计算治具每小时/天/周/月/年固定产能
function calculateCapacities(fixture) {
  const workingHoursPerDay = fixture.workingHoursPerDay || 8;
  const workingDaysPerMonth = fixture.workingDaysPerMonth || 22;
  const hoursPerWeek = workingHoursPerDay * 5; // 假设每周工作5天
  const hoursPerYear = workingHoursPerDay * workingDaysPerMonth * 12;

  const hourlyCapacity = fixture.capacity / (workingHoursPerDay * workingDaysPerMonth);
  const dailyCapacity = hourlyCapacity * workingHoursPerDay;
  const weeklyCapacity = hourlyCapacity * hoursPerWeek;
  const monthlyCapacity = fixture.capacity;
  const yearlyCapacity = hourlyCapacity * hoursPerYear;

  return {
    hourlyCapacity: hourlyCapacity.toFixed(2),
    dailyCapacity: dailyCapacity.toFixed(2),
    weeklyCapacity: weeklyCapacity.toFixed(2),
    monthlyCapacity: monthlyCapacity.toFixed(2),
    yearlyCapacity: yearlyCapacity.toFixed(2)
  };
}