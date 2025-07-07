#!/bin/bash
set -e

# 配置信息
APP_NAME="治具产能监控系统"
DEPLOY_DIR="/www/wwwroot/fixture-monitoring"
PM2_APP_NAME="fixture-monitoring"
PORT=3000
LOG_FILE="/var/log/${APP_NAME// /_}_undeploy.log"

# 颜色定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"  # 无颜色

# 日志函数
log() {
  local level=$1
  local message=$2
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  
  # 输出到控制台
  case $level in
    "INFO") echo -e "${GREEN}[INFO]${NC} $message" ;;
    "WARN") echo -e "${YELLOW}[WARN]${NC} $message" ;;
    "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
    *) echo -e "[${level}] $message" ;;
  esac
  
  # 记录到日志文件
  echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# 初始化日志文件
> "$LOG_FILE"
log "INFO" "开始解除部署 $APP_NAME (PM2版本)"

# 显示确认信息
echo -e "${RED}=====================================${NC}"
echo -e "${RED}     解除部署 $APP_NAME 确认      ${NC}"
echo -e "${RED}=====================================${NC}"
echo
echo -e "${YELLOW}此操作将完全删除以下内容：${NC}"
echo -e "  1. 应用目录: $DEPLOY_DIR"
echo -e "  2. PM2应用: $PM2_APP_NAME"
echo -e "  3. 防火墙规则: 允许端口 $PORT"
echo
read -p "确定要继续吗？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log "INFO" "解除部署已取消"
  exit 0
fi

# 步骤1：停止PM2应用
echo -ne "${YELLOW}正在停止PM2应用...${NC}"
if pm2 status $PM2_APP_NAME | grep -q "online"; then
  pm2 stop $PM2_APP_NAME
  pm2 delete $PM2_APP_NAME
  pm2 save
  log "INFO" "PM2应用已停止并删除"
  echo -e "\r${GREEN}PM2应用已成功停止并删除${NC}"
else
  log "WARN" "PM2应用未运行或不存在"
  echo -e "\r${YELLOW}PM2应用未运行，跳过停止步骤${NC}"
fi

# 步骤2：清理防火墙规则
echo -ne "${YELLOW}正在清理防火墙规则...${NC}"
if command -v ufw &> /dev/null; then
  ufw delete allow $PORT/tcp &> /dev/null || true
elif command -v firewall-cmd &> /dev/null; then
  firewall-cmd --zone=public --remove-port=$PORT/tcp --permanent &> /dev/null || true
  firewall-cmd --reload &> /dev/null || true
fi
log "INFO" "防火墙规则已清理"
echo -e "\r${GREEN}防火墙规则已清理${NC}"

# 步骤3：删除应用目录
echo -ne "${YELLOW}正在删除应用文件...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
  rm -rf $DEPLOY_DIR
  log "INFO" "应用目录已删除"
  echo -e "\r${GREEN}应用文件已成功删除${NC}"
else
  log "WARN" "应用目录不存在"
  echo -e "\r${YELLOW}应用目录不存在，跳过删除步骤${NC}"
fi

# 完成
echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}       $APP_NAME 已完全移除       ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "已删除以下内容："
echo -e "  1. 应用目录: $DEPLOY_DIR"
echo -e "  2. PM2应用: $PM2_APP_NAME"
echo -e "  3. 防火墙规则: 允许端口 $PORT"
echo -e "\n解除部署日志已保存到: $LOG_FILE"
log "INFO" "解除部署完成"