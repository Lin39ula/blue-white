const base=typeof location!=='undefined'&&location.pathname.startsWith('/blue-white/')?'/blue-white/':'/';
export function asset(path:string){return `${base}${path.replace(/^\/+/, '')}`;}

if(typeof window!=='undefined'){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=((input:RequestInfo|URL,init?:RequestInit)=>{
    if(typeof input==='string'&&input.startsWith('/')) input=asset(input);
    return nativeFetch(input,init);
  }) as typeof window.fetch;
}
