interface TextIn{
    title: string,
    list?: string[]
}
const TextHandler:ProxyHandler<TextIn> = {
    get(target, prop:any, receiver){
        if (prop === 'default' || prop === 'toString'){
            return ()=>target.title;
        }
        const list_value:any = target.list ? target.list[prop] : undefined;
        if (list_value) {
            if (typeof list_value === 'function'){
                return list_value.bind(target.list)
            }
            return list_value;
        }
        return Reflect.get(target, prop, receiver);
    }
}
function TextDecorator(data:TextIn){
    return new Proxy(data, TextHandler) as any as string&string[];
}

const text = {
    sep: '、',
    none: '无',
    all: '全部',
    other: '其他',
    description: '描述',
    using_message: '使用文本',
    message: '文本',
    effect: '效果',
    cost: '消耗',
    exp: 'E',
    gold: 'G',

    actor: '角色',
    enemy: '敌人',
    skill: '技能',
    item: '物品',
    attribute: '属性',
    state: '状态',

    ability: '' as string&string[], // 占位
    hp: 'HP',
    mp: 'MP',
    attack: '攻击',
    defense: '防御',
    spirit: '魔力',
    agility: '速度',

    variance: '数值分散度',
    priority: '优先级',
    hit: '成功率',
    rate: '发生率',
    drop: '掉落',
    crit: '暴击',
    miss: '易失误',
    half: '减半',
    double: '翻倍',
    reduce_hit_ratio: '命中率降为@%',
    restrict_skill: '无法使用@0加成大于@1%的技能',
    state_value_change: '@0每回合@1@2',
    related: '相关',
    release: TextDecorator({
      title: '自愈方式',
      list: ['无法自愈','@0回合后有@1%的概率自愈', '受到攻击后有@%的概率自愈']
    }),
    tag: TextDecorator({
      title: '标签',
      list: ['吸血','无视防御', '属性防御']
    }),
    valueDirection: TextDecorator({
      title: '方向',
      list: ['提高','降低']
    }),
    type: TextDecorator({
      title: '种类',
      list: ['一般','传送','逃走','开关']
    }),
    scope: TextDecorator({
      title: '效果范围',
      list: ['敌方个体','敌方全体','使用者','我方个体','我方全体']
    }),
    occasion: TextDecorator({
      title: '使用场合',
      list: ['战斗外', '战斗中']
    }),
    stateOccasion: TextDecorator({
      title: '生效场合',
      list: ['战斗中', '总是']
    }),
    rank: TextDecorator({
      title: '有效度',
      list: ['A','B','C','D','E']
    }),
    rankColor: TextDecorator({
      title: '有效度',
      list: ['e24', 'c40', '060', '208', '808']
    }),
    restriction: TextDecorator({
      title: '行动限制',
      list: ['无', '无法行动', '强制攻击敌方', '强制攻击友方']
    }),
};

text.ability = TextDecorator({
  title: '能力',
  list: [text.hp, text.mp, text.attack, text.defense, text.spirit, text.agility]
});

export default text;