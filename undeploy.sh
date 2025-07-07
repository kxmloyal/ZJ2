#!/bin/bash
set -e

# 配置信息
APP_NAME="fixture-monitoring-system"
DEPLOY_DIR="/opt/$APP_NAME"
SERVICE_NAME="$APP_NAME.service"
PORT=3000

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"  # 无颜色

# 显示提示信息
echo -e "${YELLOW}===== 开始解除部署治具产能监控系统 =====${NC}"

# 确认操作
read -p "确定要完全删除 $APP_NAME 吗？这将删除所有相关文件和配置 (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}解除部署已取消${NC}"
  exit 0
fi

# 停止并禁用服务
echo -e "${YELLOW}停止服务...${NC}"
if systemctl is-active --quiet $SERVICE_NAME; then
  systemctl stop $SERVICE_NAME
fi
systemctl disable $SERVICE_NAME || true

# 删除系统服务配置
echo -e "${YELLOW}删除系统服务...${NC}"
if [ -f "/etc/systemd/system/$SERVICE_NAME" ]; then
  rm -f "/etc/systemd/system/$SERVICE_NAME"
  systemctl daemon-reload
fi

# 移除防火墙规则
echo -e "${YELLOW}清理防火墙规则...${NC}"
if command -v ufw &> /dev/null; then
  ufw delete allow $PORT/tcp || true
fi

# 删除部署目录
echo -e "${YELLOW}删除应用文件...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
  rm -rf $DEPLOY_DIR
fi

# 显示结果
echo -e "\n${GREEN}===== 解除部署完成 =====${NC}"
echo -e "已删除以下内容:"
echo -e "1. 应用目录: $DEPLOY_DIR"
echo -e "2. 系统服务: $SERVICE_NAME"
echo -e "3. 防火墙规则: 允许端口 $PORT"