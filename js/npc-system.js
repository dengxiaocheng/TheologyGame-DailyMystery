/**
 * NPC System — NPC 系统
 * 12个NPC，时段对话，心情动画，关系渲染
 */
(function () {
  'use strict';

  /* ---- NPC 定义 ---- */

  var NPC_DEFS = {
    mother: {
      name: '母亲',
      color: '#d4a0a0',
      icon: '👩',
      locations: ['home'],
      defaultMood: 'warm',
      greeting: '你回来了。',
      description: '你的母亲，温柔但总有些操心。'
    },
    elderly_bus: {
      name: '公交上的老人',
      color: '#c0b090',
      icon: '👴',
      locations: ['bus_stop'],
      defaultMood: 'calm',
      greeting: '……',
      description: '经常坐这路公交的老人，总是安静地望着窗外。'
    },
    silent_woman: {
      name: '沉默的女人',
      color: '#a0a0c0',
      icon: '👩‍🦰',
      locations: ['bus_stop', 'street'],
      defaultMood: 'quiet',
      greeting: '……',
      description: '一个总在公交站出现的女人，从不开口说话。'
    },
    colleague_li: {
      name: '同事李',
      color: '#90c090',
      icon: '👨‍💼',
      locations: ['office'],
      defaultMood: 'friendly',
      greeting: '早啊。',
      description: '坐在你旁边的同事，话不多但很可靠。'
    },
    colleague_wang: {
      name: '同事王',
      color: '#c09090',
      icon: '👨‍💻',
      locations: ['office'],
      defaultMood: 'energetic',
      greeting: '嘿！',
      description: '办公室里最活跃的人，总有说不完的话题。'
    },
    lunch_friend: {
      name: '午餐朋友',
      color: '#b0a0d0',
      icon: '🧑',
      locations: ['office'],
      defaultMood: 'casual',
      greeting: '中午吃什么？',
      description: '经常一起吃饭的朋友，你们之间有种舒适的默契。'
    },
    beggar: {
      name: '街边的乞丐',
      color: '#909090',
      icon: '🧓',
      locations: ['street'],
      defaultMood: 'somber',
      greeting: '……',
      description: '总是在那个街角，面前放着一个碗。'
    },
    park_stranger: {
      name: '公园的陌生人',
      color: '#a0b0c0',
      icon: '🧑‍🦱',
      locations: ['park'],
      defaultMood: 'distant',
      greeting: '嗯？',
      description: '经常在公园长椅上坐着的人，表情总是若有所思。'
    },
    neighbor_auntie: {
      name: '邻居阿姨',
      color: '#d0b0a0',
      icon: '👩‍🦳',
      locations: ['street', 'home'],
      defaultMood: 'nosy',
      greeting: '哎呀，是你啊！',
      description: '住你楼下的阿姨，热情但有点爱管闲事。'
    },
    boss: {
      name: '老板',
      color: '#b0b0b0',
      icon: '👨‍💼',
      locations: ['office'],
      defaultMood: 'neutral',
      greeting: '嗯。',
      description: '你的上司，表情总是很难猜透。'
    },
    barista: {
      name: '咖啡师',
      color: '#c0a080',
      icon: '☕',
      locations: ['street'],
      defaultMood: 'cheerful',
      greeting: '还是老样子？',
      description: '街角咖啡店的咖啡师，总能记住常客的口味。'
    },
    street_cat: {
      name: '街猫',
      color: '#e0c090',
      icon: '🐱',
      locations: ['street', 'park'],
      defaultMood: 'aloof',
      greeting: '喵……',
      description: '一只总是出现在附近的橘猫，对人爱搭不理。'
    }
  };

  /* ---- 时段对话 ---- */

  var PERIOD_DIALOGUES = {
    mother: {
      early_morning: [
        { text: '这么早？再睡会儿吧。', mood: 'warm' },
        { text: '我给你热了牛奶。', mood: 'caring' },
        { text: '今天天气不错，记得带伞以防万一。', mood: 'cautious' }
      ],
      morning: [
        { text: '早饭在桌上，趁热吃。', mood: 'warm' },
        { text: '路上小心。', mood: 'caring' },
        { text: '你昨晚又熬夜了？脸色不好。', mood: 'worried' }
      ],
      midday: [
        { text: '中午记得吃饭，别光顾着忙。', mood: 'caring' },
        { text: '我下午要去菜市场，你想吃什么？', mood: 'casual' },
        { text: '你爸那边……算了，没事。', mood: 'hesitant' }
      ],
      afternoon: [
        { text: '今天回来早吗？', mood: 'expectant' },
        { text: '我炖了汤，晚上热一下就能喝。', mood: 'warm' },
        { text: '隔壁家的孩子考上大学了……', mood: 'wistful' }
      ],
      evening: [
        { text: '回来了？快洗手，马上开饭。', mood: 'warm' },
        { text: '今天怎么这么晚？', mood: 'worried' },
        { text: '吃过饭出去走走吧，别老闷着。', mood: 'caring' }
      ],
      dusk: [
        { text: '外面的夕阳真好看。', mood: 'peaceful' },
        { text: '有时候觉得，日子过得真快。', mood: 'wistful' },
        { text: '你在想什么？看你发呆好一会儿了。', mood: 'curious' }
      ],
      night: [
        { text: '别太晚了，早点休息。', mood: 'caring' },
        { text: '晚安。', mood: 'warm' },
        { text: '你小时候总缠着我讲故事……都长大了。', mood: 'nostalgic' }
      ],
      late_night: [
        { text: '……还没睡？', mood: 'worried' },
        { text: '我给你留了灯。', mood: 'warm' },
        { text: '记得关窗户。', mood: 'caring' }
      ]
    },
    colleague_li: {
      early_morning: [
        { text: '你是第一个到的。', mood: 'surprised' },
        { text: '今天很早啊。', mood: 'neutral' }
      ],
      morning: [
        { text: '早。', mood: 'friendly' },
        { text: '昨晚看了一部好电影，改天推荐给你。', mood: 'casual' },
        { text: '今天的邮件好多……', mood: 'tired' }
      ],
      midday: [
        { text: '去吃饭吗？', mood: 'casual' },
        { text: '食堂今天有新菜。', mood: 'curious' },
        { text: '我带了便当，你呢？', mood: 'friendly' }
      ],
      afternoon: [
        { text: '下午的会准备好了吗？', mood: 'serious' },
        { text: '这个报表你看一下。', mood: 'professional' },
        { text: '喝杯咖啡吧，我请。', mood: 'friendly' }
      ],
      evening: [
        { text: '还不走？', mood: 'casual' },
        { text: '加班？注意身体。', mood: 'caring' },
        { text: '明天见。', mood: 'friendly' }
      ],
      dusk: [
        { text: '天快黑了。', mood: 'quiet' },
        { text: '今天过得怎么样？', mood: 'curious' }
      ],
      night: [
        { text: '你还在公司？', mood: 'surprised' },
        { text: '早点回去吧。', mood: 'caring' }
      ],
      late_night: [
        { text: '别太拼了。', mood: 'worried' }
      ]
    },
    colleague_wang: {
      early_morning: [
        { text: '哟，你比我还早！', mood: 'surprised' },
        { text: '今天太阳打西边出来了？', mood: 'teasing' }
      ],
      morning: [
        { text: '听说了吗？隔壁组那个……', mood: 'gossipy' },
        { text: '来来来，看看这个好玩的。', mood: 'energetic' },
        { text: '今天老板心情好像不错。', mood: 'observant' }
      ],
      midday: [
        { text: '走！去新开的那家店！', mood: 'energetic' },
        { text: '我请你，别客气。', mood: 'generous' },
        { text: '你尝尝这个，超好吃！', mood: 'enthusiastic' }
      ],
      afternoon: [
        { text: '困死了……你困不困？', mood: 'tired' },
        { text: '我跟你说个事，别告诉别人啊。', mood: 'secretive' },
        { text: '这个客户太难搞了。', mood: 'frustrated' }
      ],
      evening: [
        { text: '一起去喝一杯？', mood: 'inviting' },
        { text: '今天总算结束了。', mood: 'relieved' },
        { text: '改天一起打球啊！', mood: 'energetic' }
      ],
      dusk: [
        { text: '看那个晚霞！', mood: 'appreciative' },
        { text: '下班后的空气都是甜的。', mood: 'relaxed' }
      ],
      night: [
        { text: '你怎么还在？我也在加班……', mood: 'sympathetic' },
        { text: '要不要订个外卖？', mood: 'caring' }
      ],
      late_night: [
        { text: '兄弟，回家吧。', mood: 'worried' }
      ]
    },
    lunch_friend: {
      early_morning: [
        { text: '这么早？一起吃早饭吗？', mood: 'friendly' }
      ],
      morning: [
        { text: '中午一起吃饭？', mood: 'casual' },
        { text: '听说食堂有糖醋排骨。', mood: 'excited' },
        { text: '今天中午我请你，上次你请我的。', mood: 'reciprocal' }
      ],
      midday: [
        { text: '走走走，饿了！', mood: 'energetic' },
        { text: '你想吃什么？还是老地方？', mood: 'casual' },
        { text: '我跟你说个事……', mood: 'serious' }
      ],
      afternoon: [
        { text: '吃太饱了……', mood: 'satisfied' },
        { text: '下午一起摸鱼？', mood: 'mischievous' },
        { text: '下次试试新开的那家？', mood: 'suggestive' }
      ],
      evening: [
        { text: '今天辛苦了。', mood: 'empathetic' },
        { text: '改天一起吃晚饭？', mood: 'inviting' }
      ],
      dusk: [
        { text: '下了班感觉整个人都活了。', mood: 'relaxed' }
      ],
      night: [
        { text: '加班？保重。', mood: 'sympathetic' }
      ],
      late_night: [
        { text: '还在公司？注意身体啊。', mood: 'worried' }
      ]
    },
    elderly_bus: {
      early_morning: [
        { text: '年轻人，你也很早啊。', mood: 'kind' },
        { text: '早班车总是很空。', mood: 'peaceful' }
      ],
      morning: [
        { text: '又是新的一天。', mood: 'philosophical' },
        { text: '现在的年轻人，总是那么忙。', mood: 'observant' },
        { text: '这个位子你坐吧。', mood: 'generous' }
      ],
      midday: [
        { text: '中午的阳光真舒服。', mood: 'content' },
        { text: '你吃过饭了吗？', mood: 'caring' }
      ],
      afternoon: [
        { text: '这个点坐车的人少。', mood: 'observant' },
        { text: '我年轻的时候也像你一样。', mood: 'nostalgic' }
      ],
      evening: [
        { text: '下班了？辛苦了。', mood: 'kind' },
        { text: '回家的路总是最长的。', mood: 'philosophical' }
      ],
      dusk: [
        { text: '夕阳让我想起很多事。', mood: 'nostalgic' },
        { text: '人生就像坐公交，有人上车，有人下车。', mood: 'philosophical' }
      ],
      night: [
        { text: '这么晚还在外面？注意安全。', mood: 'caring' },
        { text: '夜里的城市，不太一样。', mood: 'observant' }
      ],
      late_night: [
        { text: '年轻人，早点回家。', mood: 'worried' }
      ]
    },
    silent_woman: {
      early_morning: [
        { text: '……', mood: 'silent' },
        { text: '……（看了你一眼）', mood: 'curious' }
      ],
      morning: [
        { text: '……（低头看手机）', mood: 'distant' },
        { text: '……（微微点头）', mood: 'neutral' },
        { text: '……（叹了口气）', mood: 'melancholy' }
      ],
      midday: [
        { text: '……（闭着眼睛）', mood: 'resting' },
        { text: '……（在看一本旧书）', mood: 'focused' }
      ],
      afternoon: [
        { text: '……（望着远方）', mood: 'distant' },
        { text: '……（嘴角微微动了一下）', mood: 'slight_smile' }
      ],
      evening: [
        { text: '……（眼神疲惫）', mood: 'tired' },
        { text: '……（轻声说了句什么，没听清）', mood: 'murmur' }
      ],
      dusk: [
        { text: '……（在夕阳中，她的表情柔和了一些）', mood: 'soft' },
        { text: '……（似乎想说什么，但还是沉默了）', mood: 'hesitant' }
      ],
      night: [
        { text: '……（还在这里）', mood: 'patient' },
        { text: '……（第一次对你微笑了一下）', mood: 'warm' }
      ],
      late_night: [
        { text: '……（轻轻点头）', mood: 'acknowledging' }
      ]
    },
    beggar: {
      early_morning: [
        { text: '……（还在睡觉）', mood: 'asleep' },
        { text: '……（蜷缩在角落）', mood: 'cold' }
      ],
      morning: [
        { text: '……（伸出碗）', mood: 'pleading' },
        { text: '……（低声说了谢谢）', mood: 'grateful' },
        { text: '……（看着路过的行人）', mood: 'observant' }
      ],
      midday: [
        { text: '……（在吃别人给的面包）', mood: 'eating' },
        { text: '……（阳光让他眯起了眼）', mood: 'content' }
      ],
      afternoon: [
        { text: '……（在整理他的东西）', mood: 'occupied' },
        { text: '……（看着天空）', mood: 'contemplative' }
      ],
      evening: [
        { text: '……（碗里有几枚硬币）', mood: 'neutral' },
        { text: '……（对你点了点头）', mood: 'grateful' }
      ],
      dusk: [
        { text: '……（在收他的东西）', mood: 'preparing' },
        { text: '……（天快黑了，他看起来有些不安）', mood: 'anxious' }
      ],
      night: [
        { text: '……（裹紧了毯子）', mood: 'cold' },
        { text: '……（这个时间很少有人经过了）', mood: 'lonely' }
      ],
      late_night: [
        { text: '……（已经睡了）', mood: 'asleep' }
      ]
    },
    park_stranger: {
      early_morning: [
        { text: '你也这么早来公园？', mood: 'surprised' },
        { text: '清晨的空气真好。', mood: 'peaceful' }
      ],
      morning: [
        { text: '又见面了。', mood: 'casual' },
        { text: '今天的云很好看。', mood: 'observant' },
        { text: '你有没有觉得……算了。', mood: 'hesitant' }
      ],
      midday: [
        { text: '中午的公园很安静。', mood: 'peaceful' },
        { text: '你带了午饭吗？', mood: 'curious' }
      ],
      afternoon: [
        { text: '时间在这里好像过得更慢。', mood: 'philosophical' },
        { text: '我在看蚂蚁搬家。你看那一列。', mood: 'childlike' },
        { text: '坐吧，这个位置很好。', mood: 'welcoming' }
      ],
      evening: [
        { text: '傍晚的公园最美。', mood: 'appreciative' },
        { text: '你注意到了吗？风的声音变了。', mood: 'observant' }
      ],
      dusk: [
        { text: '夕阳在树叶间碎成了金子。', mood: 'poetic' },
        { text: '我每天都来这里，你知道吗？', mood: 'confessional' },
        { text: '有些话，只适合对陌生人说。', mood: 'mysterious' }
      ],
      night: [
        { text: '晚上的公园不太安全，小心点。', mood: 'warning' },
        { text: '星星出来了。你多久没看过星星了？', mood: 'reflective' }
      ],
      late_night: [
        { text: '你还没走？我也没走。', mood: 'companionable' }
      ]
    },
    neighbor_auntie: {
      early_morning: [
        { text: '哟，起这么早？锻炼身体呢？', mood: 'cheerful' }
      ],
      morning: [
        { text: '上班去啊？吃了没？', mood: 'caring' },
        { text: '你妈昨天做的菜真香，我在楼下都闻到了。', mood: 'nosy' },
        { text: '你年纪也不小了，有对象了没？', mood: 'probing' }
      ],
      midday: [
        { text: '还没去上班？还是回来了？', mood: 'nosy' },
        { text: '中午吃了吗？我家做了红烧肉！', mood: 'generous' }
      ],
      afternoon: [
        { text: '买菜回来？今天的菜可新鲜了。', mood: 'cheerful' },
        { text: '你听说了吗？楼上那家……', mood: 'gossipy' }
      ],
      evening: [
        { text: '回来啦！你妈在等你呢。', mood: 'cheerful' },
        { text: '今天做了什么好吃的？闻着真香！', mood: 'curious' }
      ],
      dusk: [
        { text: '出来散步啊？一起一起！', mood: 'enthusiastic' },
        { text: '天黑了早点回家啊。', mood: 'caring' }
      ],
      night: [
        { text: '这么晚了还在外面？', mood: 'concerned' },
        { text: '明天我给你带自己腌的咸菜！', mood: 'generous' }
      ],
      late_night: [
        { text: '年轻人别太晚了！', mood: 'scolding' }
      ]
    },
    boss: {
      early_morning: [
        { text: '嗯，早。', mood: 'neutral' },
        { text: '今天有个重要会议。', mood: 'serious' }
      ],
      morning: [
        { text: '那个报告做完了吗？', mood: 'professional' },
        { text: '不错，继续保持。', mood: 'approving' },
        { text: '到我办公室来一下。', mood: 'serious' }
      ],
      midday: [
        { text: '午休时间，放松一下。', mood: 'casual' },
        { text: '下午有个客户来访。', mood: 'reminder' }
      ],
      afternoon: [
        { text: '辛苦了。', mood: 'acknowledging' },
        { text: '这个方案还需要改。', mood: 'critical' },
        { text: '你做得不错，我在看。', mood: 'encouraging' }
      ],
      evening: [
        { text: '可以走了。今天谢谢大家。', mood: 'dismissal' },
        { text: '你留下来一下，有个事。', mood: 'mysterious' }
      ],
      dusk: [
        { text: '……（还在加班）', mood: 'diligent' },
        { text: '你也还没走？', mood: 'surprised' }
      ],
      night: [
        { text: '别太晚了。明天还有事。', mood: 'caring' },
        { text: '公司需要你这样的人。', mood: 'appreciating' }
      ],
      late_night: [
        { text: '回去吧。这里没人是铁打的。', mood: 'human' }
      ]
    },
    barista: {
      early_morning: [
        { text: '这么早？刚开门呢。', mood: 'surprised' },
        { text: '今天的第一杯，我给你做得特别点。', mood: 'generous' }
      ],
      morning: [
        { text: '还是老样子？', mood: 'familiar' },
        { text: '今天有新到的豆子，要不要试试？', mood: 'suggestive' },
        { text: '外面冷吧？进来暖暖。', mood: 'caring' }
      ],
      midday: [
        { text: '中午来杯咖啡提提神？', mood: 'suggestive' },
        { text: '今天的拿铁特别好喝。', mood: 'proud' }
      ],
      afternoon: [
        { text: '下午茶时间！来杯手冲？', mood: 'enthusiastic' },
        { text: '你看起来有点累，给你多加点奶。', mood: 'caring' },
        { text: '今天的蛋糕是刚做的，试试？', mood: 'suggestive' }
      ],
      evening: [
        { text: '下班了？来放松一下。', mood: 'welcoming' },
        { text: '今天辛苦了，这杯我请。', mood: 'generous' }
      ],
      dusk: [
        { text: '夕阳配咖啡，绝了。', mood: 'appreciative' },
        { text: '这个时间的光线最好看。', mood: 'artistic' }
      ],
      night: [
        { text: '这么晚还出来？我们快打烊了。', mood: 'warning' },
        { text: '给你做杯热可可吧，别喝咖啡了。', mood: 'caring' }
      ],
      late_night: [
        { text: '明天再来吧，早点休息。', mood: 'caring' }
      ]
    },
    street_cat: {
      early_morning: [
        { text: '喵……（还没醒透）', mood: 'sleepy' },
        { text: '……（打了个哈欠）', mood: 'lazy' }
      ],
      morning: [
        { text: '喵！（跑过来蹭你的腿）', mood: 'affectionate' },
        { text: '喵……（坐在远处看着你）', mood: 'aloof' },
        { text: '！？（突然跳起来追落叶）', mood: 'playful' }
      ],
      midday: [
        { text: '……（趴在阳光下睡觉）', mood: 'sleeping' },
        { text: '喵~（翻了个身露出肚子）', mood: 'relaxed' }
      ],
      afternoon: [
        { text: '喵。（坐在栏杆上看着你）', mood: 'regal' },
        { text: '喵喵！（追着自己的尾巴转圈）', mood: 'playful' }
      ],
      evening: [
        { text: '喵~（饿了吗，在叫）', mood: 'hungry' },
        { text: '……（安静地蹲在你脚边）', mood: 'companionable' }
      ],
      dusk: [
        { text: '猫的眼睛在暮色中发亮。', mood: 'mysterious' },
        { text: '喵……（蜷缩在你身旁）', mood: 'trusting' }
      ],
      night: [
        { text: '喵！（在月光下跑过）', mood: 'nocturnal' },
        { text: '……（在暗处亮着两只眼睛）', mood: 'mysterious' }
      ],
      late_night: [
        { text: '喵……（只有猫还醒着）', mood: 'watchful' }
      ]
    }
  };

  /* ---- NPC 心情状态动画参数 ---- */

  var MOOD_ANIMATIONS = {
    warm:        { bobSpeed: 0.02, bobAmount: 2, glowColor: '#d4a0a0', glowPulse: 0.5 },
    caring:      { bobSpeed: 0.015, bobAmount: 1.5, glowColor: '#e0b0a0', glowPulse: 0.6 },
    worried:     { bobSpeed: 0.01, bobAmount: 0.5, glowColor: '#a0a0c0', glowPulse: 0.3 },
    calm:        { bobSpeed: 0.01, bobAmount: 1, glowColor: '#b0c0b0', glowPulse: 0.4 },
    quiet:       { bobSpeed: 0.008, bobAmount: 0.5, glowColor: '#a0a0b0', glowPulse: 0.2 },
    friendly:    { bobSpeed: 0.02, bobAmount: 2, glowColor: '#90c090', glowPulse: 0.5 },
    energetic:   { bobSpeed: 0.03, bobAmount: 3, glowColor: '#c0d090', glowPulse: 0.7 },
    casual:      { bobSpeed: 0.012, bobAmount: 1, glowColor: '#b0b0b0', glowPulse: 0.3 },
    somber:      { bobSpeed: 0.005, bobAmount: 0.3, glowColor: '#808080', glowPulse: 0.2 },
    distant:     { bobSpeed: 0.008, bobAmount: 0.5, glowColor: '#a0a0c0', glowPulse: 0.2 },
    nosy:        { bobSpeed: 0.025, bobAmount: 2.5, glowColor: '#d0b0a0', glowPulse: 0.6 },
    cheerful:    { bobSpeed: 0.025, bobAmount: 2.5, glowColor: '#d0c090', glowPulse: 0.6 },
    neutral:     { bobSpeed: 0.01, bobAmount: 1, glowColor: '#b0b0b0', glowPulse: 0.3 },
    aloof:       { bobSpeed: 0.006, bobAmount: 0.3, glowColor: '#c0b090', glowPulse: 0.2 },
    philosophical: { bobSpeed: 0.008, bobAmount: 0.5, glowColor: '#a0b0c0', glowPulse: 0.3 },
    nostalgic:   { bobSpeed: 0.01, bobAmount: 1, glowColor: '#c0b0a0', glowPulse: 0.4 },
    sad:         { bobSpeed: 0.005, bobAmount: 0.2, glowColor: '#8080a0', glowPulse: 0.1 },
    happy:       { bobSpeed: 0.03, bobAmount: 3, glowColor: '#d0d090', glowPulse: 0.8 },
    grateful:    { bobSpeed: 0.015, bobAmount: 1.5, glowColor: '#c0c0a0', glowPulse: 0.5 },
    tired:       { bobSpeed: 0.005, bobAmount: 0.3, glowColor: '#909090', glowPulse: 0.2 },
    curious:     { bobSpeed: 0.02, bobAmount: 2, glowColor: '#b0a0c0', glowPulse: 0.5 },
    angry:       { bobSpeed: 0.04, bobAmount: 3, glowColor: '#c09090', glowPulse: 0.8 },
    scared:      { bobSpeed: 0.03, bobAmount: 2.5, glowColor: '#a0a0c0', glowPulse: 0.6 },
    silent:      { bobSpeed: 0.003, bobAmount: 0.2, glowColor: '#909090', glowPulse: 0.1 }
  };

  /* ---- 关系等级标签 ---- */

  var RELATIONSHIP_LABELS = [
    { max: 10, label: '陌生人', color: '#808080' },
    { max: 25, label: '点头之交', color: '#9090a0' },
    { max: 40, label: '认识', color: '#a0a0b0' },
    { max: 55, label: '熟悉', color: '#b0b0a0' },
    { max: 70, label: '亲近', color: '#c0c0a0' },
    { max: 85, label: '信任', color: '#d0c890' },
    { max: 100, label: '深厚', color: '#e0d080' }
  ];

  function getRelationshipLabel(value) {
    for (var i = 0; i < RELATIONSHIP_LABELS.length; i++) {
      if (value <= RELATIONSHIP_LABELS[i].max) {
        return RELATIONSHIP_LABELS[i];
      }
    }
    return RELATIONSHIP_LABELS[RELATIONSHIP_LABELS.length - 1];
  }

  /* ---- NPC System 构造函数 ---- */

  function NPCSystem() {
    this._npcs = {};
    this._activeDialogues = {};
    this._dialogueHistory = {};
    this._interactionCount = {};
    this._animTime = 0;
    this._initNPCs();
  }

  NPCSystem.prototype._initNPCs = function () {
    for (var id in NPC_DEFS) {
      this._npcs[id] = {
        id: id,
        name: NPC_DEFS[id].name,
        color: NPC_DEFS[id].color,
        icon: NPC_DEFS[id].icon,
        locations: NPC_DEFS[id].locations,
        mood: NPC_DEFS[id].defaultMood,
        visible: true,
        x: 0,
        y: 0
      };
      this._dialogueHistory[id] = [];
      this._interactionCount[id] = 0;
    }
  };

  /* ---- NPC 获取 ---- */

  NPCSystem.prototype.getNPC = function (npcId) {
    return this._npcs[npcId] || null;
  };

  NPCSystem.prototype.getAllNPCs = function () {
    var result = [];
    for (var id in this._npcs) {
      result.push(this._npcs[id]);
    }
    return result;
  };

  NPCSystem.prototype.getNPCsAtLocation = function (locId) {
    var result = [];
    for (var id in this._npcs) {
      var npc = this._npcs[id];
      for (var i = 0; i < npc.locations.length; i++) {
        if (npc.locations[i] === locId) {
          result.push(npc);
          break;
        }
      }
    }
    return result;
  };

  /* ---- NPC 位置（根据当前地点布局） ---- */

  var LOCATION_POSITIONS = {
    home: { mother: { x: 0.5, y: 0.6 }, neighbor_auntie: { x: 0.3, y: 0.7 } },
    street: {
      beggar: { x: 0.15, y: 0.75 },
      neighbor_auntie: { x: 0.7, y: 0.5 },
      barista: { x: 0.85, y: 0.45 },
      street_cat: { x: 0.3, y: 0.8 },
      silent_woman: { x: 0.5, y: 0.6 }
    },
    bus_stop: {
      elderly_bus: { x: 0.4, y: 0.55 },
      silent_woman: { x: 0.65, y: 0.5 }
    },
    office: {
      colleague_li: { x: 0.3, y: 0.45 },
      colleague_wang: { x: 0.6, y: 0.4 },
      lunch_friend: { x: 0.5, y: 0.55 },
      boss: { x: 0.8, y: 0.35 }
    },
    park: {
      park_stranger: { x: 0.5, y: 0.55 },
      street_cat: { x: 0.2, y: 0.75 }
    },
    church: {},
    night_room: {}
  };

  NPCSystem.prototype.getNPCPosition = function (npcId, locId) {
    var loc = locId || (window.player ? window.player.getLocation() : 'home');
    var positions = LOCATION_POSITIONS[loc];
    if (positions && positions[npcId]) {
      return positions[npcId];
    }
    return { x: 0.5, y: 0.5 };
  };

  /* ---- 对话系统 ---- */

  NPCSystem.prototype.getDialogue = function (npcId, periodId) {
    var dialogues = PERIOD_DIALOGUES[npcId];
    if (!dialogues) return null;

    var periodDialogues = dialogues[periodId];
    if (!periodDialogues || periodDialogues.length === 0) {
      return null;
    }

    var idx = Math.floor(Math.random() * periodDialogues.length);
    var dialogue = periodDialogues[idx];

    var playerRel = window.player ? window.player.getRelationship(npcId) : 30;
    var history = this._dialogueHistory[npcId] || [];

    var result = {
      npcId: npcId,
      text: dialogue.text,
      mood: dialogue.mood,
      relationship: playerRel,
      relationLabel: getRelationshipLabel(playerRel),
      isRepeat: history.indexOf(dialogue.text) !== -1
    };

    this._dialogueHistory[npcId].push(dialogue.text);
    if (this._dialogueHistory[npcId].length > 20) {
      this._dialogueHistory[npcId].shift();
    }

    return result;
  };

  NPCSystem.prototype.interact = function (npcId, periodId) {
    var npc = this._npcs[npcId];
    if (!npc) return null;

    this._interactionCount[npcId] = (this._interactionCount[npcId] || 0) + 1;

    var dialogue = this.getDialogue(npcId, periodId);
    if (!dialogue) {
      dialogue = {
        npcId: npcId,
        text: '……',
        mood: npc.mood,
        relationship: window.player ? window.player.getRelationship(npcId) : 30,
        relationLabel: getRelationshipLabel(window.player ? window.player.getRelationship(npcId) : 30),
        isRepeat: false
      };
    }

    if (window.player) {
      window.player.incrementStat('conversationsHad');
      var listenerCount = 0;
      for (var id in this._interactionCount) {
        if (this._interactionCount[id] > 0) listenerCount++;
      }
      window.player.checkAchievement('listener', listenerCount >= 12);
    }

    return dialogue;
  };

  NPCSystem.prototype.getInteractionCount = function (npcId) {
    return this._interactionCount[npcId] || 0;
  };

  /* ---- NPC 心情系统 ---- */

  NPCSystem.prototype.setNPCMood = function (npcId, mood) {
    if (this._npcs[npcId]) {
      this._npcs[npcId].mood = mood;
    }
  };

  NPCSystem.prototype.getNPCMood = function (npcId) {
    return this._npcs[npcId] ? this._npcs[npcId].mood : 'neutral';
  };

  NPCSystem.prototype.getMoodAnimation = function (mood) {
    return MOOD_ANIMATIONS[mood] || MOOD_ANIMATIONS.neutral;
  };

  /* ---- NPC 渲染 ---- */

  NPCSystem.prototype.renderNPC = function (ctx, npcId, x, y, size, time) {
    var npc = this._npcs[npcId];
    if (!npc) return;

    var anim = this.getMoodAnimation(npc.mood);
    var bobY = Math.sin(time * anim.bobSpeed) * anim.bobAmount;
    var glowPulse = Math.sin(time * 0.01) * anim.glowPulse + anim.glowPulse;

    var playerRel = window.player ? window.player.getRelationship(npcId) : 30;
    var alpha = 0.3 + (playerRel / 100) * 0.7;

    ctx.save();
    ctx.globalAlpha = alpha;

    /* 光晕 */
    var glowRadius = size * 1.5 + glowPulse * 10;
    var glow = ctx.createRadialGradient(x, y + bobY, 0, x, y + bobY, glowRadius);
    glow.addColorStop(0, anim.glowColor);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - glowRadius, y + bobY - glowRadius, glowRadius * 2, glowRadius * 2);

    /* NPC 圆形 */
    ctx.beginPath();
    ctx.arc(x, y + bobY, size, 0, Math.PI * 2);
    ctx.fillStyle = npc.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* 图标 */
    ctx.font = Math.floor(size * 1.2) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(npc.icon, x, y + bobY);

    /* 名字 */
    if (playerRel > 20) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(npc.name, x, y + bobY + size + 14);
    }

    /* 关系指示器 */
    if (playerRel > 40) {
      var relBar = playerRel / 100;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(x - 15, y + bobY - size - 12, 30, 4);
      ctx.fillStyle = getRelationshipLabel(playerRel).color;
      ctx.fillRect(x - 15, y + bobY - size - 12, 30 * relBar, 4);
    }

    ctx.restore();
  };

  NPCSystem.prototype.renderAllAtLocation = function (ctx, locId, canvasW, canvasH, time) {
    var npcs = this.getNPCsAtLocation(locId);
    for (var i = 0; i < npcs.length; i++) {
      var npc = npcs[i];
      var pos = this.getNPCPosition(npc.id, locId);
      var x = pos.x * canvasW;
      var y = pos.y * canvasH;
      var size = 22;
      this.renderNPC(ctx, npc.id, x, y, size, time);
    }
  };

  /* ---- NPC 触摸检测 ---- */

  NPCSystem.prototype.hitTest = function (touchX, touchY, locId, canvasW, canvasH) {
    var npcs = this.getNPCsAtLocation(locId);
    var hitRadius = 44;
    for (var i = 0; i < npcs.length; i++) {
      var pos = this.getNPCPosition(npcs[i].id, locId);
      var nx = pos.x * canvasW;
      var ny = pos.y * canvasH;
      var dx = touchX - nx;
      var dy = touchY - ny;
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
        return npcs[i].id;
      }
    }
    return null;
  };

  /* ---- NPC 概览（给 reflection 用） ---- */

  NPCSystem.prototype.getOverview = function () {
    var result = [];
    for (var id in this._npcs) {
      var npc = this._npcs[id];
      var rel = window.player ? window.player.getRelationship(id) : 30;
      result.push({
        id: id,
        name: npc.name,
        icon: npc.icon,
        mood: npc.mood,
        relationship: rel,
        relationLabel: getRelationshipLabel(rel),
        interactions: this._interactionCount[id] || 0
      });
    }
    return result;
  };

  /* ---- Compatibility: main.js calls render() until File 10 update ---- */

  NPCSystem.prototype.render = function (ctx, locId, canvasW, canvasH) {
    var time = Date.now();
    this.renderAllAtLocation(ctx, locId, canvasW, canvasH, time);
  };

  window.NPCSystem = NPCSystem;
})();
