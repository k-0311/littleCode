# 方案概要

* 需求信息: 埋点数据分析方案
* 系统功能版本号: V2
* 方案重要等级: A
# 架构设计

## 实现概要描述

将前端埋点脚本从 EBS 系统中收集存入到 MongoDB 中的数据，以一定的算法规则指标进行清洗整理，存入到 MySQL 数据库中，最后在数据可视化平台上展示。

## 数据处理端

### 技术栈选择

**编程语言：**NodeJS

**技术框架：**Fastify

**数据库：**MySQL

### 表结构设计

#### 平台管理表

平台ID、创建时间、更新时间、平台标识名、平台显示名、平台描述。

```plain
CREATE TABLE platform (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '平台ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    platform_name VARCHAR(100) NOT NULL COMMENT '平台标识名',
    platform_title VARCHAR(100) NOT NULL COMMENT '平台显示名',
    platform_desc VARCHAR(255) DEFAULT NULL COMMENT '平台描述',

    -- 建立唯一索引
    UNIQUE INDEX platform_name_index (platform_name ASC)
) COMMENT '平台管理表'; 
```

#### 事件管理表

事件ID、创建时间、更新时间、事件标识名、事件显示名、事件描述、平台ID。

```plain
CREATE TABLE event (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '事件ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    event_name VARCHAR(100) NOT NULL COMMENT '事件标识名',
    event_title VARCHAR(100) NOT NULL COMMENT '事件显示名',
    event_desc VARCHAR(255) DEFAULT NULL COMMENT '事件描述',
    platform_id INT NOT NULL COMMENT '平台ID',

    -- 建立唯一索引
    UNIQUE INDEX event_name_index (event_name ASC),

    -- 建立索引
    INDEX platform_id_index (platform_id)
) COMMENT '事件管理表';
```

#### 属性管理表

属性ID、创建时间、更新时间、属性标识名、属性显示名、属性描述。

```plain
CREATE TABLE attribute (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '属性ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    attribute_name VARCHAR(100) NOT NULL COMMENT '属性标识名',
    attribute_title VARCHAR(100) NOT NULL COMMENT '属性显示名',
    attribute_desc VARCHAR(255) DEFAULT NULL COMMENT '属性描述',

    -- 建立唯一索引
    UNIQUE INDEX attribute_name_index (attribute_name ASC),
) COMMENT '属性管理表';
```

#### 事件关联属性表

主键ID、创建时间、更新时间、事件ID、属性ID。

```plain
CREATE TABLE event_attribute (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    event_id INT NOT NULL COMMENT '事件ID',
    attribute_id INT NOT NULL COMMENT '属性ID',

    -- 建立索引
    INDEX event_id_index (event_id),
    INDEX attribute_id_index (attribute_id)
) COMMENT '事件关联属性表';
```

#### 埋点会话表

主键ID、创建时间、会话ID、会话时间、平台ID、账号ID、版本号、网络IP、系统语言、屏幕分辨率、视窗分辨率、终端UA、操作系统、操作终端。

```plain
CREATE TABLE user_session (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    session_id INT NOT NULL COMMENT '会话ID',
    session_time DATETIME NOT NULL COMMENT '会话时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    user_id INT NOT NULL COMMENT '账号ID',
    version VARCHAR(100) NOT NULL COMMENT '版本号',
    ip VARCHAR(15) NOT NULL COMMENT '网络IP',
    language VARCHAR(15) NOT NULL COMMENT '系统语言',
    viewport VARCHAR(15) NOT NULL COMMENT '屏幕分辨率',
    browser_viewport VARCHAR(15) NOT NULL COMMENT '视窗分辨率',
    user_agent VARCHAR(255) NOT NULL COMMENT '终端UA',
    os VARCHAR(15) NOT NULL COMMENT '操作系统',
    browser VARCHAR(15) NOT NULL COMMENT '操作终端',

    -- 建立索引
    INDEX session_id_index (session_id),
    INDEX platform_id_index (platform_id),
    INDEX user_id_index (user_id)
) COMMENT '埋点会话表';
```

#### 埋点事件表

主键ID、创建时间、事件ID、事件标识名、事件时间、平台ID、会话ID、账号ID、页面URL、页面参数、页面附加参数、页面来源、页面编码、页面标题。

```plain
CREATE TABLE user_event (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    event_id INT NOT NULL COMMENT '事件ID',
    event_name VARCHAR(100) NOT NULL COMMENT '事件标识名',
    event_time DATETIME NOT NULL COMMENT '事件时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    session_id INT NOT NULL COMMENT '会话ID',
    user_id INT NOT NULL COMMENT '账号ID',
    router_url VARCHAR(1024) NOT NULL COMMENT '页面URL',
    router_query VARCHAR(1024) NOT NULL COMMENT '页面参数',
    router_params VARCHAR(1024) NOT NULL COMMENT '页面附加参数',
    router_referer VARCHAR(1024) NOT NULL COMMENT '页面来源',
    router_name VARCHAR(100) NOT NULL COMMENT '页面编码',
    router_title VARCHAR(100) NOT NULL COMMENT '页面标题',

    -- 建立索引
    INDEX event_id_index (event_id),
    INDEX event_name_index (event_name),
    INDEX platform_id_index (platform_id),
    INDEX session_id_index (session_id),
    INDEX user_id_index (user_id)
) COMMENT '埋点事件表';
```

#### 埋点事件属性表

主键ID、创建时间、埋点事件ID、属性ID、属性标识名、属性值。

```plain
CREATE TABLE user_event_attribute (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    user_event_id INT NOT NULL COMMENT '埋点事件ID',
    attribute_id INT NOT NULL COMMENT '属性ID',
    attribute_name VARCHAR(100) NOT NULL COMMENT '属性标识名',
    attribute_value TEXT NOT NULL COMMENT '属性值',

    -- 建立索引
    INDEX user_event_id_index (user_event_id),
    INDEX attribute_name_index (attribute_name),
    INDEX attribute_id_index (attribute_id)
) COMMENT '埋点事件属性表';
```

#### 埋点用户信息表

主键ID、创建时间、更新时间、账号ID、账号启用时间、账号状态、姓名、部门、职位、身份、性别、年龄。

```plain
CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    user_id INT NOT NULL COMMENT '账号ID',
    user_enabled_time DATETIME NOT NULL COMMENT '账号启用时间',
    user_status TINYINT(1) DEFAULT '0' COMMENT '账号状态 0:离职, 1:在职',
    nickname VARCHAR(100) COMMENT '姓名',
    department VARCHAR(100) COMMENT '部门',
    position VARCHAR(100) COMMENT '职位',
    identity VARCHAR(100) COMMENT '身份',
    gender TINYINT(1) DEFAULT '0' COMMENT '性别 0:未知, 1:男性, 2:女性',
    age TINYINT(2) DEFAULT '0' COMMENT '年龄',

    -- 建立唯一索引
    UNIQUE INDEX user_id_index (user_id ASC)
) COMMENT '埋点用户信息表';
```

#### 埋点用户状态表

主键ID、创建时间、平台ID、会话ID、账号ID、状态标识名、状态值、状态变更时间。

```plain
CREATE TABLE user_status (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    session_id INT NOT NULL COMMENT '会话ID',
    user_id INT NOT NULL COMMENT '账号ID',
    status_name VARCHAR(100) NOT NULL COMMENT '状态标识名 BrowserFocus:浏览器焦点状态, UserActivityStatus:用户活跃状态',
    status_value TINYINT(1) NOT NULL DEFAULT '0' COMMENT '状态值 0:已失活, 1:已激活',
    status_time DATETIME NOT NULL COMMENT '状态变更时间',

    -- 建立索引
    INDEX platform_id_index (platform_id),
    INDEX session_id_index (session_id),
    INDEX user_id_index (user_id),
    INDEX status_name_index (status_name)
) COMMENT '埋点用户状态表';
```

#### 埋点用户配置表

主键ID、创建时间、平台ID、会话ID、账号ID、配置标识名、配置值、配置变更时间。

```plain
CREATE TABLE user_config (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    session_id INT NOT NULL COMMENT '会话ID',
    user_id INT NOT NULL COMMENT '账号ID',
    config_name VARCHAR(100) NOT NULL COMMENT '配置标识名',
    config_value TEXT NOT NULL COMMENT '配置值',
    config_time DATETIME NOT NULL COMMENT '配置变更时间',

    -- 建立索引
    INDEX platform_id_index (platform_id),
    INDEX session_id_index (session_id),
    INDEX user_id_index (user_id),
    INDEX config_name_index (config_name)
) COMMENT '埋点用户配置表';
```

#### 埋点用户变更记录表

主键ID、创建时间、平台ID、账号ID、数据库表名、变更字段、变更前值、变更后值。

```plain
CREATE TABLE user_change_record (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    user_id INT NOT NULL COMMENT '账号ID',
    table_name VARCHAR(100) NOT NULL COMMENT '数据库表名',
    change_name VARCHAR(100) NOT NULL COMMENT '变更字段',
    change_value TEXT NOT NULL COMMENT '变更前值',
    change_value_new TEXT NOT NULL COMMENT '变更后值',
    
    -- 建立索引
    INDEX platform_id_index (platform_id),
    INDEX user_id_index (user_id)
) COMMENT '埋点用户变更记录表';
```

#### 性能指标表

主键ID、创建时间、平台ID、会话ID、账号ID、指标标识名、指标值、指标触发时间。

```plain
CREATE TABLE user_web_vitals (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    session_id INT NOT NULL COMMENT '会话ID',
    user_id INT NOT NULL COMMENT '账号ID',
    vitals_name VARCHAR(100) NOT NULL COMMENT '指标标识名',
    vitals_value VARCHAR(100) NOT NULL COMMENT '指标值',
    vitals_time DATETIME NOT NULL COMMENT '指标触发时间',

    -- 建立索引
    INDEX platform_id_index (platform_id),
    INDEX session_id_index (session_id),
    INDEX user_id_index (user_id)
) COMMENT '性能指标表';
```

#### 错误监控表

主键ID、创建时间、平台ID、会话ID、账号ID、错误标识名、错误消息、错误路径、错误触发时间、处理人ID、处理状态。

```plain
CREATE TABLE user_error_record (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    platform_id INT NOT NULL COMMENT '平台ID',
    session_id INT NOT NULL COMMENT '会话ID',
    user_id INT NOT NULL COMMENT '账号ID',
    error_name VARCHAR(100) NOT NULL COMMENT '错误标识名 ErrorRequest: 异常接口错误, ErrorScript: 异常前端错误',
    error_message TEXT NOT NULL COMMENT '错误消息',
    error_path VARCHAR(1024) COMMENT '错误路径',
    error_time DATETIME NOT NULL COMMENT '错误触发时间',
    reporter_id INT COMMENT '处理人ID',
    reporter_status TINYINT(1) DEFAULT '0' COMMENT '处理状态 0:未处理, 1:已处理',

    -- 建立索引
    INDEX platform_id_index (platform_id),
    INDEX session_id_index (session_id),
    INDEX user_id_index (user_id),
    INDEX error_name_index (error_name),
    INDEX reporter_id_index (reporter_id),
    INDEX reporter_status_index (reporter_status)
) COMMENT '错误监控表';
```

#### 错误处理人员表

主键ID、创建时间、更新时间、处理人显示名、是否启用、是否删除。

```plain
CREATE TABLE user_error_reporter (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    reporter_name VARCHAR(100) NOT NULL COMMENT '处理人显示名',
    enabled TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否启用 0:禁用, 1:启用',
    deleted TINYINT(1) NOT NULL DEFAULT '0' COMMENT '是否删除 0:未删除, 1:已删除',
    
    -- 建立唯一索引
    UNIQUE INDEX reporter_name_index (reporter_name ASC),
) COMMENT '错误处理人员表';
```

#### 清洗记录表

主键 ID、创建时间、清洗开始时间、清洗结束时间、清洗数据总条数、清洗类型、清洗状态。

```plain
CREATE TABLE cleaned_record (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL COMMENT '更新时间',
    cleaned_start_time DATETIME NOT NULL COMMENT '清洗开始时间',
    cleaned_end_time DATETIME NOT NULL COMMENT '清洗结束时间',
    cleaned_total INT NOT NULL COMMENT '清洗数据总条数',
    cleaned_type INT NOT NULL COMMENT '清洗类型 1:会话清洗, 2:事件清洗',
    cleaned_status TINYINT(1) NOT NULL DEFAULT '0' COMMENT '清洗状态 0:未开始, 1:进行中, 2:已完成',

    -- 建立索引
    INDEX cleaned_type_index (cleaned_type)
) COMMENT '清洗记录表';
```

### 功能分解

#### 会话建档服务

通过清洗 MongoDB 的 Session 会话表，生成埋点会话表、用户信息表、用户配置表。

[https://www.processon.com/view/link/6444ded5fcfd2a6ff32b0ef8?embed=true](https://www.processon.com/view/link/6444ded5fcfd2a6ff32b0ef8?embed=true)

#### 事件清洗服务

[https://www.processon.com/view/link/6444f136809a0f0a5d5dbf64?embed=true](https://www.processon.com/view/link/6444f136809a0f0a5d5dbf64?embed=true)

## 数据可视端

原型地址：[https://app.mockplus.cn/s/kEXVaLIj35](https://app.mockplus.cn/s/kEXVaLIj35)

1. 登录页
2. 工作台
3. 平台管理
    1. 页面功能：新增平台
        1. 新增平台字段：平台标识名、平台显示名、平台描述
    2. 列表字段：平台ID、创建时间、更新时间、平台标识名、平台显示名、平台描述、操作
        1. 操作功能：编辑、删除、详情
            1. 编辑功能：如果该平台存在埋点数据，只允许更改平台显示名、平台描述
            2. 删除功能：如果该平台存在埋点数据，不允许删除，否则硬删除
    3. 列表筛选功能：平台标识名
4. 事件管理
    1. 页面功能：新增事件
        1. 新增事件字段：事件标识名、事件显示名、事件描述、平台ID（下拉框选择平台显示名）
    2. 列表字段：事件标识名、事件显示名、事件描述、平台显示名、操作
        1. 操作功能：编辑、删除、详情
            1. 编辑功能：如果该事件存在埋点数据，只允许更改事件显示名、事件描述
            2. 删除功能：如果该事件存在埋点数据，不允许删除，否则硬删除
    3. 列表筛选功能：事件标识名
    4. 详情字段：事件ID、创建时间、更新时间、事件标识名、事件显示名、事件描述、平台显示名、关联属性列表
        1. 关联属性列表字段：属性标识名、属性显示名
5. 属性管理
    1. 页面功能：新增属性
        1. 新增属性字段：属性标识名、显示名、属性描述
    2. 列表字段：属性标识名、属性显示名、属性描述、操作
        1. 操作功能：编辑、删除、详情
            1. 编辑功能：如果该属性存在埋点数据，只允许更改属性显示名、属性描述
            2. 删除功能：如果该属性存在埋点数据，不允许删除，否则硬删除
    3. 列表筛选功能：属性标识名
    4. 详情字段：属性ID、创建时间、更新时间、属性标识名、属性显示名、属性描述、关联事件列表
        1. 关联事件列表字段：事件标识名、事件显示名、平台显示名
6. 埋点会话列表
    1. 页面功能：开始清洗任务 
        1. 开始清洗任务：手动触发清洗埋点会话任务
    2. 列表字段：会话ID、会话时间、平台显示名、账号ID、版本号、屏幕分辨率、视窗分辨率、操作系统、操作终端、操作
        1. 操作功能：详情
    3. 列表筛选功能：会话ID、会话时间区间、平台ID（下拉框选择平台显示名）、账号ID
    4. 详情字段：会话ID、会话时间、平台显示名、账号ID、版本号、网络IP、系统语言、屏幕分辨率、视窗分辨率、终端UA、操作系统、操作终端
7. 埋点事件列表
    1. 页面功能：开始清洗任务
        1. 开始清洗任务：手动触发清洗埋点事件任务
    2. 列表字段：事件时间、事件标识名、平台显示名、会话ID、账号ID、页面URL、页面编码、页面标题
    3. 列表筛选功能：事件时间区间、事件标识名、平台ID（下拉框选择平台显示名）、会话ID、账号ID、页面编码
    4. 详情字段：事件ID、事件标识名、事件时间、平台显示名、会话ID、账号ID、页面URL、页面参数、页面附加参数、页面来源、页面编码、页面标题、事件属性列表
        1. 事件属性列表字段：属性标识名、属性显示名、属性值
8. 埋点用户列表
    1. 列表字段：账号ID、账号启用时间、账号状态、姓名、部门、职位、身份、性别、年龄、操作
        1. 操作功能：状态详情、配置详情
    2. 列表筛选功能：账号ID
    3. 状态详情字段：平台显示名、会话ID、状态标识名、状态值、状态变更时间
        1. 状态详情筛选功能：平台ID（下拉框选择平台显示名）、会话ID、状态标识名、状态变更时间区间
    4. 配置详情字段：平台显示名、会话ID、配置标识名、配置值、配置变更时间
        1. 配置详情筛选功能：平台ID（下拉框选择平台显示名）、会话ID、配置标识名、配置变更时间区间
9. 性能监控工作台 
    1. 性能统计图表（本期不开发）
    2. 性能指标列表
        1. 列表字段：平台显示名、会话ID、账号ID、指标标识名、指标值、指标触发时间
        2. 列表筛选功能：平台ID（下拉框选择平台显示名）、会话ID、账号ID、指标标识名、指标触发时间区间
10. 错误监控工作台
    1. 错误统计图表（本期不开发）
    2. 错误监控列表
        1. 列表字段：平台显示名、会话ID、账号ID、错误标识名、错误消息、错误路径、指标触发时间、处理人、处理状态
        2. 列表筛选功能：平台ID（下拉框选择平台显示名）、会话ID、账号ID、错误标识名、错误触发时间区间、处理人ID（下拉框选择处理人显示名）、处理状态
