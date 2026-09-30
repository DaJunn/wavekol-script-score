# wavekol-script-score

**直播话术评分** —— 按 7 个维度给话术打分 + 逐条查合规红线 + 评退款率风险 + 判断能不能上播

让 AI agent（DSH / Codex / Claude Code 等）使用。

## 解决什么问题

之前话术写完没人把关，合规风险靠经验判断，容易踩红线。

现在任意话术（生成器出的、带货者写的、同行抄来的都行）按 7 个维度打分，逐条查合规红线，评退款率风险，给出具体改进并明确判断**能不能上播**。

## 前置依赖

无需额外依赖，直接可用。

## 安装

```bash
git clone https://github.com/DaJunn/wavekol-script-score.git \
  ~/.agents/skills/wavekol-script-score
```

## 触发方式

对 agent 说：「评分这段话术」「这话术行不行」「话术体检」「帮我改改这段话术」「对标金标准看看差在哪」「话术合规吗」。


## 说明

- 合规是命门，红线逐条查
- 统一称「带货者」，不写「主播」「达人」

## 相关

- 完整技能合集见飞书文档《AI减负视频号运营技能合集》
- 更多 skill：https://github.com/DaJunn
