# 直播话术评分

从结构、卖点、口吻、合规风险、退款风险、算账和可念性七个维度评审话术，给出问题原句、可直接替换的写法和上播建议。

## 安装与使用

```bash
git clone https://github.com/DaJunn/wavekol-script-score.git ~/.agents/skills/wavekol-script-score
```

对 AI 说：「给这段话术评分，列出必须修改的句子。」提供话术和已有的商品、促销材料即可；完整稿按 70 分评分，局部段落只评适用维度。

## 本地扫描

需要 Node.js，无第三方依赖。在技能目录运行：

```bash
node scripts/scan-compliance.mjs /path/to/script.txt
```

扫描结果是关键词提示，需结合上下文、品类及事实证据判断；零命中不代表通过合规审核。没有 Node.js 也可做人工逐句评审，但应说明未做自动扫描。

## 输出与边界

输出评分、风险、退款风险和替换句。缺少规格、个人体验或优惠依据时标为待核实，不替带货者编造事实，也不替运营安排上播。

完整评分口径见 [SKILL.md](SKILL.md)。更多技能见 [DaJunn](https://github.com/DaJunn)。
