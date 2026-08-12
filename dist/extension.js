"use strict";var ze=Object.create;var ee=Object.defineProperty;var Fe=Object.getOwnPropertyDescriptor;var Le=Object.getOwnPropertyNames;var Re=Object.getPrototypeOf,Ge=Object.prototype.hasOwnProperty;var Ue=(s,t)=>{for(var o in t)ee(s,o,{get:t[o],enumerable:!0})},fe=(s,t,o,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of Le(t))!Ge.call(s,i)&&i!==o&&ee(s,i,{get:()=>t[i],enumerable:!(e=Fe(t,i))||e.enumerable});return s};var D=(s,t,o)=>(o=s!=null?ze(Re(s)):{},fe(t||!s||!s.__esModule?ee(o,"default",{value:s,enumerable:!0}):o,s)),_e=s=>fe(ee({},"__esModule",{value:!0}),s);var Xe={};Ue(Xe,{activate:()=>Ye,deactivate:()=>Ze});module.exports=_e(Xe);var d=D(require("vscode")),R=D(require("fs")),k=D(require("path"));var T=D(require("vscode")),me=D(require("os")),ve=D(require("path"));function P(){let s=T.workspace.getConfiguration("antigravityAnywhere"),t=me.homedir(),o=ve.join(t,".gemini","antigravity-ide"),e=s.get("googleDriveToken","").trim(),i=s.get("googleRefreshToken","").trim(),a=s.get("driveFileId","").trim();return{googleDriveToken:e,googleRefreshToken:i,driveFileId:a,googleUserEmail:s.get("googleUserEmail","").trim(),googleUserName:s.get("googleUserName","").trim(),googleUserPicture:s.get("googleUserPicture","").trim(),encryptionPassword:s.get("encryptionPassword",""),enableAutoSync:s.get("enableAutoSync",!1),syncIntervalSeconds:s.get("syncIntervalSeconds",10),antigravityDataDir:o}}async function he(s){await T.workspace.getConfiguration("antigravityAnywhere").update("enableAutoSync",s,T.ConfigurationTarget.Global)}async function le(s){await T.workspace.getConfiguration("antigravityAnywhere").update("driveFileId",s,T.ConfigurationTarget.Global)}async function de(s,t){let o=T.workspace.getConfiguration("antigravityAnywhere");await o.update("googleDriveToken",s,T.ConfigurationTarget.Global),t&&await o.update("googleRefreshToken",t,T.ConfigurationTarget.Global)}async function be(s,t,o){let e=T.workspace.getConfiguration("antigravityAnywhere");await e.update("googleUserEmail",s,T.ConfigurationTarget.Global),await e.update("googleUserName",t,T.ConfigurationTarget.Global),await e.update("googleUserPicture",o,T.ConfigurationTarget.Global)}async function ye(){let s=T.workspace.getConfiguration("antigravityAnywhere");await s.update("googleDriveToken","",T.ConfigurationTarget.Global),await s.update("googleRefreshToken","",T.ConfigurationTarget.Global),await s.update("googleUserEmail","",T.ConfigurationTarget.Global),await s.update("googleUserName","",T.ConfigurationTarget.Global),await s.update("googleUserPicture","",T.ConfigurationTarget.Global),await s.update("driveFileId","",T.ConfigurationTarget.Global)}var A=D(require("fs")),S=D(require("path")),xe=D(require("os")),te=D(require("crypto"));var we=D(require("os")),K=class{static userHome=we.homedir();static normalize(t){if(!t)return t;let o=t.replace(/\\/g,"/"),e=this.userHome.replace(/\\/g,"/");return o.startsWith(e)&&(o=o.replace(e,"${USER_HOME}")),o}static denormalize(t){if(!t)return t;let o=this.userHome.replace(/\\/g,"/");return t.replace(/\${USER_HOME}/g,o)}};var I=class{static getAppSupportDir(){let t=xe.homedir();return process.platform==="win32"?process.env.APPDATA?S.join(process.env.APPDATA,"Antigravity IDE"):S.join(t,"AppData","Roaming","Antigravity IDE"):process.platform==="darwin"?S.join(t,"Library","Application Support","Antigravity IDE"):S.join(t,".config","Antigravity IDE")}static getCacheFilePath(t){return S.join(t,"delta_sync_state.json")}static loadDeltaState(t){try{let o=this.getCacheFilePath(t);if(A.existsSync(o)){let e=A.readFileSync(o,"utf-8");return JSON.parse(e)}}catch{}return null}static async saveDeltaState(t,o){try{let e=this.getCacheFilePath(t),i={};for(let r of o)i[r.relativePath]={mtimeMs:r.mtimeMs,sizeBytes:r.sizeBytes,hash:r.hash};let a={timestamp:new Date().toISOString(),filesState:i};await A.promises.mkdir(S.dirname(e),{recursive:!0}),await A.promises.writeFile(e,JSON.stringify(a,null,2),"utf-8")}catch{}}static async scanDataDirectory(t){let o=S.dirname(t),e=[],i=[t,S.join(o,"antigravity"),S.join(o,"antigravity-ide"),S.join(o,"antigravity-cli")],a=new Set;for(let c of i)if(A.existsSync(c))for(let n of["conversations","brain","implicit"]){let l=S.join(c,n);A.existsSync(l)&&!a.has(l)&&(a.add(l),await this.scanDirRecursive(l,c,e,!1))}let r=S.join(o,"config");return A.existsSync(r)&&!a.has(r)&&(a.add(r),await this.scanDirRecursive(r,o,e,!1)),this.buildBundle(e)}static async scanForSync(t,o=!1){let e=S.dirname(t),i=[],a=[t,S.join(e,"antigravity"),S.join(e,"antigravity-ide"),S.join(e,"antigravity-cli")],r=new Set;for(let y of a)if(A.existsSync(y))for(let h of["conversations","brain","implicit"]){let g=S.join(y,h);A.existsSync(g)&&!r.has(g)&&(r.add(g),await this.scanDirRecursive(g,y,i,!1))}let c=S.join(e,"config");A.existsSync(c)&&!r.has(c)&&(r.add(c),await this.scanDirRecursive(c,e,i,!1));let n=this.getAppSupportDir();if(A.existsSync(n)){let y=S.join(n,"shared_proto_db");A.existsSync(y)&&await this.scanDirRecursive(y,n,i,!1,"app_support");let h=S.join(n,"User","globalStorage","state.vscdb");if(A.existsSync(h))try{let g=await A.promises.stat(h);if(g.size<=10*1024*1024){let p="base64:"+(await A.promises.readFile(h)).toString("base64"),f="app_support/User/globalStorage/state.vscdb",m=te.createHash("sha256").update(p).digest("hex");i.push({relativePath:f,content:p,hash:m,sizeBytes:g.size,mtimeMs:g.mtimeMs})}}catch{}}let l=o?null:this.loadDeltaState(t),u=i,x=!1;if(l&&l.filesState){let y=new Set,h=new Set;for(let g of i){let w=l.filesState[g.relativePath],p=g.relativePath.startsWith("config/")||g.relativePath.startsWith("app_support/");if((!w||w.mtimeMs!==g.mtimeMs||w.sizeBytes!==g.sizeBytes)&&(h.add(g.relativePath),!p)){let f=g.relativePath.split("/"),m="";f[0]==="conversations"?m=f[1].replace(/\.(db|db-wal|db-shm)$/,""):f[0]==="brain"&&f.length>=2?m=f[1]:f[0]==="implicit"&&f.length>=2&&(m=f[1].replace(/\.pb$/,"")),m&&y.add(m)}}h.size>0&&h.size<i.length&&(x=!0,u=i.filter(g=>{if(g.relativePath.startsWith("config/")||g.relativePath.startsWith("app_support/"))return!0;let p=g.relativePath.split("/"),f="";return p[0]==="conversations"?f=p[1].replace(/\.(db|db-wal|db-shm)$/,""):p[0]==="brain"&&p.length>=2?f=p[1]:p[0]==="implicit"&&p.length>=2&&(f=p[1].replace(/\.pb$/,"")),y.has(f)||h.has(g.relativePath)}))}u.sort((y,h)=>h.mtimeMs-y.mtimeMs);let v=this.buildBundle(u);return v.isIncremental=x,v}static buildBundle(t){let o=[...t].sort((c,n)=>c.relativePath.localeCompare(n.relativePath)),e=o.reduce((c,n)=>c+n.sizeBytes,0),i=(e/(1024*1024)).toFixed(2),a=o.map(c=>`${c.relativePath}:${c.hash}`).join(`
`),r=te.createHash("sha256").update(a).digest("hex");return{timestamp:new Date().toISOString(),totalSizeBytes:e,totalSizeMB:i,files:o,manifestHash:r}}static groupFilesByConversation(t,o){let e=new Map,i=[],a=o?this.loadDeltaState(o):null;for(let c of t.files){let n=c.relativePath.split("/"),l="global-config";if(n[0]==="brain"&&n.length>1)l=n[1];else if(n[0]==="conversations"&&n.length>1)l=n[1].replace(/\.(db|db-wal|db-shm)$/,"");else if(n[0]==="implicit"&&n.length>1)l=n[1].replace(/\.pb$/,"");else{i.push(c);continue}e.has(l)||e.set(l,[]),e.get(l).push(c)}let r=[];for(let[c,n]of e.entries()){let l="",u=n.reduce((w,p)=>w+p.sizeBytes,0),x=(u/(1024*1024)).toFixed(2),v=Math.max(...n.map(w=>w.mtimeMs),0),y=v>0?new Date(v).toLocaleDateString():"Unknown";for(let w of n){if(w.relativePath.endsWith("metadata.json"))try{let p=JSON.parse(w.content);p.Summary?l=p.Summary.substring(0,65):p.title&&(l=p.title.substring(0,65))}catch{}else if(w.relativePath.endsWith("transcript.jsonl")){let p=w.content.split(`
`);for(let f of p)if(f.trim())try{let m=JSON.parse(f);if(m.type==="USER_INPUT"&&m.content){let C=m.content;if(C.includes("<USER_REQUEST>")){let b=C.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);b&&b[1]&&(C=b[1].trim())}if(C=C.replace(/^[\/\s\n\r\t]+/,"").trim(),C.length>10){l=C.substring(0,65);break}}}catch{}}if(l)break}if(!l){for(let w of n)if(w.relativePath.endsWith(".db"))try{let f=w.content.match(/[\x20-\x7E]{12,70}/g);if(f&&f.length>0){let m=f.filter(C=>C.length>=12&&/[a-zA-Z]/.test(C));for(let C of m){let b=C.replace(/[\r\n\t]+/g," ").replace(/\s+/g," ").trim();if(b=b.replace(/^[\/\s\n\r\t]+/,"").replace(/^SQLite format \d+/,"").trim(),b.length>=12&&!b.includes("sqlite")&&!b.includes("TABLE")&&!b.includes("INDEX")&&!b.includes("file:///")&&!b.includes("http")&&!b.includes("trajectory")&&!b.includes("battle_mode")&&!b.includes("Along with each USER request")&&!b.includes("conversation_summaries")&&!b.includes("System prompt")&&!b.includes("toolAction")&&!b.includes("PRIMARY KEY")&&!b.startsWith("function")&&!b.startsWith("import ")&&!b.startsWith("export ")&&!/^[0-9a-f\-]{30,}$/i.test(b)){l=b.substring(0,65);break}}}}catch{}}if(l?(l=l.replace(/^[\/\s\n\r\t]+/,"").replace(/^SQLite format \d+/,"").replace(/^\\n/,"").trim(),l.length>65&&(l=l.substring(0,65)+"...")):l=`Chat Session (${c.substring(0,8)})`,u<10240&&l.startsWith("Chat Session")&&c!=="global-config")continue;let g="local";a&&a.filesState&&(g=n.every(p=>{let f=a.filesState[p.relativePath];return f&&f.mtimeMs===p.mtimeMs&&f.sizeBytes===p.sizeBytes})?"synced":"modified"),r.push({id:c,title:l,totalSizeBytes:u,totalSizeMB:x,lastUpdated:y,status:g,files:n})}if(i.length>0){let c=i.reduce((l,u)=>l+u.sizeBytes,0),n="local";a&&a.filesState&&(n=i.every(u=>{let x=a.filesState[u.relativePath];return x&&x.mtimeMs===u.mtimeMs&&x.sizeBytes===u.sizeBytes})?"synced":"modified"),r.push({id:"global-config",title:"Global Config & System Indexes",totalSizeBytes:c,totalSizeMB:(c/(1024*1024)).toFixed(2),lastUpdated:"Current",status:n,files:i})}return r}static async scanDirRecursive(t,o,e,i=!1,a=""){let r=await A.promises.readdir(t,{withFileTypes:!0});for(let c of r){let n=S.join(t,c.name);if(c.isDirectory()){if(c.name==="node_modules"||c.name===".git"||c.name==="tasks")continue;await this.scanDirRecursive(n,o,e,i,a)}else if(c.isFile()){let l=S.extname(c.name).toLowerCase();if([".webp",".png",".jpg",".jpeg",".gif",".mp4",".webm",".zip",".gz"].includes(l)||c.name.endsWith(".log")&&!c.name.includes("transcript")&&!n.includes("shared_proto_db"))continue;try{let u=await A.promises.stat(n);if(u.size>50*1024*1024)continue;let x=[".db",".db-wal",".db-shm",".pb",".vscdb"].includes(l)||n.includes("shared_proto_db");if(i&&x)continue;let v="";if(x)v="base64:"+(await A.promises.readFile(n)).toString("base64");else{let g=await A.promises.readFile(n,"utf-8");v=K.normalize(g)}let y=S.relative(o,n).replace(/\\/g,"/");a&&(y=`${a}/${y}`);let h=te.createHash("sha256").update(v).digest("hex");e.push({relativePath:y,content:v,hash:h,sizeBytes:u.size,mtimeMs:u.mtimeMs})}catch{}}}}static async restoreBundle(t,o){let e=S.dirname(t),i=this.getAppSupportDir(),a=0;for(let r of o.files){let c=t,n=r.relativePath;r.relativePath.startsWith("config/")?c=e:r.relativePath.startsWith("app_support/")&&(c=i,n=r.relativePath.substring(12));let l=n.replace(/\//g,S.sep),u=S.join(c,l),x=S.dirname(u);if(await A.promises.mkdir(x,{recursive:!0}),r.content.startsWith("base64:")){let v=Buffer.from(r.content.substring(7),"base64");await A.promises.writeFile(u,v)}else{let v=K.denormalize(r.content);await A.promises.writeFile(u,v,"utf-8")}a++}return a}};var U=D(require("crypto")),oe=D(require("zlib")),Se="aes-256-gcm",Ne=12,Oe=16,ke=32,Ce=1e5;function De(s,t){let e=oe.gzipSync(Buffer.from(s,"utf-8")).toString("base64");if(!t)return JSON.stringify({version:1,compressed:!0,unencrypted:!0,data:e});let i=U.randomBytes(Oe),a=U.randomBytes(Ne),r=U.pbkdf2Sync(t,i,Ce,ke,"sha256"),c=U.createCipheriv(Se,r,a),n=c.update(e,"utf-8","hex");n+=c.final("hex");let l=c.getAuthTag(),u={version:1,compressed:!0,salt:i.toString("hex"),iv:a.toString("hex"),tag:l.toString("hex"),data:n};return JSON.stringify(u)}function Ae(s,t){let o=JSON.parse(s),e="";if(o.unencrypted)e=o.data;else{if(!t)throw new Error("Encryption password is required to decrypt cloud backup.");let i=o,a=Buffer.from(i.salt,"hex"),r=Buffer.from(i.iv,"hex"),c=Buffer.from(i.tag,"hex"),n=i.data,l=U.pbkdf2Sync(t,a,Ce,ke,"sha256"),u=U.createDecipheriv(Se,l,r);u.setAuthTag(c);let x=u.update(n,"hex","utf-8");x+=u.final("utf-8"),e=x}return o.compressed?oe.gunzipSync(Buffer.from(e,"base64")).toString("utf-8"):Buffer.from(e,"base64").toString("utf-8")}var ae=D(require("https"));var pe=D(require("http")),ie=D(require("https")),ne=D(require("crypto")),H=D(require("vscode"));var ge="627024998523-13an3bmndm293rvgu9faomi6ao9bepks.apps.googleusercontent.com",Ie="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",We=["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"].join(" "),je=12e4,N=class{static async startLoginFlow(){let t=await Ve(),o=`http://127.0.0.1:${t}`,e=Pe(ne.randomBytes(32)),i=Pe(ne.createHash("sha256").update(e).digest()),a=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(ge)}&redirect_uri=${encodeURIComponent(o)}&response_type=code&scope=${encodeURIComponent(We)}&access_type=offline&prompt=consent&code_challenge=${i}&code_challenge_method=S256`,r=qe(t);await H.env.openExternal(H.Uri.parse(a)),H.window.showInformationMessage("\u{1F511} Google sign-in page opened \u2014 authorize in browser to complete login.",{modal:!1});let c;try{c=await Je(r,je)}catch{throw new Error("Google Sign-In timed out or was cancelled. Please try again.")}let n=await He(c,e,o);await de(n.accessToken,n.refreshToken);try{await this.fetchAndStoreUserProfile(n.accessToken)}catch{}return n}static fetchAndStoreUserProfile(t){return new Promise((o,e)=>{let i={hostname:"www.googleapis.com",path:"/oauth2/v3/userinfo",method:"GET",headers:{Authorization:`Bearer ${t}`,"User-Agent":"Antigravity-Cloud-IDE"}},a=ie.request(i,r=>{let c="";r.on("data",n=>c+=n),r.on("end",async()=>{try{if(r.statusCode===200){let n=JSON.parse(c),l={email:n.email||"",name:n.name||n.email||"Google User",picture:n.picture||""};await be(l.email,l.name,l.picture),o(l)}else e(new Error(`Userinfo API error (${r.statusCode}): ${c}`))}catch(n){e(n)}})});a.on("error",r=>e(r)),a.end()})}static refreshAccessToken(t){return new Promise((o,e)=>{if(!t)return e(new Error("No Refresh Token available. Please sign in with Google again."));let i=new URLSearchParams({grant_type:"refresh_token",client_id:ge,client_secret:Ie,refresh_token:t}).toString(),a={hostname:"oauth2.googleapis.com",path:"/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(i)}},r=ie.request(a,c=>{let n="";c.on("data",l=>n+=l),c.on("end",async()=>{try{let l=JSON.parse(n);l.access_token?(await de(l.access_token),this.fetchAndStoreUserProfile(l.access_token).catch(()=>{}),o(l.access_token)):e(new Error("Failed to refresh Google Access Token: "+(l.error_description||JSON.stringify(l))))}catch(l){e(new Error("Failed to parse refresh response: "+l.message))}})});r.on("error",c=>e(c)),r.write(i),r.end()})}static async logout(){await ye()}static async validateOrRefreshToken(){let t=P();if(!t.googleDriveToken)return!1;try{return await this.fetchAndStoreUserProfile(t.googleDriveToken),!0}catch{if(t.googleRefreshToken)try{let o=await this.refreshAccessToken(t.googleRefreshToken);return await this.fetchAndStoreUserProfile(o),!0}catch{return await this.logout(),!1}return await this.logout(),!1}}};function He(s,t,o){return new Promise((e,i)=>{let a=new URLSearchParams({code:s,client_id:ge,client_secret:Ie,redirect_uri:o,grant_type:"authorization_code",code_verifier:t}).toString(),r={hostname:"oauth2.googleapis.com",path:"/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(a)}},c=ie.request(r,n=>{let l="";n.on("data",u=>l+=u),n.on("end",()=>{try{let u=JSON.parse(l);u.access_token?e({accessToken:u.access_token,refreshToken:u.refresh_token}):i(new Error("OAuth Token Exchange Error: "+(u.error_description||JSON.stringify(u))))}catch(u){i(new Error("Failed to parse token response: "+u.message))}})});c.on("error",n=>i(n)),c.write(a),c.end()})}function qe(s){return new Promise((t,o)=>{let e=pe.createServer((i,a)=>{try{let r=new URL(i.url||"/",`http://127.0.0.1:${s}`),c=r.searchParams.get("code"),n=r.searchParams.get("error");if(n){a.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),a.end(Te("\u274C Sign-In Cancelled","You can close this tab and return to Antigravity IDE.",!1)),e.close(),o(new Error("Google Sign-In was denied: "+n));return}c&&(a.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),a.end(Te("\u2705 Signed In!","You can close this tab and return to Antigravity IDE.",!0)),e.close(),t(c))}catch(r){o(r),e.close()}});e.on("error",o),e.listen(s,"127.0.0.1")})}function Ve(){return new Promise((s,t)=>{let o=pe.createServer();o.listen(0,"127.0.0.1",()=>{let i=o.address().port;o.close(()=>s(i))}),o.on("error",t)})}function Pe(s){return s.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function Je(s,t){return new Promise((o,e)=>{let i=setTimeout(()=>e(new Error("Timeout")),t);s.then(a=>{clearTimeout(i),o(a)},a=>{clearTimeout(i),e(a)})})}function Te(s,t,o){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Antigravity Cloud \u2014 ${s}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f13;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #1a1a2e;
      border: 1px solid #2d2d44;
      border-radius: 16px;
      padding: 48px 56px;
      text-align: center;
      max-width: 420px;
    }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; color: ${o?"#4ade80":"#f87171"}; margin-bottom: 10px; }
    p  { font-size: 14px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${o?"\u{1F680}":"\u{1F512}"}</div>
    <h1>${s}</h1>
    <p>${t}</p>
  </div>
</body>
</html>`}var W=class{token;abortSignal;constructor(t,o){this.token=t.trim(),this.abortSignal=o}async uploadSyncPayload(t,o,e){let i="antigravity_cloud_backup.enc",a=Buffer.from(t,"utf-8"),r=o;if(r||(r=await this.findBackupFileId()||void 0),r)try{return await this.request("PATCH",`/upload/drive/v3/files/${r}?uploadType=media`,a,"application/octet-stream",!0,!1,!1,e),r}catch{if(this.abortSignal?.aborted)throw new Error("Operation canceled by user.");let v=await this.findBackupFileId();if(v&&v!==r)try{return await this.request("PATCH",`/upload/drive/v3/files/${v}?uploadType=media`,a,"application/octet-stream",!0,!1,!1,e),v}catch{}}let n=(await this.requestFullResponse("POST","/upload/drive/v3/files?uploadType=resumable",Buffer.from(JSON.stringify({name:i,mimeType:"application/octet-stream"}),"utf-8"),"application/json; charset=UTF-8",!1)).headers.location;if(!n)throw new Error("Google Drive Resumable Upload initialization failed: Location header missing.");let l=new URL(n);return(await this.requestUrl("PUT",l.hostname,l.pathname+l.search,a,"application/octet-stream",e)).id}async downloadSyncPayload(t){if(t)try{return await this.request("GET",`/drive/v3/files/${t}?alt=media`,void 0,void 0,!1,!0)}catch{}let o=await this.findBackupFileId();if(!o)throw new Error("No backup file (antigravity_cloud_backup.enc) found in your Google Drive account. Please perform a Sync first.");return await this.request("GET",`/drive/v3/files/${o}?alt=media`,void 0,void 0,!1,!0)}async findBackupFileId(){let t=encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false"),o=await this.request("GET",`/drive/v3/files?q=${t}&fields=files(id)`);return o.files&&o.files.length>0?o.files[0].id:null}async getBackupFileDetails(){try{let t=encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false"),o=await this.request("GET",`/drive/v3/files?q=${t}&fields=files(id,name,size,modifiedTime)`);if(o.files&&o.files.length>0){let e=o.files[0];return{id:e.id,name:e.name||"antigravity_cloud_backup.enc",size:e.size||"0",modifiedTime:e.modifiedTime||new Date().toISOString()}}return null}catch{return null}}async findExistingFileId(){return this.findBackupFileId()}async requestUrl(t,o,e,i,a,r){let c=P(),l=(this.token||c.googleDriveToken).replace(/^["']|["']$/g,"").trim(),u=l.startsWith("Bearer ")?l:`Bearer ${l}`;return new Promise((x,v)=>{let y={hostname:o,path:e,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:u,...a?{"Content-Type":a}:{},...i?{"Content-Length":i.length}:{}}},h=ae.request(y,g=>{let w="";g.on("data",p=>w+=p),g.on("end",()=>{if(g.statusCode&&g.statusCode>=200&&g.statusCode<350)try{x(JSON.parse(w))}catch{x(w)}else v(new Error(`Google Drive Resumable Upload Error (${g.statusCode}): ${w.substring(0,500)}`))})});if(this.abortSignal){if(this.abortSignal.aborted)return h.destroy(),v(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{h.destroy(),v(new Error("Operation canceled by user."))})}if(h.on("error",g=>v(g)),i)if(r){let w=0,p=i.length,f=()=>{if(!this.abortSignal?.aborted){for(;w<p;){let m=i.subarray(w,Math.min(w+2097152,p));if(w+=m.length,r(w,p),!h.write(m)){h.once("drain",f);return}}h.end()}};f()}else h.write(i),h.end();else h.end()})}async requestFullResponse(t,o,e,i,a=!1){let r=P(),n=(this.token||r.googleDriveToken).replace(/^["']|["']$/g,"").trim(),l=n.startsWith("Bearer ")?n:`Bearer ${n}`,u=a?"upload.googleapis.com":"www.googleapis.com";return new Promise((x,v)=>{let y={hostname:u,path:o,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:l,...i?{"Content-Type":i}:{},...e?{"Content-Length":e.length}:{}}},h=ae.request(y,g=>{let w="";g.on("data",p=>w+=p),g.on("end",()=>{g.statusCode&&g.statusCode>=200&&g.statusCode<350?x({headers:g.headers,statusCode:g.statusCode,body:w}):v(new Error(`Google Drive Resumable Init Error (${g.statusCode}): ${w.substring(0,500)}`))})});if(this.abortSignal){if(this.abortSignal.aborted)return h.destroy(),v(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{h.destroy(),v(new Error("Operation canceled by user."))})}h.on("error",g=>v(g)),e&&h.write(e),h.end()})}async request(t,o,e,i,a=!1,r=!1,c=!1,n){let l=P(),x=(this.token||l.googleDriveToken).replace(/^["']|["']$/g,"").trim(),v=x.startsWith("Bearer ")?x:`Bearer ${x}`,y=a?"upload.googleapis.com":"www.googleapis.com";return new Promise((h,g)=>{let w={hostname:y,path:o,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:v,...i?{"Content-Type":i}:{},...e?{"Content-Length":e.length}:{}}},p=ae.request(w,m=>{let C="";m.on("data",b=>C+=b),m.on("end",async()=>{if(m.statusCode&&m.statusCode>=200&&m.statusCode<300)if(r)h(C);else try{h(JSON.parse(C))}catch{h(C)}else if(m.statusCode===401&&!c&&l.googleRefreshToken)try{let b=await N.refreshAccessToken(l.googleRefreshToken);this.token=b;let _=await this.request(t,o,e,i,a,r,!0,n);h(_)}catch(b){g(new Error("Google Access Token expired and background refresh failed: "+b.message))}else{let b=`Google Drive API Error (${m.statusCode}): ${C.substring(0,500)}`;m.statusCode===401?b='Google Drive API 401 Unauthorized: Access token expired. Please click "\u{1F511} Sign in with Google" to re-authorize.':m.statusCode===404&&(b=`Google Drive API 404 Not Found. Google response: ${C.substring(0,300)}`),g(new Error(b))}})}),f=!1;if(this.abortSignal){if(this.abortSignal.aborted)return p.destroy(),f=!0,g(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{p.destroy(),f||(f=!0,g(new Error("Operation canceled by user.")))})}if(p.on("timeout",()=>{p.destroy(),f||(f=!0,g(new Error("Google Drive API Connection Timed Out (180s). Check network connection.")))}),p.on("error",m=>{f||(m.code==="EPIPE"||m.code==="ECONNRESET"?setTimeout(()=>{f||(f=!0,g(m))},500):(f=!0,g(m)))}),e)if(n){let C=0,b=e.length,_=()=>{if(!this.abortSignal?.aborted){for(;C<b;){let X=e.subarray(C,Math.min(C+2097152,b));if(C+=X.length,n(C,b),!p.write(X)){p.once("drain",_);return}}p.end()}};_()}else p.write(e),p.end();else p.end()})}};var G=D(require("fs")),O=D(require("path")),Z=class{static async createSnapshot(t){let o=O.join(t,"brain");if(!G.existsSync(o))return null;let e=new Date().toISOString().replace(/[:.]/g,"-"),i=O.join(t,"local_backups"),a=O.join(i,`backup_${e}`);return await G.promises.mkdir(a,{recursive:!0}),await this.copyRecursive(o,O.join(a,"brain")),await this.cleanupOldBackups(i,10),a}static async copyRecursive(t,o){if((await G.promises.stat(t)).isDirectory()){await G.promises.mkdir(o,{recursive:!0});let i=await G.promises.readdir(t);for(let a of i)await this.copyRecursive(O.join(t,a),O.join(o,a))}else await G.promises.copyFile(t,o)}static async cleanupOldBackups(t,o){try{if(!G.existsSync(t))return;let i=(await G.promises.readdir(t)).filter(a=>a.startsWith("backup_")).sort();if(i.length>o){let a=i.slice(0,i.length-o);for(let r of a)await G.promises.rm(O.join(t,r),{recursive:!0,force:!0})}}catch{}}};var V=D(require("fs")),Ee=D(require("path")),q=class{watcher=null;debounceTimer=null;onTriggerSync;debounceMs;constructor(t,o){this.debounceMs=t*1e3,this.onTriggerSync=o}startWatching(t){let o=Ee.join(t,"brain");if(!V.existsSync(o))try{V.mkdirSync(o,{recursive:!0})}catch{return}try{this.watcher=V.watch(o,{recursive:!0},(e,i)=>{i&&i.endsWith(".log")||this.handleChange()})}catch{}}handleChange(){this.debounceTimer&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>{this.onTriggerSync()},this.debounceMs)}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null),this.debounceTimer&&(clearTimeout(this.debounceTimer),this.debounceTimer=null)}};var B=D(require("vscode"));var Y=D(require("os")),$e=D(require("crypto")),se=D(require("vscode")),J=class{static cachedDevice=null;static getDeviceInfo(){if(this.cachedDevice)return this.cachedDevice;let t=se.workspace.getConfiguration("antigravityAnywhere"),o=t.get("deviceId","").trim();o||(o="dev_"+$e.randomBytes(8).toString("hex"),t.update("deviceId",o,se.ConfigurationTarget.Global));let e=Y.platform(),i="linux";e==="darwin"?i="mac":e==="win32"&&(i="windows");let c=`${Y.hostname()} (${i==="mac"?"macOS":i==="windows"?"Windows":"Linux"})`;return this.cachedDevice={deviceId:o,deviceName:c,platform:i,osRelease:Y.release(),lastSyncTime:new Date().toISOString()},this.cachedDevice}};var M=class s{static currentPanel;static show(t){let o=B.window.activeTextEditor?B.window.activeTextEditor.viewColumn:void 0;if(s.currentPanel){s.currentPanel.reveal(o);return}let e=B.window.createWebviewPanel("antigravityAnywhereDashboard","\u2601\uFE0F Antigravity Cloud Hub",o||B.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0});s.currentPanel=e,e.onDidDispose(()=>{s.currentPanel=void 0},null,t.subscriptions),e.webview.onDidReceiveMessage(async i=>{switch(i.command){case"googleLogin":await B.commands.executeCommand("antigravityAnywhere.googleLogin"),this.updateWebviewHtml(e);break;case"googleLogout":await B.commands.executeCommand("antigravityAnywhere.googleLogout"),this.updateWebviewHtml(e);break;case"deepScan":await B.commands.executeCommand("antigravityAnywhere.deepScan"),this.updateWebviewHtml(e);break;case"syncNow":await B.commands.executeCommand("antigravityAnywhere.syncNow"),this.updateWebviewHtml(e);break;case"restore":await B.commands.executeCommand("antigravityAnywhere.restore"),this.updateWebviewHtml(e);break;case"cancelSync":await B.commands.executeCommand("antigravityAnywhere.cancelSync"),this.updateWebviewHtml(e);break;case"toggleAutoSync":await B.commands.executeCommand("antigravityAnywhere.toggleAutoSync"),this.updateWebviewHtml(e);break;case"deleteAll":await B.commands.executeCommand("antigravityAnywhere.deleteAllFiles",!0),this.updateWebviewHtml(e);break;case"deleteFile":await B.commands.executeCommand("antigravityAnywhere.deleteFile",i.relativePath,!0),this.updateWebviewHtml(e);break;case"deleteConversation":await B.commands.executeCommand("antigravityAnywhere.deleteConversation",i.convId,!0),this.updateWebviewHtml(e);break;case"deleteBatchConversations":await B.commands.executeCommand("antigravityAnywhere.deleteBatchConversations",i.convIds),this.updateWebviewHtml(e);break;case"refresh":this.updateWebviewHtml(e);break}},void 0,t.subscriptions),this.updateWebviewHtml(e)}static refreshCurrentPanel(){s.currentPanel&&s.updateWebviewHtml(s.currentPanel)}static async updateWebviewHtml(t){let o=P(),e=J.getDeviceInfo(),i=0,a=0,r="0",c="";try{let p=await I.scanDataDirectory(o.antigravityDataDir);i=p.files.length,r=p.totalSizeMB;let f=I.groupFilesByConversation(p,o.antigravityDataDir);a=f.length,c=f.map((m,C)=>{let b=m.files.map(ce=>`<div class="sub-file-item">
                <span class="sub-file-name">\u{1F4C4} ${ce.relativePath}</span>
                <span class="sub-file-size">${(ce.sizeBytes/1048576).toFixed(2)} MB</span>
                <button class="btn-sub-del" onclick="confirmDeleteFile('${ce.relativePath}')" title="Delete file">\u{1F5D1}\uFE0F</button>
              </div>`).join(""),_=m.title.replace(/"/g,"&quot;").replace(/'/g,"&#39;"),X=m.id.substring(0,12),ue=m.status==="synced"?'<span class="sync-badge synced">\u{1F7E2} Synced</span>':m.status==="modified"?'<span class="sync-badge modified" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4);">\u{1F7E1} Modified</span>':'<span class="sync-badge local" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4);">\u26AA Local</span>';return`<div class="conv-card" data-title="${_.toLowerCase()}" data-id="${m.id}">
            <div class="conv-header">
              <div class="conv-info">
                <div class="conv-title-row">
                  <input type="checkbox" class="conv-checkbox" data-id="${m.id}" onchange="updateBatchState()">
                  <div class="conv-title">\u{1F4AC} ${_}</div>
                  ${ue}
                </div>
                <div class="conv-sub">
                  ID: ${X}... \u2022 ${m.files.length} Files (${m.totalSizeMB} MB) \u2022 Updated: ${m.lastUpdated}
                </div>
              </div>
              <div class="conv-actions">
                <button class="btn-toggle-files" onclick="toggleFiles('files_${C}')">\u25B6 Files (${m.files.length})</button>
                <button class="btn-del-conv" onclick="confirmDeleteConv('${m.id}', '${_}')" title="Delete chat">\u{1F5D1}\uFE0F Delete Chat</button>
              </div>
            </div>
            <div class="conv-files" id="files_${C}">
              ${b}
            </div>
          </div>`}).join("")}catch{c='<div class="empty-state">No conversation files found. Click "Deep Scan & Re-Index".</div>'}let n=!!o.googleDriveToken,l=o.googleUserEmail||"",u=o.googleUserName||l||"Google User",x=o.googleUserPicture||"",v='<div class="empty-state">Not signed in to Google Drive. Sign in above to view cloud backups.</div>',y="0",h="Never";if(n)try{let f=await new W(o.googleDriveToken).getBackupFileDetails();f?(y=(parseInt(f.size||"0")/(1024*1024)).toFixed(2),h=new Date(f.modifiedTime).toLocaleString(),v=`
            <div class="cloud-info-card">
              <div class="cloud-info-header">
                <div class="cloud-info-title">\u2601\uFE0F Google Drive Backup File</div>
                <div class="status-badge" style="color: #34d399;"><span class="pulse-dot"></span> Backup File Active</div>
              </div>
              <div class="cloud-info-grid">
                <div class="cloud-info-item">
                  <div class="cloud-info-label">File Name</div>
                  <div class="cloud-info-val">${f.name}</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Backup Size</div>
                  <div class="cloud-info-val">${y} MB</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Last Cloud Sync</div>
                  <div class="cloud-info-val">${h}</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Google Drive File ID</div>
                  <div class="cloud-info-val" style="font-family: monospace; font-size: 11px;">${f.id}</div>
                </div>
              </div>
              <div class="cloud-actions-row">
                <button class="btn btn-secondary" onclick="sendMessage('restore')">\u{1F4E5} Pull & Restore from Cloud</button>
                <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Push & Overwrite Cloud</button>
              </div>
            </div>
          `):v=`
            <div class="cloud-info-card">
              <div class="cloud-info-title">\u2601\uFE0F No Cloud Backup Found Yet</div>
              <p style="color: var(--text-muted); font-size: 13px; margin: 8px 0 16px 0;">No backup file named <code>antigravity_cloud_backup.enc</code> exists in your Google Drive yet. Click "Sync All Conversations" to upload your first backup.</p>
              <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Perform Initial Cloud Sync</button>
            </div>
          `}catch(p){v=`<div class="empty-state">Unable to query Google Drive backup info: ${p.message}</div>`}let g=x?`<img src="${x}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`:'<div class="user-avatar-fallback">\u{1F464}</div>',w=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Cloud Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0d17;
      --card-bg: rgba(22, 26, 44, 0.75);
      --card-border: rgba(255, 255, 255, 0.08);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --gradient-primary: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
      --gradient-login: linear-gradient(135deg, #10b981 0%, #059669 100%);
      --gradient-scan: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
      --gradient-danger: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 32px;
      margin: 0;
      box-sizing: border-box;
    }
    .hero {
      background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 45%),
                  radial-gradient(circle at top right, rgba(168, 85, 247, 0.18), transparent 45%);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 24px 32px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(16px);
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .title-box h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title-box p {
      margin: 0;
      font-size: 14px;
      color: var(--text-muted);
    }
    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(22, 26, 44, 0.9);
      border: 1px solid ${n?"rgba(16, 185, 129, 0.4)":"rgba(239, 68, 68, 0.4)"};
      padding: 10px 18px;
      border-radius: 16px;
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
    }
    .user-avatar-fallback {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .user-meta-name {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    .user-meta-email {
      font-size: 12px;
      color: var(--text-muted);
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      color: ${n?"#34d399":"#f87171"};
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${n?"#34d399":"#f87171"};
      box-shadow: 0 0 10px ${n?"#34d399":"#f87171"};
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.8; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.8; }
    }

    /* Progress Bar Component */
    .progress-card {
      display: none;
      background: rgba(22, 26, 44, 0.95);
      border: 1px solid rgba(139, 92, 246, 0.5);
      border-radius: 16px;
      padding: 18px 24px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(139, 92, 246, 0.25);
      flex-direction: column;
      gap: 10px;
      backdrop-filter: blur(16px);
      animation: fadeIn 0.3s ease;
    }
    .progress-card.active {
      display: flex;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
    }
    .progress-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ffffff;
    }
    .progress-percent {
      color: #c084fc;
      font-size: 15px;
      font-family: monospace;
      font-weight: 700;
    }
    .progress-track {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
      border-radius: 10px;
      transition: width 0.35s ease;
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
    }
    .progress-status {
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
    }

    .action-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 12px 22px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    }
    .btn-login {
      background: var(--gradient-login);
      color: #ffffff;
      font-size: 14px;
    }
    .btn-logout {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    .btn-logout:hover {
      background: #ef4444;
      color: #ffffff;
    }
    .btn-scan {
      background: var(--gradient-scan);
      color: #ffffff;
    }
    .btn-primary {
      background: var(--gradient-primary);
      color: #ffffff;
    }
    .btn-secondary {
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--card-border);
    }
    .btn-danger {
      background: var(--gradient-danger);
      color: #ffffff;
      margin-left: auto;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 20px;
      border-radius: 16px;
      backdrop-filter: blur(12px);
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-val {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
    }

    /* Modular Segmented Tabs */
    .tabs-nav {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 12px;
    }
    .tab-btn {
      padding: 12px 24px;
      border-radius: 12px;
      background: rgba(22, 26, 44, 0.6);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.25s;
    }
    .tab-btn:hover {
      color: var(--text);
      border-color: rgba(139, 92, 246, 0.4);
    }
    .tab-btn.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: #8b5cf6;
      color: #ffffff;
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }

    /* Cloud Info Card Styling */
    .cloud-info-card {
      background: var(--card-bg);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 24px;
      backdrop-filter: blur(12px);
    }
    .cloud-info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .cloud-info-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }
    .cloud-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    .cloud-info-item {
      background: rgba(11, 13, 23, 0.6);
      border-radius: 12px;
      padding: 14px 18px;
    }
    .cloud-info-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .cloud-info-val {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .cloud-actions-row {
      display: flex;
      gap: 12px;
    }

    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }
    .search-input {
      flex: 1;
      padding: 14px 20px;
      border-radius: 12px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent-purple);
    }
    .batch-bar {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .master-select-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 12px 18px;
      border-radius: 12px;
      cursor: pointer;
      user-select: none;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      transition: all 0.2s;
    }
    .master-select-box:hover {
      border-color: var(--accent-purple);
      background: rgba(139, 92, 246, 0.1);
    }
    .btn-batch-del {
      background: var(--gradient-danger);
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      opacity: 0.4;
      pointer-events: none;
      transition: all 0.25s;
    }
    .btn-batch-del.active {
      opacity: 1;
      pointer-events: auto;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
    }

    .conv-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .conv-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
      transition: all 0.25s ease;
    }
    .conv-card:hover {
      border-color: rgba(168, 85, 247, 0.4);
    }
    .conv-card.selected {
      border-color: rgba(139, 92, 246, 0.8) !important;
      background: rgba(30, 27, 60, 0.85) !important;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }
    .conv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .conv-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .conv-checkbox {
      width: 18px;
      height: 18px;
      accent-color: #8b5cf6;
      cursor: pointer;
    }
    .conv-title {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
    }
    .sync-badge {
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
    }
    .sync-badge.synced {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .conv-sub {
      font-size: 12px;
      color: var(--text-muted);
      font-family: monospace;
      margin-top: 4px;
      margin-left: 30px;
    }
    .conv-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn-toggle-files {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-toggle-files:hover {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text);
    }
    .btn-del-conv {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-del-conv:hover {
      background: #ef4444;
      color: #fff;
    }
    .conv-files {
      display: none;
      flex-direction: column;
      gap: 8px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px dashed var(--card-border);
      margin-left: 30px;
    }
    .sub-file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(11, 13, 23, 0.6);
      border-radius: 8px;
      font-size: 13px;
      font-family: monospace;
    }
    .sub-file-size {
      opacity: 0.6;
      font-size: 11px;
    }
    .btn-sub-del {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .btn-sub-del:hover {
      opacity: 1;
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      background: var(--card-bg);
      border: 1px dashed var(--card-border);
      border-radius: 16px;
      color: var(--text-muted);
      font-size: 14px;
    }

    /* Modal System */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(8px);
      z-index: 999;
      justify-content: center;
      align-items: center;
    }
    .modal-card {
      background: #161a2c;
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 32px;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    .modal-icon {
      font-size: 44px;
      margin-bottom: 16px;
    }
    .modal-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .modal-desc {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .modal-btn-cancel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .modal-btn-confirm {
      background: var(--gradient-danger);
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <div class="hero">
    <div class="title-box">
      <h1>\u2601\uFE0F Antigravity Cloud Hub</h1>
      <p>Multi-Device State Manager & Real-Time Sync Engine (Google Drive Backend)</p>
    </div>
    
    <div class="user-profile-badge">
      ${n?`${g}
             <div>
               <div class="user-meta-name">${u}</div>
               <div class="user-meta-email">${l}</div>
               <div class="status-badge"><span class="pulse-dot"></span> Google Drive Connected</div>
             </div>`:'<div class="status-badge"><span class="pulse-dot"></span> Not Logged In</div>'}
    </div>
  </div>

  <div class="progress-card" id="progressCard">
    <div class="progress-header">
      <div class="progress-title" id="progressTitle">\u{1F680} Syncing to Google Drive...</div>
      <div class="progress-percent" id="progressPercent">0%</div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <div class="progress-status" id="progressStatus">Initializing...</div>
    <div style="font-size: 12px; color: #fbbf24; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); padding: 8px 12px; border-radius: 8px; margin-top: 8px; display: flex; align-items: center; gap: 8px;">
      <span>\u26A0\uFE0F</span> <span>Large payload sync in progress. Please keep Antigravity IDE open until upload finishes.</span>
    </div>
    <button class="btn btn-danger" style="margin-top: 10px; width: fit-content; padding: 6px 16px; font-size: 12px;" onclick="sendMessage('cancelSync')">\u23F9\uFE0F Cancel Sync</button>
  </div>

  ${n?"":`<div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
          <div>
            <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 6px;">\u{1F680} Welcome to Antigravity Anywhere!</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Connect your Google Drive account to sync your Antigravity IDE chat history, SQLite databases, and trajectory metadata across all your computers seamlessly.</p>
          </div>
          <button class="btn btn-login" style="padding: 12px 24px; font-size: 14px; white-space: nowrap;" onclick="sendMessage('googleLogin')">\u{1F511} Sign in with Google</button>
        </div>`}

  <div class="action-bar">
    <button class="btn ${o.enableAutoSync?"btn-scan":"btn-secondary"}" onclick="sendMessage('toggleAutoSync')">\u26A1 Auto Sync: ${o.enableAutoSync?"ON (Click to Disable)":"OFF (Click to Enable)"}</button>
    ${n?`<button class="btn btn-logout" onclick="sendMessage('googleLogout')">\u{1F6AA} Sign Out (${u.split(" ")[0]})</button>`:`<button class="btn btn-login" onclick="sendMessage('googleLogin')">\u{1F511} Sign in with Google</button>`}
    <button class="btn btn-scan" onclick="sendMessage('deepScan')">\u{1F50D} Deep Scan & Re-Index</button>
    <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Sync All Conversations (Push)</button>
    <button class="btn btn-secondary" onclick="sendMessage('restore')">\u{1F4E5} Restore from Google Drive (Pull)</button>
    <button class="btn btn-danger" onclick="confirmDeleteAll()">\u{1F5D1}\uFE0F Delete All Local Files</button>
  </div>

  <div class="grid">
    <div class="card stat-card">
      <div class="stat-label">Active Conversations</div>
      <div class="stat-val">${a} Chats</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Local Data Size</div>
      <div class="stat-val">${r} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Cloud Backup Size</div>
      <div class="stat-val">${y} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Device Info</div>
      <div class="stat-val" style="font-size: 16px;">${e.deviceName} (${e.platform})</div>
    </div>
  </div>

  <div class="tabs-nav">
    <button class="tab-btn active" id="tabLocal" onclick="switchTab('local')">\u{1F4BB} Local Conversations (${a})</button>
    <button class="tab-btn" id="tabCloud" onclick="switchTab('cloud')">\u2601\uFE0F Cloud Backup Info (${y} MB)</button>
  </div>

  <div class="tab-content active" id="contentLocal">
    <div class="search-bar">
      <input type="text" id="searchInput" class="search-input" placeholder="\u{1F50D} Search conversations by title or ID..." onkeyup="filterConversations()">
      <div class="batch-bar">
        <label class="master-select-box" title="Select / Deselect all visible conversations">
          <input type="checkbox" id="masterCheckbox" class="conv-checkbox" onchange="toggleSelectAll(this.checked)">
          <span id="masterSelectLabel">Select All (${a})</span>
        </label>
        <button class="btn-batch-del" id="batchDelBtn" onclick="confirmBatchDelete()">\u{1F5D1}\uFE0F Delete Selected (<span id="selectedCount">0</span>)</button>
      </div>
    </div>

    <div class="conv-list" id="convList">
      ${c}
    </div>
  </div>

  <div class="tab-content" id="contentCloud">
    ${v}
  </div>

  <!-- Custom Glassmorphism Confirmation Modal -->
  <div class="modal-overlay" id="confirmModal">
    <div class="modal-card">
      <div class="modal-icon" id="modalIcon">\u26A0\uFE0F</div>
      <div class="modal-title" id="modalTitle">Confirm Action</div>
      <div class="modal-desc" id="modalDesc">Are you sure you want to proceed?</div>
      <div class="modal-actions">
        <button class="modal-btn-cancel" onclick="closeModal()">Cancel</button>
        <button class="modal-btn-confirm" id="modalConfirmBtn">Confirm Delete</button>
      </div>
    </div>
  </div>

  <script>
    const vscode = (window.vscodeApi = window.vscodeApi || acquireVsCodeApi());

    function sendMessage(command) {
      vscode.postMessage({ command });
    }

    function switchTab(tabName) {
      document.getElementById('tabLocal').classList.remove('active');
      document.getElementById('tabCloud').classList.remove('active');
      document.getElementById('contentLocal').classList.remove('active');
      document.getElementById('contentCloud').classList.remove('active');

      if (tabName === 'local') {
        document.getElementById('tabLocal').classList.add('active');
        document.getElementById('contentLocal').classList.add('active');
      } else {
        document.getElementById('tabCloud').classList.add('active');
        document.getElementById('contentCloud').classList.add('active');
      }
    }

    function toggleFiles(id) {
      const el = document.getElementById(id);
      if (el) {
        const isHidden = el.style.display === 'none' || !el.style.display;
        el.style.display = isHidden ? 'flex' : 'none';
      }
    }

    function filterConversations() {
      const q = document.getElementById('searchInput').value.toLowerCase();
      const cards = document.querySelectorAll('.conv-card');
      cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const id = card.getAttribute('data-id') || '';
        if (title.includes(q) || id.includes(q)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
      updateBatchState();
    }

    function updateBatchState() {
      const cards = document.querySelectorAll('.conv-card');
      let totalVisible = 0;
      let selectedVisibleCount = 0;

      cards.forEach(card => {
        const isVisible = card.style.display !== 'none';
        const cb = card.querySelector('.conv-checkbox');
        if (isVisible) {
          totalVisible++;
          if (cb && cb.checked) {
            selectedVisibleCount++;
            card.classList.add('selected');
          } else {
            card.classList.remove('selected');
          }
        } else {
          if (cb) cb.checked = false;
          card.classList.remove('selected');
        }
      });

      const masterCb = document.getElementById('masterCheckbox');
      const masterLabel = document.getElementById('masterSelectLabel');
      const countSpan = document.getElementById('selectedCount');
      const btn = document.getElementById('batchDelBtn');

      if (countSpan) countSpan.innerText = selectedVisibleCount;

      if (btn) {
        if (selectedVisibleCount > 0) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }

      if (masterCb && masterLabel) {
        if (selectedVisibleCount === 0) {
          masterCb.checked = false;
          masterCb.indeterminate = false;
          masterLabel.innerText = 'Select All (' + totalVisible + ')';
        } else if (selectedVisibleCount === totalVisible && totalVisible > 0) {
          masterCb.checked = true;
          masterCb.indeterminate = false;
          masterLabel.innerText = 'Deselect All (' + totalVisible + ')';
        } else {
          masterCb.checked = false;
          masterCb.indeterminate = true;
          masterLabel.innerText = selectedVisibleCount + ' / ' + totalVisible + ' Selected';
        }
      }
    }

    function toggleSelectAll(checked) {
      const cards = document.querySelectorAll('.conv-card');
      cards.forEach(card => {
        if (card.style.display !== 'none') {
          const cb = card.querySelector('.conv-checkbox');
          if (cb) cb.checked = checked;
        }
      });
      updateBatchState();
    }

    let pendingAction = null;

    function openModal(icon, title, desc, onConfirm) {
      document.getElementById('modalIcon').innerText = icon;
      document.getElementById('modalTitle').innerText = title;
      document.getElementById('modalDesc').innerText = desc;
      pendingAction = onConfirm;
      document.getElementById('confirmModal').style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('confirmModal').style.display = 'none';
      pendingAction = null;
    }

    document.getElementById('modalConfirmBtn').addEventListener('click', () => {
      if (pendingAction) pendingAction();
      closeModal();
    });

    function confirmDeleteConv(convId, title) {
      openModal(
        '\u{1F5D1}\uFE0F',
        'Delete Conversation?',
        'Are you sure you want to permanently delete conversation "' + title + '" (' + convId.substring(0, 8) + ')?',
        () => vscode.postMessage({ command: 'deleteConversation', convId })
      );
    }

    function confirmBatchDelete() {
      const checked = document.querySelectorAll('.conv-checkbox:checked');
      const convIds = Array.from(checked).map(cb => cb.getAttribute('data-id'));
      if (convIds.length === 0) return;

      openModal(
        '\u{1F5D1}\uFE0F',
        'Delete Selected Conversations?',
        'Are you sure you want to permanently delete ' + convIds.length + ' selected conversations and all associated files?',
        () => vscode.postMessage({ command: 'deleteBatchConversations', convIds })
      );
    }

    function confirmDeleteFile(relativePath) {
      openModal(
        '\u{1F4C4}',
        'Delete File?',
        'Are you sure you want to delete "' + relativePath + '"?',
        () => vscode.postMessage({ command: 'deleteFile', relativePath })
      );
    }

    function confirmDeleteAll() {
      openModal(
        '\u26A0\uFE0F',
        'Delete All Local Files?',
        'DANGER: This will wipe all local conversation files in brain/. A safety backup snapshot will be created before deletion.',
        () => vscode.postMessage({ command: 'deleteAll' })
      );
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'syncProgress') {
        const { active, percentage, statusText, title } = message.progress;
        const card = document.getElementById('progressCard');
        const fill = document.getElementById('progressFill');
        const percent = document.getElementById('progressPercent');
        const status = document.getElementById('progressStatus');
        const titleEl = document.getElementById('progressTitle');

        if (card && active) {
          card.classList.add('active');
          if (fill) fill.style.width = percentage + '%';
          if (percent) percent.innerText = percentage + '%';
          if (status) status.innerText = statusText;
          if (titleEl) titleEl.innerText = title;

          if (percentage >= 100) {
            setTimeout(() => {
              card.classList.remove('active');
            }, 3500);
          }
        } else if (card) {
          card.classList.remove('active');
        }
      }
    });
  </script>

</body>
</html>`;t.webview.html=w}};var L=D(require("vscode"));var j=class s{constructor(t){this._extensionUri=t}static viewType="antigravityAnywhereSidebarView";static currentView;_view;resolveWebviewView(t,o,e){this._view=t,s.currentView=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},t.webview.onDidReceiveMessage(async i=>{switch(i.command){case"googleLogin":await L.commands.executeCommand("antigravityAnywhere.googleLogin"),this.refresh();break;case"googleLogout":await L.commands.executeCommand("antigravityAnywhere.googleLogout"),this.refresh();break;case"deepScan":await L.commands.executeCommand("antigravityAnywhere.deepScan"),this.refresh();break;case"syncNow":await L.commands.executeCommand("antigravityAnywhere.syncNow"),this.refresh();break;case"restore":await L.commands.executeCommand("antigravityAnywhere.restore"),this.refresh();break;case"deleteAll":await L.commands.executeCommand("antigravityAnywhere.deleteAllFiles",!0),this.refresh();break;case"deleteFile":await L.commands.executeCommand("antigravityAnywhere.deleteFile",i.relativePath),this.refresh();break;case"deleteConversation":await L.commands.executeCommand("antigravityAnywhere.deleteConversation",i.convId),this.refresh();break;case"openDashboard":await L.commands.executeCommand("antigravityAnywhere.openDashboard");break;case"cancelSync":await L.commands.executeCommand("antigravityAnywhere.cancelSync"),this.refresh();break;case"toggleAutoSync":await L.commands.executeCommand("antigravityAnywhere.toggleAutoSync"),this.refresh();break;case"refresh":this.refresh();break}}),this.refresh()}async refresh(){this._view&&(this._view.webview.html=await this._getHtmlForWebview())}async _getHtmlForWebview(){let t=P(),o=J.getDeviceInfo(),e=0,i="0",a="";try{let x=await I.scanDataDirectory(t.antigravityDataDir);i=x.totalSizeMB;let v=I.groupFilesByConversation(x,t.antigravityDataDir);e=v.length,a=v.map(y=>`<div class="conv-item">
              <div class="conv-header">
                <div class="conv-title">${y.status==="synced"?"\u{1F7E2}":y.status==="modified"?"\u{1F7E1}":"\u26AA"} ${y.title}</div>
                <button class="btn-del-mini" onclick="send('deleteConversation', '${y.id}')" title="Delete conversation">\u{1F5D1}\uFE0F</button>
              </div>
              <div class="conv-meta">ID: ${y.id.substring(0,8)}... \u2022 ${y.files.length} Files (${y.totalSizeMB} MB)</div>
            </div>`).join("")}catch{a='<div class="conv-item empty">No chat data found.</div>'}let r=!!t.googleDriveToken,c=t.googleUserEmail||"Google User",n=t.googleUserName||c,l=t.googleUserPicture||"",u=l?`<img src="${l}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`:'<div class="user-avatar-fallback">\u{1F464}</div>';return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Anywhere</title>
  <style>
    body {
      font-family: var(--vscode-font-family, system-ui, sans-serif);
      color: var(--vscode-foreground);
      padding: 12px;
      margin: 0;
      font-size: 12px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-widget-border, #333);
    }
    .title {
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      background: ${r?"rgba(16, 185, 129, 0.2)":"rgba(239, 68, 68, 0.2)"};
      border: 1px solid ${r?"#10b981":"#ef4444"};
      color: ${r?"#34d399":"#f87171"};
      font-weight: 600;
    }
    .user-card {
      background: var(--vscode-sideBar-background, #1e1e2e);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
    }
    .user-avatar-fallback {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .user-details {
      flex: 1;
      overflow: hidden;
    }
    .user-name {
      font-weight: 700;
      font-size: 12px;
      color: var(--vscode-foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 10px;
      opacity: 0.65;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* Progress Bar Widget */
    .progress-card {
      display: none;
      background: rgba(30, 27, 60, 0.9);
      border: 1px solid #8b5cf6;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 12px;
      flex-direction: column;
      gap: 6px;
    }
    .progress-card.active {
      display: flex;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
    }
    .progress-title {
      color: #fff;
    }
    .progress-percent {
      color: #a855f7;
      font-family: monospace;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899);
      border-radius: 6px;
      transition: width 0.3s ease;
    }
    .progress-status {
      font-size: 10px;
      opacity: 0.8;
      color: #cbd5e1;
    }
    .btn-cancel-sync {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #f87171;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 4px;
      width: 100%;
    }
    .btn-cancel-sync:hover {
      background: #ef4444;
      color: #fff;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    button.btn-dashboard {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: #ffffff;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
    }
    button.btn-dashboard:hover {
      background: linear-gradient(135deg, #4f46e5, #9333ea);
    }
    button {
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #ffffff);
      border: none;
      padding: 7px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: opacity 0.2s;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground, #1177bb);
    }
    button.login {
      background: #10b981;
      color: #fff;
    }
    button.login:hover {
      background: #059669;
    }
    button.logout {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    button.logout:hover {
      background: #ef4444;
      color: #fff;
    }
    button.scan {
      background: #8b5cf6;
      color: #fff;
    }
    button.scan:hover {
      background: #7c3aed;
    }
    button.secondary {
      background: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #ffffff);
    }
    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground, #45494e);
    }
    button.danger {
      background: #dc2626;
      color: #ffffff;
      margin-top: 4px;
    }
    button.danger:hover {
      background: #b91c1c;
    }
    .stats-card {
      background: var(--vscode-sideBar-background, #252526);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 14px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 11px;
    }
    .stat-row:last-child {
      margin-bottom: 0;
    }
    .stat-label {
      opacity: 0.7;
    }
    .stat-val {
      font-weight: 600;
      color: var(--vscode-symbolIcon-keywordForeground, #75beff);
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .conv-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .conv-item {
      background: var(--vscode-sideBar-background, #252526);
      border: 1px solid var(--vscode-widget-border, #333);
      border-radius: 6px;
      padding: 8px 10px;
    }
    .conv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .conv-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 170px;
    }
    .conv-meta {
      font-size: 10px;
      opacity: 0.6;
      font-family: monospace;
    }
    .btn-del-mini {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 12px;
      opacity: 0.7;
    }
    .btn-del-mini:hover {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">\u2601\uFE0F Antigravity Drive</div>
    <div class="badge">${r?"Connected":"Not Connected"}</div>
  </div>

  ${r?`<div class="user-card">
          ${u}
          <div class="user-details">
            <div class="user-name">${n}</div>
            <div class="user-email">${c}</div>
          </div>
        </div>`:""}

  <div class="progress-card" id="progressCard">
    <div class="progress-header">
      <div class="progress-title" id="progressTitle">\u{1F680} Syncing...</div>
      <div class="progress-percent" id="progressPercent">0%</div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progressFill"></div>
    </div>
    <div class="progress-status" id="progressStatus">Initializing...</div>
    <button class="btn-cancel-sync" onclick="send('cancelSync')">\u23F9\uFE0F Cancel Sync</button>
  </div>

  <div class="actions">
    <button class="btn-dashboard" onclick="send('openDashboard')">\u{1F5A5}\uFE0F Open Full Dashboard</button>
    <button class="${t.enableAutoSync?"scan":"secondary"}" onclick="send('toggleAutoSync')">\u26A1 Auto Sync: ${t.enableAutoSync?"ON":"OFF"}</button>
    ${r?`<button class="logout" onclick="send('googleLogout')">\u{1F6AA} Sign Out (${n.split(" ")[0]})</button>`:`<button class="login" onclick="send('googleLogin')">\u{1F511} Sign in with Google</button>`}
    <button class="scan" onclick="send('deepScan')">\u{1F50D} Deep Scan & Re-Index</button>
    <button onclick="send('syncNow')">\u26A1 Sync All (Google Drive)</button>
    <button class="secondary" onclick="send('restore')">\u{1F4E5} Restore from Google Drive</button>
    <button class="secondary" onclick="send('refresh')">\u{1F504} Refresh UI</button>
    <button class="danger" onclick="send('deleteAll')">\u{1F5D1}\uFE0F Delete All Files</button>
  </div>

  <div class="stats-card">
    <div class="stat-row">
      <span class="stat-label">Device:</span>
      <span class="stat-val">${o.deviceName}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Active Chats:</span>
      <span class="stat-val">${e}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Total Size:</span>
      <span class="stat-val">${i} MB</span>
    </div>
  </div>

  <div class="section-title">Conversations (${e})</div>
  <div class="conv-list">
    ${a}
  </div>

  <script>
    const vscode = (window.vscodeApi = window.vscodeApi || acquireVsCodeApi());
    function send(command, param) {
      if (command === 'deleteConversation') {
        vscode.postMessage({ command: 'deleteConversation', convId: param });
      } else {
        vscode.postMessage({ command });
      }
    }

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'syncProgress') {
        const { active, percentage, statusText, title } = message.progress;
        const card = document.getElementById('progressCard');
        const fill = document.getElementById('progressFill');
        const percent = document.getElementById('progressPercent');
        const status = document.getElementById('progressStatus');
        const titleEl = document.getElementById('progressTitle');

        if (card && active) {
          card.classList.add('active');
          if (fill) fill.style.width = percentage + '%';
          if (percent) percent.innerText = percentage + '%';
          if (status) status.innerText = statusText;
          if (titleEl) titleEl.innerText = title;

          if (percentage >= 100) {
            setTimeout(() => {
              card.classList.remove('active');
            }, 3500);
          }
        } else if (card) {
          card.classList.remove('active');
        }
      }
    });
  </script>
</body>
</html>`}};var Q,z=null,Be="",F=null;function Ye(s){Q=d.window.createStatusBarItem(d.StatusBarAlignment.Right,100),Q.command="antigravityAnywhere.openDashboard",$("Not Logged In","$(account)"),Q.show(),s.subscriptions.push(Q);let t=new j(s.extensionUri);s.subscriptions.push(d.window.registerWebviewViewProvider(j.viewType,t)),N.validateOrRefreshToken().then(e=>{if(e){let i=P();$(i.googleUserName?`Signed in as ${i.googleUserName.split(" ")[0]}`:"Signed In","$(cloud-check)")}else $("Not Logged In","$(account)");t.refresh(),M.refreshCurrentPanel()}),s.subscriptions.push(d.commands.registerCommand("antigravityAnywhere.googleLogin",async()=>{try{$("Signing in...","$(sync~spin)"),await N.startLoginFlow();let e=P();$(e.googleUserName?`${e.googleUserName.split(" ")[0]}`:"Signed In","$(cloud-check)"),d.window.showInformationMessage("Antigravity Cloud: Successfully signed in with Google! You can now sync manually."),t.refresh(),M.refreshCurrentPanel()}catch(e){$("Login Error","$(error)"),d.window.showErrorMessage("Antigravity Cloud Google Login Failed: "+e.message)}}),d.commands.registerCommand("antigravityAnywhere.openDashboard",()=>M.show(s)),d.commands.registerCommand("antigravityAnywhere.cancelSync",()=>{F&&(F.abort(),F=null,$("Canceled","$(x)"),E(!1,0,"\u23F9\uFE0F Sync canceled by user.","Canceled"),d.window.showInformationMessage("Antigravity Cloud: Sync operation canceled by user."),t.refresh(),M.refreshCurrentPanel())}),d.commands.registerCommand("antigravityAnywhere.toggleAutoSync",async()=>{let e=P(),i=!e.enableAutoSync;await he(i),i?(e.googleDriveToken&&(z||(z=new q(e.syncIntervalSeconds,()=>re(!1))),z.startWatching(e.antigravityDataDir)),d.window.showInformationMessage("Antigravity Cloud: Automatic Sync is now ENABLED \u26A1")):(z&&(z.stopWatching(),z=null),d.window.showInformationMessage("Antigravity Cloud: Automatic Sync is now DISABLED \u{1F6D1} (Manual Sync only)")),t.refresh(),M.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.syncNow",async()=>{await re(!0),t.refresh(),M.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.restore",async()=>{await Ke(),t.refresh(),M.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.googleLogout",async()=>{await N.logout(),$("Not Logged In","$(account)"),d.window.showInformationMessage("Antigravity Cloud: Signed out of Google."),t.refresh(),M.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.deepScan",async()=>{await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Deep Scanning all conversation directories...",cancellable:!1},async()=>{let e=P(),i=await I.scanDataDirectory(e.antigravityDataDir),a=I.groupFilesByConversation(i);t.refresh(),d.window.showInformationMessage(`Antigravity Anywhere Deep Scan Complete: Found ${a.length} Conversations (${i.files.length} Total Files, ${i.totalSizeMB} MB).`)})}),d.commands.registerCommand("antigravityAnywhere.deleteConversation",async(e,i)=>{if(!e||e==="global-config"||!i&&await d.window.showWarningMessage(`Are you sure you want to delete conversation "${e}" and all its associated files?`,"Yes, Delete Conversation","Cancel")!=="Yes, Delete Conversation")return;let a=P(),r=Me(a.antigravityDataDir,e);try{let c=!1;for(let n of r)R.existsSync(n)&&(await R.promises.rm(n,{recursive:!0,force:!0}),c=!0);c&&(t.refresh(),M.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Deleted conversation ${e}`))}catch(c){d.window.showErrorMessage(`Antigravity Anywhere: Failed to delete conversation: ${c.message}`)}}),d.commands.registerCommand("antigravityAnywhere.deleteBatchConversations",async e=>{if(!Array.isArray(e)||e.length===0)return;let i=P();for(let a of e){if(!a)continue;let r=Me(i.antigravityDataDir,a);for(let c of r)if(R.existsSync(c))try{await R.promises.rm(c,{recursive:!0,force:!0})}catch{}}t.refresh(),M.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Successfully deleted ${e.length} selected conversation(s).`)}),d.commands.registerCommand("antigravityAnywhere.deleteFile",async(e,i)=>{if(!e||!i&&await d.window.showWarningMessage(`Are you sure you want to delete "${e}"?`,"Yes, Delete","Cancel")!=="Yes, Delete")return;let a=P(),r=k.dirname(a.antigravityDataDir),c=k.join(a.antigravityDataDir,e);if(e.startsWith("config/"))c=k.join(r,e);else if(e.startsWith("app_support/")){let n=I.getAppSupportDir();c=k.join(n,e.substring(12))}try{R.existsSync(c)&&(await R.promises.rm(c,{recursive:!0,force:!0}),t.refresh(),M.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Deleted ${e}`))}catch(n){d.window.showErrorMessage(`Antigravity Anywhere: Failed to delete file: ${n.message}`)}}),d.commands.registerCommand("antigravityAnywhere.deleteAllFiles",async e=>{let i=P();if(!e){if(await d.window.showWarningMessage("\u26A0\uFE0F DANGER: Are you sure you want to DELETE ALL local conversation files in brain/, conversations/, and implicit/?","Yes, Delete All Files","Cancel")!=="Yes, Delete All Files")return;if(await d.window.showInputBox({prompt:"Type DELETE to confirm wiping all local conversation files:",placeHolder:"DELETE",ignoreFocusOut:!0})!=="DELETE"){d.window.showInformationMessage("Antigravity Anywhere: Delete All cancelled.");return}}try{await Z.createSnapshot(i.antigravityDataDir);let a=k.dirname(i.antigravityDataDir),r=I.getAppSupportDir(),c=[k.join(i.antigravityDataDir,"brain"),k.join(i.antigravityDataDir,"conversations"),k.join(i.antigravityDataDir,"implicit"),k.join(a,"antigravity","brain"),k.join(a,"antigravity","conversations"),k.join(a,"antigravity","implicit"),k.join(a,"antigravity-ide","brain"),k.join(a,"antigravity-ide","conversations"),k.join(a,"antigravity-ide","implicit"),k.join(r,"shared_proto_db")];for(let l of c)R.existsSync(l)&&await R.promises.rm(l,{recursive:!0,force:!0});let n=I.getCacheFilePath(i.antigravityDataDir);R.existsSync(n)&&await R.promises.unlink(n),t.refresh(),M.refreshCurrentPanel(),d.window.showInformationMessage("Antigravity Anywhere: All local conversation files wiped (safety snapshot created).")}catch(a){d.window.showErrorMessage(`Antigravity Anywhere: Delete All failed: ${a.message}`)}}));let o=P();o.enableAutoSync&&o.googleDriveToken&&(z=new q(o.syncIntervalSeconds,()=>re(!1)),z.startWatching(o.antigravityDataDir)),s.subscriptions.push(d.workspace.onDidChangeConfiguration(e=>{e.affectsConfiguration("antigravityAnywhere")&&Qe()}))}function Qe(){z&&(z.stopWatching(),z=null);let s=P();s.enableAutoSync&&s.googleDriveToken&&(z=new q(s.syncIntervalSeconds,()=>re(!1)),z.startWatching(s.antigravityDataDir))}function E(s,t,o,e="\u{1F680} Syncing to Google Drive..."){let i={command:"syncProgress",progress:{active:s,percentage:t,statusText:o,title:e}};M.currentPanel&&M.currentPanel.webview.postMessage(i),j.currentView&&j.currentView.webview.postMessage(i)}async function re(s=!1){let t=P();if(!t.googleDriveToken){s&&d.window.showWarningMessage("Antigravity Anywhere: Please sign in with Google first.","Sign In").then(e=>{e==="Sign In"&&d.commands.executeCommand("antigravityAnywhere.googleLogin")});return}F=new AbortController;let o=async()=>{try{$("Syncing...","$(sync~spin)"),E(!0,10,"\u{1F50D} Scanning local chat transcripts & databases... (Do not close Antigravity IDE)","\u{1F680} Syncing to Google Drive...");let e=await I.scanForSync(t.antigravityDataDir);if(F?.signal.aborted)throw new Error("Operation canceled by user.");if(e.files.length===0){s&&d.window.showInformationMessage("Antigravity Anywhere: No chat data found to sync."),$("Idle","$(cloud-check)"),E(!1,0,"");return}if(e.manifestHash===Be){$("Up to Date","$(cloud-check)"),E(!0,100,"\u26A1 Already Up to Date! No changes detected since last sync.","\u{1F680} Up to Date"),s&&d.window.showInformationMessage(`Antigravity Anywhere: Cloud backup is already up-to-date! All ${e.files.length} conversation files match Google Drive.`);return}E(!0,30,`\u26A1 Processing ${e.files.length} chat files (${e.totalSizeMB} MB)...`,"\u{1F680} Syncing to Google Drive...");let i=JSON.stringify(e);if(F?.signal.aborted)throw new Error("Operation canceled by user.");E(!0,55,"\u{1F512} Compressing & Encrypting payload (AES-256-GCM)...","\u{1F680} Syncing to Google Drive...");let a=De(i,t.encryptionPassword);if(F?.signal.aborted)throw new Error("Operation canceled by user.");E(!0,75,`\u2601\uFE0F Uploading encrypted bundle (${(a.length/(1024*1024)).toFixed(2)} MB) to Google Drive... Please wait...`,"\u{1F680} Syncing to Google Drive...");let r=new W(t.googleDriveToken,F?.signal),c=t.driveFileId;if(!c){let l=await r.findBackupFileId();l&&(c=l)}let n=await r.uploadSyncPayload(a,c,(l,u)=>{let x=Math.min(89,Math.floor(75+l/u*14)),v=(l/(1024*1024)).toFixed(1),y=(u/(1024*1024)).toFixed(1);E(!0,x,`\u2601\uFE0F Uploading: ${v} MB / ${y} MB (${x}%)... Please wait...`,"\u{1F680} Uploading to Google Drive...")});if(n!==t.driveFileId&&await le(n),E(!0,90,"\u{1F4BE} Saving local delta state cache...","\u{1F680} Syncing to Google Drive..."),await I.saveDeltaState(t.antigravityDataDir,e.files),Be=e.manifestHash,$("Synced","$(cloud-check)"),E(!0,100,`\u2705 Synced ${e.files.length} chat files (${e.totalSizeMB} MB) to Google Drive!`,"\u{1F680} Sync Complete"),s){let l=I.groupFilesByConversation(e),u=e.isIncremental?"\u26A1 Incremental Delta Sync":"\u{1F504} Full Backup Sync";d.window.showInformationMessage(`Antigravity Anywhere [${u}]: Synced ${l.length} active/modified chats (${e.files.length} files, ${e.totalSizeMB} MB) to Google Drive!`)}}catch(e){$("Sync Error","$(error)"),E(!0,0,`\u274C Sync Failed: ${e.message}`,"Sync Error"),s&&!F?.signal.aborted&&(e.message&&e.message.includes("console.developers.google.com")?d.window.showErrorMessage("Antigravity Cloud: Google Drive API is disabled in your Google Cloud Project (627024998523). Click below to enable it.","Enable Google Drive API").then(i=>{i==="Enable Google Drive API"&&d.env.openExternal(d.Uri.parse("https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=627024998523"))}):d.window.showErrorMessage(`Antigravity Anywhere Google Drive Sync Failed: ${e.message}`))}finally{F=null}};s?await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Syncing all conversations to Google Drive...",cancellable:!1},o):await o()}async function Ke(){let s=P();if(!s.googleDriveToken){d.window.showErrorMessage("Antigravity Anywhere: Google Sign-In is required to restore backups.","Sign In").then(i=>{i==="Sign In"&&d.commands.executeCommand("antigravityAnywhere.googleLogin")});return}F=new AbortController;let t=new W(s.googleDriveToken,F.signal),o=s.driveFileId;if(!o){$("Searching Google Drive...","$(sync~spin)"),E(!0,10,"\u{1F50D} Searching Google Drive for backup file...","\u{1F4E5} Restoring from Google Drive...");let i=await t.findBackupFileId();if(i)o=i,await le(o);else{$("Restore Error","$(error)"),E(!0,0,"\u274C No backup found on Google Drive","Restore Error"),d.window.showErrorMessage("Antigravity Anywhere: No cloud backup found in Google Drive account. Perform a Sync first on your main computer."),F=null;return}}if(await d.window.showWarningMessage("Restoring from Google Drive will update local chat history and SQLite databases. A local backup snapshot will be created automatically. Proceed?","Yes, Restore","Cancel")!=="Yes, Restore"){$("Idle","$(cloud-check)"),F=null;return}await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Restoring all conversations from Google Drive...",cancellable:!1},async()=>{try{$("Restoring...","$(sync~spin)"),E(!0,20,"\u{1F4F8} Creating Safety Snapshot local backup...","\u{1F4E5} Restoring from Google Drive..."),await Z.createSnapshot(s.antigravityDataDir),E(!0,45,"\u2601\uFE0F Downloading encrypted payload from Google Drive...","\u{1F4E5} Restoring from Google Drive...");let i=await t.downloadSyncPayload(o);E(!0,70,"\u{1F513} Decrypting payload & uncompressing files...","\u{1F4E5} Restoring from Google Drive...");let a=Ae(i,s.encryptionPassword),r=JSON.parse(a);E(!0,85,`\u{1F4C1} Restoring ${r.files?.length||0} transcript files and databases to disk...`,"\u{1F4E5} Restoring from Google Drive...");let c=await I.restoreBundle(s.antigravityDataDir,r);$("Restored","$(cloud-check)"),E(!0,100,`\u2705 Restored ${c} chat files! \u26A0\uFE0F Please Quit & Restart Antigravity IDE (Cmd+Q) to reload history.`,"\u{1F4E5} Restore Complete (Restart App)"),d.window.showInformationMessage(`Antigravity Cloud: Successfully restored ${c} conversation & database files! Please Quit & Restart Antigravity IDE to reload SQLite chat history.`,"\u{1F6AA} Quit Antigravity","\u{1F504} Reload Window","Later").then(n=>{n==="\u{1F6AA} Quit Antigravity"?d.commands.executeCommand("workbench.action.quit"):n==="\u{1F504} Reload Window"&&d.commands.executeCommand("workbench.action.reloadWindow")})}catch(i){$("Restore Error","$(error)"),E(!0,0,`\u274C Restore Failed: ${i.message}`,"Restore Error"),d.window.showErrorMessage(`Antigravity Anywhere Google Drive Restore Failed: ${i.message}`)}finally{F=null}})}function Me(s,t){let o=k.dirname(s),e=I.getAppSupportDir();if(t==="global-config")return[k.join(s,"config"),k.join(s,"state.vscdb"),k.join(s,"state.vscdb.backup"),k.join(o,"antigravity","config"),k.join(o,"antigravity-ide","config"),k.join(e,"shared_proto_db")];let i=[s,k.join(o,"antigravity"),k.join(o,"antigravity-ide")],a=[];for(let r of i)a.push(k.join(r,"brain",t),k.join(r,"conversations",`${t}.db`),k.join(r,"conversations",`${t}.db-wal`),k.join(r,"conversations",`${t}.db-shm`),k.join(r,"implicit",`${t}.pb`));return a}function $(s,t){Q&&(Q.text=`${t} Antigravity: ${s}`)}function Ze(){z&&z.stopWatching()}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
