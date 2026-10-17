# 智航罗盘 (AI Compass) 🧭

> **大学生专属 AI 智能进阶与竞赛定制导航平台**  
> 识别真实用户痛点，用 AI 算力为每一位求知者点亮个性化大学成长路标。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Responsive: Mobile & Desktop](https://img.shields.io/badge/Responsive-Mobile%20%26%20Desktop-emerald.svg)]()
[![Pure Modern Web](https://img.shields.io/badge/Stack-HTML5%20%2B%20Tailwind%20%2B%20JS-indigo.svg)]()

---

## 🌟 项目亮点

1. **真实需求痛点破局**：针对当代大学生“千人一面、信息过载、跨界困难、竞赛组队迷茫”痛点，提供真正有价值的个性化 AI 解决路径。
2. **最有价值的 AI 核心功能**：
   * **多维画像深度诊断**：基于专业、年级、基础、时间、诉求 5 维数据建模；
   * **五维能力雷达与避坑警示**：直击痛点，指出最容易浪费时间的误区；
   * **阶梯式 4 阶段时间线**：破冰、内功、实战、竞赛，带任务打卡与本地持久化；
   * **高校竞赛智能匹配**：精选国家级赛事，附带团队角色生态位定位建议。
3. **极佳的多端交互体验**：完美自适应桌面端与移动端（手机扫码即用），内置粒子庆祝动效与抽屉式路线领航导师。
4. **开箱即用 & 零摩擦评审**：
   * 搭载内置高保真实时推理库，评委无需输入任何 API Key 即可 1 秒体验完整生成流程；
   * 亦支持一键配置接入真实大模型（OpenAI / DeepSeek / Kimi 兼容接口）。

---

## 📁 提交材料与项目文件清单

```text
ai-compass/
├── index.html         # 核心交互 Web App 页面（响应式、Tailwind CSS、Chart.js）
├── app.js             # 核心逻辑：状态管理、AI 规划合成、雷达图、打卡缓存、导师问答
├── server.py          # 本地极速启动脚本（Python 标准库，零第三方依赖，自动弹窗）
├── PRODUCT_SPEC.md    # 【提交材料 5】简要产品说明（目标用户、痛点、功能、演进）
├── AI_LOG.md          # 【提交材料 4】《AI 使用记录》（深度回答全部 7 个必答公开问题）
├── DEMO_SCRIPT.md     # 【提交材料 3】2～3 分钟作品演示视频分镜与解说脚本
└── README.md          # 本项目主说明文档
```

---

## 🚀 本地极速运行（3秒启动）

本项目采用现代零依赖架构，无需安装臃肿的 node_modules，只要电脑有 Python 即可一键运行：

```bash
# 1. 切换至项目目录
cd C:\Users\COLORFUL\.gemini\antigravity\scratch\ai-compass

# 2. 启动本地服务器
python server.py
```

终端将打印：
```text
🚀 智航罗盘 AI Compass 已成功启动！
👉 本地访问地址: http://localhost:8000
```
浏览器将自动弹出打开页面；手机连同一 Wi-Fi 输入电脑 IP:8000 即可进行移动端调试。

---

## 🌐 免费公网一键部署指南（获取评委直接访问网址）

评委要求提供**“可直接访问的公网作品网址”**。由于本项目为纯静态现代 Web 架构，可以通过以下任意一种平台在 **60 秒内免费上线并获得永久 HTTPS 域名**：

### 方式一：Vercel（强烈推荐，全球 CDN 极速访问）
1. 在 GitHub 上创建一个新仓库（如 `ai-compass`），将本项目文件上传或推送（Push）上去；
2. 打开 [Vercel.com](https://vercel.com)，点击 **Add New Project** 并导入该 GitHub 仓库；
3. Framework Preset 选择 **Other**，Root Directory 保持默认，点击 **Deploy**；
4. 几秒钟后即可获得专属网址（如 `https://ai-compass-xyz.vercel.app`）。

### 方式二：GitHub Pages（全免费）
1. 将项目推送到 GitHub 仓库；
2. 进入仓库的 **Settings** -> **Pages**；
3. 在 **Branch** 处选择 `main` 分支根目录 `/ (root)`，点击 **Save**；
4. 稍等 1 分钟即可生成访问网址：`https://<你的用户名>.github.io/ai-compass/`。

### 方式三：Netlify / Cloudflare Pages（拖拽即上线）
1. 打开 [Netlify Drop](https://app.netlify.com/drop)；
2. 直接将 `ai-compass` 整个文件夹拖拽进网页窗口；
3. 瞬间生成可公开访问的测试网址！

---

## 💡 评委快速评审操作建议

1. **一键填入典型画像**：
   * 点击右上角 **“⚡ 评委速测预设”** 下拉菜单，选择【案例 1】或【案例 2】；
   * 表单将自动填满预设数据，点击 **“生成我的专属 AI 导航路线图”**；
2. **体验核心交互**：
   * 观察五维雷达图与避坑警示；
   * 点击阶段一、阶段二任务旁边的复选框，体验**“打卡划线 + 粒子动效”**；
   * 点击 **“导出学习手册”**，体验即时下载的 Markdown 规划文档；
   * 点击底部 **“打开路线专属导师”**，在右侧抽屉输入任意问题（如“没有显卡怎么学？”），体验实时智能交互。
