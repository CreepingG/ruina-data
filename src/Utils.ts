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