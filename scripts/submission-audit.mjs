import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = walk('dist');
const checks = [];
const check=(name,pass,detail)=>checks.push({name,pass,detail});
check('原始模型与发布模型一致', hash('模型.glb')===hash('public/模型.glb')&&hash('模型.glb')===hash('dist/模型.glb'));
check('两档独立轻量模型齐全', ['lite','standard'].every(q=>fs.existsSync('dist/models/vase-'+q+'.glb')));
check('发布包排除原始视频', !files.some(f=>/^dist[\\/]videos[\\/][^\\/]+\.mp4$/.test(f)));
check('六段网页视频齐全', files.filter(f=>/^dist[\\/]videos[\\/]web[\\/].+\.mp4$/.test(f)).length===6);
const pointers=files.filter(f=>/\.(mp4|glb)$/.test(f)&&fs.statSync(f).size<1024).filter(f=>fs.readFileSync(f,'utf8').startsWith('version https://git-lfs.github.com/spec/v1'));
check('发布媒体不是 LFS 指针', pointers.length===0,pointers);
const readme=fs.readFileSync('README.md','utf8');
let anonymous=readme.replace(/## 参赛信息（完整版本）[\s\S]*?(?=## 作品介绍)/,'## 参赛介绍（匿名版本）\n\n本版本用于作品评选，不包含参赛者身份信息。\n\n');
anonymous=anonymous.replace(/公开展示地址：[^\n]+/,'匿名版本不附带可识别参赛者身份的公开展示链接，请按下文在本地预览。');
// Final administrative checklist belongs to the full submission guide, not the jury copy.
anonymous=anonymous.replace(/## 按手册准备提交包[\s\S]*/, '');
fs.mkdirSync('docs/competition',{recursive:true});
fs.writeFileSync('docs/competition/README.anonymous.md',anonymous.trimEnd()+'\n');
check('匿名说明移除个人账号与身份字段',!/(lin39ula|队长姓名|成员姓名|联系方式)/i.test(anonymous));
const report={generatedAt:new Date().toISOString(),publishedMiB:files.reduce((s,f)=>s+fs.statSync(f).size,0)/1048576,checks,pending:['填写完整版本的组别、队伍、成员及实际分工','核实官方参赛主题及报名状态','确认人物、品牌、藏品、视频和模型的使用许可','人工检查匿名包注释、文档、截图与媒体元数据，不以关键词扫描替代匿名审查','按手册命名两个子包并解压复验；本脚本不打包或发送邮件']};
fs.writeFileSync('docs/competition/submission-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(checks.some(c=>!c.pass))process.exitCode=1;
