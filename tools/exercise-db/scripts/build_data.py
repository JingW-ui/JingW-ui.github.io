# -*- coding: utf-8 -*-
"""
exercise-db 数据裁剪脚本
来源:https://github.com/hasaneyldrm/exercises-dataset (数据 MIT)
生成:assets/data/exercises.js —— 仅保留核心字段 + 中文/英文指令,并规则翻译出中文名称 name_zh

用法:
  python build_data.py                    # 默认从 jsdelivr CDN 下载
  SOURCE=/path/exercises.json python build_data.py   # 或使用本地文件
"""
import json
import os
import re
import urllib.request

SOURCE = os.environ.get('SOURCE', 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/data/exercises.json')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'data', 'exercises.js')

# ---------------------------------------------------------------
# 动作名称 英→中 规则翻译词表(短语按"词数多者优先"贪心匹配)
# 未收录的词保留英文,保证任何名称都能生成一个可读的中文结果
# ---------------------------------------------------------------
VOCAB = [
    # 器械
    ('body weight', '自重'), ('olympic barbell', '奥林匹克杠铃'), ('resistance band', '阻力带'),
    ('leverage machine', '杠杆器械'), ('smith machine', '史密斯机'), ('elliptical machine', '椭圆机'),
    ('skierg machine', '滑雪测功机'), ('stepmill machine', '爬梯机'), ('stability ball', '健身球'),
    ('medicine ball', '药球'), ('bosu ball', '波速球'), ('upper body ergometer', '上肢测功仪'),
    ('stationary bike', '固定单车'), ('trap bar', '六角杠铃'), ('ez barbell', 'EZ杠铃'),
    ('dumbbell', '哑铃'), ('barbell', '杠铃'), ('kettlebell', '壶铃'), ('bodyweight', '自重'),
    ('cable', '绳索'), ('band', '弹力带'), ('roller', '泡沫轴'), ('wheel roller', '健腹轮'),
    ('hammer', '锤'), ('machine', '器械'), ('assisted', '辅助'), ('weighted', '负重'),
    ('tire', '轮胎'), ('sled', '雪橇'), ('rope', '绳'), ('grip', '握力器'),
    # 复合动作
    ('bench press', '卧推'), ('deadlift', '硬拉'), ('romanian deadlift', '罗马尼亚硬拉'),
    ('overhead press', '过头推举'), ('shoulder press', '肩推'), ('military press', '军事推举'),
    ('chest press', '胸推'), ('incline bench press', '上斜卧推'), ('decline bench press', '下斜卧推'),
    ('front squat', '前蹲'), ('overhead squat', '过头蹲'), ('back squat', '颈后深蹲'),
    ('leg press', '腿举'), ('leg extension', '腿屈伸'), ('leg curl', '腿弯举'),
    ('calf raise', '提踵'), ('lateral raise', '侧平举'), ('front raise', '前平举'),
    ('rear delt raise', '后束平举'), ('rear deltoid raise', '后束平举'), ('rear delt', '后束'),
    ('upright row', '直立划船'), ('bent over row', '俯身划船'), ('bent-over row', '俯身划船'),
    ('seated row', '坐姿划船'), ('one arm row', '单臂划船'), ('cable row', '绳索划船'),
    ('hammer curl', '锤式弯举'), ('preacher curl', '牧师凳弯举'), ('concentration curl', '集中弯举'),
    ('zottman curl', '佐特曼弯举'), ('incline curl', '上斜弯举'), ('tricep extension', '三头屈伸'),
    ('triceps extension', '三头屈伸'), ('overhead extension', '过头屈伸'), ('skull crusher', '仰卧臂屈伸'),
    ('push up', '俯卧撑'), ('push-up', '俯卧撑'), ('pull up', '引体向上'), ('pull-up', '引体向上'),
    ('chin up', '反手引体向上'), ('chin-up', '反手引体向上'), ('chest dip', '双杠臂屈伸'),
    ('side plank', '侧平板支撑'), ('mountain climber', '登山跑'), ('leg raise', '举腿'),
    ('sit up', '仰卧起坐'), ('sit-up', '仰卧起坐'), ('good morning', '早安躬身'),
    ('power clean', '高翻'), ('push press', '借力推举'), ('push jerk', '借力挺举'),
    ('power snatch', '高抓'), ('barbell lunge', '杠铃箭步蹲'), ('step up', '上台阶'),
    ('tricep pushdown', '三头下压'), ('triceps pushdown', '三头下压'), ('rope pushdown', '绳索下压'),
    ('lat pulldown', '高位下拉'), ('lat pull-down', '高位下拉'), ('reverse fly', '反向飞鸟'),
    ('cable fly', '绳索飞鸟'), ('incline fly', '上斜飞鸟'), ('decline fly', '下斜飞鸟'),
    ('pullover', '直臂上拉'), ('bent over lateral raise', '俯身侧平举'), ('face pull', '面拉'),
    ('farmer walk', '农夫行走'), ('kettlebell swing', '壶铃摆动'), ('thruster', '推蹲'),
    ('burpee', '波比跳'), ('jump squat', '跳跃深蹲'), ('box jump', '跳箱'),
    ('leg press', '腿举'), ('hack squat', '哈克深蹲'), ('bulgarian split squat', '保加利亚分腿蹲'),
    # 单动作词
    ('squat', '深蹲'), ('lunge', '箭步蹲'), ('press', '推举'), ('curl', '弯举'), ('fly', '飞鸟'),
    ('row', '划船'), ('raise', '平举'), ('extension', '屈伸'), ('shrug', '耸肩'),
    ('crunch', '卷腹'), ('plank', '平板支撑'), ('bridge', '臀桥'), ('twist', '转体'),
    ('swing', '摆动'), ('kickback', '后踢'), ('snatch', '抓举'), ('clean', '翻举'),
    ('jerk', '挺举'), ('pulldown', '下拉'), ('pushdown', '下压'), ('dip', '臂屈伸'),
    ('knee', '膝'), ('leg', '腿'), ('arm', '臂'), ('abs', '腹肌'), ('core', '核心'),
    ('chest', '胸'), ('back', '背'), ('shoulder', '肩'), ('glute', '臀'), ('hip', '髋'),
    ('ab', '腹'), ('hamstring', '腘绳肌'), ('quad', '股四头'), ('bicep', '二头'),
    ('tricep', '三头'), ('calf', '小腿'), ('glutes', '臀部'), ('pec', '胸'),
    ('deltoid', '三角肌'), ('delt', '三角肌'), ('forearm', '前臂'), ('wrist', '手腕'),
    # 修饰语
    ('one arm', '单臂'), ('single arm', '单臂'), ('double arm', '双臂'), ('alternating', '交替'),
    ('reverse grip', '反握'), ('overhand grip', '正握'), ('underhand grip', '反握'),
    ('narrow grip', '窄握'), ('wide grip', '宽握'), ('close grip', '窄握'), ('medium grip', '中握'),
    ('incline', '上斜'), ('decline', '下斜'), ('flat', '平板'), ('seated', '坐姿'),
    ('standing', '站姿'), ('lying', '仰卧'), ('lying down', '仰卧'), ('overhead', '过头'),
    ('behind the head', '颈后'), ('behind neck', '颈后'), ('behind', '后'),
    ('forward', '前'), ('russian', '俄式'), ('bicycle', '自行车式'), ('clap', '击掌'),
    ('sumo', '相扑'), ('staggered', '错位'), ('arnold', '阿诺德'), ('deficit', '垫高'),
    ('concentric', '向心'), ('eccentric', '离心'), ('isometric', '等长'), ('explosive', '爆发'),
    ('jumping', '跳跃'), ('lower', '下'), ('upper', '上'), ('middle', '中'),
    ('straight', '直'), ('bent', '屈'), ('neutral', '中立'), ('pronated', '正握'),
    ('supinated', '反握'), ('closed', '闭合'), ('open', '开放'), ('fixed', '固定'),
    ('smith', '史密斯'), ('split', '分腿'), ('stiff', '直腿'), ('straight-leg', '直腿'),
    ('single', '单'), ('double', '双'), ('cross', '交叉'), ('around', '环绕'),
    ('rotation', '旋转'), ('rotate', '旋转'), ('push', '推'), ('pull', '拉'),
    ('high', '高'), ('low', '低'), ('deep', '深'), ('shallow', '浅'),
    ('body', '身体'), ('weight', '重量'), ('wall', '墙'), ('floor', '地面'),
    ('bench', '凳'), ('incline bench', '上斜凳'), ('decline bench', '下斜凳'),
    ('barbell', '杠铃'), ('dumbbell', '哑铃'),
    # ---- 常用动作/修饰补全 ----
    ('all fours', '四点跪姿'), ('archer', '弓箭手'), ('squad', '蹲'), ('stretch', '拉伸'),
    ('plyo', '增强式'), ('sprint', '冲刺'), ('wind sprint', '冲刺跑'), ('wind', '跑'),
    ('alternate', '交替'), ('sitted', '坐姿'), ('throw', '抛'), ('down', '下'),
    ('reverse', '反'), ('wrist curl', '腕弯举'), ('russian twist', '俄式转体'),
    ('bicycle crunch', '自行车卷腹'), ('bicycle', '自行车式'), ('cross crunch', '交叉卷腹'),
    ('dead bug', '死虫式'), ('bird dog', '鸟狗式'), ('fire hydrant', '消防栓式'),
    ('donkey kick', '驴踢'), ('glute bridge', '臀桥'), ('hip thrust', '髋推'),
    ('cable crunch', '绳索卷腹'), ('ab wheel', '健腹轮'), ('jackknife', '折刀式'),
    ('v-up', 'V字卷腹'), ('v up', 'V字卷腹'), ('flutter kick', '交替打腿'),
    ('scissor', '剪刀'), ('toe touch', '触脚趾'), ('wall sit', '靠墙静蹲'),
    ('pistol', '手枪式'), ('single leg', '单腿'), ('single-leg', '单腿'),
    ('reach', '伸展'), ('drop', '下落'), ('touch', '触'), ('kick', '踢'),
    ('jump', '跳'), ('march', '踏步'), ('tap', '轻触'), ('hold', '保持'),
    ('hover', '悬停'), ('walk', '行走'), ('sit', '坐'), ('stand', '站'),
    ('balance', '平衡'), ('crunch', '卷腹'), ('flutter', '交替'),
    ('side', '侧'), ('cross', '交叉'), ('around', '环绕'), ('above', '上方'),
    ('under', '下方'), ('through', '穿过'), ('into', '进入'), ('out', '出'),
    ('half', '半'), ('quarter', '四分之一'), ('full', '全程'), ('partial', '部分'),
    ('speed', '速度'), ('fast', '快速'), ('slow', '慢速'), ('tempo', '节奏'),
    ('power', '爆发'), ('strength', '力量'), ('endurance', '耐力'), ('mobility', '灵活'),
    ('rotation', '旋转'), ('internal', '内旋'), ('external', '外旋'),
    ('hip', '髋'), ('torso', '躯干'), ('pelvic', '骨盆'), ('spine', '脊柱'),
    ('quad', '股四头'), ('glut', '臀'), ('calves', '小腿'), ('feet', '脚'),
    ('hands', '手'), ('knees', '膝'), ('elbows', '肘'), ('ankle', '踝'),
    ('toes', '脚趾'), ('heels', '脚跟'), ('palms', '掌'),
    ('around the world', '环绕'), ('wide', '宽'), ('narrow', '窄'),
    ('smith machine', '史密斯机'), ('trap bar', '六角杠铃'),
]


def _build_table():
    table = {}
    for phrase, zh in VOCAB:
        key = phrase.lower()
        if key not in table:
            table[key] = zh
    # 按"词数降序、短语长度降序"排列,保证长短语优先匹配
    return sorted(table.items(), key=lambda kv: (kv[0].count(' ') + 1, len(kv[0])), reverse=True)


TABLE = _build_table()


# 虚词/介词:翻译为空(丢弃),避免中文名夹英文虚词
STOPWORDS = {
    'with': '', 'the': '', 'a': '', 'an': '', 'and': '', 'on': '', 'of': '',
    'to': '', 'for': '', 'in': '', 'from': '', 'by': '', 'at': '', 'your': '',
    'using': '', 'use': '', 'into': '', 'than': '',
}
# 括号内容翻译
PAREN_MAP = {
    'female': '女', 'male': '男', 'flat': '平板', 'barbell': '杠铃', 'dumbbell': '哑铃',
    'single': '单', 'double': '双', 'beginner': '入门', 'advanced': '进阶', 'intermediate': '中级',
}
# 单数词表(复数回退用): phrase(单词) -> 中文
_SINGLES = {k: v for k, v in TABLE if ' ' not in k}


def translate_name(name):
    """规则翻译动作名称;未识别词保留英文"""
    if not name:
        return ''
    s = name
    for en, zh in PAREN_MAP.items():
        s = re.sub(r'\(%s\)' % en, '(%s)' % zh, s, flags=re.I)
    tokens = re.sub(r'-', ' ', s).split()
    out = []
    i = 0
    n = len(tokens)
    while i < n:
        matched = False
        for phrase, zh in TABLE:
            pc = phrase.count(' ') + 1
            if i + pc <= n and ' '.join(tokens[i:i + pc]).lower() == phrase:
                out.append(zh)
                i += pc
                matched = True
                break
        if not matched:
            t = tokens[i]
            key = t.lower()
            if key in STOPWORDS:
                out.append(STOPWORDS[key])  # 空串丢弃
            elif key in _SINGLES:
                out.append(_SINGLES[key])
            elif key.endswith('s') and len(key) > 3 and key[:-1] in _SINGLES:
                out.append(_SINGLES[key[:-1]])  # 复数回退
            else:
                out.append(t)
            i += 1
    return ' '.join(x for x in out if x)


def load_source():
    if os.path.exists(SOURCE):
        with open(SOURCE, encoding='utf-8') as f:
            return json.load(f)
    with urllib.request.urlopen(SOURCE, timeout=180) as r:
        return json.load(r)


def main():
    data = load_source()
    out = []
    for r in data:
        steps = r.get('instruction_steps') or {}
        name = r.get('name', '')
        out.append({
            'id': r.get('id'),
            'name': name,
            'name_zh': translate_name(name),
            'body_part': r.get('body_part'),
            'equipment': r.get('equipment'),
            'target': r.get('target'),
            'muscle_group': r.get('muscle_group'),
            'secondary_muscles': r.get('secondary_muscles') or [],
            # 分步指令已含全文,不再保留冗余的 instructions 自由文本
            'steps': {'zh': steps.get('zh', []), 'en': steps.get('en', [])},
            'image': r.get('image'),
            'gif': r.get('gif_url'),
            'attr': r.get('attribution'),
        })
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    body = json.dumps(out, ensure_ascii=False, separators=(',', ':'))
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('window.EXERCISES = ' + body + ';\n')

    # 统计翻译覆盖率
    total = len(out)
    pure_zh = sum(1 for x in out if not re.search(r'[a-zA-Z]', x['name_zh']))
    has_zh = sum(1 for x in out if x['name_zh'] != x['name'])
    print('生成 %s (%d 条, %.2f MB)' % (OUT, total, os.path.getsize(OUT) / 1024 / 1024))
    print('翻译覆盖率: 有翻译变化 %d/%d, 全中文 %d/%d' % (has_zh, total, pure_zh, total))


if __name__ == '__main__':
    main()
