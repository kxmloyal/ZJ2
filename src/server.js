const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const config = require('../config/default.json');
const routes = require('./routes');

// 初始化Express应用
const app = express();
const PORT = config.server.port || 3000;

// 中间件配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 日志配置
app.use(morgan('dev'));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.use('/api', routes);

// 根路由返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`当前环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;