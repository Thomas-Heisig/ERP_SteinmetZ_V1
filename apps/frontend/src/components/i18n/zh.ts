export default {
  // ===== 仪表板与系统 =====
  dashboard: {
    title: "ERP SteinmetZ – 功能目录",
    subtitle: "业务运营中央控制面板",
    welcome: "欢迎回来，{{name}}",
    
    // 状态指示器
    status: {
      online: "系统在线",
      degraded: "系统部分受限",
      offline: "系统离线",
      maintenance: "维护模式",
      syncing: "正在同步数据...",
    },
    
    // 快速操作
    quickActions: {
      title: "快速操作",
      newInvoice: "新建发票",
      newCustomer: "新建客户",
      newEmployee: "新建员工",
      newProject: "新建项目",
      runReport: "运行报告",
      exportData: "导出数据",
      importData: "导入数据",
    },
    
    // 健康监控
    health: {
      title: "系统健康状态",
      status: {
        healthy: "所有系统运行正常",
        degraded: "部分功能受限",
        unhealthy: "检测到严重故障",
      },
      components: {
        database: "数据库",
        api: "API 网关",
        auth: "认证系统",
        storage: "文件存储",
        websocket: "WebSocket",
        cache: "缓存",
      },
      metrics: {
        uptime: "运行时间",
        responseTime: "响应时间",
        memoryUsage: "内存使用",
        cpuLoad: "CPU 负载",
      },
    },
    
    // 通知
    notifications: {
      title: "通知",
      empty: "无新通知",
      markAllRead: "全部标记为已读",
      clearAll: "清空所有",
      types: {
        info: "信息",
        warning: "警告",
        error: "错误",
        success: "成功",
      },
    },
    
    // 最近活动
    recentActivity: {
      title: "最近活动",
      types: {
        login: "用户登录",
        create: "创建",
        update: "更新",
        delete: "删除",
        export: "导出",
        import: "导入",
      },
      empty: "无近期活动",
    },
  },
  
  // ===== 目录与功能 =====
  catalog: {
    title: "功能目录",
    subtitle: "浏览可用的系统功能",
    
    categories: {
      title: "功能区域",
      count: "{{count}} 个区域可用",
      count_one: "{{count}} 个区域可用",
      count_other: "{{count}} 个区域可用",
      emptyTitle: "未找到类别",
      emptyDescription: "未找到符合条件的类别。",
      filter: {
        all: "所有类别",
        favorites: "仅收藏",
        recent: "最近使用",
      },
    },
    
    functions: {
      title: "可用功能",
      search: {
        placeholder: "搜索功能...",
        button: "搜索",
        advanced: "高级搜索",
        filters: "筛选器",
        clear: "清除搜索",
      },
      view: {
        grid: "网格视图",
        list: "列表视图",
        details: "详细视图",
      },
      actions: {
        execute: "执行",
        favorite: "添加到收藏",
        unfavorite: "从收藏移除",
        details: "查看详情",
        export: "导出功能",
        duplicate: "复制",
      },
      metadata: {
        version: "版本",
        author: "作者",
        lastModified: "最后修改",
        dependencies: "依赖项",
        tags: "标签",
      },
    },
  },
  
  // ===== 搜索 =====
  search: {
    global: {
      placeholder: "在 ERP 系统中搜索...",
      button: "搜索",
      advanced: "高级搜索",
      clear: "清除",
    },
    
    filters: {
      title: "搜索筛选器",
      category: "类别",
      type: "类型",
      status: "状态",
      dateRange: "日期范围",
      amount: "金额范围",
      clearAll: "清除所有筛选器",
      apply: "应用筛选器",
    },
    
    results: {
      title: "搜索结果",
      loading: "正在搜索...",
      noResults: "未找到结果",
      tryAgain: "尝试不同的关键词",
      showing: "显示 {{count}} 条，共 {{total}} 条结果",
      relevance: "相关性",
      newest: "最新优先",
      oldest: "最早优先",
    },
    
    modules: {
      all: "所有模块",
      crm: "客户关系管理",
      finance: "财务",
      hr: "人力资源",
      inventory: "库存",
      projects: "项目",
      documents: "文档",
      ai: "AI 功能",
    },
  },
  
  // ===== 导航与侧边栏 =====
  sidebar: {
    title: "导航",
    collapse: "折叠侧边栏",
    expand: "展开侧边栏",
    pin: "固定侧边栏",
    unpin: "取消固定侧边栏",
    
    // 主要部分
    sections: {
      main: "主要区域",
      business: "业务管理",
      finance: "财务与控制",
      sales: "销售与营销",
      procurement: "采购",
      production: "生产与制造",
      warehouse: "仓库与物流",
      hr: "人力资源",
      reporting: "报告与分析",
      communication: "通讯",
      system: "系统与管理",
      ai: "AI 与自动化",
      tools: "工具",
    },
    
    // 导航项目带图标
    navItems: {
      dashboard: "仪表板",
      catalog: "功能目录",
      calendar: "日历",
      company: "公司",
      processes: "流程管理",
      risk: "风险与合规",
      
      // 财务
      accounting: "会计",
      controlling: "控制",
      treasury: "资金管理",
      taxes: "税务",
      invoices: "发票",
      expenses: "费用",
      
      // CRM 与销售
      crm: "客户管理",
      customers: "客户",
      leads: "潜在客户",
      opportunities: "销售机会",
      marketing: "营销",
      sales: "销售",
      orders: "订单",
      fulfillment: "订单履行",
      
      // 采购
      purchasing: "采购",
      receiving: "收货",
      suppliers: "供应商",
      contracts: "合同",
      
      // 生产
      planning: "生产计划",
      manufacturing: "制造",
      quality: "质量管理",
      maintenance: "维护",
      
      // 仓库
      inventory: "库存",
      picking: "拣货",
      logistics: "物流",
      shipping: "发货",
      
      // 人力资源
      personnel: "人事",
      timeTracking: "时间跟踪",
      payroll: "薪资",
      development: "发展",
      recruiting: "招聘",
      
      // 报告
      reports: "报告",
      analytics: "分析",
      dashboards: "仪表板",
      exports: "数据导出",
      
      // 通讯
      email: "电子邮件",
      messaging: "消息",
      social: "社交媒体",
      calls: "电话呼叫",
      
      // 系统
      users: "用户",
      roles: "角色",
      permissions: "权限",
      settings: "设置",
      logs: "系统日志",
      backups: "备份",
      
      // AI 与工具
      aiAnnotator: "AI 注释器",
      batchProcessing: "批处理",
      modelManagement: "AI 模型",
      advancedFilters: "高级筛选器",
      innovation: "创新实验室",
      
      // 其他
      documents: "文档",
      projects: "项目",
      help: "帮助与支持",
      about: "关于系统",
    },
    
    // 用户菜单
    user: {
      profile: "我的资料",
      settings: "我的设置",
      logout: "退出登录",
      switchAccount: "切换账户",
    },
    
    // 页脚
    footer: {
      version: "版本 {{version}}",
      lastUpdate: "最后更新：{{date}}",
      copyright: "© {{year}} ERP SteinmetZ",
    },
  },
  
  // ===== AI 与自动化 =====
  ai: {
    title: "AI 与自动化",
    annotator: {
      title: "AI 注释器",
      subtitle: "智能文档处理",
      upload: "上传文档",
      analyze: "使用 AI 分析",
      extract: "提取数据",
      validate: "验证结果",
      export: "导出注释",
      supportedFormats: "支持格式：PDF、DOCX、图片",
    },
    
    models: {
      title: "AI 模型",
      provider: "提供商",
      capabilities: "功能",
      status: "状态",
      active: "活跃",
      inactive: "非活跃",
      loading: "正在加载",
      select: "选择模型",
      configure: "配置",
      test: "测试模型",
    },
    
    chat: {
      title: "AI 助手",
      inputPlaceholder: "向我询问关于 ERP 系统的任何问题...",
      send: "发送",
      newSession: "新对话",
      clear: "清除聊天",
      thinking: "正在思考...",
      examples: {
        title: "示例问题",
        q1: "如何创建发票？",
        q2: "显示逾期付款",
        q3: "生成第四季度销售报告",
        q4: "帮助员工入职",
      },
    },
    
    batch: {
      title: "批处理",
      create: "创建批处理作业",
      monitor: "监控进度",
      history: "作业历史",
      schedule: "计划",
      cancel: "取消作业",
      retry: "重试失败",
    },
  },
  
  // ===== CRM 模块 =====
  crm: {
    title: "客户关系管理",
    
    customers: {
      title: "客户",
      list: "客户列表",
      details: "客户详情",
      new: "新建客户",
      edit: "编辑客户",
      delete: "删除客户",
      import: "导入客户",
      export: "导出客户",
    },
    
    leads: {
      title: "潜在客户",
      convert: "转为客户",
      assign: "分配给销售",
      followUp: "安排跟进",
    },
    
    opportunities: {
      title: "销售机会",
      stages: {
        prospecting: "潜在客户开发",
        qualification: "资质确认",
        proposal: "提案",
        negotiation: "谈判",
        closedWon: "成功关闭",
        closedLost: "失败关闭",
      },
    },
    
    contacts: {
      title: "联系人",
      add: "添加联系人",
      primary: "主要联系人",
      communication: "沟通记录",
    },
    
    activities: {
      title: "活动",
      logCall: "记录电话",
      scheduleMeeting: "安排会议",
      sendEmail: "发送邮件",
      addNote: "添加备注",
    },
  },
  
  // ===== 财务模块 =====
  finance: {
    title: "财务与会计",
    
    invoices: {
      title: "发票",
      create: "创建发票",
      send: "发送发票",
      markPaid: "标记为已支付",
      reminder: "发送提醒",
      cancel: "取消发票",
      duplicate: "复制",
    },
    
    status: {
      draft: "草稿",
      sent: "已发送",
      paid: "已支付",
      overdue: "逾期",
      cancelled: "已取消",
      partiallyPaid: "部分支付",
    },
    
    reports: {
      title: "财务报告",
      profitLoss: "损益表",
      balanceSheet: "资产负债表",
      cashFlow: "现金流量表",
      agedReceivables: "应收账款账龄",
      agedPayables: "应付账款账龄",
    },
    
    banking: {
      title: "银行",
      reconcile: "对账",
      importStatement: "导入对账单",
      matchTransactions: "匹配交易",
    },
  },
  
  // ===== 人力资源模块 =====
  hr: {
    title: "人力资源",
    
    employees: {
      title: "员工",
      new: "新建员工",
      edit: "编辑员工",
      terminate: "终止雇佣",
      reactivate: "重新激活",
      documents: "员工文档",
    },
    
    departments: {
      title: "部门",
      assign: "分配部门",
      transfer: "调动员工",
    },
    
    attendance: {
      title: "考勤",
      clockIn: "打卡上班",
      clockOut: "打卡下班",
      timesheet: "时间表",
      approve: "批准工时",
    },
    
    payroll: {
      title: "薪资",
      run: "运行薪资",
      review: "审核薪资",
      approve: "批准薪资",
      export: "导出给银行",
    },
  },
  
  // ===== UI 组件 =====
  ui: {
    common: {
      confirm: "确认",
      cancel: "取消",
      save: "保存",
      delete: "删除",
      edit: "编辑",
      add: "添加",
      view: "查看",
      close: "关闭",
      back: "返回",
      next: "下一步",
      previous: "上一步",
      search: "搜索",
      filter: "筛选",
      sort: "排序",
      refresh: "刷新",
      download: "下载",
      upload: "上传",
      print: "打印",
      export: "导出",
      import: "导入",
      help: "帮助",
      settings: "设置",
      more: "更多",
      less: "更少",
      expand: "展开",
      collapse: "折叠",
      enable: "启用",
      disable: "禁用",
      activate: "激活",
      deactivate: "停用",
      selectAll: "全选",
      deselectAll: "取消全选",
      clear: "清除",
      reset: "重置",
      submit: "提交",
      continue: "继续",
      finish: "完成",
      ok: "确定",
      yes: "是",
      no: "否",
    },
    
    status: {
      loading: "正在加载...",
      saving: "正在保存...",
      processing: "正在处理...",
      uploading: "正在上传...",
      downloading: "正在下载...",
      success: "成功！",
      error: "错误！",
      warning: "警告！",
      info: "信息",
      unknown: "未知",
    },
    
    validation: {
      required: "此字段为必填项",
      invalidEmail: "无效的电子邮件地址",
      invalidPhone: "无效的电话号码",
      minLength: "至少需要 {{count}} 个字符",
      maxLength: "最多允许 {{count}} 个字符",
      passwordMismatch: "密码不匹配",
      invalidFormat: "格式无效",
      duplicate: "此值已存在",
    },
    
    emptyStates: {
      noData: "无可用数据",
      noResults: "未找到结果",
      emptyList: "列表为空",
      notConfigured: "尚未配置",
      comingSoon: "即将推出",
    },
    
    dates: {
      today: "今天",
      yesterday: "昨天",
      tomorrow: "明天",
      thisWeek: "本周",
      lastWeek: "上周",
      nextWeek: "下周",
      thisMonth: "本月",
      lastMonth: "上月",
      nextMonth: "下月",
      thisQuarter: "本季度",
      lastQuarter: "上季度",
      nextQuarter: "下季度",
      thisYear: "今年",
      lastYear: "去年",
      nextYear: "明年",
      customRange: "自定义范围",
      selectDate: "选择日期",
    },
    
    time: {
      now: "现在",
      minutes: "分钟",
      hours: "小时",
      days: "天",
      weeks: "周",
      months: "月",
      years: "年",
      ago: "前",
      fromNow: "后",
    },
    
    numbers: {
      currency: "¥{{value}}",
      percent: "{{value}}%",
      decimal: "{{value}}",
      integer: "{{value}}",
      thousand: "{{value}}千",
      million: "{{value}}百万",
      billion: "{{value}}十亿",
    },
    
    units: {
      pieces: "件",
      kilograms: "公斤",
      grams: "克",
      liters: "升",
      meters: "米",
      squareMeters: "平方米",
      cubicMeters: "立方米",
      hours: "小时",
      minutes: "分钟",
      seconds: "秒",
    },
  },
  
  // ===== 错误消息 =====
  errors: {
    network: "网络错误，请检查您的连接。",
    server: "服务器错误，请稍后重试。",
    timeout: "请求超时，请重试。",
    unauthorized: "您无权执行此操作。",
    forbidden: "访问被拒绝，权限不足。",
    notFound: "未找到请求的资源。",
    validation: "请检查输入并重试。",
    duplicate: "此记录已存在。",
    constraint: "由于存在依赖关系，无法删除。",
    fileTooLarge: "文件大小超过限制。",
    invalidFileType: "无效的文件类型。",
    quotaExceeded: "存储配额已满。",
    
    specific: {
      loginFailed: "登录失败，请检查凭据。",
      sessionExpired: "会话已过期，请重新登录。",
      passwordWeak: "密码太弱。",
      emailInUse: "电子邮件地址已被使用。",
      invalidToken: "无效或过期的令牌。",
    },
    
    retry: "重试",
    contactSupport: "联系支持",
    goBack: "返回",
    reloadPage: "重新加载页面",
  },
  
  // ===== 成功消息 =====
  success: {
    saved: "更改已成功保存！",
    created: "创建成功！",
    updated: "更新成功！",
    deleted: "删除成功！",
    uploaded: "上传成功！",
    exported: "导出成功！",
    imported: "导入成功！",
    sent: "发送成功！",
    processed: "处理成功！",
    configured: "配置成功！",
    activated: "激活成功！",
    deactivated: "停用成功！",
    
    actions: {
      close: "关闭",
      view: "查看",
      continue: "继续",
      new: "新建",
    },
  },
  
  // ===== 确认对话框 =====
  confirm: {
    delete: {
      title: "确认删除",
      message: "确定要删除此项吗？此操作无法撤消。",
      single: "删除此项？",
      multiple: "删除 {{count}} 个选定项？",
      permanent: "这将永久删除该项目。",
    },
    
    logout: {
      title: "确认退出",
      message: "确定要退出登录吗？",
    },
    
    cancel: {
      title: "确认取消",
      message: "确定要取消吗？未保存的更改将丢失。",
    },
    
    discard: {
      title: "放弃更改",
      message: "您有未保存的更改，确定要放弃吗？",
    },
    
    overwrite: {
      title: "确认覆盖",
      message: "这将覆盖现有数据，确定吗？",
    },
    
    buttons: {
      proceed: "继续",
      keep: "保留",
      discard: "放弃",
      cancel: "取消",
    },
  },
  
  // ===== 表单与输入 =====
  forms: {
    labels: {
      name: "名称",
      email: "电子邮件",
      phone: "电话",
      address: "地址",
      city: "城市",
      zipCode: "邮政编码",
      country: "国家",
      description: "描述",
      notes: "备注",
      comments: "评论",
      quantity: "数量",
      price: "价格",
      amount: "金额",
      total: "总计",
      discount: "折扣",
      tax: "税",
      subtotal: "小计",
      status: "状态",
      type: "类型",
      category: "类别",
      tags: "标签",
      priority: "优先级",
      dueDate: "到期日",
      startDate: "开始日期",
      endDate: "结束日期",
      createdAt: "创建时间",
      updatedAt: "更新时间",
      createdBy: "创建者",
      updatedBy: "更新者",
    },
    
    placeholders: {
      select: "选择...",
      searchSelect: "输入以搜索...",
      typeHere: "在此输入...",
      chooseFile: "选择文件...",
      dragDrop: "拖放文件到这里",
      optional: "可选",
      required: "必填",
    },
    
    hints: {
      minCharacters: "至少 {{count}} 个字符",
      maxCharacters: "最多 {{count}} 个字符",
      requiredField: "必填字段",
      optionalField: "可选字段",
    },
  },
  
  // ===== 表格与数据网格 =====
  table: {
    actions: {
      title: "操作",
      edit: "编辑",
      delete: "删除",
      view: "查看",
      duplicate: "复制",
      export: "导出",
      more: "更多操作",
    },
    
    selection: {
      selected: "已选择 {{count}} 项",
      selectAll: "全选",
      clear: "清除选择",
    },
    
    pagination: {
      page: "第 {{page}} 页",
      of: "共 {{pages}} 页",
      rowsPerPage: "每页行数",
      showing: "显示第 {{from}} 到 {{to}} 条，共 {{total}} 条",
      first: "首页",
      previous: "上一页",
      next: "下一页",
      last: "末页",
    },
    
    sorting: {
      sortBy: "排序依据",
      ascending: "升序",
      descending: "降序",
      clear: "清除排序",
    },
    
    filtering: {
      filter: "筛选",
      clearFilters: "清除筛选",
      apply: "应用",
    },
    
    empty: {
      noData: "无可用数据",
      noResults: "未找到结果",
      loading: "正在加载数据...",
      error: "加载数据时出错",
    },
  },
  
  // ===== 模态框与对话框 =====
  modal: {
    close: "关闭",
    maximize: "最大化",
    minimize: "最小化",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
  },
  
  // ===== 文件管理 =====
  files: {
    upload: "上传文件",
    download: "下载",
    preview: "预览",
    rename: "重命名",
    move: "移动",
    copy: "复制",
    delete: "删除",
    share: "分享",
    properties: "属性",
    
    types: {
      image: "图片",
      document: "文档",
      pdf: "PDF",
      spreadsheet: "电子表格",
      presentation: "演示文稿",
      archive: "存档",
      audio: "音频",
      video: "视频",
      other: "其他",
    },
    
    status: {
      uploading: "正在上传...",
      processing: "正在处理...",
      complete: "完成",
      failed: "失败",
      queued: "排队中",
    },
  },
  
  // ===== 打印与导出 =====
  export: {
    formats: {
      pdf: "PDF",
      excel: "Excel",
      csv: "CSV",
      json: "JSON",
      xml: "XML",
      print: "打印",
    },
    
    options: {
      currentPage: "当前页",
      allPages: "所有页",
      selectedRows: "选定行",
      customRange: "自定义范围",
    },
    
    status: {
      generating: "正在生成导出...",
      ready: "导出就绪",
      failed: "导出失败",
    },
  },
  
  // ===== 系统与管理 =====
  system: {
    settings: {
      title: "系统设置",
      general: "常规",
      appearance: "外观",
      notifications: "通知",
      security: "安全",
      integrations: "集成",
      backup: "备份与恢复",
      logs: "系统日志",
      maintenance: "维护",
    },
    
    users: {
      title: "用户管理",
      newUser: "新建用户",
      editUser: "编辑用户",
      resetPassword: "重置密码",
      deactivate: "停用",
      activate: "激活",
      roles: "分配角色",
    },
    
    roles: {
      title: "角色与权限",
      create: "创建角色",
      edit: "编辑角色",
      delete: "删除角色",
      permissions: "管理权限",
    },
    
    logs: {
      title: "系统日志",
      clear: "清除日志",
      export: "导出日志",
      filter: "筛选日志",
      severity: {
        debug: "调试",
        info: "信息",
        warning: "警告",
        error: "错误",
        critical: "严重",
      },
    },
    
    maintenance: {
      title: "维护",
      backup: "创建备份",
      restore: "恢复备份",
      cleanup: "清理数据",
      optimize: "优化数据库",
      update: "系统更新",
    },
  },
  
  // ===== 时间与日期格式 =====
  datetime: {
    formats: {
      shortDate: "YYYY/MM/DD",
      mediumDate: "YYYY年MM月DD日",
      longDate: "YYYY年MM月DD日",
      fullDate: "YYYY年MM月DD日 dddd",
      shortTime: "HH:mm",
      mediumTime: "HH:mm:ss",
      longTime: "HH:mm:ss.SSS",
      fullTime: "HH:mm:ss zzzz",
      shortDateTime: "YYYY/MM/DD HH:mm",
      mediumDateTime: "YYYY年MM月DD日 HH:mm:ss",
      longDateTime: "YYYY年MM月DD日 HH:mm:ss z",
      fullDateTime: "YYYY年MM月DD日 dddd HH:mm:ss zzzz",
    },
    
    relative: {
      justNow: "刚刚",
      secondsAgo: "{{count}} 秒前",
      secondsAgo_one: "1 秒前",
      minutesAgo: "{{count}} 分钟前",
      minutesAgo_one: "1 分钟前",
      hoursAgo: "{{count}} 小时前",
      hoursAgo_one: "1 小时前",
      daysAgo: "{{count}} 天前",
      daysAgo_one: "1 天前",
      weeksAgo: "{{count}} 周前",
      weeksAgo_one: "1 周前",
      monthsAgo: "{{count}} 个月前",
      monthsAgo_one: "1 个月前",
      yearsAgo: "{{count}} 年前",
      yearsAgo_one: "1 年前",
      
      inSeconds: "{{count}} 秒后",
      inSeconds_one: "1 秒后",
      inMinutes: "{{count}} 分钟后",
      inMinutes_one: "1 分钟后",
      inHours: "{{count}} 小时后",
      inHours_one: "1 小时后",
      inDays: "{{count}} 天后",
      inDays_one: "1 天后",
      inWeeks: "{{count}} 周后",
      inWeeks_one: "1 周后",
      inMonths: "{{count}} 个月后",
      inMonths_one: "1 个月后",
      inYears: "{{count}} 年后",
      inYears_one: "1 年后",
    },
    
    units: {
      second: "秒",
      second_one: "{{count}} 秒",
      second_other: "{{count}} 秒",
      minute: "分钟",
      minute_one: "{{count}} 分钟",
      minute_other: "{{count}} 分钟",
      hour: "小时",
      hour_one: "{{count}} 小时",
      hour_other: "{{count}} 小时",
      day: "天",
      day_one: "{{count}} 天",
      day_other: "{{count}} 天",
      week: "周",
      week_one: "{{count}} 周",
      week_other: "{{count}} 周",
      month: "月",
      month_one: "{{count}} 月",
      month_other: "{{count}} 月",
      year: "年",
      year_one: "{{count}} 年",
      year_other: "{{count}} 年",
    },
  },
  
  // ===== 复数规则 =====
  pluralization: {
    items: {
      item: "项目",
      item_one: "{{count}} 个项目",
      item_other: "{{count}} 个项目",
      record: "记录",
      record_one: "{{count}} 条记录",
      record_other: "{{count}} 条记录",
      file: "文件",
      file_one: "{{count}} 个文件",
      file_other: "{{count}} 个文件",
      user: "用户",
      user_one: "{{count}} 个用户",
      user_other: "{{count}} 个用户",
      customer: "客户",
      customer_one: "{{count}} 个客户",
      customer_other: "{{count}} 个客户",
      employee: "员工",
      employee_one: "{{count}} 名员工",
      employee_other: "{{count}} 名员工",
      invoice: "发票",
      invoice_one: "{{count}} 张发票",
      invoice_other: "{{count}} 张发票",
      product: "产品",
      product_one: "{{count}} 个产品",
      product_other: "{{count}} 个产品",
      order: "订单",
      order_one: "{{count}} 个订单",
      order_other: "{{count}} 个订单",
      project: "项目",
      project_one: "{{count}} 个项目",
      project_other: "{{count}} 个项目",
      document: "文档",
      document_one: "{{count}} 个文档",
      document_other: "{{count}} 个文档",
    },
    
    time: {
      day: "天",
      day_one: "{{count}} 天",
      day_other: "{{count}} 天",
      hour: "小时",
      hour_one: "{{count}} 小时",
      hour_other: "{{count}} 小时",
      minute: "分钟",
      minute_one: "{{count}} 分钟",
      minute_other: "{{count}} 分钟",
      second: "秒",
      second_one: "{{count}} 秒",
      second_other: "{{count}} 秒",
    },
  },
} as const;