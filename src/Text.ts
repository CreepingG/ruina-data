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
    hit: '成功率',
    drop: '掉落',
    crit: '暴击',
    miss: '易失误',
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
    rank: TextDecorator({
      title: '有效度',
      list: ['A','B','C','D','E']
    }),
};

text.ability = TextDecorator({
  title: '能力',
  list: [text.hp, text.mp, text.attack, text.defense, text.spirit, text.agility]
});

export default text;