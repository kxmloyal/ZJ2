const NodeCache = require('node-cache');

// 创建缓存实例，默认TTL为0（永不过期）
const cache = new NodeCache({
  stdTTL: 0,
  checkperiod: 60, // 每分钟检查一次过期键
  useClones: false // 不克隆数据，提高性能
});

// 缓存工具函数
module.exports = {
  // 获取缓存实例
  getInstance: () => cache,
  
  // 获取缓存
  get: (key) => cache.get(key),
  
  // 设置缓存
  set: (key, value, ttl = 0) => cache.set(key, value, ttl),
  
  // 删除缓存
  del: (key) => cache.del(key),
  
  // 清除所有缓存
  flush: () => cache.flushAll(),
  
  // 获取所有缓存键
  keys: () => cache.keys()
};