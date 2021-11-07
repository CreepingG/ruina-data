import {Datum} from './Data'
import {Ref} from 'vue'

/** 路由读写 */
export class Location{
    static getSearch(){
        const result = {} as Record<string, string>;
        const pairs = window.location.search.slice(1).split('&').map(pair=>pair.split('='));
        pairs.forEach(pair=>{
            result[pair[0]] = pair[1] ?? '';
        });
        return result;
    }
    static setSearch(search:Record<string,string|null>, jump:boolean){
        let s = Object.entries(search).filter(pair=>pair[1]).map(pair=>pair[0]+'='+pair[1]).join('&');
        if (s) s = '?' + s;
        if (s === window.location.search) return;
        const location = [window.location.pathname, s, window.location.hash].join('');
        if (jump){
            window.location.href = location;
        }
        else{
            history.pushState(null, '', location);
        }
    }
}

export interface LocParam {
    page: string,
    id?: number,
    force?: boolean,
    [k:string]: any
}

/* Page Shared */
interface pack{
    name:string,
    id:Ref<number>,
    menuList:Ref<any>,
    data:Datum[] & Map<number, Datum>,
    filter:Ref<string>,
    advancedFilters?:Record<string, (list:Datum[])=>Datum[]>,
}
export const GetIdFromURL = () => Number(Location.getSearch()['id']) || 0;
export function SetURL(this:pack){
    Location.setSearch({page:this.name, id:this.id.value ? this.id.value.toString() : null}, false)
}
export function Select(this:pack, i:number){
    this.id.value = i;
    SetURL.call(this);
}
export function OnUpdate(this:pack, loc:LocParam){
    if (loc.page !== this.name) return;
    const newId = Number(loc.id);
    if (newId && this.data.has(newId)){
        this.id.value = newId;
    }
    else{
        this.id.value = loc.force ? 0 : this.id.value;
    }
    setTimeout(()=>this.menuList.value.scroll(), 0);
    if (!loc.force) SetURL.call(this);
}
export function ApplyFilter(this:pack, keys:string[]=['name']){
    let result:Datum[] = this.data;
    if (this.filter.value){
      const pattern = this.filter.value.replace(
        new RegExp('([' + '\\[].?*-+^$'.split('').map(c=>'\\'+c).join('') + '])' ,'g'),
        '\\$1'
      );
      const match = pattern.match(/^@(.*)@$/);
      const action = match && this.advancedFilters && this.advancedFilters[match[1]];
      if (action){
        result = action(result);
      }
      else{
        const int = pattern.match(/^\d+$/) ? Number(pattern) : NaN;
        result = result.filter(v=>{
          if (v['@id']===int) return true;
          return keys.some(key=>{
            const value = v[key];
            return typeof value === 'string' && value.match(pattern);
          });
        });
      }
    }
    return result.map(v=>{
      return {
        '@id': v['@id'],
        name: v.name,
      };
    });
}