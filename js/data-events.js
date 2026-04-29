/**
 * DataEvents — 事件数据
 * 36个事件覆盖所有地点和时段，含叙述、选项、深度影响
 */
(function () {
  'use strict';

  var EVENTS = [

    /* ========== HOME — MORNING ========== */
    {
      id: 'morning_rush',
      location: 'home',
      period: 'morning',
      priority: 10,
      requiresFlag: null,
      narration: '闹钟已经响了三遍。你知道再不起就迟到了，但被窝的温度让人不舍。',
      choices: [
        { id: 'rushed', text: '翻身跳起，手忙脚乱地穿上衣服。', flag: 'morning_rushed', depthChange: -1, timeCost: 5, category: 'rushed', result: '你冲出家门，鞋带还没系好。一天的基调就这样被定下了。', relationshipDelta: null },
        { id: 'steady', text: '深呼吸三次，然后慢慢起身。', flag: 'morning_steady', depthChange: 2, timeCost: 10, category: 'reflective', result: '你在床边坐了一会儿。窗外的鸟叫声突然变得清晰。身体慢慢醒过来。', relationshipDelta: null },
        { id: 'snooze', text: '再躺五分钟。就五分钟。', flag: 'morning_snooze', depthChange: 0, timeCost: 8, category: 'avoidant', result: '你闭上了眼。五分钟像一秒钟。再次睁开时，又过了十分钟。', relationshipDelta: null }
      ]
    },
    {
      id: 'home_breakfast',
      location: 'home',
      period: 'morning',
      priority: 5,
      requiresFlag: null,
      narration: '厨房台面上有昨晚买回来的面包和一盒牛奶。冰箱里还有前天的剩菜。',
      choices: [
        { id: 'proper_meal', text: '热一热剩菜，坐下来认真吃早餐。', flag: 'breakfast_proper', depthChange: 2, timeCost: 15, category: 'reflective', result: '食物的味道比想象中好。你看着窗外的天色慢慢变亮。时间似乎慢了下来。', relationshipDelta: null },
        { id: 'quick_bite', text: '啃两口面包，灌一口牛奶，出门。', flag: 'breakfast_quick', depthChange: 0, timeCost: 3, category: 'rushed', result: '面包屑掉在了衣服上。牛奶差点洒出来。你一边走一边嚼。', relationshipDelta: null },
        { id: 'skip', text: '不吃了。不饿。', flag: 'breakfast_skip', depthChange: -1, timeCost: 0, category: 'avoidant', result: '胃里空空的。你告诉自己中午会补上。你每次都这么说。', relationshipDelta: null }
      ]
    },
    {
      id: 'home_window',
      location: 'home',
      period: 'morning',
      priority: 3,
      requiresFlag: null,
      narration: '你走到窗前拉开窗帘。外面的天色还没有完全亮。楼下的街道上有零星的行人。',
      choices: [
        { id: 'watch', text: '站在窗前多看一会儿。', flag: 'window_watched', depthChange: 3, timeCost: 8, category: 'observant', result: '你看到一个老人在遛狗。狗停在路灯杆旁嗅了很久。你突然觉得，今天也许没那么糟糕。', relationshipDelta: null },
        { id: 'close', text: '拉上窗帘，转身离开。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '窗帘合上的声音很轻。房间又暗了下来。', relationshipDelta: null }
      ]
    },

    /* ========== STREET — MORNING / COMMUTE ========== */
    {
      id: 'street_elderly',
      location: 'street',
      period: 'morning',
      priority: 8,
      requiresFlag: null,
      narration: '前面的路上，一个老奶奶提着沉重的购物袋，走得很慢。她的手在发抖。',
      choices: [
        { id: 'help', text: '走过去，接过她手里的袋子。', flag: 'helped_elderly', depthChange: 3, timeCost: 10, category: 'kindness', result: '"谢谢你啊，年轻人。"她笑了。你拎着袋子送她到巷口。袋子比你想象的重。', relationshipDelta: { elderly_bus: 10 } },
        { id: 'pass_by', text: '犹豫了一下，低头走过。', flag: null, depthChange: -1, timeCost: 2, category: 'avoidant', result: '你从她身边走过。余光里看到她的背影又弯下去了一些。你加快了脚步。', relationshipDelta: null },
        { id: 'slow_walk', text: '放慢脚步，走在她后面。', flag: 'walked_behind_elderly', depthChange: 1, timeCost: 5, category: 'observant', result: '你跟在后面，不近不远。她偶尔停下来歇一歇。你假装在看手机。', relationshipDelta: null }
      ]
    },
    {
      id: 'street_cat',
      location: 'street',
      period: 'morning',
      priority: 5,
      requiresFlag: null,
      narration: '一只橘猫蹲在垃圾桶旁边，舔着自己的爪子。它抬头看了你一眼。',
      choices: [
        { id: 'pet', text: '蹲下来，伸出手。', flag: 'pet_cat', depthChange: 2, timeCost: 5, category: 'kindness', result: '猫犹豫了一下，然后蹭了蹭你的手指。它的毛比想象中柔软。一声低沉的呼噜。', relationshipDelta: { street_cat: 15 } },
        { id: 'ignore', text: '走过去就好。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '猫目送你离开。你走了几步回头看，它已经开始舔另一只爪子了。', relationshipDelta: null },
        { id: 'share_food', text: '翻翻包里有没有什么吃的。', flag: 'fed_cat', depthChange: 3, timeCost: 8, category: 'kindness', result: '你找到半根火腿肠。猫闻了闻，小心翼翼地咬了一口，然后吃了起来。', relationshipDelta: { street_cat: 20 } }
      ]
    },

    /* ========== BUS STOP — COMMUTE ========== */
    {
      id: 'bus_seat',
      location: 'bus_stop',
      period: 'commute',
      priority: 10,
      requiresFlag: null,
      narration: '公交车上还有一个空位。旁边坐着一个低头看手机的人。车门口站着一位抱小孩的妇女。',
      choices: [
        { id: 'offer_seat', text: '站起来，把座位让给她。', flag: 'offered_seat', depthChange: 3, timeCost: 0, category: 'kindness', result: '她笑着点头坐下。小孩趴在她肩上，眼睛骨碌碌地看你。你抓着扶手，觉得站着的视线不一样。', relationshipDelta: { silent_woman: 5 } },
        { id: 'stay', text: '假装没看见，低头看自己的手机。', flag: null, depthChange: -2, timeCost: 0, category: 'avoidant', result: '你在手机上漫无目的地滑动。每一次颠簸都让车厢里的人晃一下。你不去看门口。', relationshipDelta: null },
        { id: 'stand_anyway', text: '不坐了，站着看窗外。', flag: 'stood_on_bus', depthChange: 1, timeCost: 0, category: 'observant', result: '窗外的城市在移动。你看见路边的早餐摊、等红灯的人群、天桥上的流浪歌手。', relationshipDelta: null }
      ]
    },
    {
      id: 'bus_arrival',
      location: 'bus_stop',
      period: 'commute',
      priority: 6,
      requiresFlag: null,
      narration: '公交车到站了。下车的一瞬间，清晨的空气涌入肺里。车站旁有一个卖早点的阿姨正在收摊。',
      choices: [
        { id: 'buy_breakfast', text: '买一杯豆浆。', flag: 'bought_soy_milk', depthChange: 1, timeCost: 3, category: 'kindness', result: '"早啊，去上班？"阿姨递给你一杯热豆浆。杯子烫手，但你握着很舒服。', relationshipDelta: null },
        { id: 'rush_office', text: '快步走向办公室。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '你的脚步很快。路上的人像背景一样模糊地掠过。', relationshipDelta: null }
      ]
    },
    {
      id: 'bus_rain',
      location: 'bus_stop',
      period: 'commute',
      priority: 12,
      requiresFlag: null,
      narration: '下雨了。公交站台挤满了躲雨的人。你的肩膀被雨淋湿了一小块。',
      choices: [
        { id: 'share_umbrella', text: '往里挪一挪，给旁边的人让出空间。', flag: 'shared_shelter', depthChange: 2, timeCost: 3, category: 'kindness', result: '旁边的人感激地点了点头。你们挤在一起，听雨打在站台顶棚上的声音。', relationshipDelta: null },
        { id: 'wait_patience', text: '安静地等雨变小。', flag: 'waited_rain', depthChange: 2, timeCost: 8, category: 'reflective', result: '雨的声音很密集。水从站台边缘滴下来，形成一条细线。你盯着那条线看了很久。', relationshipDelta: null },
        { id: 'run', text: '冒雨跑向办公室。', flag: 'ran_in_rain', depthChange: -1, timeCost: 2, category: 'rushed', result: '你跑了起来。雨水打在脸上，凉而密。到办公室时，衬衫湿透了。', relationshipDelta: null }
      ]
    },

    /* ========== OFFICE — WORK ========== */
    {
      id: 'office_colleague',
      location: 'office',
      period: 'work',
      priority: 10,
      requiresFlag: null,
      narration: '同事李从你身边经过时放慢了脚步。"昨晚加班到几点？"他的声音很低，像是不想让别人听到。',
      choices: [
        { id: 'honest', text: '"其实没加班，早早就睡了。"', flag: 'honest_with_li', depthChange: 2, timeCost: 5, category: 'honest', result: '他笑了笑。"那挺好的。"停顿了一下，"我最近睡不好。"他没有继续说下去。', relationshipDelta: { colleague_li: 8 } },
        { id: 'vague', text: '"还行吧，你呢？"', flag: null, depthChange: 1, timeCost: 3, category: 'observant', result: '"还行。"他把杯子放在桌上。"还行"是这里最常用的回答。你不太确定它是真的。', relationshipDelta: { colleague_li: 3 } },
        { id: 'nod', text: '点点头，继续盯着屏幕。', flag: null, depthChange: -1, timeCost: 0, category: 'avoidant', result: '他在你旁边站了两秒，然后走开了。键盘的敲击声填满了沉默。', relationshipDelta: { colleague_li: -2 } }
      ]
    },
    {
      id: 'office_wang_gossip',
      location: 'office',
      period: 'work',
      priority: 6,
      requiresFlag: null,
      narration: '同事王端着咖啡凑过来。"听说隔壁组要裁员了。"她的眼神闪烁着某种兴奋。',
      choices: [
        { id: 'listen', text: '"真的吗？什么情况？"你放下手里的工作。', flag: 'listened_gossip', depthChange: 0, timeCost: 8, category: 'observant', result: '她压低声音说了很多细节。你不知道哪些是真的。但办公室的空气确实不一样了。', relationshipDelta: { colleague_wang: 5 } },
        { id: 'deflect', text: '"嗯……先忙了。"礼貌地转回屏幕。', flag: null, depthChange: 1, timeCost: 2, category: 'reflective', result: '她有点扫兴地走了。你看着屏幕上的数字，觉得它们比八卦更真实一些。', relationshipDelta: { colleague_wang: -3 } },
        { id: 'ask_source', text: '"消息来源可靠吗？"', flag: 'questioned_gossip', depthChange: 2, timeCost: 5, category: 'brave', result: '她愣了一下。"反正听说的。"她的语气不如刚才确定了。你不确定你做对了没有。', relationshipDelta: { colleague_wang: 0 } }
      ]
    },
    {
      id: 'office_plant',
      location: 'office',
      period: 'work',
      priority: 3,
      requiresFlag: null,
      narration: '办公桌角落的那盆绿萝叶子开始发黄了。你不确定上次浇水是什么时候。',
      choices: [
        { id: 'water', text: '去茶水间接一杯水浇上。', flag: 'watered_plant', depthChange: 2, timeCost: 3, category: 'kindness', result: '水慢慢渗进土里。你想起小时候也浇过花，后来那盆花还是死了。', relationshipDelta: null },
        { id: 'move_closer', text: '把它挪到窗边，让它晒晒太阳。', flag: 'moved_plant', depthChange: 1, timeCost: 2, category: 'observant', result: '叶子在光线下是半透明的。你看到了叶脉的纹路，像河流的分支。', relationshipDelta: null },
        { id: 'ignore_plant', text: '它自己会想办法的。', flag: null, depthChange: 0, timeCost: 0, category: 'avoidant', result: '你看了它最后一眼，然后回到工作中。黄叶在角落里安静地卷曲。', relationshipDelta: null }
      ]
    },
    {
      id: 'office_email',
      location: 'office',
      period: 'afternoon',
      priority: 7,
      requiresFlag: null,
      narration: '收到一封群发邮件，要求所有人提交本周工作总结。截止时间是五点。',
      choices: [
        { id: 'write_carefully', text: '认真写一份详细的总结。', flag: 'careful_report', depthChange: 1, timeCost: 15, category: 'reflective', result: '你回看了这一周的工作。有些事情已经想不起来了。你写了删，删了写。最后发出去的是第三版。', relationshipDelta: { boss: 3 } },
        { id: 'quick_summary', text: '草草写几句交了。', flag: null, depthChange: 0, timeCost: 5, category: 'rushed', result: '你用了五分钟。内容空洞但格式正确。这种事，没人真的会看。也许吧。', relationshipDelta: null }
      ]
    },

    /* ========== OFFICE — LUNCH ========== */
    {
      id: 'lunch_choice',
      location: 'office',
      period: 'lunch',
      priority: 10,
      requiresFlag: null,
      narration: '午休了。食堂的方向传来人声和饭菜的味道。同事李问你要不要一起。',
      choices: [
        { id: 'together', text: '和他一起去食堂。', flag: 'lunch_together', depthChange: 2, timeCost: 15, category: 'kindness', result: '食堂很吵。你们找了个角落的位置。他说起他女儿刚上小学的事。你没想到他会聊这些。', relationshipDelta: { colleague_li: 10 } },
        { id: 'alone_outside', text: '"不了，我去外面走走。"', flag: 'lunch_outside', depthChange: 1, timeCost: 10, category: 'observant', result: '你端着饭盒走到楼下的长椅上。阳光很暖。你嚼着饭菜，看行人来来去去。', relationshipDelta: null },
        { id: 'desk', text: '"你们去吧，我随便吃点。"', flag: 'lunch_at_desk', depthChange: 0, timeCost: 5, category: 'avoidant', result: '你在工位上吃了面包。办公室里只剩你一个人和空调的嗡嗡声。', relationshipDelta: { colleague_li: -2 } }
      ]
    },
    {
      id: 'lunch_conversation',
      location: 'office',
      period: 'lunch',
      priority: 5,
      requiresFlag: 'lunch_together',
      narration: '吃饭时，同事李忽然放下筷子。"你说，人活着到底是为了什么？"',
      choices: [
        { id: 'serious_answer', text: '"也许是为了某些瞬间吧。"', flag: 'philosophical_chat', depthChange: 4, timeCost: 10, category: 'reflective', result: '他看着你，好像在想你说的话。"什么瞬间？"你也不确定。但这个问题本身似乎就是一种回答。', relationshipDelta: { colleague_li: 12 } },
        { id: 'joke', text: '"为了食堂的红烧肉。"', flag: null, depthChange: 1, timeCost: 3, category: 'observant', result: '他笑了。笑完之后沉默了一会儿。你不知道他是真的觉得好笑，还是在配合你。', relationshipDelta: { colleague_li: 3 } },
        { id: 'deflect_deep', text: '"你最近是不是压力太大了？"', flag: 'noticed_li_stress', depthChange: 3, timeCost: 5, category: 'kindness', result: '他愣了一下，然后叹了口气。"可能是吧。"他没有继续说，但你注意到他的筷子停在空中很久。', relationshipDelta: { colleague_li: 15 } }
      ]
    },

    /* ========== PARK — LUNCH / AFTERNOON ========== */
    {
      id: 'park_stranger',
      location: 'park',
      period: 'lunch',
      priority: 10,
      requiresFlag: null,
      narration: '长椅的另一头坐着一个陌生人。他在看一本很旧的书，封面已经磨损了。他似乎注意到了你在看他。',
      choices: [
        { id: 'ask_book', text: '"在看什么书？"', flag: 'asked_stranger_book', depthChange: 3, timeCost: 8, category: 'brave', result: '他翻了翻封面。"佩索阿的诗集。你不一定知道。"他递给你看。书页泛黄，有手写的批注。', relationshipDelta: { park_stranger: 10 } },
        { id: 'nod_smile', text: '点头微笑，继续看自己的方向。', flag: null, depthChange: 1, timeCost: 2, category: 'observant', result: '他也点了点头。你们各自安静地坐着。风吹过，树叶沙沙响了一阵。', relationshipDelta: null },
        { id: 'change_seat', text: '站起来，换一个位置坐。', flag: null, depthChange: -1, timeCost: 2, category: 'avoidant', result: '你换了个位置。新的长椅上只有你一个人。但你还在想那本书的封面。', relationshipDelta: null }
      ]
    },
    {
      id: 'park_children',
      location: 'park',
      period: 'afternoon',
      priority: 5,
      requiresFlag: null,
      narration: '草地上有几个小孩在追逐打闹。他们的笑声很远就能听到。一个小孩摔倒了，坐在地上张大了嘴。',
      choices: [
        { id: 'help_child', text: '走过去看看他有没有受伤。', flag: 'helped_child', depthChange: 2, timeCost: 5, category: 'kindness', result: '你蹲下来。"疼不疼？"他摇了摇头，眼泪还在流。一个大人跑过来抱起了他。', relationshipDelta: null },
        { id: 'watch_children', text: '远远地看着。', flag: null, depthChange: 2, timeCost: 5, category: 'observant', result: '你看着他们跑、跳、摔倒、爬起来、再跑。你的嘴角不自觉地上扬了一点。', relationshipDelta: null },
        { id: 'walk_on', text: '继续走你的路。', flag: null, depthChange: 0, timeCost: 1, category: 'avoidant', result: '笑声渐渐远去。你走在鹅卵石小路上，脚步声被草丛吸收了。', relationshipDelta: null }
      ]
    },
    {
      id: 'park_bench',
      location: 'park',
      period: 'afternoon',
      priority: 3,
      requiresFlag: null,
      narration: '你找到一张空长椅坐下。周围很安静，只有远处传来的鸟叫声和风吹树叶的声音。',
      choices: [
        { id: 'close_eyes', text: '闭上眼睛，听周围的声音。', flag: 'park_meditated', depthChange: 4, timeCost: 10, category: 'reflective', result: '你听到了风、鸟、远处的车声、自己的呼吸。世界没有消失，只是换了一种方式存在。你睁开眼时，阳光的位置已经变了。', relationshipDelta: null },
        { id: 'observe_nature', text: '观察身旁的那棵树。', flag: 'observed_tree', depthChange: 3, timeCost: 8, category: 'observant', result: '树皮上有裂纹和苔藓。一只蚂蚁正沿着裂纹向上爬。你跟着它的轨迹看了一会儿，直到它消失在树干的另一面。', relationshipDelta: null },
        { id: 'check_phone', text: '掏出手机看看。', flag: null, depthChange: -1, timeCost: 5, category: 'rushed', result: '手机上没什么新的消息。你把屏幕锁上，又打开，又锁上。阳光照在黑屏上，映出你的脸。', relationshipDelta: null }
      ]
    },

    /* ========== CHURCH — EVENING ========== */
    {
      id: 'church_evening',
      location: 'church',
      period: 'evening',
      priority: 10,
      requiresFlag: null,
      narration: '教堂的门半开着。里面传出管风琴的余音。昏暗的灯光从门缝中洒出来，在台阶上画出一条界线。',
      choices: [
        { id: 'enter', text: '推门走进去。', flag: 'entered_church', depthChange: 4, timeCost: 10, category: 'brave', result: '里面空无一人。彩色玻璃窗在残存的光线中发出模糊的彩光。你坐在最后一排长椅上，木头很凉。安静得能听到自己的心跳。', relationshipDelta: null },
        { id: 'stand_door', text: '站在门口往里看。', flag: null, depthChange: 2, timeCost: 5, category: 'observant', result: '你看到长椅排列整齐，尽头是一个十字架的剪影。光线从窗户落下，像凝固的水。你不知道该不该进去。', relationshipDelta: null },
        { id: 'pass_by', text: '经过就好。你不信教。', flag: null, depthChange: -1, timeCost: 1, category: 'avoidant', result: '你走过了教堂。背后，管风琴的声音还在继续。你不确定那是不是错觉。', relationshipDelta: null }
      ]
    },
    {
      id: 'church_graveyard',
      location: 'church',
      period: 'evening',
      priority: 5,
      requiresFlag: 'entered_church',
      narration: '教堂后面有一片小小的墓地。墓碑新旧不一，有些已经长满了青苔。',
      choices: [
        { id: 'read_stones', text: '走近几步，看看墓碑上的字。', flag: 'read_gravestones', depthChange: 3, timeCost: 8, category: 'observant', result: '一块碑上刻着"1923-1998"，名字已经模糊了。旁边的碑很新，花还没有完全枯萎。你站在那里，风吹过，像有人轻声叹息。', relationshipDelta: null },
        { id: 'sit_nearby', text: '在旁边的长椅上坐一会儿。', flag: 'sat_by_graves', depthChange: 2, timeCost: 6, category: 'reflective', result: '你坐在那里，看着墓碑和暮色。远处教堂的钟响了一声。你想到一些很远的事情。', relationshipDelta: null }
      ]
    },

    /* ========== STREET — COMMUTE-HOME ========== */
    {
      id: 'evening_beggar',
      location: 'street',
      period: 'commute-home',
      priority: 10,
      requiresFlag: null,
      narration: '街角坐着一个乞丐。他的面前放着一个破旧的碗，里面只有几个硬币。他在发抖。',
      choices: [
        { id: 'give_money', text: '弯下腰，在碗里放几块钱。', flag: 'gave_to_beggar', depthChange: 3, timeCost: 3, category: 'kindness', result: '他抬头看了你一眼，点了点头。你没有说"不用谢"之类的话。你不知道该说什么。', relationshipDelta: { beggar: 10 } },
        { id: 'buy_food', text: '去旁边的便利店买一个热饭团给他。', flag: 'gave_food_beggar', depthChange: 4, timeCost: 8, category: 'kindness', result: '他接过来，低声说了句什么。你不确定是不是谢谢。饭团的热气在他的手指间升起。', relationshipDelta: { beggar: 15 } },
        { id: 'walk_past', text: '低下头走过去。', flag: null, depthChange: -2, timeCost: 1, category: 'avoidant', result: '你加快了脚步。他的目光跟了你几步，然后低下了头。你把手插进口袋里。', relationshipDelta: null },
        { id: 'sit_nearby', text: '在旁边坐下来。', flag: 'sat_with_beggar', depthChange: 3, timeCost: 10, category: 'reflective', result: '你坐了下来。他没有赶你走。你们沉默地坐了一会儿。天色暗下来。路灯亮了。', relationshipDelta: { beggar: 8 } }
      ]
    },
    {
      id: 'evening_convenience',
      location: 'street',
      period: 'commute-home',
      priority: 5,
      requiresFlag: null,
      narration: '便利店的白光从玻璃门泻出来。门口的便当架上还剩几盒打折的饭。',
      choices: [
        { id: 'buy_dinner', text: '买一盒便当。', flag: 'bought_bento', depthChange: 1, timeCost: 5, category: 'observant', result: '收银员扫了一下码，没有抬头。微波炉旋转的声音很规律。三分钟后，你拿到了热便当。', relationshipDelta: null },
        { id: 'browse', text: '在里面逛一圈再走。', flag: 'browsed_convenience', depthChange: 1, timeCost: 8, category: 'observant', result: '你走过一排排货架。零食、饮料、日用品。所有东西都在固定的位置上。你在杂志架前停了一会儿。', relationshipDelta: null },
        { id: 'pass_convenience', text: '继续走。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '便利店的门开了又关。冷气从门缝里飘出来，在你脚边散开。', relationshipDelta: null }
      ]
    },

    /* ========== NIGHT ROOM — NIGHT ========== */
    {
      id: 'night_reflection',
      location: 'night_room',
      period: 'night',
      priority: 10,
      requiresFlag: null,
      narration: '你坐在床边。房间很安静。手机屏幕亮了一下，又暗了。你不知道该做什么。',
      choices: [
        { id: 'write_diary', text: '拿起笔，在纸上写下今天的事。', flag: 'wrote_diary', depthChange: 4, timeCost: 15, category: 'reflective', result: '你写了几行字。笔迹歪歪扭扭的。有些事写出来之后，看起来不一样了。你把纸折好，放在枕头底下。', relationshipDelta: null },
        { id: 'stare_ceiling', text: '仰面躺下，盯着天花板。', flag: 'stared_ceiling', depthChange: 2, timeCost: 10, category: 'reflective', result: '天花板上的裂纹像一条干涸的河。你沿着它走了一趟。思绪像水一样流动，没有方向。', relationshipDelta: null },
        { id: 'scroll_phone', text: '打开手机刷社交媒体。', flag: 'scrolled_phone', depthChange: -2, timeCost: 10, category: 'avoidant', result: '你滑了很久。别人的生活像图片展览，清晰而遥远。你关掉手机，房间更暗了。', relationshipDelta: null }
      ]
    },
    {
      id: 'night_remember',
      location: 'night_room',
      period: 'night',
      priority: 8,
      requiresFlag: '__night_remember_check',
      narration: '你忽然想起一件事。很久以前的。那些细节像碎片一样浮上来。',
      choices: [
        { id: 'follow_memory', text: '闭上眼睛，让它完整地浮现。', flag: 'followed_memory', depthChange: 5, timeCost: 12, category: 'reflective', result: '记忆来了又去。你抓住了其中一帧：某个下午的光线，某句话的语气，某种已经忘记的气味。它停留了一会儿，然后像水一样流走了。', relationshipDelta: null },
        { id: 'shake_off', text: '摇摇头，不想了。', flag: null, depthChange: -1, timeCost: 2, category: 'avoidant', result: '你翻了个身。枕头被压出一个凹痕。那个记忆退到很远的地方，但并没有消失。', relationshipDelta: null }
      ]
    },
    {
      id: 'night_window',
      location: 'night_room',
      period: 'night',
      priority: 4,
      requiresFlag: null,
      narration: '你走到窗前。夜色很浓。远处有几盏灯还亮着。不知道是谁还没有睡。',
      choices: [
        { id: 'watch_lights', text: '数一数那些亮着的窗。', flag: 'counted_lights', depthChange: 3, timeCost: 8, category: 'observant', result: '一、二、三……数到第七个的时候，有一盏灯灭了。你想，那个人终于睡了。然后你又数了一遍。', relationshipDelta: null },
        { id: 'open_window', text: '推开窗户，感受夜风。', flag: 'opened_night_window', depthChange: 2, timeCost: 5, category: 'observant', result: '风很凉。你深吸一口气。空气里有花草和泥土的气味。远处有火车的汽笛声，像一声叹息。', relationshipDelta: null },
        { id: 'close_curtain', text: '拉上窗帘。该睡了。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '窗帘拉上了。世界被隔在外面。你躺下来，把被子拉到下巴。', relationshipDelta: null }
      ]
    },

    /* ========== Additional Events ========== */

    {
      id: 'home_mirror',
      location: 'home',
      period: 'morning',
      priority: 2,
      requiresFlag: null,
      narration: '你路过走廊的镜子，余光中看到自己的脸。你停了下来。',
      choices: [
        { id: 'look_carefully', text: '凑近镜子，仔细看看自己。', flag: 'looked_in_mirror', depthChange: 2, timeCost: 5, category: 'reflective', result: '你看到了眼角的细纹、下巴上没刮干净的胡茬、瞳孔里微弱的光。这是你，又不完全是你。', relationshipDelta: null },
        { id: 'look_away', text: '移开视线，继续走。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '你走过了镜子。镜子里的人也走过了。', relationshipDelta: null }
      ]
    },
    {
      id: 'home_phone_call',
      location: 'home',
      period: 'evening',
      priority: 8,
      requiresFlag: null,
      narration: '手机响了。是妈妈的电话。屏幕上显示着"妈妈"。时间已经不早了。',
      choices: [
        { id: 'answer', text: '接起电话。', flag: 'answered_mom', depthChange: 3, timeCost: 12, category: 'kindness', result: '"吃了吗？""嗯。""工作还好吧？""还好。"沉默了一会儿。她说"那早点睡"，你说"好"。电话挂断后，你握着手机坐了很久。', relationshipDelta: { mother: 12 } },
        { id: 'call_back_later', text: '现在不方便，等下回过去。', flag: 'missed_mom_call', depthChange: -1, timeCost: 2, category: 'avoidant', result: '你按了静音。手机震动了三次，然后安静了。你想着待会回，但你知道"待会"可能意味着明天。', relationshipDelta: { mother: -5 } }
      ]
    },
    {
      id: 'street_noise',
      location: 'street',
      period: 'commute',
      priority: 3,
      requiresFlag: null,
      narration: '你经过一栋居民楼，听到楼上传来钢琴声。断断续续的，像是一个初学者在练习。',
      choices: [
        { id: 'stop_listen', text: '停下来听一会儿。', flag: 'listened_piano', depthChange: 3, timeCost: 5, category: 'observant', result: '旋律反复了三遍，每遍都比上一遍流畅一些。第三遍的时候，有个音弹错了。你等着听第四遍，但它没有来。', relationshipDelta: null },
        { id: 'walk_on_music', text: '脚步不停，音乐渐远。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '音乐在身后渐渐模糊。你走过拐角，它就消失了。', relationshipDelta: null }
      ]
    },
    {
      id: 'bus_music',
      location: 'bus_stop',
      period: 'commute-home',
      priority: 4,
      requiresFlag: null,
      narration: '公交车上很安静。有人在后排戴着耳机小声哼歌。旋律很熟悉，你想不起来叫什么。',
      choices: [
        { id: 'hum_along', text: '不自觉地跟着哼了起来。', flag: 'hummed_on_bus', depthChange: 2, timeCost: 3, category: 'observant', result: '你们的声音汇在了一起。对方摘下一只耳机回头看你，笑了。你有点不好意思，但也笑了。', relationshipDelta: null },
        { id: 'enjoy_silence', text: '安静地听。', flag: null, depthChange: 1, timeCost: 3, category: 'reflective', result: '那个旋律在车厢里回荡。窗外的路灯一盏一盏地闪过，像翻页一样。', relationshipDelta: null }
      ]
    },
    {
      id: 'office_printer',
      location: 'office',
      period: 'work',
      priority: 2,
      requiresFlag: null,
      narration: '打印机卡纸了。指示灯不停地闪着红光。旁边没有人。',
      choices: [
        { id: 'fix_printer', text: '打开盖子，小心地取出卡住的纸。', flag: 'fixed_printer', depthChange: 2, timeCost: 5, category: 'kindness', result: '纸张皱巴巴的，上面印了半张报告。你把纸抽出来，重新放好。绿灯亮了。打印机嗡嗡地重新开始工作。', relationshipDelta: null },
        { id: 'leave_it', text: '不是你的问题。等IT来处理。', flag: null, depthChange: 0, timeCost: 1, category: 'avoidant', result: '红灯继续闪着。你走回座位。路过的人看了一眼打印机，皱了皱眉，也走开了。', relationshipDelta: null }
      ]
    },
    {
      id: 'park_dusk',
      location: 'park',
      period: 'evening',
      priority: 6,
      requiresFlag: null,
      narration: '公园里的人越来越少。喷泉已经停了。最后的光正从天边消失。',
      choices: [
        { id: 'stay_until_dark', text: '坐在长椅上，等天完全黑下来。', flag: 'stayed_until_dark', depthChange: 4, timeCost: 10, category: 'reflective', result: '天空从橙色变成紫色，再变成深蓝。路灯自动亮了。你听到一只鸟飞过头顶，翅膀划破空气的声音。你站起来时，腿有点麻。', relationshipDelta: null },
        { id: 'leave_park', text: '天快黑了，该走了。', flag: null, depthChange: 0, timeCost: 2, category: 'rushed', result: '你快步走出公园。身后的路灯一盏接一盏地亮起来，像在为你送行。', relationshipDelta: null }
      ]
    },
    {
      id: 'church_silence',
      location: 'church',
      period: 'night',
      priority: 5,
      requiresFlag: null,
      narration: '夜晚的教堂广场空无一人。路灯在教堂的墙壁上投下昏黄的光。远处偶尔有车经过。',
      choices: [
        { id: 'stand_silence', text: '站在广场中央，闭上眼睛。', flag: 'church_silence_stood', depthChange: 3, timeCost: 8, category: 'reflective', result: '你听到了风穿过教堂缝隙的声音。很低，像叹息。你睁开眼时，月亮在教堂尖顶的旁边。', relationshipDelta: null },
        { id: 'touch_wall', text: '走过去，把手放在粗糙的石墙上。', flag: 'touched_church_wall', depthChange: 2, timeCost: 5, category: 'observant', result: '石头很凉，表面凹凸不平。你能感觉到时间的纹理。墙上有一小片青苔，在灯光下泛着微弱的绿。', relationshipDelta: null },
        { id: 'leave_church', text: '这里太安静了。回去吧。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '你转身离开。脚步声在空旷的广场上回响了一会儿，然后被夜色吸收了。', relationshipDelta: null }
      ]
    },
    {
      id: 'night_room_book',
      location: 'night_room',
      period: 'night',
      priority: 3,
      requiresFlag: null,
      narration: '书架上有一本你买了很久但一直没读的书。书脊上的字已经有些褪色了。',
      choices: [
        { id: 'read_book', text: '拿下来翻几页。', flag: 'read_at_night', depthChange: 3, timeCost: 10, category: 'reflective', result: '你翻到一页，上面写着："人是为活着本身而活着的，而不是为了活着之外的任何事物所活着。"你盯着这句话看了很久。', relationshipDelta: null },
        { id: 'not_now', text: '今天太累了。改天吧。', flag: null, depthChange: 0, timeCost: 1, category: 'avoidant', result: '你的手在书脊上停了一下，然后收了回来。书继续在架子上等待。', relationshipDelta: null }
      ]
    },
    {
      id: 'night_room_photo',
      location: 'night_room',
      period: 'night',
      priority: 2,
      requiresFlag: null,
      narration: '你打开抽屉找充电线，翻到一张旧照片。照片上的人笑容很灿烂。你想不起来是在哪拍的。',
      choices: [
        { id: 'study_photo', text: '拿起来仔细看看。', flag: 'studied_old_photo', depthChange: 3, timeCost: 8, category: 'reflective', result: '照片背面有字，但已经模糊了。你看着照片上的自己，那个表情是你很久没有做过的。你把照片放在了桌上，而不是放回抽屉。', relationshipDelta: null },
        { id: 'put_back', text: '放回去。', flag: null, depthChange: 0, timeCost: 1, category: 'avoidant', result: '你把照片放回抽屉。充电线在照片下面。你插上线，手机亮了一下。', relationshipDelta: null }
      ]
    },

    /* ========== Extended Events — Phase 8 ========== */

    {
      id: 'home_window_morning',
      location: 'home',
      period: 'morning',
      priority: 4,
      requiresFlag: null,
      narration: '你走到窗前拉开窗帘。阳光一下子涌进来，在地板上画出一个明亮的长方形。灰尘在光柱里飘浮。',
      choices: [
        { id: 'watch_dust', text: '站在光柱里，看灰尘飘浮。', flag: 'watched_dust', depthChange: 3, timeCost: 6, category: 'observant', result: '灰尘在阳光里像是微小的星球。你伸出手，它们从你的指缝间穿过。你突然觉得，也许所有东西都是这样——看得见，却抓不住。', relationshipDelta: null },
        { id: 'open_window_wide', text: '把窗户推开，让新鲜空气进来。', flag: 'opened_morning_window', depthChange: 2, timeCost: 3, category: 'reflective', result: '风带着清晨的凉意吹进来。楼下有人在遛狗。远处的天际线上，太阳已经完全升起来了。新的一天。', relationshipDelta: null }
      ]
    },
    {
      id: 'home_rainy_morning',
      location: 'home',
      period: 'morning',
      priority: 6,
      requiresFlag: null,
      narration: '你被雨声吵醒。雨下得很大，打在窗户上像密密麻麻的鼓点。今天没有带伞。',
      choices: [
        { id: 'enjoy_rain', text: '在窗边坐一会儿，听雨。', flag: 'listened_morning_rain', depthChange: 3, timeCost: 8, category: 'reflective', result: '雨声有一种节奏。不是整齐的那种，而是像很多人在说话，各说各的。你闭上眼睛，让声音从左耳进，右耳出。', relationshipDelta: null },
        { id: 'check_weather', text: '打开手机看天气预报。', flag: null, depthChange: 0, timeCost: 2, category: 'rushed', result: '预报说上午转阴。你不太相信。天气预报和人生一样，计划赶不上变化。', relationshipDelta: null }
      ]
    },
    {
      id: 'street_morning_vendor',
      location: 'street',
      period: 'morning',
      priority: 4,
      requiresFlag: null,
      narration: '路边有个卖煎饼的摊子。摊主是个中年男人，动作很快，一勺面糊摊出一个圆。',
      choices: [
        { id: 'buy_jianbing', text: '排队买一个煎饼。', flag: 'bought_jianbing', depthChange: 1, timeCost: 5, category: 'observant', result: '"加不加辣？""加。""要不要蛋？""加两个。"摊主的手翻飞着。你看着他把煎饼折起来，像在包一件礼物。热乎乎地递到你手里。', relationshipDelta: null },
        { id: 'watch_vendor', text: '站在旁边看一会儿。', flag: 'watched_vendor', depthChange: 2, timeCost: 4, category: 'observant', result: '他的动作行云流水。每一个煎饼都一样圆，一样薄。你突然觉得，把一件事做到这个程度，也是一种了不起。', relationshipDelta: null }
      ]
    },
    {
      id: 'street_evening_lights',
      location: 'street',
      period: 'evening',
      priority: 5,
      requiresFlag: null,
      narration: '黄昏的街道。路灯还没有全亮。天边最后一抹橙色正在消退，像一幅正在被擦掉的画。',
      choices: [
        { id: 'pause_sunset', text: '停下来，看天边最后一缕光。', flag: 'paused_sunset', depthChange: 3, timeCost: 5, category: 'observant', result: '那道光从橙色变成紫色，然后变成灰蓝。你看着它消失的过程，像目送一个朋友远行。天完全暗下来的那一刻，你感到一种奇怪的平静。', relationshipDelta: null },
        { id: 'hurry_home', text: '加快脚步回家。', flag: null, depthChange: 0, timeCost: 1, category: 'rushed', result: '你低着头走。当你再抬头时，天已经完全黑了。那道光线你没有看到它消失。', relationshipDelta: null }
      ]
    },
    {
      id: 'bus_evening_people',
      location: 'bus_stop',
      period: 'commute-home',
      priority: 6,
      requiresFlag: null,
      narration: '晚高峰的公交车上人很多。你被挤在后门附近，和一群疲惫的面孔挤在一起。每个人都在看手机或者闭着眼。',
      choices: [
        { id: 'observe_faces', text: '偷偷观察周围人的表情。', flag: 'observed_bus_faces', depthChange: 2, timeCost: 5, category: 'observant', result: '有人的嘴角微微上翘，不知道在看什么。有人的眉头紧锁，手机屏幕上全是密密麻麻的数字。有人闭着眼，耳机线从领口垂下来。你也是他们中的一员。', relationshipDelta: null },
        { id: 'close_eyes_bus', text: '也闭上眼休息一会儿。', flag: 'rested_on_bus', depthChange: 1, timeCost: 5, category: 'reflective', result: '你闭上眼。公交车的震动传到脚底，像摇篮一样。你不记得自己是什么时候睁开眼的。只是窗外的景色变了。', relationshipDelta: null }
      ]
    },
    {
      id: 'bus_morning_newspaper',
      location: 'bus_stop',
      period: 'commute',
      priority: 3,
      requiresFlag: null,
      narration: '座位上遗落了一份报纸。头版标题很醒目，讲的是城市改造的新闻。',
      choices: [
        { id: 'read_newspaper', text: '拿起来翻一翻。', flag: 'read_bus_newspaper', depthChange: 2, timeCost: 5, category: 'observant', result: '你翻到副刊，有一篇短文写的是某个即将消失的老巷子。配图里有一棵很大的梧桐树。你不知道那个地方在哪里，但你想去看看。', relationshipDelta: null },
        { id: 'leave_newspaper', text: '不看了，放在旁边。', flag: null, depthChange: 0, timeCost: 1, category: 'neutral', result: '报纸安静地躺在座位上。下一站上来一个人，拿起来看了。', relationshipDelta: null }
      ]
    },
    {
      id: 'office_afternoon_slump',
      location: 'office',
      period: 'afternoon',
      priority: 5,
      requiresFlag: null,
      narration: '下午三点。眼皮在打架。屏幕上的文字开始模糊。咖啡杯已经空了。',
      choices: [
        { id: 'stretch', text: '站起来活动一下，走到窗边。', flag: 'stretched_afternoon', depthChange: 2, timeCost: 5, category: 'reflective', result: '窗外的天空是浅灰色的。对面楼的窗户里有人在走动。你活动了一下肩膀，骨节发出轻微的声响。身体记住了你需要它记住的一切。', relationshipDelta: null },
        { id: 'push_through', text: '揉揉眼睛，继续干活。', flag: null, depthChange: 0, timeCost: 3, category: 'rushed', result: '你用力揉了揉眼睛。屏幕重新变得清晰。但你知道那种清晰不会持续太久。', relationshipDelta: null },
        { id: 'tea_break', text: '去茶水间泡杯茶。', flag: 'made_tea', depthChange: 2, timeCost: 5, category: 'pause', result: '热水冲进杯子，茶叶慢慢展开。你看着它们在水里旋转、舒展、沉底。办公室的噪音好像远了。茶还烫，你吹了吹。', relationshipDelta: null }
      ]
    },
    {
      id: 'office_lunch_alone',
      location: 'office',
      period: 'lunch',
      priority: 3,
      requiresFlag: null,
      narration: '食堂人太多了。你决定去天台吃午饭。天台上有风，可以看到远处的城市。',
      choices: [
        { id: 'skyline', text: '站在栏杆边看天际线。', flag: 'viewed_skyline', depthChange: 3, timeCost: 8, category: 'observant', result: '从这个高度看，城市像一幅缩小的地图。那些你走过的街道变成了细线，人变成了看不见的点。风把饭盒里的热气吹散了。', relationshipDelta: null },
        { id: 'eat_quietly', text: '找个角落安静地吃。', flag: 'ate_on_roof', depthChange: 2, timeCost: 6, category: 'reflective', result: '你蹲在角落里吃着。风翻动着你的餐巾纸。远处有起重机在缓缓转动。你嚼着饭，什么都不想。有时候什么都不想就是最好的想法。', relationshipDelta: null }
      ]
    },
    {
      id: 'park_evening_dog',
      location: 'park',
      period: 'evening',
      priority: 4,
      requiresFlag: null,
      narration: '公园里有人在遛狗。一只金毛跑到你面前，摇着尾巴，用鼻子拱你的手。',
      choices: [
        { id: 'pet_dog', text: '蹲下来摸摸它的头。', flag: 'pet_golden', depthChange: 2, timeCost: 4, category: 'kindness', result: '它把头靠在你的膝盖上，尾巴摇得更欢了。主人远远地喊了一声"回来"，它抬头看了看你，又看了看他，然后跑回去了。你的手上还有它毛发的温度。', relationshipDelta: null },
        { id: 'watch_dog', text: '看着它跑远。', flag: null, depthChange: 1, timeCost: 2, category: 'observant', result: '它朝主人跑回去，又回头看了一眼。然后跳进草丛里追什么东西去了。快乐对它来说是这么简单的事情。', relationshipDelta: null }
      ]
    },
    {
      id: 'park_morning_jogger',
      location: 'park',
      period: 'morning',
      priority: 3,
      requiresFlag: null,
      narration: '清晨的公园。一个穿运动服的人从你身边跑过，呼吸均匀。他的额头上全是汗。',
      choices: [
        { id: 'watch_jogger', text: '目送他远去。', flag: 'watched_jogger', depthChange: 1, timeCost: 2, category: 'observant', result: '他的脚步声越来越远。你注意到他的鞋带系得很整齐。有些人的一天是从这里开始的。', relationshipDelta: null },
        { id: 'start_jogging', text: '要不要也跑两步？', flag: 'tried_jogging', depthChange: 2, timeCost: 8, category: 'brave', result: '你跑了几步就喘了。风吹在脸上是凉的。你的心跳很快，但不是因为害怕。也许明天可以多跑一点。', relationshipDelta: null }
      ]
    },
    {
      id: 'church_afternoon_light',
      location: 'church',
      period: 'afternoon',
      priority: 4,
      requiresFlag: null,
      narration: '下午的教堂外，阳光斜斜地照在石阶上。一只鸽子站在台阶的最高处，像是在守望什么。',
      choices: [
        { id: 'sit_steps', text: '在台阶上坐下来。', flag: 'sat_church_steps', depthChange: 2, timeCost: 6, category: 'reflective', result: '石阶被太阳晒得温热。鸽子歪着头看你，然后飞走了。你坐在那里，背靠着教堂的墙。石头很粗糙，但让你感到踏实。', relationshipDelta: null },
        { id: 'photo_pigeon', text: '拿出手机想拍那只鸽子。', flag: null, depthChange: 0, timeCost: 2, category: 'observant', result: '你举起手机的时候，鸽子飞走了。屏幕上只有空荡荡的台阶。有些东西，拍下来就不是那个样子了。', relationshipDelta: null }
      ]
    },
    {
      id: 'church_evening_bell',
      location: 'church',
      period: 'evening',
      priority: 7,
      requiresFlag: 'entered_church',
      narration: '教堂的钟响了。六下。每一声都沉甸甸的，在暮色中向外扩散。你站在门口，感觉声音穿过了你的身体。',
      choices: [
        { id: 'count_bells', text: '闭上眼睛，数每一声钟响。', flag: 'counted_bells', depthChange: 3, timeCost: 5, category: 'observant', result: '一。二。三。四。五。六。每一声之间是均匀的沉默。最后一声钟响消失之后，安静变得格外沉重。你睁开了眼睛，天色比刚才暗了很多。', relationshipDelta: null },
        { id: 'walk_with_bells', text: '沿着钟声的方向走几步。', flag: 'walked_with_bells', depthChange: 2, timeCost: 4, category: 'reflective', result: '你走了几步。钟声在你背后渐渐远去。你不确定自己在走向哪里，但脚步停不下来。也许有些路就是这样——不需要方向。', relationshipDelta: null }
      ]
    },
    {
      id: 'night_room_neighbor',
      location: 'night_room',
      period: 'night',
      priority: 5,
      requiresFlag: null,
      narration: '隔壁传来轻微的说话声。听不清内容，但能分辨出一男一女。偶尔有笑声。他们在聊什么开心的事。',
      choices: [
        { id: 'eavesdrop', text: '安静地听一会儿。', flag: 'listened_neighbors', depthChange: 2, timeCost: 5, category: 'observant', result: '笑声又传来了一次。你听出了一个词——"记得吗"。然后是更长时间的笑。你不知道他们在回忆什么，但那个声音让房间显得不那么空了。', relationshipDelta: null },
        { id: 'knock', text: '……算了。翻个身。', flag: null, depthChange: 0, timeCost: 1, category: 'avoidant', result: '你翻了个身，把被子拉高了一些。说话声还在继续，但变得模糊了。像收音机调到了一个不清晰的频道。', relationshipDelta: null }
      ]
    },
    {
      id: 'home_evening_cooking',
      location: 'home',
      period: 'evening',
      priority: 5,
      requiresFlag: null,
      narration: '回到家，厨房灯还亮着。冰箱里有鸡蛋、西红柿和半袋挂面。灶台上有一口干净的锅。',
      choices: [
        { id: 'cook_properly', text: '认真做一顿简单的饭。', flag: 'cooked_dinner', depthChange: 3, timeCost: 15, category: 'reflective', result: '你切西红柿、打鸡蛋、烧水、下面。动作很慢，但每一步都是认真的。最后端着碗坐在桌前，热气模糊了你的脸。你觉得这顿饭比外面的好吃。也许是因为等待。', relationshipDelta: null },
        { id: 'instant_noodle', text: '泡一碗方便面就好。', flag: null, depthChange: 0, timeCost: 3, category: 'rushed', result: '三分钟。你看着调料包化开在热水里。碗面上有一层薄薄的油花。你端着碗站着吃了。三口就吃完了。', relationshipDelta: null }
      ]
    }

  ];

  window.EVENTS_DATA = EVENTS;
})();
