# NutriHealth Pro - 平台部署手册

## 文档信息

| 项目 | 内容 |
|------|------|
| 文档名称 | 平台部署手册 |
| 版本 | V1.0 |
| 适用版本 | NutriHealth Pro v1.0 |
| 目标读者 | 运维工程师、系统管理员 |

---

## 目录

1. [部署架构概述](#1-部署架构概述)
2. [环境准备](#2-环境准备)
3. [基础设施部署](#3-基础设施部署)
4. [应用部署](#4-应用部署)
5. [配置管理](#5-配置管理)
6. [监控告警](#6-监控告警)
7. [备份恢复](#7-备份恢复)
8. [故障处理](#8-故障处理)

---

## 1. 部署架构概述

### 1.1 部署拓扑图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NutriHealth Pro 部署架构                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   外部流量层                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│   │    DNS       │  │   CDN        │  │  WAF/防火墙  │                 │
│   │  (Route53)   │  │  (阿里云CDN) │  │  (高防IP)    │                 │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│          │                 │                 │                          │
│   ┌──────┴─────────────────┴─────────────────┴───────┐                 │
│   │              负载均衡层 (SLB)                   │                 │
│   │     ┌────────────┐        ┌────────────┐       │                 │
│   │     │  公网SLB   │        │  内网SLB   │       │                 │
│   │     │ (Ingress)  │        │ (Service)  │       │                 │
│   │     └────────────┘        └────────────┘       │                 │
│   └─────────────────────────────────────────────────┘                 │
│                              │                                          │
│   K8s集群层 (ACK托管集群)                                               │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │  Namespace: nutrihealth-prod                                  │   │
│   │                                                               │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│   │  │nutri-    │ │nutri-    │ │nutri-    │ │nutri-    │       │   │
│   │  │gateway  │ │user-svc │ │health-svc│ │diet-svc  │       │   │
│   │  │  3副本  │ │  2副本  │ │  2副本  │ │  2副本  │       │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│   │                                                               │   │
│   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │   │
│   │  │nutri-    │ │nutri-    │ │nutri-    │ │nutri-    │       │   │
│   │  │ai-svc   │ │report-svc│ │notify-svc│ │admin-web │       │   │
│   │  │  2副本  │ │  2副本  │ │  2副本  │ │  2副本  │       │   │
│   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │   │
│   │                                                               │   │
│   │  HPA配置: CPU>70%或内存>80%时自动扩容                        │   │
│   │  PDB配置: 保证最小可用副本数                                  │   │
│   │  反亲和性: 同服务Pod分布在不同节点                            │   │
│   └───────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   数据层                                                                 │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │  MySQL主从集群 (RDS for MySQL)                               │   │
│   │  - Master: 8C32G 500G SSD (高可用版)                         │   │
│   │  - Slave: 8C32G 500G SSD × 2                                  │   │
│   │  - 自动备份: 每日全量+实时增量                                 │   │
│   │  - 跨地域灾备: 异地只读实例                                   │   │
│   └───────────────────────────────────────────────────────────────┘   │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │  Redis Cluster (云数据库Redis)                               │   │
│   │  - 集群版: 4C16G × 6节点                                     │   │
│   │  - 主从架构, 自动故障转移                                    │   │
│   │  - 持久化配置: AOF每秒同步                                   │   │
│   └───────────────────────────────────────────────────────────────┘   │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │  Elasticsearch集群                                           │   │
│   │  - 3节点集群: 8C32G 1T SSD × 3                               │   │
│   │  - 副本数: 1 (保证可用性)                                    │   │
│   │  - 索引策略: 按日期分片                                      │   │
│   └───────────────────────────────────────────────────────────────┘   │
│   ┌───────────────────────────────────────────────────────────────┐   │
│   │  MinIO对象存储                                               │   │
│   │  - 分布式部署: 4节点                                         │   │
│   │  - 存储容量: 10TB起, 可扩展                                  │   │
│   │  - 纠删码配置: EC:4 (可容忍1/4节点故障)                      │   │
│   │  - CDN加速: 阿里云CDN                                        │   │
│   └───────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   中间件与基础设施                                                       │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│   │RabbitMQ  │ │  Nacos   │ │  Kong    │ │Prometheus│               │
│   │  消息队列│ │  配置中心│ │  API网关 │ │  监控告警│               │
│   │  3节点  │ │  3节点  │ │  2节点  │ │  +Grafana│               │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                             │
│   │  ELK     │ │  Jaeger  │ │  XXLJob  │                             │
│   │日志分析  │ │链路追踪  │ │任务调度  │                             │
│   └──────────┘ └──────────┘ └──────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 部署环境规格

| 环境 | 规模 | 配置 | 用途 |
|------|------|------|------|
| **开发环境** | 2节点 | 4C8G | 开发测试 |
| **测试环境** | 4节点 | 8C16G | 集成测试 |
| **预发环境** | 同生产 | 同生产 | 上线前验证 |
| **生产环境** | 20+节点 | 混合配置 | 正式服务 |

---

## 2. 环境准备

### 2.1 系统要求

```bash
# 操作系统要求
- CentOS 7.9+ / Ubuntu 20.04 LTS / Alibaba Cloud Linux 3
- 内核版本 >= 4.19
- 文件系统: ext4 或 xfs

# 网络要求
- 内网互通: 所有节点互相可达
- 外网访问: 控制节点需外网访问能力
- 端口开放: 详见端口清单

# 资源要求 (生产环境单节点)
- Master节点: 4C8G 100G SSD (管理节点, 不跑业务)
- Worker节点: 8C16G 200G SSD (运行业务Pod)
- 存储节点: 16C64G 2T SSD (运行数据库)
- GPU节点: 8C32G 500G SSD + GPU (运行AI服务)
```

### 2.2 端口清单

| 端口 | 服务 | 说明 | 开放范围 |
|------|------|------|----------|
| 22 | SSH | 远程管理 | 堡垒机IP |
| 80 | HTTP | Web入口 | 公网 |
| 443 | HTTPS | 安全Web | 公网 |
| 6443 | K8s API | K8s管理 | 内网 |
| 10250 | Kubelet | 节点管理 | 内网 |
| 30000-32767 | NodePort | K8s服务 | 内网 |
| 3306 | MySQL | 数据库 | 内网 |
| 6379 | Redis | 缓存 | 内网 |
| 9200 | ES | 搜索 | 内网 |
| 5672 | RabbitMQ | 消息队列 | 内网 |

### 2.3 依赖工具安装

```bash
#!/bin/bash
# 部署前置依赖安装脚本

# 1. 安装 Docker
install_docker() {
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
    
    # 配置镜像加速
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://mirror.aliyuncs.com",
    "https://hub-mirror.c.163.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF
    systemctl restart docker
}

# 2. 安装 kubectl
install_kubectl() {
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    mv kubectl /usr/local/bin/
}

# 3. 安装 Helm
install_helm() {
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
}

# 4. 安装其他工具
install_tools() {
    # jq - JSON处理
    yum install -y jq
    
    # git
    yum install -y git
    
    # telnet
    yum install -y telnet
    
    # net-tools
    yum install -y net-tools
}

# 执行安装
main() {
    echo "开始安装部署依赖..."
    install_docker
    install_kubectl
    install_helm
    install_tools
    echo "依赖安装完成!"
}

main
```

---

## 3. 基础设施部署

### 3.1 Kubernetes集群部署

```bash
# 使用kubeadm部署K8s集群 (示例为1主2从)

# ====== Master节点执行 ======

# 1. 初始化集群
sudo kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --service-cidr=10.96.0.0/12 \
  --apiserver-advertise-address=<MASTER_IP>

# 2. 配置kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# 3. 安装网络插件 (Flannel)
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml

# 4. 获取加入令牌
kubeadm token create --print-join-command

# ====== Worker节点执行 ======

# 使用Master生成的命令加入集群
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH>

# ====== 验证集群 ======

# 查看节点状态
kubectl get nodes

# 查看系统Pod
kubectl get pods -n kube-system
```

### 3.2 核心中间件部署

```yaml
# ====== MySQL部署 (使用Helm) ======

# 添加Bitnami仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 创建命名空间
kubectl create namespace database

# 安装MySQL主从集群
helm install mysql bitnami/mysql \
  --namespace database \
  --set architecture=replication \
  --set auth.rootPassword=Root@123456 \
  --set auth.database=nutrihealth \
  --set primary.persistence.size=500Gi \
  --set secondary.persistence.size=500Gi \
  --set primary.resources.requests.cpu=2000m \
  --set primary.resources.requests.memory=8Gi

# ====== Redis部署 ======

helm install redis bitnami/redis-cluster \
  --namespace database \
  --set cluster.nodes=6 \
  --set cluster.replicas=1 \
  --set password=Redis@123456 \
  --set persistence.size=100Gi

# ====== Elasticsearch部署 ======

helm install elasticsearch bitnami/elasticsearch \
  --namespace database \
  --set master.replicas=3 \
  --set data.replicas=3 \
  --set master.persistence.size=100Gi \
  --set data.persistence.size=500Gi

# 安装Kibana
helm install kibana bitnami/kibana \
  --namespace database \
  --set elasticsearch.hosts[0]=elasticsearch.database.svc.cluster.local

# ====== RabbitMQ部署 ======

helm install rabbitmq bitnami/rabbitmq-cluster-operator \
  --namespace database

# 创建RabbitMQ集群
kubectl apply -f - <<EOF
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: rabbitmq
  namespace: database
spec:
  replicas: 3
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 1000m
      memory: 2Gi
  persistence:
    storage: 10Gi
EOF
```

---

## 4. 应用部署

### 4.1 应用镜像构建

```dockerfile
# ====== 后端服务Dockerfile示例 ======

# 构建阶段
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build
COPY pom.xml .
COPY src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 创建应用目录
WORKDIR /app

# 从构建阶段复制jar文件
COPY --from=builder /build/target/*.jar app.jar

# 创建非root用户
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动命令
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 4.2 Helm Chart部署

```yaml
# ====== Helm values.yaml示例 ======

# 全局配置
global:
  env: prod
  imageRegistry: registry.example.com
  imagePullSecrets:
    - name: regcred

# API网关配置
gateway:
  replicaCount: 3
  image:
    repository: nutrihealth/gateway
    tag: v1.0.0
  service:
    type: ClusterIP
    port: 8080
  ingress:
    enabled: true
    className: nginx
    hosts:
      - api.nutrihealth.com
    tls:
      - secretName: api-tls
        hosts:
          - api.nutrihealth.com
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 2000m
      memory: 2Gi
  hpa:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  livenessProbe:
    httpGet:
      path: /actuator/health/liveness
      port: 8080
    initialDelaySeconds: 60
    periodSeconds: 10
  readinessProbe:
    httpGet:
      path: /actuator/health/readiness
      port: 8080
    initialDelaySeconds: 30
    periodSeconds: 5

# 用户服务配置
userService:
  replicaCount: 2
  image:
    repository: nutrihealth/user-service
    tag: v1.0.0
  service:
    port: 8080
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

# 健康服务配置
healthService:
  replicaCount: 2
  image:
    repository: nutrihealth/health-service
    tag: v1.0.0
  service:
    port: 8080
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

# 膳食服务配置
dietService:
  replicaCount: 2
  image:
    repository: nutrihealth/diet-service
    tag: v1.0.0
  service:
    port: 8080
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi

# AI服务配置 (GPU节点)
aiService:
  replicaCount: 2
  image:
    repository: nutrihealth/ai-service
    tag: v1.0.0
  service:
    port: 8000
  nodeSelector:
    node-type: gpu
  tolerations:
    - key: nvidia.com/gpu
      operator: Exists
      effect: NoSchedule
  resources:
    requests:
      cpu: 2000m
      memory: 8Gi
      nvidia.com/gpu: 1
    limits:
      cpu: 4000m
      memory: 16Gi
      nvidia.com/gpu: 1

# 数据库连接配置
database:
  mysql:
    host: mysql.database.svc.cluster.local
    port: 3306
    username: nutrihealth
    password: ${MYSQL_PASSWORD}
    database: nutrihealth
    pool:
      min: 10
      max: 50
  redis:
    cluster:
      nodes:
        - redis-cluster-0.redis-cluster.database.svc.cluster.local:6379
        - redis-cluster-1.redis-cluster.database.svc.cluster.local:6379
        - redis-cluster-2.redis-cluster.database.svc.cluster.local:6379
    password: ${REDIS_PASSWORD}
    pool:
      min: 10
      max: 50
  elasticsearch:
    hosts:
      - http://elasticsearch.database.svc.cluster.local:9200
    username: elastic
    password: ${ES_PASSWORD}

# 外部服务配置
external:
  oss:
    provider: aliyun
    endpoint: oss-cn-beijing.aliyuncs.com
    bucket: nutrihealth-prod
    accessKeyId: ${OSS_ACCESS_KEY_ID}
    accessKeySecret: ${OSS_ACCESS_KEY_SECRET}
  sms:
    provider: aliyun
    accessKeyId: ${SMS_ACCESS_KEY_ID}
    accessKeySecret: ${SMS_ACCESS_KEY_SECRET}
    signName: 营养健康
  push:
    provider: jpush
    appKey: ${PUSH_APP_KEY}
    masterSecret: ${PUSH_MASTER_SECRET}
  ai:
    openai:
      apiKey: ${OPENAI_API_KEY}
      model: gpt-4
    claude:
      apiKey: ${CLAUDE_API_KEY}
      model: claude-3-opus
```

---

## 5. 配置管理

### 5.1 配置分层

```yaml
# 配置分层架构

Layer 1: 系统默认配置 (代码中)
  - 应用程序默认参数
  - 不随环境变化的基础配置
  
Layer 2: 环境配置 (ConfigMap/配置文件)
  - application-{env}.yml
  - 各环境差异化配置
  
Layer 3: 敏感配置 (Secret/密钥管理系统)
  - 数据库密码
  - API密钥
  - TLS证书
  
Layer 4: 动态配置 (配置中心Nacos/Apollo)
  - 运行时动态调整
  - 热更新无需重启
```

---

## 6. 监控告警

### 6.1 监控体系

```yaml
监控体系架构:
  基础设施层:
    - 服务器CPU/内存/磁盘/网络
    - K8s节点状态
    - 容器资源使用
    
  应用层:
    - JVM指标 (堆内存、GC、线程)
    - HTTP请求量/延迟/错误率
    - 业务指标 (注册用户、订单量)
    
  数据层:
    - 数据库连接数、QPS、慢查询
    - 缓存命中率、内存使用
    - 消息队列堆积情况
    
  用户体验层:
    - 页面加载时间
    - API响应时间
    - 错误率

告警策略:
  P0级 (立即处理):
    - 生产环境服务不可用
    - 数据库主库故障
    - 核心业务流程中断
    
  P1级 (15分钟内处理):
    - 服务响应时间>5s
    - 错误率>5%
    - 磁盘使用率>85%
    
  P2级 (1小时内处理):
    - 非核心服务异常
    - 警告级别日志增多
```

---

## 7. 备份恢复

### 7.1 备份策略

```yaml
数据备份策略:
  MySQL数据库:
    备份方式:
      - 每日全量备份 (mysqldump/xtrabackup)
      - 实时增量备份 (binlog)
    备份时间: 每日凌晨2:00
    保留周期: 7天本地 + 30天异地
    异地备份: 跨地域OSS存储
    
  Redis缓存:
    备份方式: RDB持久化 + AOF
    备份频率: 每15分钟RDB快照
    保留周期: 3天
    
  Elasticsearch:
    备份方式: 快照(snapshot)
    备份频率: 每日增量
    保留周期: 15天
    
  文件存储:
    备份方式: OSS跨区域复制
    复制策略: 实时同步

备份验证:
  - 每月进行一次恢复演练
  - 验证备份数据完整性
  - 测试恢复时间目标(RTO)
```

---

## 8. 故障处理

### 8.1 常见故障处理

```yaml
故障排查流程:
  1. 确认故障现象
     - 查看监控告警
     - 收集用户反馈
     - 复现问题
     
  2. 定位故障范围
     - 检查服务状态
     - 查看日志
     - 分析链路追踪
     
  3. 采取应急措施
     - 服务降级
     - 切换备用方案
     - 扩容
     
  4. 修复问题
     - 定位根因
     - 实施修复
     - 验证修复
     
  5. 复盘总结
     - 记录故障
     - 分析根因
     - 制定预防措施

常见故障场景:
  场景1: 服务无响应
    症状: API返回超时, 健康检查失败
    排查:
      - 检查Pod状态: kubectl get pods
      - 查看资源使用: kubectl top pods
      - 查看日志: kubectl logs <pod>
      - 检查依赖服务
    处理:
      - 资源不足: HPA自动扩容或手动扩容
      - OOMKilled: 增加内存限制
      - 依赖故障: 启用降级策略
      
  场景2: 数据库连接池耗尽
    症状: 应用报错"too many connections"
    排查:
      - 查看当前连接数: show processlist
      - 检查连接池配置
      - 查看慢查询
    处理:
      - 优化慢查询, 释放连接
      - 调整连接池大小
      - 增加数据库连接数限制
      
  场景3: 缓存击穿
    症状: 大量请求打到数据库
    排查:
      - 检查缓存命中率
      - 查看热点key
    处理:
      - 启用热点key本地缓存
      - 缓存预热
      - 限流保护
```

---

**文档结束**

*本文档为NutriHealth Pro平台的部署手册, 包含完整的部署架构、环境准备、应用部署、配置管理、监控告警、备份恢复和故障处理指南。*
