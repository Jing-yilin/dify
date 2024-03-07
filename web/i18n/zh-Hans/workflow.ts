const translation = {
  common: {
    editing: '编辑中',
    autoSaved: '自动保存',
    unpublished: '未发布',
    published: '已发布',
    publish: '发布',
    run: '运行',
    running: '运行中',
    inRunMode: '在运行模式中',
    inPreview: '预览中',
    inPreviewMode: '预览中',
    preview: '预览',
    viewRunHistory: '查看运行历史',
    runHistory: '运行历史',
    goBackToEdit: '返回编辑模式',
    conversationLog: '对话记录',
    features: '功能',
    debugAndPreview: '调试和预览',
    restart: '重新开始',
    currentDraft: '当前草稿',
    latestPublished: '最新发布',
    restore: '恢复',
  },
  singleRun: {
    testRun: '测试运行 ',
    startRun: '开始运行',
    running: '运行中',
  },
  tabs: {
    'searchBlock': '搜索节点',
    'blocks': '节点',
    'builtInTool': '内置工具',
    'customTool': '自定义工具',
    'question-understand': '问题理解',
    'logic': '逻辑',
    'transform': '转换',
    'utilities': '工具',
  },
  blocks: {
    'start': '开始',
    'end': '结束',
    'direct-answer': '直接回答',
    'llm': 'LLM',
    'knowledge-retrieval': '知识检索',
    'question-classifier': '问题分类器',
    'if-else': '条件分支',
    'code': '代码',
    'template-transform': '模板转换',
    'http-request': 'HTTP 请求',
    'variable-assigner': '变量赋值',
  },
  operator: {
    zoomIn: '放大',
    zoomOut: '缩小',
    zoomTo50: '缩放到 50%',
    zoomTo100: '放大到 100%',
    zoomToFit: '自适应视图',
  },
  panel: {
    userInputField: '用户输入字段',
    changeBlock: '更改节点',
    helpLink: '帮助链接',
    about: '关于',
    createdBy: '作者',
    nextStep: '下一步',
    addNextStep: '添加此工作流程中的下一个节点',
    selectNextStep: '选择下一个节点',
    runThisStep: '运行此步骤',
    checklist: '检查清单',
    checklistTip: '发布前确保所有问题均已解决',
    organizeBlocks: '整理节点',
  },
  nodes: {
    common: {
      outputVars: '输出变量',
      insertVarTip: '插入变量',
      memory: {
        memory: '记忆',
        memoryTip: '聊天记忆设置',
        windowSize: '记忆窗口',
        conversationRoleName: '对话角色名',
        user: '用户前缀',
        assistant: '助手前缀',
      },
    },
    start: {
      required: '必填',
      inputField: '输入字段',
      builtInVar: '内置变量',
      outputVars: {
        query: '用户输入',
        memories: {
          des: '会话历史',
          type: '消息类型',
          content: '消息内容',
        },
        files: '文件列表',
      },
      noVarTip: '设置的输入可在工作流程中使用',
    },
    end: {
      outputs: '输出',
      output: {
        type: '输出类型',
        variable: '输出变量',
      },
      type: {
        'none': '无',
        'plain-text': '纯文本',
        'structured': '结构化',
      },
    },
    directAnswer: {
      answer: '回复',
      inputVars: '输入变量',
    },
    llm: {
      model: '模型',
      variables: '变量',
      context: '上下文',
      contextTooltip: '您可以导入知识库作为上下文',
      prompt: '提示词',
      addMessage: '添加消息',
      roleDescription: 'TODO: Role Description',
      vision: '视觉',
      files: '文件',
      resolution: {
        name: '分辨率',
        high: '高',
        low: '低',
      },
      outputVars: {
        output: '生成内容',
        usage: '模型用量信息',
      },
      singleRun: {
        variable: '变量',
      },
    },
    knowledgeRetrieval: {
      queryVariable: '查询变量',
      knowledge: '知识库',
      outputVars: {
        output: '召回的分段',
        content: '分段内容',
        title: '分段标题',
        icon: '分段图标',
        url: '分段链接',
        metadata: '其他元数据',
      },
    },
    http: {
      inputVars: '输入变量',
      api: 'API',
      key: '键',
      value: '值',
      bulkEdit: '批量编辑',
      keyValueEdit: '键值编辑',
      headers: '响应头',
      params: '参数',
      body: '响应内容',
      outputVars: {
        body: '响应内容',
        statusCode: '响应状态码',
        headers: '响应头列表 JSON',
      },
      authorization: {
        'authorization': '鉴权',
        'authorizationType': '鉴权类型',
        'no-auth': '无',
        'api-key': 'API-Key',
        'auth-type': 'API 鉴权类型',
        'basic': '基础',
        'bearer': 'Bearer',
        'custom': '自定义',
        'api-key-title': 'API Key',
        'header': 'Header',
      },
    },
    code: {
      inputVars: '输入变量',
      outputVars: '输出变量',
    },
    templateTransform: {
      inputVars: '输入变量',
      code: '代码',
      codeSupportTip: '只支持 Jinja2',
      outputVars: {
        output: '转换后内容',
      },
    },
    ifElse: {
      conditions: '条件',
      if: 'If',
      else: 'Else',
      elseDescription: '用于定义当 if 条件不满足时应执行的逻辑。',
      and: 'and',
      or: 'or',
      comparisonOperator: {
        'contains': '包含',
        'not contains': '不包含',
        'start with': '开始是',
        'end with': '结束是',
        'is': '是',
        'is not': '不是',
        'empty': '为空',
        'not empty': '不为空',
        'null': '空',
        'not null': '不为空',
      },
      enterValue: '输入值',
      addCondition: '添加条件',
    },
    variableAssigner: {
      title: '变量赋值',
      outputType: '输出类型',
      outputVarType: '输出变量类型',
      varNotSet: '未设置变量',
      noVarTip: '添加需要赋值的变量',
      type: {
        string: 'String',
        number: 'Number',
        object: 'Object',
        array: 'Array',
      },
    },
    tool: {
      toAuthorize: '授权',
      inputVars: '输入变量',
    },
    questionClassifiers: {
      model: '模型',
      inputVars: '输入变量',
      class: '分类',
      classNamePlaceholder: '输入你的分类名称',
      advancedSetting: '高级设置',
      topicPlaceholder: '在这里输入你的主题内容',
      addClass: '添加分类',
      instruction: '指令',
      instructionPlaceholder: '在这里输入你的指令',
    },
  },
}

export default translation
