interface TextIn{
    title: string,
    list?: string[]
}
const TextHandler:ProxyHandler<TextIn> = {
    get(target, prop:any, receiver){
        const list_value:any = target.list ? target.list[prop] : undefined;
        if (list_value) {
            if (typeof list_value === 'function'){
                return list_value.bind(target.list)
            }
            return list_value;
        }
        if (prop === 'default' || prop === 'toString'){
            return ()=>target.title;
        }
        return Reflect.get(target, prop, receiver);
    }
}
export function TextDecorator(data:TextIn){
    return new Proxy(data, TextHandler) as any as string[];
}

const DataHandler:ProxyHandler<[any, any]> = {
    get(target, prop:any){
        return (prop in target[0]) ? target[0][prop] : target[1][prop];
    }
}
export function DataDecorator<T>(raw:T[]){
    const default_data = raw[0];
    const rest = raw.slice(1);
    return rest.map(data => new Proxy([data, default_data], DataHandler) as any as T);
}

export class Location{
    static getSearch(key:string){
        const pairs = window.location.search.slice(1).split('&').map(pair=>pair.split('='));
        let result = '';
        pairs.forEach(pair=>{if(pair[0]===key) result = pair[1];});
        return result;
    }
    static set(params:{path?:string, search?:Record<string,string>,hash?:string}, jump:boolean){
        let location = [window.location.pathname, window.location.search, window.location.hash];
        if (params.path !== undefined){
            location[0] = (params.path.startsWith('/') ? '' : '/') + params.path;
        }
        if (params.search !== undefined){
            const prev:Record<string,string> = {};
            location[1].slice(1).split('&').filter(s=>s!=='').map(pair=>pair.split('=')).forEach(pair=>{prev[pair[0]] = pair[1]});
            location[1] = '?' + Object.entries({...prev, ...params.search}).map(pair=>pair[0]+'='+pair[1]).join('&');
        }
        if (params.hash !== undefined){
            location[2] = ((params.hash.startsWith('#')||params.hash==='') ? '' : '#') + params.hash;
        }
        if (jump){
            window.location.href = location.join('');
        }
        else{
            history.pushState(null, '', location.join(''));
        }
    }
}