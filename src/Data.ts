import _skills from './json/skills.json'
import _enemies from './json/enemies.json'
import _attributes from './json/attributes.json'
import _states from './json/states.json'
import _items from './json/items.json'

export type Datum = {
  "@id": number,
  name?: string,
  [k: string]: any
}
const DataHandler:ProxyHandler<[any, any]> = {
  get(target, prop:any){
    return (prop in target[0]) ? target[0][prop] : target[1][prop];
  }
}
/** 将数组中的首项作为默认值，可作为Array或Map使用 */ 
export function DataDecorator<T extends Datum>(raw:T[]){
  const default_data = raw[0];
  const rest = raw.slice(1);
  return MapArray(rest.map(data => new Proxy([data, default_data], DataHandler) as any as Readonly<T>));
}
const MapArrayHandler:ProxyHandler<[any, any]> = {
  get(target, prop:string){
    if (['get','set','has'].includes(prop)){
      return target[1][prop].bind(target[1]);
    }
    const result = target[0][prop];
    if (typeof result === 'function') return result.bind(target[0]);
    return result;
  }
}
function MapArray<T extends Datum>(raw:T[]){
  const map = new Map<number, T>();
  raw.forEach(o=>{
      map.set(o['@id'], o);
  });
  return new Proxy([raw, map], MapArrayHandler) as any as T[]&Map<number,T>
}

export const skills = DataDecorator(_skills);
export const enemies = DataDecorator(_enemies);
export const items = DataDecorator(_items);
export const attributes = DataDecorator(_attributes);
export const states = DataDecorator(_states.map(v=>v.name?.match('；') ? {...v, name:v.name.replace('；','：')} : v));

const GetMaxId = (list:any) => Math.max(...list.map((o:any)=>o['@id'] as number));
export const max_id = {
  attr: GetMaxId(attributes),
  state: GetMaxId(states),
}

