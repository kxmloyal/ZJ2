#!/bin/bash
set -e

# 配置信息
APP_NAME="治具产能监控系统"
APP_DIR="./"
DEPLOY_DIR="/www/wwwroot/fixture-monitoring"
NODE_VERSION="16"
PORT=3000
PID_FILE="/var/run/fixture-monitoring.pid"
LOG_FILE="/var/log/${APP_NAME// /_}_deploy.log"
APP_LOG_FILE="$DEPLOY_DIR/app.log"

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

# 进度显示函数
show_progress() {
  local current=$1
  local total=$2
  local message=$3
  local width=50
  
  # 计算进度条长度
  local progress=$((current * width / total))
  local bar=$(printf "%-${progress}s" "#")
  bar=${bar// /#}
  local percent=$((current * 100 / total))
  
  # 输出进度条
  echo -ne "${YELLOW}[${bar}%${width-$progress}s] ${percent}% ${message}${NC}\r"
}

# 检查应用状态
check_app_status() {
  if [ -f "$PID_FILE" ] && ps -p $(cat $PID_FILE) > /dev/null; then
    return 0  # 应用正在运行
  else
    return 1  # 应用未运行
  fi
}

# 停止应用
stop_app() {
  if check_app_status; then
    log "INFO" "停止现有应用进程..."
    kill $(cat $PID_FILE)
    
    # 等待进程退出
    for i in {1..10}; do
      if ! check_app_status; then
        log "INFO" "应用已停止"
        rm -f $PID_FILE
        return 0
      fi
      sleep 1
    done
    
    # 强制终止
    log "WARN" "应用未正常停止，尝试强制终止..."
    kill -9 $(cat $PID_FILE)
    rm -f $PID_FILE
    
    if ! check_app_status; then
      log "INFO" "应用已强制终止"
      return 0
    else
      log "ERROR" "无法停止应用"
      return 1
    fi
  else
    log "INFO" "应用未运行"
    return 0
  fi
}

# 执行命令并记录日志
execute_command() {
  local command=$1
  local message=$2
  log "INFO" "$message: $command"
  if ! eval "$command"; then
    log "ERROR" "$message 失败"
    exit 1
  fi
}

# 初始化日志文件
> "$LOG_FILE"
log "INFO" "开始部署 $APP_NAME (纯后台运行版本)"

TOTAL_STEPS=11  # 总步骤数
current_step=0

# 显示欢迎信息
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}      $APP_NAME 一键部署脚本       ${NC}"
echo -e "${GREEN}      (纯后台运行版本)             ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo

# 检查是否为root用户
if [ "$(id -u)" -ne 0 ]; then
  log "WARN" "建议使用root用户运行此脚本"
  read -p "是否继续？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "INFO" "部署已取消"
    exit 0
  fi
fi

# 步骤1：系统初始化
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "系统初始化..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 系统初始化"

# 安装必要系统工具
if command -v yum &> /dev/null; then
  execute_command "yum install -y curl wget git tar gcc-c++ make" "安装基础系统工具（yum）"
else
  execute_command "apt install -y curl wget git tar build-essential" "安装基础系统工具（apt）"
fi

# 步骤2：安装Node.js和npm（修复依赖问题）
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "安装Node.js $NODE_VERSION..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 安装Node.js $NODE_VERSION"

# 移除可能存在的旧版本
if command -v yum &> /dev/null; then
  execute_command "yum remove -y nodejs npm" "移除旧版本Node.js和npm（yum）"
else
  execute_command "apt remove -y nodejs npm" "移除旧版本Node.js和npm（apt）"
fi

# 手动安装Node.js 16 LTS（解决GLIBC依赖问题）
execute_command "mkdir -p /opt/nodejs && cd /opt/nodejs" "创建Node.js安装目录"
NODE_VERSION=$(curl -s https://nodejs.org/dist/latest-v16.x/ | grep -o 'node-v16\.[0-9]*\.[0-9]*-linux-x64.tar.xz' | head -1)
execute_command "wget -q https://nodejs.org/dist/latest-v16.x/$NODE_VERSION" "下载Node.js $NODE_VERSION"
execute_command "tar -xJf $NODE_VERSION" "解压Node.js $NODE_VERSION"
execute_command "rm $NODE_VERSION" "删除Node.js压缩包"
execute_command "ln -sf /opt/nodejs/${NODE_VERSION%.tar.xz}/bin/node /usr/bin/node" "创建Node.js软链接"
execute_command "ln -sf /opt/nodejs/${NODE_VERSION%.tar.xz}/bin/npm /usr/bin/npm" "创建npm软链接"
execute_command "ln -sf /opt/nodejs/${NODE_VERSION%.tar.xz}/bin/npx /usr/bin/npx" "创建npx软链接"

# 验证Node.js安装
log "INFO" "Node.js版本: $(node -v)"
log "INFO" "npm版本: $(npm -v)"

# 步骤3：创建部署目录
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "创建部署目录..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 创建部署目录"

execute_command "mkdir -p $DEPLOY_DIR" "创建部署目录"
execute_command "chmod -R 755 $DEPLOY_DIR" "设置部署目录权限"
execute_command "chown -R $USER:$USER $DEPLOY_DIR 2>/dev/null || true" "设置部署目录所有者"

# 步骤4：复制应用文件
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "复制应用文件..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 复制应用文件"

execute_command "cp -r $APP_DIR/* $DEPLOY_DIR/" "复制应用文件"
execute_command "mkdir -p $DEPLOY_DIR/public" "创建public目录"
execute_command "mkdir -p $DEPLOY_DIR/data" "创建data目录"
execute_command "mkdir -p $DEPLOY_DIR/src" "创建src目录"

# 步骤5：配置package.json
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "配置package.json..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 配置package.json"

# 写入正确的package.json
cat > "$DEPLOY_DIR/package.json" << EOF
{
  "name": "fixture-monitoring-system",
  "version": "1.0.0",
  "description": "治具产能监控系统",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "fs-extra": "^11.1.1",
    "morgan": "^1.10.0",
    "node-cache": "^5.1.2",
    "uuid": "^8.3.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
EOF

# 步骤6：安装应用依赖
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "安装应用依赖..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 安装应用依赖"

execute_command "npm cache clean --force" "清除npm缓存"
execute_command "cd $DEPLOY_DIR" "进入部署目录"
execute_command "npm install --production" "安装应用依赖"

# 步骤7：配置环境变量
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "配置环境变量..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 配置环境变量"

# 创建环境变量配置文件
cat > "$DEPLOY_DIR/.env" << EOF
NODE_ENV=production
PORT=$PORT
DATA_DIR=$DEPLOY_DIR/data
LOG_DIR=$DEPLOY_DIR/logs
EOF

execute_command "mkdir -p $DEPLOY_DIR/logs" "创建日志目录"
execute_command "touch $APP_LOG_FILE" "创建应用日志文件"
execute_command "chmod 666 $APP_LOG_FILE" "设置应用日志文件权限"

# 步骤8：停止现有应用
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "停止现有应用..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 停止现有应用"

if ! stop_app; then
  log "ERROR" "停止现有应用失败，部署终止"
  exit 1
fi

# 步骤9：启动应用服务（纯后台运行）
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "启动应用服务..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 启动应用服务"

# 启动应用
execute_command "cd $DEPLOY_DIR" "进入部署目录"
execute_command "echo '启动应用...' > $APP_LOG_FILE" "写入启动信息到应用日志文件"
nohup node src/server.js > $APP_LOG_FILE 2>&1 &
echo $! > $PID_FILE

# 验证启动状态
sleep 3
if check_app_status; then
  log "INFO" "应用启动成功"
else
  log "ERROR" "应用启动失败"
  tail -n 50 $APP_LOG_FILE >> "$LOG_FILE"
  echo -e "\n${RED}应用启动失败，请查看日志：$APP_LOG_FILE${NC}"
  exit 1
fi

# 步骤10：配置开机自启（不依赖systemd）
current_step=$((current_step + 1))
show_progress $current_step $TOTAL_STEPS "配置开机自启..."
log "INFO" "步骤 $current_step/$TOTAL_STEPS: 配置开机自启"

# 创建启动脚本
START_SCRIPT="/etc/init.d/fixture-monitoring"
cat > "$START_SCRIPT" << EOF
#!/bin/bash
### BEGIN INIT INFO
# Provides:          fixture-monitoring
# Required-Start:    \$network
# Required-Stop:     \$network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: 治具产能监控系统
# Description:       治具产能监控系统后台服务
### END INIT INFO

DEPLOY_DIR="$DEPLOY_DIR"
PID_FILE="$PID_FILE"
LOG_FILE="$APP_LOG_FILE"

case "\$1" in
    start)
        echo "Starting fixture-monitoring..."
        cd \$DEPLOY_DIR
        nohup node src/server.js > \$LOG_FILE 2>&1 &
        echo \$! > \$PID_FILE
        ;;
    stop)
        echo "Stopping fixture-monitoring..."
        if [ -f "\$PID_FILE" ]; then
            kill \$(cat \$PID_FILE)
            rm -f \$PID_FILE
        fi
        ;;
    status)
        if [ -f "\$PID_FILE" ] && ps -p \$(cat \$PID_FILE) > /dev/null; then
            echo "fixture-monitoring is running with PID \$(cat \$PID_FILE)"
            exit 0
        else
            echo "fixture-monitoring is not running"
            exit 3
        fi
        ;;
    restart)
        \$0 stop
        \$0 start
        ;;
    *)
        echo "Usage: \$0 {start|stop|status|restart}"
        exit 2
        ;;
esac

exit 0
EOF

execute_command "chmod +x $START_SCRIPT" "赋予启动脚本执行权限"

# 添加到系统服务
if command -v update-rc.d &> /dev/null; then
  execute_command "update-rc.d fixture-monitoring defaults" "添加到系统服务（update-rc.d）"
elif command -v chkconfig &> /dev/null; then
  execute_command "chkconfig --add fixture-monitoring" "添加到系统服务（chkconfig）"
  execute_command "chkconfig fixture-monitoring on" "设置开机自启（chkconfig）"
else
  log "WARN" "无法配置开机自启，请手动添加到 rc.local 或等效文件"
fi

# 步骤11：部署完成
echo -e "\n\n${GREEN}=====================================${NC}"
echo -e "${GREEN}       $APP_NAME 部署成功!       ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${YELLOW}应用名称:${NC} $APP_NAME"
echo -e "${YELLOW}部署目录:${NC} $DEPLOY_DIR"
echo -e "${YELLOW}端口:${NC} $PORT"
echo -e "${YELLOW}PID文件:${NC} $PID_FILE"
echo -e "${YELLOW}访问地址:${NC} http://$(curl -s ifconfig.me):$PORT"
echo -e "${YELLOW}应用日志:${NC} $APP_LOG_FILE"
echo -e "${YELLOW}部署日志:${NC} $LOG_FILE"
echo -e "\n${YELLOW}应用管理命令:${NC}"
echo -e "  启动应用: $START_SCRIPT start"
echo -e "  停止应用: $START_SCRIPT stop"
echo -e "  重启应用: $START_SCRIPT restart"
echo -e "  查看状态: $START_SCRIPT status"
echo -e "\n${GREEN}部署日志已保存到: $LOG_FILE${NC}"