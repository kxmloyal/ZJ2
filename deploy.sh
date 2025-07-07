#!/bin/bash
set -e  # 遇到错误立即退出

# 配置信息
APP_NAME="fixture-monitoring-system"
APP_DIR="./"
DEPLOY_DIR="/opt/$APP_NAME"
NODE_VERSION="16.x"
PORT=3000
SERVICE_NAME="$APP_NAME.service"

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"  # 无颜色

# 显示欢迎信息
echo -e "${GREEN}===== 开始部署治具产能监控系统 =====${NC}"

# 检查是否为root用户
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${YELLOW}警告：建议使用root用户运行此脚本，以获得足够权限${NC}"
  read -p "是否继续？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}部署已取消${NC}"
    exit 1
  fi
fi

# 更新系统包
echo -e "${YELLOW}更新系统包...${NC}"
apt update -y && apt upgrade -y

# 安装必要依赖
echo -e "${YELLOW}安装必要依赖...${NC}"
apt install -y curl git build-essential

# 安装Node.js
echo -e "${YELLOW}安装Node.js $NODE_VERSION...${NC}"
curl -sL https://deb.nodesource.com/setup_$NODE_VERSION | bash -
apt install -y nodejs

# 验证安装
echo -e "${YELLOW}验证安装...${NC}"
node -v
npm -v
git --version

# 创建部署目录
echo -e "${YELLOW}准备部署目录...${NC}"
mkdir -p $DEPLOY_DIR
chmod 755 $DEPLOY_DIR

# 复制应用文件
echo -e "${YELLOW}复制应用文件...${NC}"
cp -r $APP_DIR/* $DEPLOY_DIR/

# 安装应用依赖
echo -e "${YELLOW}安装应用依赖...${NC}"
cd $DEPLOY_DIR
npm install --production

# 创建系统服务
echo -e "${YELLOW}配置系统服务...${NC}"
cat > /etc/systemd/system/$SERVICE_NAME << EOF
[Unit]
Description=$APP_NAME service
After=network.target

[Service]
User=root
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/node $DEPLOY_DIR/src/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=$PORT

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
echo -e "${YELLOW}启动应用服务...${NC}"
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

# 检查服务状态
echo -e "${YELLOW}检查服务状态...${NC}"
if systemctl is-active --quiet $SERVICE_NAME; then
  echo -e "${GREEN}服务启动成功！${NC}"
else
  echo -e "${RED}服务启动失败，请检查日志：journalctl -u $SERVICE_NAME${NC}"
  exit 1
fi

# 配置防火墙
echo -e "${YELLOW}配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
  ufw allow $PORT/tcp
  ufw reload
fi

# 显示部署结果
echo -e "\n${GREEN}===== 部署完成 =====${NC}"
echo -e "应用名称: $APP_NAME"
echo -e "部署目录: $DEPLOY_DIR"
echo -e "端口: $PORT"
echo -e "服务名称: $SERVICE_NAME"
echo -e "访问地址: http://$(hostname -I | awk '{print $1}'):$PORT"
echo -e "服务状态: systemctl status $SERVICE_NAME"
echo -e "停止服务: systemctl stop $SERVICE_NAME"
echo -e "查看日志: journalctl -u $SERVICE_NAME -f"