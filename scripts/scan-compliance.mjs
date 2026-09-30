#!/usr/bin/env node
// WaveKOL 话术合规红线·确定性扫描器（给 wavekol-script-score skill 用）
// 用法：
//   node scan-compliance.mjs path/to/script.txt
//   echo "话术文本" | node scan-compliance.mjs
//   pbpaste | node scan-compliance.mjs
// 输出：按类别列出命中词 + 上下文（供判断是真违规还是劝退/护栏语境的误报）+ 结构自检 + 汇总。
// 注意：这是"提示器"，不是判决——副词「最好(两天内喝完)」「第一次」、出现在"不能说/风险提醒"里的功效词，都是误报，最终判分要看上下文。

import fs from "node:fs";

function readInput() {
  const arg = process.argv[2];
  if (arg && fs.existsSync(arg)) return fs.readFileSync(arg, "utf8");
  try { return fs.readFileSync(0, "utf8"); } catch (e) { return ""; }
}
const text = readInput();
if (!text.trim()) { console.log("（没有读到话术文本。用法：node scan-compliance.mjs file.txt 或 pbpaste | node scan-compliance.mjs）"); process.exit(0); }

// —— 红线词库（按 WaveKOL 合规口径，命中=封号/违法/退款高发，需重点核） ——
const RED = {
  "🔴功效/疗效(食品·滋补·奶粉一票否决)": ["控糖","降糖","降血糖","降三高","降血脂","降压","降血压","减脂","减肥","瘦身","养胃","护胃","通便","润肠","排毒","增强免疫","提高免疫","免疫力","改善睡眠","助眠","安神","补钙","骨密度","抗氧化","抗衰","补气","养气","养血","气血","滋阴","温补","大补","进补","调理","抗疲劳","解乏","补肾","壮阳","养肝","护肝","消炎","杀菌","祛湿","驱寒","养颜","提神醒脑"],
  "🔴化妆品特证功效": ["美白","祛斑","淡斑","抗皱","除皱","防脱","生发","祛痘","修复屏障","收缩毛孔"],
  "🔴水军/编观众/编销量": ["已经有姐妹","已经有姐姐","已经有人","已经有不少","已售","已抢","抢到了","抢光","秒没","秒光","恭喜抢到","恭喜你抢","好多人已经拍","有人已经拍","我看已经有人","回购率","复购率","大家都返单","下次直接拍","下次就拍"],
  "🔴虚假紧迫/编库存数字": ["库存不多","卖完恢复原价","卖完就恢复原价","手慢没","手慢的没","就剩最后","只剩最后","仅剩","倒计时"],
  "🔴幕后谈价戏(无法证实)": ["好不容易申请","好不容易争取","好不容易跟品牌方","跟品牌方申请","品牌方看看咱们","让品牌方看","帮你谈下来的","我谈下来的","申请了好久","争取了好久"],
  "🟡极限词(广告法)": ["纯天然","最好的","最香的","最干净","第一名","唯一","顶级","国家级","全网最低","全球最低","史上最","百分百","100%","根治","特效","永久"],
  "🟡占位符泄漏(达人会念出口)": ["占位","【根据","待核实","待填","【运营填"],
};
// 数字型虚假稀缺（带数字才算）
const SCARCITY_NUM = /(就剩|仅剩|只剩|剩下|最后|限量|名额)\s*[0-9一二三四五六七八九十两]+\s*(秒|分钟|单|袋|份|罐|盒|个|件)/g;

function ctx(t, w) {
  const i = t.indexOf(w);
  return i < 0 ? "" : t.slice(Math.max(0, i - 16), i + w.length + 16).replace(/\n/g, "⏎");
}

let total = 0;
console.log("===== 红线确定性扫描（命中=需重点核，非自动判违规，看上下文）=====\n");
for (const [cat, words] of Object.entries(RED)) {
  const hits = [];
  for (const w of words) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const m = text.match(re);
    if (m) hits.push(`${w}×${m.length}「…${ctx(text, w)}…」`);
  }
  if (hits.length) { total += hits.length; console.log(cat + "："); hits.forEach((h) => console.log("  • " + h)); console.log(); }
}
const sc = text.match(SCARCITY_NUM);
if (sc) { total += sc.length; console.log("🔴带数字的虚假稀缺（没真实库存就不能说）：\n  • " + sc.join(" / ") + "\n"); }
if (total === 0) console.log("✅ 词库层面未命中红线（仍需人工读语境确认）。\n");

// —— 结构自检（对标金标准完整话术应有的档）——
console.log("===== 结构完整度自检（对标金标准）=====");
const STRUCT = [
  ["开播前速记/口径卡", /开播前|达人速记|口径卡|一句话定位|主打卖点/],
  ["能说/不能说边界", /不能说|能说/],
  ["娱播引入(养场)", /娱播|引入带货|🌊/],
  ["种草段", /种草/],
  ["种草分小层(开场在地/感受/痛点)", /▎|开场|我的感受|痛点/],
  ["福利段+算账", /福利|原价|直播价|省了|合下来|一袋.*块|拍\s*1\s*发\s*4|拍一发四/],
  ["互动催单+筛人劝退", /催单|先别拍|谁适合|别买回去|不建议你|囤.*别拍/],
  ["收尾答疑", /收尾|答疑|保质期|发货|怎么吃/],
  ["观众常见问题库", /问：|常见问题/],
  ["达人记忆口诀", /记忆口诀|口诀/],
];
let miss = [];
STRUCT.forEach(([name, re]) => { const ok = re.test(text); console.log(`  ${ok ? "✅" : "❌缺"} ${name}`); if (!ok) miss.push(name); });

// —— 字数/可念性粗看 ——
const lines = text.split(/\n/).filter((l) => l.trim());
const longLines = lines.filter((l) => l.replace(/[，,。！？、；\s]/g, "").length > 30 && !/^[【\[（(]/.test(l.trim())).length;
console.log("\n===== 篇幅/可念性 =====");
console.log(`  总字数约 ${text.replace(/\s/g, "").length}；总行数 ${lines.length}；超长行(>30字非标题) ${longLines} 行${longLines > 6 ? "（偏多，提词器照念会卡）" : ""}`);

console.log("\n===== 汇总 =====");
console.log(`红线词命中条数：${total}（0=干净；命中需逐条看是真违规还是劝退/护栏语境）`);
console.log(`结构缺档：${miss.length ? miss.join("、") : "无，结构完整"}`);
