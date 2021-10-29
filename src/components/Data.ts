import _skills from '../json/skills.json'
import _attributes from '../json/attributes.json'
import _states from '../json/states.json'
import { DataDecorator, TextDecorator } from './Utils'

export const attributes = _attributes.slice(1);
export const states = _states.slice(1).filter(v=>v.name && !v.name.startsWith('-') && !(v['@id']>=32 && v['@id']<=36));

export type Skill = {
    [k in  "description" | "using_message1" | "using_message2"]:string|null;
} & {
    [k in  "@id" | "type" | "sp_cost" | "scope" | "physical_rate" | "magical_rate" | "variance" | "power" | "hit"]:number;
} & {
    [k in  "affect_hp" | "affect_sp" | "affect_attack" | "affect_defense" | "affect_spirit" | "affect_agility" | "absorb_damage" | "ignore_defense" | "affect_attr_defence"]:boolean;
} & {
    [k in "state_effects" | "attribute_effects"]: boolean[]
} & {
    [k in string]: any
}
export const skills = DataDecorator(_skills as unknown as Skill[]);

export const text = {
    sep: '、',
    description: '描述',
    using_message: '使用文本',
    power: '效果量',
    magic: '魔力',
    attack: '攻击力',
    attribute: '属性',
    state: '状态',
    variance: '数值分散度',
    mp: 'mp消耗',
    actor: '角色',
    hit: '成功率',
    none: '无',
    effect: TextDecorator({
      title: '效果',
      list: ['HP','MP','攻击','防御','魔力','速度']
    }),
    tags: TextDecorator({
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
};