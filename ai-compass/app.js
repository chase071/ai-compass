/**
 * 智航罗盘 AI Compass - Core Application Logic
 * 支持真实大模型 API 接入 (OpenAI/DeepSeek/Kimi 格式) 与高保真内置推理引擎
 */

// ================= 全局状态与预设数据 =================
const APP_STATE = {
  currentProfile: null,
  currentRoadmap: null,
  radarChartInstance: null,
  completedTasks: new Set(),
  chatHistory: []
};

// 典型学生画像预设（供评委速测）
const PRESET_PROFILES = {
  preset_non_cs: {
    major: "新闻传播/文学/外语/法学",
    grade: "大二（技能筑基期）",
    codingBase: "零基础，从没写过代码",
    weeklyHours: "8-12 小时（常规课外自修节奏）",
    goal: "参加学科竞赛（挑战杯/互联网+/省市级AI赛），拿奖加分保研",
    notes: "想做AI跨界创意产品，不懂底层代码，需要轻代码/No-code与Prompt工程路径"
  },
  preset_eng: {
    major: "自动化/电子信息/通信工程",
    grade: "大二（技能筑基期）",
    codingBase: "有基础C/Python语法，写过小作业",
    weeklyHours: "15-25 小时（集中突破/冲刺备赛）",
    goal: "进入实验室科研课题组，发表学术论文与保研加分",
    notes: "希望将视觉大模型(VLM)或具身智能与单片机硬件结合"
  },
  preset_cs: {
    major: "计算机科学与技术/软件工程",
    grade: "大三（竞赛科研冲刺期）",
    codingBase: "熟悉数据结构与算法，能独立写项目",
    weeklyHours: "15-25 小时（集中突破/冲刺备赛）",
    goal: "掌握大模型应用开发与全栈工程能力，准备大厂实习/求职",
    notes: "主攻 Agent 智能体系统、RAG 知识库检索增强与全栈落地"
  }
};

// ================= 初始化与事件绑定 =================
document.addEventListener("DOMContentLoaded", () => {
  // 加载本地存储的已完成任务
  const savedTasks = localStorage.getItem("ai_compass_completed_tasks");
  if (savedTasks) {
    try {
      APP_STATE.completedTasks = new Set(JSON.parse(savedTasks));
    } catch (e) {
      console.warn("读取本地打卡记录失败", e);
    }
  }

  // 加载本地存储的 API 设置
  loadSavedApiSettings();

  // 默认加载一次演示，提供良好的即刻首屏感知
  loadPresetProfile("preset_non_cs", false);
});

// 平滑滚动至诊断区域
function scrollToDiagnosis() {
  const section = document.getElementById("diagnosisSection");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// 一键加载预设学生画像
function loadPresetProfile(presetKey, autoGenerate = true) {
  if (!presetKey || !PRESET_PROFILES[presetKey]) return;
  const p = PRESET_PROFILES[presetKey];

  document.getElementById("userMajor").value = p.major;
  document.getElementById("userGrade").value = p.grade;
  document.getElementById("userCodingBase").value = p.codingBase;
  document.getElementById("userWeeklyHours").value = p.weeklyHours;
  document.getElementById("userGoal").value = p.goal;
  document.getElementById("userNotes").value = p.notes;

  if (autoGenerate) {
    handleGenerateRoadmap();
  }
}

// ================= 核心 AI 生成逻辑 =================
async function handleGenerateRoadmap(event) {
  if (event) event.preventDefault();

  // 收集用户画像表单数据
  const profile = {
    major: document.getElementById("userMajor").value,
    grade: document.getElementById("userGrade").value,
    codingBase: document.getElementById("userCodingBase").value,
    weeklyHours: document.getElementById("userWeeklyHours").value,
    goal: document.getElementById("userGoal").value,
    notes: document.getElementById("userNotes").value.trim()
  };
  APP_STATE.currentProfile = profile;

  // 显示加载动效
  const genBox = document.getElementById("generatingState");
  const dashBox = document.getElementById("resultsDashboard");
  const genBtn = document.getElementById("generateBtn");
  const bar = document.getElementById("generatingBar");
  const statusText = document.getElementById("generatingStatusText");

  genBox.classList.remove("hidden");
  dashBox.classList.add("hidden");
  genBtn.disabled = true;
  genBtn.classList.add("opacity-60", "cursor-not-allowed");

  // 模拟进度条与分析状态
  bar.style.width = "30%";
  statusText.textContent = `正在为【${profile.major} · ${profile.grade}】建立多维特征模型...`;

  setTimeout(() => {
    bar.style.width = "75%";
    statusText.textContent = `正在对齐 2026 最新竞赛日程与能力图谱库...`;
  }, 400);

  try {
    // 检查是否配置了真实 API
    const apiSettings = getApiSettings();
    let roadmapData = null;

    if (apiSettings.apiKey && apiSettings.apiUrl) {
      // 真实大模型 API 调用
      statusText.textContent = `已连接 ${apiSettings.model || "大模型"}，正在进行实时结构化推理...`;
      roadmapData = await callRealLLMApi(profile, apiSettings);
    }

    // 如果未配置或 API 调用失败，使用高保真内置推理引擎生成深度客制化路线
    if (!roadmapData) {
      roadmapData = generateSynthesizedRoadmap(profile);
    }

    bar.style.width = "100%";
    statusText.textContent = "生成完成！正在渲染交互式图谱...";

    setTimeout(() => {
      APP_STATE.currentRoadmap = roadmapData;
      renderRoadmapDashboard(roadmapData);

      genBox.classList.add("hidden");
      dashBox.classList.remove("hidden");
      genBtn.disabled = false;
      genBtn.classList.remove("opacity-60", "cursor-not-allowed");

      // 滚动到结果页
      dashBox.scrollIntoView({ behavior: "smooth" });
      triggerConfettiCelebrate();
    }, 350);

  } catch (err) {
    console.error("生成失败:", err);
    alert("生成过程遇到小问题，已自动切换为内置高保真引擎恢复。");
    const fallbackData = generateSynthesizedRoadmap(profile);
    APP_STATE.currentRoadmap = fallbackData;
    renderRoadmapDashboard(fallbackData);
    genBox.classList.add("hidden");
    dashBox.classList.remove("hidden");
    genBtn.disabled = false;
    genBtn.classList.remove("opacity-60", "cursor-not-allowed");
  }
}

// ================= 高保真自适应生成引擎 =================
function generateSynthesizedRoadmap(profile) {
  const isZero = profile.codingBase.includes("零基础");
  const isCS = profile.major.includes("计算机");
  const isInterdisciplinary = !isCS;
  const isContestGoal = profile.goal.includes("竞赛");
  const isResearchGoal = profile.goal.includes("科研") || profile.goal.includes("论文");
  const isJobGoal = profile.goal.includes("求职") || profile.goal.includes("实习");

  // 计算五维雷达初始能力值
  let radarScores = [40, 30, 45, 35, 75]; // [理论基础, 工程代码, 算法思维, 赛事视野, 跨界融合]
  if (isCS) {
    radarScores = [65, 70, 75, 60, 50];
  } else if (profile.major.includes("数学") || profile.major.includes("自动化")) {
    radarScores = [75, 55, 70, 50, 70];
  } else if (isZero) {
    radarScores = [35, 20, 40, 45, 88];
  }

  // 定制避坑指南
  let pitfall = "";
  if (isZero || isInterdisciplinary) {
    pitfall = `【警惕深奥公式陷阱】：千万不要花几个月从微积分和反向传播推导硬啃！你的最大优势在于“专业背景痛点洞察”，首选善用 Cursor/Claude 等 AI 辅助编程，快速搭建原型（POC），直接打挑战杯或互联网+交叉赛道。`;
  } else if (isCS && isJobGoal) {
    pitfall = `【警惕套壳玩具陷阱】：不要只做一个简单的 Chatbot 套壳就完事。评委和面试官极度看重“工程完备性”——必须体现 Agent 自主规划、Prompt 鲁棒性防注入、评测体系(Eval)与流式性能优化。`;
  } else {
    pitfall = `【警惕单打独斗陷阱】：高等级竞赛与科研非常看重多学科互补。切忌一个人既写论文又做展示又写代码，及时寻找不同背景队友（如工科+商科+设计）组建梯队。`;
  }

  // 定制策略要点
  const strategyPoints = [
    `<strong>差异化定位</strong>：立足于【${profile.major}】的真实业务痛点，将大模型作为“杠杆”，打造具有独特领域壁垒的 AI 创新方案。`,
    `<strong>时间分配公式</strong>：按每周投入 ${profile.weeklyHours.split("（")[0]}，建议采取「30% 核心概念研读 + 50% 动手改写开源项目 + 20% 商业/答辩材料沉淀」的黄金配比。`,
    `<strong>破局突破口</strong>：避开从头训练大模型的高算力红海，聚焦于「小切口、深垂类、轻量部署」的特定场景解决方案。`
  ];

  // 四阶段动态进阶路线规划
  const phases = [
    {
      step: 1,
      title: "阶段一：认知破冰与工具链装配",
      timeline: "第 1 - 2 周",
      statusBadge: "破冰基础",
      description: isZero 
        ? "快速掌握现代 AI 编程辅助工具，跑通第一个可交互的智能体原型，消除对代码的恐惧。"
        : "系统梳理 Transformer、LLM 运行机理，配置本地与云端开发测试环境。",
      tasks: isZero ? [
        { text: "学会使用 Cursor / Antigravity 生成基础网页界面与表单", checked: false },
        { text: "掌握 Prompt 结构化编写（角色+背景+约束+输出格式）", checked: true },
        { text: "调用主流大模型开放平台 API 完成一次简单的问答调用", checked: false },
        { text: "完成 GitHub 账号注册与基本项目 Fork 操作", checked: false }
      ] : [
        { text: "深入精读 Attention is All You Need 核心注意力机制核心公式", checked: false },
        { text: "搭建 Python 3.12 虚拟环境并配置 PyTorch 与 Hugging Face Transformers", checked: true },
        { text: "基于 LangChain / LlamaIndex 跑通第一个本地文档问答系统 (RAG)", checked: false },
        { text: "测试并对比 3 款开源大模型（Qwen2.5/Llama3/DeepSeek）的 API 调用差异", checked: false }
      ],
      resources: [
        { name: "吴恩达《面向开发者的 Prompt 提示词工程》", tag: "必看视频" },
        { name: "Hugging Face 官方开放文档与 Pipeline 教学", tag: "官方教程" }
      ]
    },
    {
      step: 2,
      title: "阶段二：核心技术筑基与轻量实战",
      timeline: "第 3 - 5 周",
      statusBadge: "硬核内功",
      description: "围绕目标方向进行模块化技能突破，完成一个具备真实实用价值的最小可用产品 (MVP)。",
      tasks: [
        { text: "设计结构化数据接口 (JSON Schema)，确保 AI 输出具备稳定性与前端可解析性", checked: false },
        { text: "实现打字机流式输出 (Server-Sent Events / Streaming API) 提升前端响应感知", checked: false },
        { text: "加入错误重试机制与输入安全性过滤 (Guardrails)", checked: false },
        { text: "完成多端适配，使手机与电脑均能正常体验核心流程", checked: false }
      ],
      resources: [
        { name: "Tailwind CSS 极简响应式实战手册", tag: "前端利器" },
        { name: "LangChain 进阶：如何构建可靠的 Tool Calling 智能体", tag: "架构实战" }
      ]
    },
    {
      step: 3,
      title: "阶段三：领域垂直项目深耕与调优",
      timeline: "第 6 - 8 周",
      statusBadge: "实战进阶",
      description: `结合【${profile.major}】具体应用场景，引入真实业务数据与领域知识库，打造属于你的代表作。`,
      tasks: [
        { text: "收集并清洗专业领域的 100+ 份高质量问答语料或知识文档", checked: false },
        { text: "构建向量索引并进行混合检索 (BM25 + 语义向量嵌入) 精度调优", checked: false },
        { text: "设计基准测试集 (Eval Dataset)，量化对比 AI 在专业任务中的准确率", checked: false },
        { text: "制作 1 分钟高清交互演示 GIF 与产品架构逻辑脑图", checked: false }
      ],
      resources: [
        { name: "RAG 检索增强生成前沿优化论文汇总", tag: "进阶研读" },
        { name: "GitHub 热门开源：Agent 智能体设计模式全景", tag: "开源精选" }
      ]
    },
    {
      step: 4,
      title: "阶段四：竞赛路演与成果加分冲刺",
      timeline: "第 9 - 12 周",
      statusBadge: "成果变现",
      description: "提炼商业计划书 (BP)、专利/软著或学术论文框架，形成具备评委说服力的完整成果包。",
      tasks: [
        { text: "梳理项目创新点，用「痛点-现有方案缺陷-本产品解决方案-壁垒」撰写汇报材料", checked: false },
        { text: "录制 2-3 分钟一镜到底产品实测演示视频", checked: false },
        { text: "将项目一键部署至公网 (Vercel/Cloudflare)，生成无障碍访问网址", checked: false },
        { text: "申请一项软件著作权登记 (软著) 或提交竞赛报名申报书", checked: false }
      ],
      resources: [
        { name: "国奖项目商业计划书 (BP) 黄金排版逻辑模版", tag: "竞赛必备" },
        { name: "高教社全国高校竞赛排行榜官方评分准则解读", tag: "答辩锦囊" }
      ]
    }
  ];

  // 匹配赛事推荐
  const competitions = [];
  if (isContestGoal || isInterdisciplinary) {
    competitions.push({
      name: "中国国际大学生创新大赛（原互联网+）",
      badge: "国家级 A 类 / 极高含金量",
      matchScore: "98%",
      roleTip: isZero ? "建议担任项目发起人/队长，主抓痛点场景落地与路演答辩" : "负责技术架构演练与核心原型搭建",
      desc: "极度看重产品落地性与社会/行业价值。你所在专业的垂直应用非常容易在交叉赛道脱颖而出！",
      color: "border-red-200 bg-red-50/40 text-red-900"
    });
  }

  competitions.push({
    name: "“挑战杯”全国大学生课外学术科技作品竞赛",
    badge: "学术/科技 A 类顶级",
    matchScore: "94%",
    roleTip: "提炼 AI 算法与专业交叉的独创方法论，撰写科技发明报告",
    desc: "注重科技创新性与实际应用。适合将 AI 作为解决传统专业难题的核心科技支撑。",
    color: "border-brand-200 bg-brand-50/40 text-brand-900"
  });

  competitions.push({
    name: "中国大学生计算机设计大赛 / 百度飞桨 / 阿里云天池 AI 创新赛",
    badge: "计算机专业权威赛事",
    matchScore: "91%",
    roleTip: "完整交付一个高交互 Web 原型系统与作品说明书",
    desc: "设有人工智能应用专门赛道，对非纯算法研究、重视产品体验的实战作品非常友好。",
    color: "border-teal-200 bg-teal-50/40 text-teal-900"
  });

  return {
    metaId: `COMPASS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `为【${profile.major}】${profile.grade}定制的 AI 跨越进阶路线`,
    summary: `目标设定：${profile.goal}。系统已为你规划 4 个递进里程碑，重点攻坚「${isZero ? "Prompt 工程与轻代码原型落地" : "大模型 Agent 架构与全栈交付"}」。`,
    radarScores: radarScores,
    strategyPoints: strategyPoints,
    pitfall: pitfall,
    phases: phases,
    competitions: competitions
  };
}

// ================= 渲染结果仪表盘 =================
function renderRoadmapDashboard(data) {
  // 1. 基础标题与摘要
  document.getElementById("resultMetaBadge").textContent = `ID: ${data.metaId}`;
  document.getElementById("resultTitle").textContent = data.title;
  document.getElementById("resultSummary").textContent = data.summary;

  // 2. 策略要点与避坑指南
  const strategyContainer = document.getElementById("aiStrategyContent");
  strategyContainer.innerHTML = data.strategyPoints
    .map(pt => `<div class="flex items-start gap-2.5"><i class="fa-solid fa-check text-emerald-500 mt-1 shrink-0 text-xs"></i><p>${pt}</p></div>`)
    .join("");

  document.getElementById("aiPitfallContent").textContent = data.pitfall;

  // 3. 渲染五维雷达图
  renderRadarChart(data.radarScores);

  // 4. 渲染阶梯式 4 阶段时间线
  const phasesContainer = document.getElementById("phasesContainer");
  phasesContainer.innerHTML = data.phases.map(phase => {
    return `
      <div class="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm transition hover:border-brand-300">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
          <div class="flex items-center space-x-3">
            <span class="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              ${phase.step}
            </span>
            <div>
              <h4 class="text-sm sm:text-base font-bold text-slate-900">${phase.title}</h4>
              <p class="text-[11px] text-slate-500">${phase.description}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
              <i class="fa-regular fa-calendar-check mr-1"></i> ${phase.timeline}
            </span>
            <span class="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-semibold border border-brand-200">
              ${phase.statusBadge}
            </span>
          </div>
        </div>

        <!-- Checklist Tasks -->
        <div class="space-y-2.5 pt-1">
          <div class="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i class="fa-solid fa-list-check text-brand-600"></i>
            <span>阶段关键任务与达标动作：</span>
          </div>
          ${phase.tasks.map((task, idx) => {
            const taskId = `task_${phase.step}_${idx}`;
            const isChecked = APP_STATE.completedTasks.has(taskId) || task.checked;
            return `
              <label class="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer select-none">
                <input type="checkbox" id="${taskId}" onchange="toggleTaskCompletion('${taskId}')" ${isChecked ? "checked" : ""} class="mt-0.5 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 transition cursor-pointer">
                <span class="text-xs text-slate-700 leading-snug ${isChecked ? 'line-through text-slate-400' : ''}">${task.text}</span>
              </label>
            `;
          }).join("")}
        </div>

        <!-- Recommended Learning Resources -->
        ${phase.resources && phase.resources.length > 0 ? `
          <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span class="text-[10px] text-slate-400 font-semibold">推荐攻坚资源：</span>
            ${phase.resources.map(res => `
              <span class="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                <i class="fa-solid fa-book-bookmark text-brand-600"></i>
                <span>${res.name}</span>
                <span class="text-[9px] px-1 bg-white rounded text-slate-500">${res.tag}</span>
              </span>
            `).join("")}
          </div>
        ` : ''}
      </div>
    `;
  }).join("");

  // 5. 渲染比赛推荐卡片
  const compContainer = document.getElementById("competitionsContainer");
  compContainer.innerHTML = data.competitions.map(comp => {
    return `
      <div class="rounded-2xl p-5 border ${comp.color} shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between gap-1 mb-2">
            <span class="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white shadow-xs">
              ${comp.badge}
            </span>
            <span class="text-xs font-bold text-brand-700 flex items-center gap-1">
              <i class="fa-solid fa-fire text-amber-500"></i> 契合度 ${comp.matchScore}
            </span>
          </div>
          <h4 class="text-sm font-bold text-slate-900 leading-snug">${comp.name}</h4>
          <p class="text-xs text-slate-600 mt-2 leading-relaxed">${comp.desc}</p>
        </div>

        <div class="pt-3 border-t border-slate-200/60">
          <div class="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
            <i class="fa-solid fa-users text-brand-600"></i>
            <span>战队角色定位建议：</span>
          </div>
          <p class="text-xs text-slate-700 bg-white/70 p-2.5 rounded-lg border border-slate-200/50">${comp.roleTip}</p>
        </div>
      </div>
    `;
  }).join("");
}

// ================= 雷达图绘制 (Chart.js) =================
function renderRadarChart(scores) {
  const ctx = document.getElementById("radarChart");
  if (!ctx) return;

  if (APP_STATE.radarChartInstance) {
    APP_STATE.radarChartInstance.destroy();
  }

  APP_STATE.radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['理论深度', '工程代码', '算法思维', '竞赛视野', '跨界融合'],
      datasets: [{
        label: '当前画像指数',
        data: scores,
        fill: true,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: 'rgb(79, 70, 229)',
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(79, 70, 229)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(203, 213, 225, 0.6)' },
          grid: { color: 'rgba(226, 232, 240, 0.8)' },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false, stepSize: 20 },
          pointLabels: {
            font: { size: 11, family: 'Inter, system-ui' },
            color: '#475569'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// ================= 打卡与交互动作 =================
function toggleTaskCompletion(taskId) {
  const checkbox = document.getElementById(taskId);
  if (!checkbox) return;

  if (checkbox.checked) {
    APP_STATE.completedTasks.add(taskId);
    triggerConfettiCelebrate();
  } else {
    APP_STATE.completedTasks.delete(taskId);
  }

  // 联动更新文本删除线
  const labelText = checkbox.nextElementSibling;
  if (labelText) {
    if (checkbox.checked) {
      labelText.classList.add('line-through', 'text-slate-400');
    } else {
      labelText.classList.remove('line-through', 'text-slate-400');
    }
  }

  localStorage.setItem("ai_compass_completed_tasks", JSON.stringify(Array.from(APP_STATE.completedTasks)));
}

// 庆祝粒子动效
function triggerConfettiCelebrate() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
  }
}

// ================= 导出 Markdown 学习手册 =================
function exportRoadmapMarkdown() {
  if (!APP_STATE.currentRoadmap) {
    alert("请先生成路线图！");
    return;
  }

  const d = APP_STATE.currentRoadmap;
  let md = `# 智航罗盘 AI Compass - 专属个性化成长导航手册\n\n`;
  md += `> 生成时间：${new Date().toLocaleDateString()} | 档案编号：${d.metaId}\n\n`;
  md += `## 一、诊断与破局策略\n`;
  md += `${d.summary}\n\n`;
  md += `### 避坑警示：\n> ${d.pitfall}\n\n`;
  md += `## 二、阶梯式四阶段学习路线\n\n`;

  d.phases.forEach(p => {
    md += `### ${p.title} (${p.timeline})\n`;
    md += `${p.description}\n\n`;
    md += `**关键任务列表：**\n`;
    p.tasks.forEach(t => {
      md += `- [ ] ${t.text}\n`;
    });
    md += `\n`;
  });

  md += `## 三、推荐重点冲刺赛事\n\n`;
  d.competitions.forEach(c => {
    md += `### ${c.name} (匹配度 ${c.matchScore})\n`;
    md += `- **定位与组队建议**：${c.roleTip}\n`;
    md += `- **备赛指南**：${c.desc}\n\n`;
  });

  // 触发浏览器直接下载
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `AI-Compass-Roadmap-${d.metaId}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ================= AI 专属导师抽屉与问答 =================
function toggleTutorChat(show) {
  const drawer = document.getElementById("tutorDrawer");
  const panel = document.getElementById("tutorDrawerPanel");
  if (!drawer || !panel) return;

  if (show) {
    drawer.classList.remove("opacity-0", "pointer-events-none");
    panel.classList.remove("translate-x-full");
    document.getElementById("tutorInput")?.focus();
  } else {
    drawer.classList.add("opacity-0", "pointer-events-none");
    panel.classList.add("translate-x-full");
  }
}

async function handleTutorSend(event) {
  if (event) event.preventDefault();
  const input = document.getElementById("tutorInput");
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById("tutorMessages");

  // 添加用户消息气泡
  messagesBox.innerHTML += `
    <div class="flex items-start justify-end space-x-2">
      <div class="p-3 bg-brand-600 text-white rounded-2xl rounded-tr-none shadow-sm max-w-[85%] leading-relaxed">
        ${escapeHtml(text)}
      </div>
    </div>
  `;
  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // AI 回复占位
  const aiBubbleId = `reply_${Date.now()}`;
  messagesBox.innerHTML += `
    <div class="flex items-start space-x-2.5">
      <div class="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs shrink-0">
        <i class="fa-solid fa-compass"></i>
      </div>
      <div id="${aiBubbleId}" class="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-slate-700 leading-relaxed">
        <span class="inline-flex items-center gap-1.5 text-slate-400">
          <i class="fa-solid fa-circle-notch fa-spin text-xs"></i> 正在结合你的路线深度解答...
        </span>
      </div>
    </div>
  `;
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // 模拟/真实调用回答
  setTimeout(() => {
    const bubble = document.getElementById(aiBubbleId);
    if (!bubble) return;

    let response = "";
    const lower = text.toLowerCase();
    const profile = APP_STATE.currentProfile || {};

    if (lower.includes("显卡") || lower.includes("算力") || lower.includes("没有电脑") || lower.includes("配置")) {
      response = `针对没有高配独立显卡的同学，强烈推荐 3 种低成本破局方案：<br>
      1. **善用云端免费算力**：Google Colab（免费提供 T4/V100 GPU 额度）以及 Kaggle Notebooks（每周提供免费 30 小时 GPU）；<br>
      2. **端侧轻量化模型**：使用 Ollama 运行量化后的 <code>Qwen2.5-1.5B</code> 或 <code>Llama3.2-3B</code>，普通轻薄本 CPU 就能流畅运行；<br>
      3. **API 驱动开发**：大模型应用落地核心在于 Prompt、Agent 和 RAG 工程，直接调用各大平台开放 API，本地只写网页与逻辑，对电脑配置几乎零要求！`;
    } else if (lower.includes("角色") || lower.includes("分工") || lower.includes("队友") || lower.includes("文科") || lower.includes("非计科")) {
      response = `在高校竞赛（如挑战杯、互联网+）中，**纯代码技术只能决定下限，跨界整合与商业转化才决定上限**！<br>
      非计算机专业同学在队伍里通常担任黄金核心：<br>
      • **产品经理 / 场景定义官**：挖掘真实痛点，撰写高说服力申报书；<br>
      • **Prompt & Eval 评测工程师**：用自然语言编写高准确率提示词，制定行业评测标准；<br>
      • **路演答辩人**：将晦涩技术转化为评委听得懂的社会价值与经济价值。`;
    } else {
      response = `关于「${escapeHtml(text)}」：在你的【${profile.major || "当前专业"}】规划中，建议将此问题作为【阶段二】的核心实践要点。<br>
      你可以优先从 GitHub 寻找对应关键词的经典开源仓库，先在本地跑通 <code>README.md</code> 中的最小示例，再逐步将它改造适配为你的竞赛作品核心组件。`;
    }

    bubble.innerHTML = response;
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }, 600);
}

// ================= API 设置管理 =================
function toggleSettingsModal(show) {
  const modal = document.getElementById("settingsModal");
  if (!modal) return;
  modal.classList.toggle("hidden", !show);
}

function saveApiSettings() {
  const url = document.getElementById("settingApiUrl").value.trim();
  const key = document.getElementById("settingApiKey").value.trim();
  const model = document.getElementById("settingApiModel").value.trim();

  const settings = { apiUrl: url, apiKey: key, model: model };
  localStorage.setItem("ai_compass_api_settings", JSON.stringify(settings));
  toggleSettingsModal(false);
  alert("API 配置已保存至浏览器本地！后续生成将尝试直接调用该大模型。");
}

function loadSavedApiSettings() {
  const raw = localStorage.getItem("ai_compass_api_settings");
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (document.getElementById("settingApiUrl")) document.getElementById("settingApiUrl").value = s.apiUrl || "";
      if (document.getElementById("settingApiKey")) document.getElementById("settingApiKey").value = s.apiKey || "";
      if (document.getElementById("settingApiModel")) document.getElementById("settingApiModel").value = s.model || "";
    } catch (e) {
      console.warn("解析 API 配置失败", e);
    }
  }
}

function getApiSettings() {
  const raw = localStorage.getItem("ai_compass_api_settings");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

// 辅助方法：字符转义
function escapeHtml(string) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}

// ================= 真实大模型 API 调用适配器 =================
async function callRealLLMApi(profile, settings) {
  const prompt = `你是一位顶级高校计算机与人工智能学科带头人兼国家级科技竞赛评审专家。
请根据以下大学生的多维背景与诉求，为TA生成个性化【AI进阶路线与竞赛导航方案】：

【学生档案】：
- 专业大类：${profile.major}
- 当前年级：${profile.grade}
- 编程基础：${profile.codingBase}
- 每周可投入时间：${profile.weeklyHours}
- 核心诉求与目标：${profile.goal}
- 补充与特殊要求：${profile.notes || "无"}

【必须严格以合法 JSON 格式输出，禁止任何多余解释与 Markdown 代码块标签】：
{
  "metaId": "COMPASS-2026-LIVE",
  "title": "简明有力的路线总标题",
  "summary": "一句话诊断结论与核心破局点",
  "radarScores": [理论分数, 代码分数, 算法分数, 竞赛视野, 跨界融合], // 5个 0-100 的整数
  "strategyPoints": ["策略要点1", "策略要点2", "策略要点3"],
  "pitfall": "针对其背景的具体避坑警告",
  "phases": [
    {
      "step": 1,
      "title": "阶段一名称",
      "timeline": "第 1-2 周",
      "statusBadge": "标签",
      "description": "阶段目标说明",
      "tasks": [
        {"text": "具体任务1", "checked": false},
        {"text": "具体任务2", "checked": false}
      ],
      "resources": [
        {"name": "资源名称", "tag": "类型"}
      ]
    }
  ],
  "competitions": [
    {
      "name": "赛事全称",
      "badge": "级别",
      "matchScore": "95%",
      "roleTip": "队伍角色建议",
      "desc": "备赛建议",
      "color": "border-brand-200 bg-brand-50/40 text-brand-900"
    }
  ]
}`;

  let endpoint = settings.apiUrl.replace(/\/+$/, "");
  if (!endpoint.endsWith("/chat/completions")) {
    endpoint += "/chat/completions";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model || "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert AI education and competition mentor. Always respond with clean, valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6
    })
  });

  if (!response.ok) {
    throw new Error(`API 响应异常: HTTP ${response.status}`);
  }

  const resJson = await response.json();
  const rawText = resJson.choices?.[0]?.message?.content || "";
  
  // 提取清洗 JSON
  const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedJson);
}
