/** 路由读写 */
export class Location{
    static getSearch(key:string){
        const pairs = window.location.search.slice(1).split('&').map(pair=>pair.split('='));
        let result = '';
        pairs.forEach(pair=>{if(pair[0]===key) result = pair[1];});
        return result;
    }
    static set(params:{path?:string, search?:Record<string,string|null>,hash?:string}, jump:boolean){
        let location = [window.location.pathname, window.location.search, window.location.hash];
        if (params.path !== undefined){
            location[0] = (params.path.startsWith('/') ? '' : '/') + params.path;
        }
        if (params.search !== undefined){
            const prev:Record<string,string> = {};
            location[1].slice(1).split('&').filter(s=>s!=='').map(pair=>pair.split('=')).forEach(pair=>{prev[pair[0]] = pair[1]});
            location[1] = Object.entries({...prev, ...params.search}).filter(pair=>pair[0]&&pair[1]).map(pair=>pair[0]+'='+pair[1]).join('&');
            if (location[1]) location[1] = '?' + location[1];
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