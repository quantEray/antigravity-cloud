"use strict";var Ne=Object.create;var ne=Object.defineProperty;var _e=Object.getOwnPropertyDescriptor;var We=Object.getOwnPropertyNames;var je=Object.getPrototypeOf,Oe=Object.prototype.hasOwnProperty;var He=(r,t)=>{for(var i in t)ne(r,i,{get:t[i],enumerable:!0})},be=(r,t,i,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of We(t))!Oe.call(r,o)&&o!==i&&ne(r,o,{get:()=>t[o],enumerable:!(e=_e(t,o))||e.enumerable});return r};var k=(r,t,i)=>(i=r!=null?Ne(je(r)):{},be(t||!r||!r.__esModule?ne(i,"default",{value:r,enumerable:!0}):i,r)),qe=r=>be(ne({},"__esModule",{value:!0}),r);var at={};He(at,{activate:()=>tt,deactivate:()=>nt});module.exports=qe(at);var d=k(require("vscode")),G=k(require("fs")),A=k(require("path"));var P=k(require("vscode")),ye=k(require("os")),we=k(require("path"));function I(){let r=P.workspace.getConfiguration("antigravityAnywhere"),t=ye.homedir(),i=we.join(t,".gemini","antigravity-ide"),e=r.get("googleDriveToken","").trim(),o=r.get("googleRefreshToken","").trim(),n=r.get("driveFileId","").trim();return{googleDriveToken:e,googleRefreshToken:o,driveFileId:n,googleUserEmail:r.get("googleUserEmail","").trim(),googleUserName:r.get("googleUserName","").trim(),googleUserPicture:r.get("googleUserPicture","").trim(),encryptionPassword:r.get("encryptionPassword",""),enableAutoSync:r.get("enableAutoSync",!1),syncIntervalSeconds:r.get("syncIntervalSeconds",10),antigravityDataDir:i}}async function xe(r){await P.workspace.getConfiguration("antigravityAnywhere").update("enableAutoSync",r,P.ConfigurationTarget.Global)}async function ue(r){await P.workspace.getConfiguration("antigravityAnywhere").update("driveFileId",r,P.ConfigurationTarget.Global)}async function fe(r,t){let i=P.workspace.getConfiguration("antigravityAnywhere");await i.update("googleDriveToken",r,P.ConfigurationTarget.Global),t&&await i.update("googleRefreshToken",t,P.ConfigurationTarget.Global)}async function Se(r,t,i){let e=P.workspace.getConfiguration("antigravityAnywhere");await e.update("googleUserEmail",r,P.ConfigurationTarget.Global),await e.update("googleUserName",t,P.ConfigurationTarget.Global),await e.update("googleUserPicture",i,P.ConfigurationTarget.Global)}async function ke(){let r=P.workspace.getConfiguration("antigravityAnywhere");await r.update("googleDriveToken","",P.ConfigurationTarget.Global),await r.update("googleRefreshToken","",P.ConfigurationTarget.Global),await r.update("googleUserEmail","",P.ConfigurationTarget.Global),await r.update("googleUserName","",P.ConfigurationTarget.Global),await r.update("googleUserPicture","",P.ConfigurationTarget.Global),await r.update("driveFileId","",P.ConfigurationTarget.Global)}var C=k(require("fs")),x=k(require("path")),Ae=k(require("os")),ae=k(require("crypto"));var Ce=k(require("os")),O=class{static userHome=Ce.homedir();static normalize(t){if(!t)return t;let i=t.replace(/\\/g,"/"),e=this.userHome.replace(/\\/g,"/");return i.startsWith(e)&&(i=i.replace(e,"${USER_HOME}")),i}static denormalize(t){if(!t)return t;let i=this.userHome.replace(/\\/g,"/");return t.replace(/\${USER_HOME}/g,i)}};var T=class{static getAppSupportDir(){let t=Ae.homedir();return process.platform==="win32"?process.env.APPDATA?x.join(process.env.APPDATA,"Antigravity IDE"):x.join(t,"AppData","Roaming","Antigravity IDE"):process.platform==="darwin"?x.join(t,"Library","Application Support","Antigravity IDE"):x.join(t,".config","Antigravity IDE")}static getCacheFilePath(t){return x.join(t,"delta_sync_state.json")}static loadDeltaState(t){try{let i=this.getCacheFilePath(t);if(C.existsSync(i)){let e=C.readFileSync(i,"utf-8");return JSON.parse(e)}}catch{}return null}static async saveDeltaState(t,i){try{let e=this.getCacheFilePath(t),o={};for(let c of i)o[c.relativePath]={mtimeMs:c.mtimeMs,sizeBytes:c.sizeBytes,hash:c.hash};let n={timestamp:new Date().toISOString(),filesState:o};await C.promises.mkdir(x.dirname(e),{recursive:!0}),await C.promises.writeFile(e,JSON.stringify(n,null,2),"utf-8")}catch{}}static async scanDataDirectory(t){let i=x.dirname(t),e=[],o=[t,x.join(i,"antigravity"),x.join(i,"antigravity-ide"),x.join(i,"antigravity-cli")],n=new Set;for(let a of o)if(C.existsSync(a))for(let s of["conversations","brain","implicit"]){let l=x.join(a,s);C.existsSync(l)&&!n.has(l)&&(n.add(l),await this.scanDirRecursive(l,a,e,!1))}let c=x.join(i,"config");return C.existsSync(c)&&!n.has(c)&&(n.add(c),await this.scanDirRecursive(c,i,e,!1)),this.buildBundle(e)}static async scanForSync(t,i=!1){let e=x.dirname(t),o=[],n=[t,x.join(e,"antigravity"),x.join(e,"antigravity-ide"),x.join(e,"antigravity-cli")],c=new Set;for(let v of n)if(C.existsSync(v))for(let y of["conversations","brain","implicit"]){let p=x.join(v,y);C.existsSync(p)&&!c.has(p)&&(c.add(p),await this.scanDirRecursive(p,v,o,!1))}let a=x.join(e,"config");C.existsSync(a)&&!c.has(a)&&(c.add(a),await this.scanDirRecursive(a,e,o,!1));let s=this.getAppSupportDir();if(C.existsSync(s)){let v=x.join(s,"shared_proto_db");C.existsSync(v)&&await this.scanDirRecursive(v,s,o,!1,"app_support");let y=x.join(s,"User","globalStorage","state.vscdb");if(C.existsSync(y))try{let p=await C.promises.stat(y);if(p.size<=10*1024*1024){let u="base64:"+(await C.promises.readFile(y)).toString("base64"),f="app_support/User/globalStorage/state.vscdb",m=ae.createHash("sha256").update(u).digest("hex");o.push({relativePath:f,content:u,hash:m,sizeBytes:p.size,mtimeMs:p.mtimeMs})}}catch{}}let l=i?null:this.loadDeltaState(t),g=o,h=!1;if(l&&l.filesState){let v=new Set,y=new Set;for(let p of o){let S=l.filesState[p.relativePath],u=p.relativePath.startsWith("config/")||p.relativePath.startsWith("app_support/");if((!S||S.mtimeMs!==p.mtimeMs||S.sizeBytes!==p.sizeBytes)&&(y.add(p.relativePath),!u)){let f=p.relativePath.split("/"),m="";f[0]==="conversations"?m=f[1].replace(/\.(db|db-wal|db-shm)$/,""):f[0]==="brain"&&f.length>=2?m=f[1]:f[0]==="implicit"&&f.length>=2&&(m=f[1].replace(/\.pb$/,"")),m&&v.add(m)}}y.size>0&&y.size<o.length&&(h=!0,g=o.filter(p=>{if(p.relativePath.startsWith("config/")||p.relativePath.startsWith("app_support/"))return!0;let u=p.relativePath.split("/"),f="";return u[0]==="conversations"?f=u[1].replace(/\.(db|db-wal|db-shm)$/,""):u[0]==="brain"&&u.length>=2?f=u[1]:u[0]==="implicit"&&u.length>=2&&(f=u[1].replace(/\.pb$/,"")),v.has(f)||y.has(p.relativePath)}))}g.sort((v,y)=>y.mtimeMs-v.mtimeMs);let b=this.buildBundle(g);return b.isIncremental=h,b}static buildBundle(t){let i=[...t].sort((a,s)=>a.relativePath.localeCompare(s.relativePath)),e=i.reduce((a,s)=>a+s.sizeBytes,0),o=(e/(1024*1024)).toFixed(2),n=i.map(a=>`${a.relativePath}:${a.hash}`).join(`
`),c=ae.createHash("sha256").update(n).digest("hex");return{timestamp:new Date().toISOString(),totalSizeBytes:e,totalSizeMB:o,files:i,manifestHash:c}}static groupFilesByConversation(t,i){let e=new Map,o=[],n=i?this.loadDeltaState(i):null;for(let a of t.files){let s=a.relativePath.split("/"),l="global-config";if(s[0]==="brain"&&s.length>1)l=s[1];else if(s[0]==="conversations"&&s.length>1)l=s[1].replace(/\.(db|db-wal|db-shm)$/,"");else if(s[0]==="implicit"&&s.length>1)l=s[1].replace(/\.pb$/,"");else{o.push(a);continue}e.has(l)||e.set(l,[]),e.get(l).push(a)}let c=[];for(let[a,s]of e.entries()){let l="",g=s.reduce((S,u)=>S+u.sizeBytes,0),h=(g/(1024*1024)).toFixed(2),b=Math.max(...s.map(S=>S.mtimeMs),0),v=b>0?new Date(b).toLocaleDateString():"Unknown";for(let S of s){if(S.relativePath.endsWith("metadata.json"))try{let u=JSON.parse(S.content);u.Summary?l=u.Summary.substring(0,65):u.title&&(l=u.title.substring(0,65))}catch{}else if(S.relativePath.endsWith("transcript.jsonl")){let u=S.content.split(`
`);for(let f of u)if(f.trim())try{let m=JSON.parse(f);if(m.type==="USER_INPUT"&&m.content){let D=m.content;if(D.includes("<USER_REQUEST>")){let w=D.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);w&&w[1]&&(D=w[1].trim())}if(D=D.replace(/^[\/\s\n\r\t]+/,"").trim(),D.length>10){l=D.substring(0,65);break}}}catch{}}if(l)break}if(!l){for(let S of s)if(S.relativePath.endsWith(".db"))try{let f=S.content.match(/[\x20-\x7E]{12,70}/g);if(f&&f.length>0){let m=f.filter(D=>D.length>=12&&/[a-zA-Z]/.test(D));for(let D of m){let w=D.replace(/[\r\n\t]+/g," ").replace(/\s+/g," ").trim();if(w=w.replace(/^[\/\s\n\r\t]+/,"").replace(/^SQLite format \d+/,"").trim(),w.length>=12&&!w.includes("sqlite")&&!w.includes("TABLE")&&!w.includes("INDEX")&&!w.includes("file:///")&&!w.includes("http")&&!w.includes("trajectory")&&!w.includes("battle_mode")&&!w.includes("Along with each USER request")&&!w.includes("conversation_summaries")&&!w.includes("System prompt")&&!w.includes("toolAction")&&!w.includes("PRIMARY KEY")&&!w.startsWith("function")&&!w.startsWith("import ")&&!w.startsWith("export ")&&!/^[0-9a-f\-]{30,}$/i.test(w)){l=w.substring(0,65);break}}}}catch{}}if(l?(l=l.replace(/^[\/\s\n\r\t]+/,"").replace(/^SQLite format \d+/,"").replace(/^\\n/,"").trim(),l.length>65&&(l=l.substring(0,65)+"...")):l=`Chat Session (${a.substring(0,8)})`,g<10240&&l.startsWith("Chat Session")&&a!=="global-config")continue;let p="local";n&&n.filesState&&(p=s.every(u=>{let f=n.filesState[u.relativePath];return f&&f.mtimeMs===u.mtimeMs&&f.sizeBytes===u.sizeBytes})?"synced":"modified"),c.push({id:a,title:l,totalSizeBytes:g,totalSizeMB:h,lastUpdated:v,status:p,files:s})}if(o.length>0){let a=o.reduce((l,g)=>l+g.sizeBytes,0),s="local";n&&n.filesState&&(s=o.every(g=>{let h=n.filesState[g.relativePath];return h&&h.mtimeMs===g.mtimeMs&&h.sizeBytes===g.sizeBytes})?"synced":"modified"),c.push({id:"global-config",title:"Global Config & System Indexes",totalSizeBytes:a,totalSizeMB:(a/(1024*1024)).toFixed(2),lastUpdated:"Current",status:s,files:o})}return c}static async scanDirRecursive(t,i,e,o=!1,n=""){let c=await C.promises.readdir(t,{withFileTypes:!0});for(let a of c){let s=x.join(t,a.name);if(a.isDirectory()){if(a.name==="node_modules"||a.name===".git"||a.name==="tasks")continue;await this.scanDirRecursive(s,i,e,o,n)}else if(a.isFile()){let l=x.extname(a.name).toLowerCase();if([".webp",".png",".jpg",".jpeg",".gif",".mp4",".webm",".zip",".gz"].includes(l)||a.name.endsWith(".log")&&!a.name.includes("transcript")&&!s.includes("shared_proto_db"))continue;try{let g=await C.promises.stat(s);if(g.size>50*1024*1024)continue;let h=[".db",".db-wal",".db-shm",".pb",".vscdb"].includes(l)||s.includes("shared_proto_db");if(o&&h)continue;let b="";if(h)b="base64:"+(await C.promises.readFile(s)).toString("base64");else{let p=await C.promises.readFile(s,"utf-8");b=O.normalize(p)}let v=x.relative(i,s).replace(/\\/g,"/");n&&(v=`${n}/${v}`);let y=ae.createHash("sha256").update(b).digest("hex");e.push({relativePath:v,content:b,hash:y,sizeBytes:g.size,mtimeMs:g.mtimeMs})}catch{}}}}static async restoreBundle(t,i){let e=x.dirname(t),o=this.getAppSupportDir(),n=0,c=[t,x.join(e,"antigravity"),x.join(e,"antigravity-ide")];for(let a of i.files){let s=a.relativePath;if(a.relativePath.startsWith("config/")){let g=x.join(e,s.replace(/\//g,x.sep));try{await C.promises.mkdir(x.dirname(g),{recursive:!0}),a.content.startsWith("base64:")?await C.promises.writeFile(g,Buffer.from(a.content.substring(7),"base64")):await C.promises.writeFile(g,O.denormalize(a.content),"utf-8")}catch{}n++;continue}if(a.relativePath.startsWith("app_support/")){s=a.relativePath.substring(12);let g=x.join(o,s.replace(/\//g,x.sep));try{await C.promises.mkdir(x.dirname(g),{recursive:!0}),a.content.startsWith("base64:")?await C.promises.writeFile(g,Buffer.from(a.content.substring(7),"base64")):await C.promises.writeFile(g,O.denormalize(a.content),"utf-8")}catch{}n++;continue}let l=s.replace(/\//g,x.sep);for(let g of c){let h=x.join(g,l),b=x.dirname(h);try{if(await C.promises.mkdir(b,{recursive:!0}),a.content.startsWith("base64:")){let v=Buffer.from(a.content.substring(7),"base64");await C.promises.writeFile(h,v)}else{let v=O.denormalize(a.content);await C.promises.writeFile(h,v,"utf-8")}}catch{}}n++}return await this.saveDeltaState(t,i.files),n}};var N=k(require("crypto")),se=k(require("zlib")),De="aes-256-gcm",Ve=12,Je=16,Ee=32,Ie=1e5;function Pe(r,t){let e=se.gzipSync(Buffer.from(r,"utf-8")).toString("base64");if(!t)return JSON.stringify({version:1,compressed:!0,unencrypted:!0,data:e});let o=N.randomBytes(Je),n=N.randomBytes(Ve),c=N.pbkdf2Sync(t,o,Ie,Ee,"sha256"),a=N.createCipheriv(De,c,n),s=a.update(e,"utf-8","hex");s+=a.final("hex");let l=a.getAuthTag(),g={version:1,compressed:!0,salt:o.toString("hex"),iv:n.toString("hex"),tag:l.toString("hex"),data:s};return JSON.stringify(g)}function Te(r,t){let i=JSON.parse(r),e="";if(i.unencrypted)e=i.data;else{if(!t)throw new Error("Encryption password is required to decrypt cloud backup.");let o=i,n=Buffer.from(o.salt,"hex"),c=Buffer.from(o.iv,"hex"),a=Buffer.from(o.tag,"hex"),s=o.data,l=N.pbkdf2Sync(t,n,Ie,Ee,"sha256"),g=N.createDecipheriv(De,l,c);g.setAuthTag(a);let h=g.update(s,"hex","utf-8");h+=g.final("utf-8"),e=h}return i.compressed?se.gunzipSync(Buffer.from(e,"base64")).toString("utf-8"):Buffer.from(e,"base64").toString("utf-8")}var le=k(require("https"));var ve=k(require("http")),re=k(require("https")),ce=k(require("crypto")),V=k(require("vscode"));var me="627024998523-13an3bmndm293rvgu9faomi6ao9bepks.apps.googleusercontent.com",Me="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",Ye=["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"].join(" "),Qe=12e4,W=class{static async startLoginFlow(){let t=await Xe(),i=`http://127.0.0.1:${t}`,e=$e(ce.randomBytes(32)),o=$e(ce.createHash("sha256").update(e).digest()),n=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(me)}&redirect_uri=${encodeURIComponent(i)}&response_type=code&scope=${encodeURIComponent(Ye)}&access_type=offline&prompt=consent&code_challenge=${o}&code_challenge_method=S256`,c=Ze(t);await V.env.openExternal(V.Uri.parse(n)),V.window.showInformationMessage("\u{1F511} Google sign-in page opened \u2014 authorize in browser to complete login.",{modal:!1});let a;try{a=await et(c,Qe)}catch{throw new Error("Google Sign-In timed out or was cancelled. Please try again.")}let s=await Ke(a,e,i);await fe(s.accessToken,s.refreshToken);try{await this.fetchAndStoreUserProfile(s.accessToken)}catch{}return s}static fetchAndStoreUserProfile(t){return new Promise((i,e)=>{let o={hostname:"www.googleapis.com",path:"/oauth2/v3/userinfo",method:"GET",headers:{Authorization:`Bearer ${t}`,"User-Agent":"Antigravity-Cloud-IDE"}},n=re.request(o,c=>{let a="";c.on("data",s=>a+=s),c.on("end",async()=>{try{if(c.statusCode===200){let s=JSON.parse(a),l={email:s.email||"",name:s.name||s.email||"Google User",picture:s.picture||""};await Se(l.email,l.name,l.picture),i(l)}else e(new Error(`Userinfo API error (${c.statusCode}): ${a}`))}catch(s){e(s)}})});n.on("error",c=>e(c)),n.end()})}static refreshAccessToken(t){return new Promise((i,e)=>{if(!t)return e(new Error("No Refresh Token available. Please sign in with Google again."));let o=new URLSearchParams({grant_type:"refresh_token",client_id:me,client_secret:Me,refresh_token:t}).toString(),n={hostname:"oauth2.googleapis.com",path:"/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(o)}},c=re.request(n,a=>{let s="";a.on("data",l=>s+=l),a.on("end",async()=>{try{let l=JSON.parse(s);l.access_token?(await fe(l.access_token),this.fetchAndStoreUserProfile(l.access_token).catch(()=>{}),i(l.access_token)):e(new Error("Failed to refresh Google Access Token: "+(l.error_description||JSON.stringify(l))))}catch(l){e(new Error("Failed to parse refresh response: "+l.message))}})});c.on("error",a=>e(a)),c.write(o),c.end()})}static async logout(){await ke()}static async validateOrRefreshToken(){let t=I();if(!t.googleDriveToken)return!1;try{return await this.fetchAndStoreUserProfile(t.googleDriveToken),!0}catch{if(t.googleRefreshToken)try{let i=await this.refreshAccessToken(t.googleRefreshToken);return await this.fetchAndStoreUserProfile(i),!0}catch{return await this.logout(),!1}return await this.logout(),!1}}};function Ke(r,t,i){return new Promise((e,o)=>{let n=new URLSearchParams({code:r,client_id:me,client_secret:Me,redirect_uri:i,grant_type:"authorization_code",code_verifier:t}).toString(),c={hostname:"oauth2.googleapis.com",path:"/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(n)}},a=re.request(c,s=>{let l="";s.on("data",g=>l+=g),s.on("end",()=>{try{let g=JSON.parse(l);g.access_token?e({accessToken:g.access_token,refreshToken:g.refresh_token}):o(new Error("OAuth Token Exchange Error: "+(g.error_description||JSON.stringify(g))))}catch(g){o(new Error("Failed to parse token response: "+g.message))}})});a.on("error",s=>o(s)),a.write(n),a.end()})}function Ze(r){return new Promise((t,i)=>{let e=ve.createServer((o,n)=>{try{let c=new URL(o.url||"/",`http://127.0.0.1:${r}`),a=c.searchParams.get("code"),s=c.searchParams.get("error");if(s){n.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),n.end(Be("\u274C Sign-In Cancelled","You can close this tab and return to Antigravity IDE.",!1)),e.close(),i(new Error("Google Sign-In was denied: "+s));return}a&&(n.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),n.end(Be("\u2705 Signed In!","You can close this tab and return to Antigravity IDE.",!0)),e.close(),t(a))}catch(c){i(c),e.close()}});e.on("error",i),e.listen(r,"127.0.0.1")})}function Xe(){return new Promise((r,t)=>{let i=ve.createServer();i.listen(0,"127.0.0.1",()=>{let o=i.address().port;i.close(()=>r(o))}),i.on("error",t)})}function $e(r){return r.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function et(r,t){return new Promise((i,e)=>{let o=setTimeout(()=>e(new Error("Timeout")),t);r.then(n=>{clearTimeout(o),i(n)},n=>{clearTimeout(o),e(n)})})}function Be(r,t,i){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Antigravity Cloud \u2014 ${r}</title>
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
    h1 { font-size: 22px; font-weight: 700; color: ${i?"#4ade80":"#f87171"}; margin-bottom: 10px; }
    p  { font-size: 14px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${i?"\u{1F680}":"\u{1F512}"}</div>
    <h1>${r}</h1>
    <p>${t}</p>
  </div>
</body>
</html>`}var H=class{token;abortSignal;constructor(t,i){this.token=t.trim(),this.abortSignal=i}async uploadSyncPayload(t,i,e){let o="antigravity_cloud_backup.enc",n=Buffer.from(t,"utf-8"),c=i;if(c||(c=await this.findBackupFileId()||void 0),c)try{return await this.request("PATCH",`/upload/drive/v3/files/${c}?uploadType=media`,n,"application/octet-stream",!0,!1,!1,e),c}catch{if(this.abortSignal?.aborted)throw new Error("Operation canceled by user.");let b=await this.findBackupFileId();if(b&&b!==c)try{return await this.request("PATCH",`/upload/drive/v3/files/${b}?uploadType=media`,n,"application/octet-stream",!0,!1,!1,e),b}catch{}}let s=(await this.requestFullResponse("POST","/upload/drive/v3/files?uploadType=resumable",Buffer.from(JSON.stringify({name:o,mimeType:"application/octet-stream"}),"utf-8"),"application/json; charset=UTF-8",!1)).headers.location;if(!s)throw new Error("Google Drive Resumable Upload initialization failed: Location header missing.");let l=new URL(s);return(await this.requestUrl("PUT",l.hostname,l.pathname+l.search,n,"application/octet-stream",e)).id}async downloadSyncPayload(t){if(t)try{return await this.request("GET",`/drive/v3/files/${t}?alt=media`,void 0,void 0,!1,!0)}catch{}let i=await this.findBackupFileId();if(!i)throw new Error("No backup file (antigravity_cloud_backup.enc) found in your Google Drive account. Please perform a Sync first.");return await this.request("GET",`/drive/v3/files/${i}?alt=media`,void 0,void 0,!1,!0)}static async cleanupDuplicates(t){try{await t.findBackupFileId()}catch{}}async findBackupFileId(){let t=encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false"),i=await this.request("GET",`/drive/v3/files?q=${t}&fields=files(id,modifiedTime)`);if(i.files&&i.files.length>0){if(i.files.length>1){let e=[...i.files].sort((n,c)=>{let a=n.modifiedTime?new Date(n.modifiedTime).getTime():0;return(c.modifiedTime?new Date(c.modifiedTime).getTime():0)-a}),o=e[0].id;for(let n=1;n<e.length;n++)try{await this.request("DELETE",`/drive/v3/files/${e[n].id}`)}catch{}return o}return i.files[0].id}return null}async getBackupFileDetails(){try{let t=encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false"),i=await this.request("GET",`/drive/v3/files?q=${t}&fields=files(id,name,size,modifiedTime)`);if(i.files&&i.files.length>0){let e=i.files[0];return{id:e.id,name:e.name||"antigravity_cloud_backup.enc",size:e.size||"0",modifiedTime:e.modifiedTime||new Date().toISOString()}}return null}catch{return null}}async findExistingFileId(){return this.findBackupFileId()}async requestUrl(t,i,e,o,n,c){let a=I(),l=(this.token||a.googleDriveToken).replace(/^["']|["']$/g,"").trim(),g=l.startsWith("Bearer ")?l:`Bearer ${l}`;return new Promise((h,b)=>{let v={hostname:i,path:e,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:g,...n?{"Content-Type":n}:{},...o?{"Content-Length":o.length}:{}}},y=le.request(v,p=>{let S="";p.on("data",u=>S+=u),p.on("end",()=>{if(p.statusCode&&p.statusCode>=200&&p.statusCode<350)try{h(JSON.parse(S))}catch{h(S)}else b(new Error(`Google Drive Resumable Upload Error (${p.statusCode}): ${S.substring(0,500)}`))})});if(this.abortSignal){if(this.abortSignal.aborted)return y.destroy(),b(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{y.destroy(),b(new Error("Operation canceled by user."))})}if(y.on("error",p=>b(p)),o)if(c){let S=0,u=o.length,f=()=>{if(!this.abortSignal?.aborted){for(;S<u;){let m=o.subarray(S,Math.min(S+2097152,u));if(S+=m.length,c(S,u),!y.write(m)){y.once("drain",f);return}}y.end()}};f()}else y.write(o),y.end();else y.end()})}async requestFullResponse(t,i,e,o,n=!1){let c=I(),s=(this.token||c.googleDriveToken).replace(/^["']|["']$/g,"").trim(),l=s.startsWith("Bearer ")?s:`Bearer ${s}`,g=n?"upload.googleapis.com":"www.googleapis.com";return new Promise((h,b)=>{let v={hostname:g,path:i,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:l,...o?{"Content-Type":o}:{},...e?{"Content-Length":e.length}:{}}},y=le.request(v,p=>{let S="";p.on("data",u=>S+=u),p.on("end",()=>{p.statusCode&&p.statusCode>=200&&p.statusCode<350?h({headers:p.headers,statusCode:p.statusCode,body:S}):b(new Error(`Google Drive Resumable Init Error (${p.statusCode}): ${S.substring(0,500)}`))})});if(this.abortSignal){if(this.abortSignal.aborted)return y.destroy(),b(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{y.destroy(),b(new Error("Operation canceled by user."))})}y.on("error",p=>b(p)),e&&y.write(e),y.end()})}async request(t,i,e,o,n=!1,c=!1,a=!1,s){let l=I(),h=(this.token||l.googleDriveToken).replace(/^["']|["']$/g,"").trim(),b=h.startsWith("Bearer ")?h:`Bearer ${h}`,v=n?"upload.googleapis.com":"www.googleapis.com";return new Promise((y,p)=>{let S={hostname:v,path:i,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:b,...o?{"Content-Type":o}:{},...e?{"Content-Length":e.length}:{}}},u=le.request(S,m=>{let D="";m.on("data",w=>D+=w),m.on("end",async()=>{if(m.statusCode&&m.statusCode>=200&&m.statusCode<300)if(c)y(D);else try{y(JSON.parse(D))}catch{y(D)}else if(m.statusCode===401&&!a&&l.googleRefreshToken)try{let w=await W.refreshAccessToken(l.googleRefreshToken);this.token=w;let _=await this.request(t,i,e,o,n,c,!0,s);y(_)}catch(w){p(new Error("Google Access Token expired and background refresh failed: "+w.message))}else{let w=`Google Drive API Error (${m.statusCode}): ${D.substring(0,500)}`;m.statusCode===401?w='Google Drive API 401 Unauthorized: Access token expired. Please click "\u{1F511} Sign in with Google" to re-authorize.':m.statusCode===404&&(w=`Google Drive API 404 Not Found. Google response: ${D.substring(0,300)}`),p(new Error(w))}})}),f=!1;if(this.abortSignal){if(this.abortSignal.aborted)return u.destroy(),f=!0,p(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{u.destroy(),f||(f=!0,p(new Error("Operation canceled by user.")))})}if(u.on("timeout",()=>{u.destroy(),f||(f=!0,p(new Error("Google Drive API Connection Timed Out (180s). Check network connection.")))}),u.on("error",m=>{f||(m.code==="EPIPE"||m.code==="ECONNRESET"?setTimeout(()=>{f||(f=!0,p(m))},500):(f=!0,p(m)))}),e)if(s){let D=0,w=e.length,_=()=>{if(!this.abortSignal?.aborted){for(;D<w;){let ie=e.subarray(D,Math.min(D+2097152,w));if(D+=ie.length,s(D,w),!u.write(ie)){u.once("drain",_);return}}u.end()}};_()}else u.write(e),u.end();else u.end()})}};var U=k(require("fs")),j=k(require("path")),ee=class{static async createSnapshot(t){let i=j.join(t,"brain");if(!U.existsSync(i))return null;let e=new Date().toISOString().replace(/[:.]/g,"-"),o=j.join(t,"local_backups"),n=j.join(o,`backup_${e}`);return await U.promises.mkdir(n,{recursive:!0}),await this.copyRecursive(i,j.join(n,"brain")),await this.cleanupOldBackups(o,10),n}static async copyRecursive(t,i){if((await U.promises.stat(t)).isDirectory()){await U.promises.mkdir(i,{recursive:!0});let o=await U.promises.readdir(t);for(let n of o)await this.copyRecursive(j.join(t,n),j.join(i,n))}else await U.promises.copyFile(t,i)}static async cleanupOldBackups(t,i){try{if(!U.existsSync(t))return;let o=(await U.promises.readdir(t)).filter(n=>n.startsWith("backup_")).sort();if(o.length>i){let n=o.slice(0,o.length-i);for(let c of n)await U.promises.rm(j.join(t,c),{recursive:!0,force:!0})}}catch{}}};var Y=k(require("fs")),Fe=k(require("path")),J=class{watcher=null;debounceTimer=null;onTriggerSync;debounceMs;constructor(t,i){this.debounceMs=t*1e3,this.onTriggerSync=i}startWatching(t){let i=Fe.join(t,"brain");if(!Y.existsSync(i))try{Y.mkdirSync(i,{recursive:!0})}catch{return}try{this.watcher=Y.watch(i,{recursive:!0},(e,o)=>{o&&o.endsWith(".log")||this.handleChange()})}catch{}}handleChange(){this.debounceTimer&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>{this.onTriggerSync()},this.debounceMs)}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null),this.debounceTimer&&(clearTimeout(this.debounceTimer),this.debounceTimer=null)}};var E=k(require("vscode"));var K=k(require("os")),ze=k(require("crypto")),de=k(require("vscode")),Q=class{static cachedDevice=null;static getDeviceInfo(){if(this.cachedDevice)return this.cachedDevice;let t=de.workspace.getConfiguration("antigravityAnywhere"),i=t.get("deviceId","").trim();i||(i="dev_"+ze.randomBytes(8).toString("hex"),t.update("deviceId",i,de.ConfigurationTarget.Global));let e=K.platform(),o="linux";e==="darwin"?o="mac":e==="win32"&&(o="windows");let a=`${K.hostname()} (${o==="mac"?"macOS":o==="windows"?"Windows":"Linux"})`;return this.cachedDevice={deviceId:i,deviceName:a,platform:o,osRelease:K.release(),lastSyncTime:new Date().toISOString()},this.cachedDevice}};var F=class r{static currentPanel;static show(t){let i=E.window.activeTextEditor?E.window.activeTextEditor.viewColumn:void 0;if(r.currentPanel){r.currentPanel.reveal(i);return}let e=E.window.createWebviewPanel("antigravityAnywhereDashboard","\u2601\uFE0F Antigravity Cloud Hub",i||E.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0});r.currentPanel=e,e.onDidDispose(()=>{r.currentPanel=void 0},null,t.subscriptions),e.webview.onDidReceiveMessage(async o=>{switch(o.command){case"googleLogin":await E.commands.executeCommand("antigravityAnywhere.googleLogin"),this.updateWebviewHtml(e);break;case"googleLogout":await E.commands.executeCommand("antigravityAnywhere.googleLogout"),this.updateWebviewHtml(e);break;case"deepScan":await E.commands.executeCommand("antigravityAnywhere.deepScan"),this.updateWebviewHtml(e);break;case"syncNow":await E.commands.executeCommand("antigravityAnywhere.syncNow"),this.updateWebviewHtml(e);break;case"restore":await E.commands.executeCommand("antigravityAnywhere.restore"),this.updateWebviewHtml(e);break;case"cancelSync":await E.commands.executeCommand("antigravityAnywhere.cancelSync"),this.updateWebviewHtml(e);break;case"toggleAutoSync":await E.commands.executeCommand("antigravityAnywhere.toggleAutoSync"),this.updateWebviewHtml(e);break;case"openGithubStar":E.env.openExternal(E.Uri.parse("https://github.com/quantEray/antigravity-cloud"));break;case"openGithubIssues":E.env.openExternal(E.Uri.parse("https://github.com/quantEray/antigravity-cloud/issues"));break;case"deleteAll":await E.commands.executeCommand("antigravityAnywhere.deleteAllFiles",!0),this.updateWebviewHtml(e);break;case"deleteFile":await E.commands.executeCommand("antigravityAnywhere.deleteFile",o.relativePath,!0),this.updateWebviewHtml(e);break;case"deleteConversation":await E.commands.executeCommand("antigravityAnywhere.deleteConversation",o.convId,!0),this.updateWebviewHtml(e);break;case"deleteBatchConversations":await E.commands.executeCommand("antigravityAnywhere.deleteBatchConversations",o.convIds),this.updateWebviewHtml(e);break;case"refresh":this.updateWebviewHtml(e);break}},void 0,t.subscriptions),this.updateWebviewHtml(e)}static refreshCurrentPanel(){r.currentPanel&&r.updateWebviewHtml(r.currentPanel)}static async updateWebviewHtml(t){let i=I(),e=Q.getDeviceInfo(),o=0,n=0,c="0",a="";try{let u=await T.scanDataDirectory(i.antigravityDataDir);o=u.files.length,c=u.totalSizeMB;let f=T.groupFilesByConversation(u,i.antigravityDataDir);n=f.length,a=f.map((m,D)=>{let w=m.files.map(pe=>`<div class="sub-file-item">
                <span class="sub-file-name">\u{1F4C4} ${pe.relativePath}</span>
                <span class="sub-file-size">${(pe.sizeBytes/1048576).toFixed(2)} MB</span>
                <button class="btn-sub-del" onclick="confirmDeleteFile('${pe.relativePath}')" title="Delete file">\u{1F5D1}\uFE0F</button>
              </div>`).join(""),_=m.title.replace(/"/g,"&quot;").replace(/'/g,"&#39;"),ie=m.id.substring(0,12),he=m.status==="synced"?'<span class="sync-badge synced">\u{1F7E2} Synced</span>':m.status==="modified"?'<span class="sync-badge modified" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4);">\u{1F7E1} Modified</span>':'<span class="sync-badge local" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4);">\u26AA Local</span>';return`<div class="conv-card" data-title="${_.toLowerCase()}" data-id="${m.id}">
            <div class="conv-header">
              <div class="conv-info">
                <div class="conv-title-row">
                  <input type="checkbox" class="conv-checkbox" data-id="${m.id}" onchange="updateBatchState()">
                  <div class="conv-title">\u{1F4AC} ${_}</div>
                  ${he}
                </div>
                <div class="conv-sub">
                  ID: ${ie}... \u2022 ${m.files.length} Files (${m.totalSizeMB} MB) \u2022 Updated: ${m.lastUpdated}
                </div>
              </div>
              <div class="conv-actions">
                <button class="btn-toggle-files" onclick="toggleFiles('files_${D}')">\u25B6 Files (${m.files.length})</button>
                <button class="btn-del-conv" onclick="confirmDeleteConv('${m.id}', '${_}')" title="Delete chat">\u{1F5D1}\uFE0F Delete Chat</button>
              </div>
            </div>
            <div class="conv-files" id="files_${D}">
              ${w}
            </div>
          </div>`}).join("")}catch{a='<div class="empty-state">No conversation files found. Click "Deep Scan & Re-Index".</div>'}let s=!!i.googleDriveToken,l=i.googleUserEmail||"",g=i.googleUserName||l||"Google User",h=i.googleUserPicture||"",b='<div class="empty-state">Not signed in to Google Drive. Sign in above to view cloud backups.</div>',v="0",y="Never";if(s)try{let f=await new H(i.googleDriveToken).getBackupFileDetails();f?(v=(parseInt(f.size||"0")/(1024*1024)).toFixed(2),y=new Date(f.modifiedTime).toLocaleString(),b=`
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
                  <div class="cloud-info-val">${v} MB</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Last Cloud Sync</div>
                  <div class="cloud-info-val">${y}</div>
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
          `):b=`
            <div class="cloud-info-card">
              <div class="cloud-info-title">\u2601\uFE0F No Cloud Backup Found Yet</div>
              <p style="color: var(--text-muted); font-size: 13px; margin: 8px 0 16px 0;">No backup file named <code>antigravity_cloud_backup.enc</code> exists in your Google Drive yet. Click "Sync All Conversations" to upload your first backup.</p>
              <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Perform Initial Cloud Sync</button>
            </div>
          `}catch(u){b=`<div class="empty-state">Unable to query Google Drive backup info: ${u.message}</div>`}let p=h?`<img src="${h}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`:'<div class="user-avatar-fallback">\u{1F464}</div>',S=`<!DOCTYPE html>
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
      border: 1px solid ${s?"rgba(16, 185, 129, 0.4)":"rgba(239, 68, 68, 0.4)"};
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
      color: ${s?"#34d399":"#f87171"};
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${s?"#34d399":"#f87171"};
      box-shadow: 0 0 10px ${s?"#34d399":"#f87171"};
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
    
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-secondary" onclick="sendMessage('openGithubStar')" style="padding: 8px 14px; font-size: 12px; border-color: rgba(251, 191, 36, 0.4); color: #fde047;" title="Star project on GitHub">
          \u2B50 Star Project
        </button>
        <button class="btn btn-secondary" onclick="sendMessage('openGithubIssues')" style="padding: 8px 14px; font-size: 12px; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;" title="Feedback & Issue Tracker">
          \u{1F4AC} Feedback
        </button>
      </div>

      <div class="user-profile-badge">
        ${s?`${p}
               <div>
                 <div class="user-meta-name">${g}</div>
                 <div class="user-meta-email">${l}</div>
                 <div class="status-badge"><span class="pulse-dot"></span> Google Drive Connected</div>
               </div>`:'<div class="status-badge"><span class="pulse-dot"></span> Not Logged In</div>'}
      </div>
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

  ${s?"":`<div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
          <div>
            <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 6px;">\u{1F680} Welcome to Antigravity Anywhere!</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Connect your Google Drive account to sync your Antigravity IDE chat history, SQLite databases, and trajectory metadata across all your computers seamlessly.</p>
          </div>
          <button class="btn btn-login" style="padding: 12px 24px; font-size: 14px; white-space: nowrap;" onclick="sendMessage('googleLogin')">\u{1F511} Sign in with Google</button>
        </div>`}

  <div class="action-bar">
    <button class="btn ${i.enableAutoSync?"btn-scan":"btn-secondary"}" onclick="sendMessage('toggleAutoSync')">\u26A1 Auto Sync: ${i.enableAutoSync?"ON (Click to Disable)":"OFF (Click to Enable)"}</button>
    ${s?`<button class="btn btn-logout" onclick="sendMessage('googleLogout')">\u{1F6AA} Sign Out (${g.split(" ")[0]})</button>`:`<button class="btn btn-login" onclick="sendMessage('googleLogin')">\u{1F511} Sign in with Google</button>`}
    <button class="btn btn-scan" onclick="sendMessage('deepScan')">\u{1F50D} Deep Scan & Re-Index</button>
    <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Sync All Conversations (Push)</button>
    <button class="btn btn-secondary" onclick="sendMessage('restore')">\u{1F4E5} Restore from Google Drive (Pull)</button>
    <button class="btn btn-danger" onclick="confirmDeleteAll()">\u{1F5D1}\uFE0F Delete All Local Files</button>
  </div>

  <div class="grid">
    <div class="card stat-card">
      <div class="stat-label">Active Conversations</div>
      <div class="stat-val">${n} Chats</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Local Data Size</div>
      <div class="stat-val">${c} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Cloud Backup Size</div>
      <div class="stat-val">${v} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Device Info</div>
      <div class="stat-val" style="font-size: 16px;">${e.deviceName} (${e.platform})</div>
    </div>
  </div>

  <div class="tabs-nav">
    <button class="tab-btn active" id="tabLocal" onclick="switchTab('local')">\u{1F4BB} Local Conversations (${n})</button>
    <button class="tab-btn" id="tabCloud" onclick="switchTab('cloud')">\u2601\uFE0F Cloud Backup Info (${v} MB)</button>
  </div>

  <div class="tab-content active" id="contentLocal">
    <div class="search-bar">
      <input type="text" id="searchInput" class="search-input" placeholder="\u{1F50D} Search conversations by title or ID..." onkeyup="filterConversations()">
      <div class="batch-bar">
        <label class="master-select-box" title="Select / Deselect all visible conversations">
          <input type="checkbox" id="masterCheckbox" class="conv-checkbox" onchange="toggleSelectAll(this.checked)">
          <span id="masterSelectLabel">Select All (${n})</span>
        </label>
        <button class="btn-batch-del" id="batchDelBtn" onclick="confirmBatchDelete()">\u{1F5D1}\uFE0F Delete Selected (<span id="selectedCount">0</span>)</button>
      </div>
    </div>

    <div class="conv-list" id="convList">
      ${a}
    </div>
  </div>

  <div class="tab-content" id="contentCloud">
    ${b}
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
</html>`;t.webview.html=S}};var M=k(require("vscode"));var q=class r{constructor(t){this._extensionUri=t}static viewType="antigravityAnywhereSidebarView";static currentView;_view;resolveWebviewView(t,i,e){this._view=t,r.currentView=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},t.webview.onDidReceiveMessage(async o=>{switch(o.command){case"googleLogin":await M.commands.executeCommand("antigravityAnywhere.googleLogin"),this.refresh();break;case"googleLogout":await M.commands.executeCommand("antigravityAnywhere.googleLogout"),this.refresh();break;case"deepScan":await M.commands.executeCommand("antigravityAnywhere.deepScan"),this.refresh();break;case"syncNow":await M.commands.executeCommand("antigravityAnywhere.syncNow"),this.refresh();break;case"restore":await M.commands.executeCommand("antigravityAnywhere.restore"),this.refresh();break;case"deleteAll":await M.commands.executeCommand("antigravityAnywhere.deleteAllFiles",!0),this.refresh();break;case"deleteFile":await M.commands.executeCommand("antigravityAnywhere.deleteFile",o.relativePath),this.refresh();break;case"deleteConversation":await M.commands.executeCommand("antigravityAnywhere.deleteConversation",o.convId),this.refresh();break;case"openDashboard":await M.commands.executeCommand("antigravityAnywhere.openDashboard");break;case"cancelSync":await M.commands.executeCommand("antigravityAnywhere.cancelSync"),this.refresh();break;case"toggleAutoSync":await M.commands.executeCommand("antigravityAnywhere.toggleAutoSync"),this.refresh();break;case"openGithubStar":M.env.openExternal(M.Uri.parse("https://github.com/quantEray/antigravity-cloud"));break;case"openGithubIssues":M.env.openExternal(M.Uri.parse("https://github.com/quantEray/antigravity-cloud/issues"));break;case"refresh":this.refresh();break}}),this.refresh()}async refresh(){this._view&&(this._view.webview.html=await this._getHtmlForWebview())}async _getHtmlForWebview(){let t=I(),i=Q.getDeviceInfo(),e=0,o="0",n="";try{let h=await T.scanDataDirectory(t.antigravityDataDir);o=h.totalSizeMB;let b=T.groupFilesByConversation(h,t.antigravityDataDir);e=b.length,n=b.map(v=>`<div class="conv-item">
              <div class="conv-header">
                <div class="conv-title">${v.status==="synced"?"\u{1F7E2}":v.status==="modified"?"\u{1F7E1}":"\u26AA"} ${v.title}</div>
                <button class="btn-del-mini" onclick="send('deleteConversation', '${v.id}')" title="Delete conversation">\u{1F5D1}\uFE0F</button>
              </div>
              <div class="conv-meta">ID: ${v.id.substring(0,8)}... \u2022 ${v.files.length} Files (${v.totalSizeMB} MB)</div>
            </div>`).join("")}catch{n='<div class="conv-item empty">No chat data found.</div>'}let c=!!t.googleDriveToken,a=t.googleUserEmail||"Google User",s=t.googleUserName||a,l=t.googleUserPicture||"",g=l?`<img src="${l}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`:'<div class="user-avatar-fallback">\u{1F464}</div>';return`<!DOCTYPE html>
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
      background: ${c?"rgba(16, 185, 129, 0.2)":"rgba(239, 68, 68, 0.2)"};
      border: 1px solid ${c?"#10b981":"#ef4444"};
      color: ${c?"#34d399":"#f87171"};
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
    <div class="badge">${c?"Connected":"Not Connected"}</div>
  </div>

  ${c?`<div class="user-card">
          ${g}
          <div class="user-details">
            <div class="user-name">${s}</div>
            <div class="user-email">${a}</div>
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
    ${c?`<button class="logout" onclick="send('googleLogout')">\u{1F6AA} Sign Out (${s.split(" ")[0]})</button>`:`<button class="login" onclick="send('googleLogin')">\u{1F511} Sign in with Google</button>`}
    <button class="scan" onclick="send('deepScan')">\u{1F50D} Deep Scan & Re-Index</button>
    <button onclick="send('syncNow')">\u26A1 Sync All (Google Drive)</button>
    <button class="secondary" onclick="send('restore')">\u{1F4E5} Restore from Google Drive</button>
    <button class="secondary" onclick="send('refresh')">\u{1F504} Refresh UI</button>
    <div style="display: flex; gap: 6px; width: 100%;">
      <button class="secondary" onclick="send('openGithubStar')" style="flex: 1; font-size: 11px; padding: 6px;" title="Star on GitHub">\u2B50 Star Project</button>
      <button class="secondary" onclick="send('openGithubIssues')" style="flex: 1; font-size: 11px; padding: 6px;" title="Report Feedback">\u{1F4AC} Feedback</button>
    </div>
    <button class="danger" onclick="send('deleteAll')">\u{1F5D1}\uFE0F Delete All Files</button>
  </div>

  <div class="stats-card">
    <div class="stat-row">
      <span class="stat-label">Device:</span>
      <span class="stat-val">${i.deviceName}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Active Chats:</span>
      <span class="stat-val">${e}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Total Size:</span>
      <span class="stat-val">${o} MB</span>
    </div>
  </div>

  <div class="section-title">Conversations (${e})</div>
  <div class="conv-list">
    ${n}
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
</html>`}};var R=k(require("vscode")),te=k(require("https")),Z=k(require("fs")),Le=k(require("path")),Re=k(require("os")),oe=class r{strokeRepo="quantEray/antigravity-cloud";static async checkForUpdates(t,i=!1){let e=t.extension?.packageJSON?.version||"0.1.0";try{let o=await r.fetchLatestRelease();if(!o||!o.tag_name){i&&R.window.showInformationMessage("\u2601\uFE0F Antigravity Cloud: Unable to check for updates right now.");return}let n=o.tag_name.replace(/^v/,"");if(r.compareVersions(n,e)>0){let s=o.assets?.find(g=>g.name.endsWith(".vsix"))?.browser_download_url||`https://github.com/quantEray/antigravity-cloud/releases/download/${o.tag_name}/antigravity-anywhere-${n}.vsix`;await R.window.showInformationMessage(`\u{1F680} Antigravity Cloud update v${n} is available! (Current: v${e})`,"\u26A1 Update Now","Later")==="\u26A1 Update Now"&&await r.downloadAndInstallUpdate(s,n)}else i&&R.window.showInformationMessage(`\u2728 Antigravity Cloud is up to date (v${e}).`)}catch(o){i&&R.window.showErrorMessage(`Update check failed: ${o.message}`)}}static async fetchLatestRelease(){return new Promise(t=>{let e=te.request({hostname:"api.github.com",path:"/repos/quantEray/antigravity-cloud/releases/latest",method:"GET",headers:{"User-Agent":"Antigravity-Cloud-Extension"}},o=>{if(o.statusCode===301||o.statusCode===302){let c=o.headers.location;if(c){te.get(c,{headers:{"User-Agent":"Antigravity-Cloud-Extension"}},a=>{let s="";a.on("data",l=>s+=l),a.on("end",()=>{try{t(JSON.parse(s))}catch{t(null)}})});return}}let n="";o.on("data",c=>n+=c),o.on("end",()=>{try{t(JSON.parse(n))}catch{t(null)}})});e.on("error",()=>t(null)),e.end()})}static async downloadAndInstallUpdate(t,i){await R.window.withProgress({location:R.ProgressLocation.Notification,title:`\u{1F4E5} Downloading Antigravity Cloud v${i}...`,cancellable:!1},async e=>{let o=Le.join(Re.tmpdir(),`antigravity-anywhere-${i}.vsix`);await r.downloadFile(t,o,e),e.report({message:"Installing extension package..."}),await R.commands.executeCommand("workbench.extensions.installExtension",R.Uri.file(o));try{Z.unlinkSync(o)}catch{}await R.window.showInformationMessage(`\u{1F389} Antigravity Cloud updated to v${i} successfully!`,"\u{1F504} Reload Window")==="\u{1F504} Reload Window"&&await R.commands.executeCommand("workbench.action.reloadWindow")})}static downloadFile(t,i,e){return new Promise((o,n)=>{let c=Z.createWriteStream(i),a=s=>{te.get(s,{headers:{"User-Agent":"Antigravity-Cloud-Extension"}},l=>{if((l.statusCode===301||l.statusCode===302)&&l.headers.location){a(l.headers.location);return}if(l.statusCode!==200){n(new Error(`Failed to download: HTTP status ${l.statusCode}`));return}let g=parseInt(l.headers["content-length"]||"0",10),h=0;l.on("data",b=>{if(h+=b.length,g>0){let v=Math.round(h/g*100);e.report({message:`${v}% (${(h/(1024*1024)).toFixed(2)} MB)`})}}),l.pipe(c),c.on("finish",()=>{c.close(),o()})}).on("error",l=>{Z.unlink(i,()=>n(l))})};a(t)})}static compareVersions(t,i){let e=t.split(".").map(Number),o=i.split(".").map(Number),n=Math.max(e.length,o.length);for(let c=0;c<n;c++){let a=e[c]||0,s=o[c]||0;if(a>s)return 1;if(a<s)return-1}return 0}};var X,z=null,Ge="",L=null;function tt(r){oe.checkForUpdates(r).catch(()=>{}),X=d.window.createStatusBarItem(d.StatusBarAlignment.Right,100),X.command="antigravityAnywhere.openDashboard",B("Not Logged In","$(account)"),X.show(),r.subscriptions.push(X);let t=new q(r.extensionUri);r.subscriptions.push(d.window.registerWebviewViewProvider(q.viewType,t)),W.validateOrRefreshToken().then(e=>{if(e){let o=I();B(o.googleUserName?`Signed in as ${o.googleUserName.split(" ")[0]}`:"Signed In","$(cloud-check)")}else B("Not Logged In","$(account)");t.refresh(),F.refreshCurrentPanel()}),r.subscriptions.push(d.commands.registerCommand("antigravityAnywhere.googleLogin",async()=>{try{B("Signing in...","$(sync~spin)"),await W.startLoginFlow();let e=I();B(e.googleUserName?`${e.googleUserName.split(" ")[0]}`:"Signed In","$(cloud-check)"),d.window.showInformationMessage("Antigravity Cloud: Successfully signed in with Google! You can now sync manually."),t.refresh(),F.refreshCurrentPanel()}catch(e){B("Login Error","$(error)"),d.window.showErrorMessage("Antigravity Cloud Google Login Failed: "+e.message)}}),d.commands.registerCommand("antigravityAnywhere.openDashboard",()=>F.show(r)),d.commands.registerCommand("antigravityAnywhere.checkForUpdates",async()=>{await oe.checkForUpdates(r,!0)}),d.commands.registerCommand("antigravityAnywhere.cancelSync",()=>{L&&(L.abort(),L=null,B("Canceled","$(x)"),$(!1,0,"\u23F9\uFE0F Sync canceled by user.","Canceled"),d.window.showInformationMessage("Antigravity Cloud: Sync operation canceled by user."),t.refresh(),F.refreshCurrentPanel())}),d.commands.registerCommand("antigravityAnywhere.toggleAutoSync",async()=>{let e=I(),o=!e.enableAutoSync;await xe(o),o?(e.googleDriveToken&&(z||(z=new J(e.syncIntervalSeconds,()=>ge(!1))),z.startWatching(e.antigravityDataDir)),d.window.showInformationMessage("Antigravity Cloud: Automatic Sync is now ENABLED \u26A1")):(z&&(z.stopWatching(),z=null),d.window.showInformationMessage("Antigravity Cloud: Automatic Sync is now DISABLED \u{1F6D1} (Manual Sync only)")),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.syncNow",async()=>{await ge(!0),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.restore",async()=>{await it(),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.googleLogout",async()=>{await W.logout(),B("Not Logged In","$(account)"),d.window.showInformationMessage("Antigravity Cloud: Signed out of Google."),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.deepScan",async()=>{await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Deep Scanning all conversation directories...",cancellable:!1},async()=>{let e=I(),o=await T.scanDataDirectory(e.antigravityDataDir),n=T.groupFilesByConversation(o);t.refresh(),d.window.showInformationMessage(`Antigravity Anywhere Deep Scan Complete: Found ${n.length} Conversations (${o.files.length} Total Files, ${o.totalSizeMB} MB).`)})}),d.commands.registerCommand("antigravityAnywhere.deleteConversation",async(e,o)=>{if(!e||e==="global-config"||!o&&await d.window.showWarningMessage(`Are you sure you want to delete conversation "${e}" and all its associated files?`,"Yes, Delete Conversation","Cancel")!=="Yes, Delete Conversation")return;let n=I(),c=Ue(n.antigravityDataDir,e);try{let a=!1;for(let s of c)G.existsSync(s)&&(await G.promises.rm(s,{recursive:!0,force:!0}),a=!0);a&&(t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Deleted conversation ${e}`))}catch(a){d.window.showErrorMessage(`Antigravity Anywhere: Failed to delete conversation: ${a.message}`)}}),d.commands.registerCommand("antigravityAnywhere.deleteBatchConversations",async e=>{if(!Array.isArray(e)||e.length===0)return;let o=I();for(let n of e){if(!n)continue;let c=Ue(o.antigravityDataDir,n);for(let a of c)if(G.existsSync(a))try{await G.promises.rm(a,{recursive:!0,force:!0})}catch{}}t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Successfully deleted ${e.length} selected conversation(s).`)}),d.commands.registerCommand("antigravityAnywhere.deleteFile",async(e,o)=>{if(!e||!o&&await d.window.showWarningMessage(`Are you sure you want to delete "${e}"?`,"Yes, Delete","Cancel")!=="Yes, Delete")return;let n=I(),c=A.dirname(n.antigravityDataDir),a=A.join(n.antigravityDataDir,e);if(e.startsWith("config/"))a=A.join(c,e);else if(e.startsWith("app_support/")){let s=T.getAppSupportDir();a=A.join(s,e.substring(12))}try{G.existsSync(a)&&(await G.promises.rm(a,{recursive:!0,force:!0}),t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Deleted ${e}`))}catch(s){d.window.showErrorMessage(`Antigravity Anywhere: Failed to delete file: ${s.message}`)}}),d.commands.registerCommand("antigravityAnywhere.deleteAllFiles",async e=>{let o=I();if(!e){if(await d.window.showWarningMessage("\u26A0\uFE0F DANGER: Are you sure you want to DELETE ALL local conversation files in brain/, conversations/, and implicit/?","Yes, Delete All Files","Cancel")!=="Yes, Delete All Files")return;if(await d.window.showInputBox({prompt:"Type DELETE to confirm wiping all local conversation files:",placeHolder:"DELETE",ignoreFocusOut:!0})!=="DELETE"){d.window.showInformationMessage("Antigravity Anywhere: Delete All cancelled.");return}}try{await ee.createSnapshot(o.antigravityDataDir);let n=A.dirname(o.antigravityDataDir),c=T.getAppSupportDir(),a=[A.join(o.antigravityDataDir,"brain"),A.join(o.antigravityDataDir,"conversations"),A.join(o.antigravityDataDir,"implicit"),A.join(n,"antigravity","brain"),A.join(n,"antigravity","conversations"),A.join(n,"antigravity","implicit"),A.join(n,"antigravity-ide","brain"),A.join(n,"antigravity-ide","conversations"),A.join(n,"antigravity-ide","implicit"),A.join(c,"shared_proto_db")];for(let l of a)G.existsSync(l)&&await G.promises.rm(l,{recursive:!0,force:!0});let s=T.getCacheFilePath(o.antigravityDataDir);G.existsSync(s)&&await G.promises.unlink(s),t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage("Antigravity Anywhere: All local conversation files wiped (safety snapshot created).")}catch(n){d.window.showErrorMessage(`Antigravity Anywhere: Delete All failed: ${n.message}`)}}));let i=I();i.enableAutoSync&&i.googleDriveToken&&(z=new J(i.syncIntervalSeconds,()=>ge(!1)),z.startWatching(i.antigravityDataDir)),r.subscriptions.push(d.workspace.onDidChangeConfiguration(e=>{e.affectsConfiguration("antigravityAnywhere")&&ot()}))}function ot(){z&&(z.stopWatching(),z=null);let r=I();r.enableAutoSync&&r.googleDriveToken&&(z=new J(r.syncIntervalSeconds,()=>ge(!1)),z.startWatching(r.antigravityDataDir))}function $(r,t,i,e="\u{1F680} Syncing to Google Drive..."){let o={command:"syncProgress",progress:{active:r,percentage:t,statusText:i,title:e}};F.currentPanel&&F.currentPanel.webview.postMessage(o),q.currentView&&q.currentView.webview.postMessage(o)}async function ge(r=!1){let t=I();if(!t.googleDriveToken){r&&d.window.showWarningMessage("Antigravity Anywhere: Please sign in with Google first.","Sign In").then(e=>{e==="Sign In"&&d.commands.executeCommand("antigravityAnywhere.googleLogin")});return}L=new AbortController;let i=async()=>{try{B("Syncing...","$(sync~spin)"),$(!0,10,"\u{1F50D} Scanning local chat transcripts & databases... (Do not close Antigravity IDE)","\u{1F680} Syncing to Google Drive...");let e=await T.scanForSync(t.antigravityDataDir);if(L?.signal.aborted)throw new Error("Operation canceled by user.");if(e.files.length===0){r&&d.window.showInformationMessage("Antigravity Anywhere: No chat data found to sync."),B("Idle","$(cloud-check)"),$(!1,0,"");return}if(e.manifestHash===Ge){B("Up to Date","$(cloud-check)"),$(!0,100,"\u26A1 Already Up to Date! No changes detected since last sync.","\u{1F680} Up to Date"),r&&d.window.showInformationMessage(`Antigravity Anywhere: Cloud backup is already up-to-date! All ${e.files.length} conversation files match Google Drive.`);return}$(!0,30,`\u26A1 Processing ${e.files.length} chat files (${e.totalSizeMB} MB)...`,"\u{1F680} Syncing to Google Drive...");let o=JSON.stringify(e);if(L?.signal.aborted)throw new Error("Operation canceled by user.");$(!0,55,"\u{1F512} Compressing & Encrypting payload (AES-256-GCM)...","\u{1F680} Syncing to Google Drive...");let n=Pe(o,t.encryptionPassword);if(L?.signal.aborted)throw new Error("Operation canceled by user.");$(!0,75,`\u2601\uFE0F Uploading encrypted bundle (${(n.length/(1024*1024)).toFixed(2)} MB) to Google Drive... Please wait...`,"\u{1F680} Syncing to Google Drive...");let c=new H(t.googleDriveToken,L?.signal),a=t.driveFileId;if(!a){let l=await c.findBackupFileId();l&&(a=l)}let s=await c.uploadSyncPayload(n,a,(l,g)=>{let h=Math.min(89,Math.floor(75+l/g*14)),b=(l/(1024*1024)).toFixed(1),v=(g/(1024*1024)).toFixed(1);$(!0,h,`\u2601\uFE0F Uploading: ${b} MB / ${v} MB (${h}%)... Please wait...`,"\u{1F680} Uploading to Google Drive...")});if(s!==t.driveFileId&&await ue(s),$(!0,90,"\u{1F4BE} Saving local delta state cache...","\u{1F680} Syncing to Google Drive..."),await T.saveDeltaState(t.antigravityDataDir,e.files),Ge=e.manifestHash,B("Synced","$(cloud-check)"),$(!0,100,`\u2705 Synced ${e.files.length} chat files (${e.totalSizeMB} MB) to Google Drive!`,"\u{1F680} Sync Complete"),r){let l=T.groupFilesByConversation(e),g=e.isIncremental?"\u26A1 Incremental Delta Sync":"\u{1F504} Full Backup Sync";d.window.showInformationMessage(`Antigravity Anywhere [${g}]: Synced ${l.length} active/modified chats (${e.files.length} files, ${e.totalSizeMB} MB) to Google Drive!`)}}catch(e){B("Sync Error","$(error)"),$(!0,0,`\u274C Sync Failed: ${e.message}`,"Sync Error"),r&&!L?.signal.aborted&&(e.message&&e.message.includes("console.developers.google.com")?d.window.showErrorMessage("Antigravity Cloud: Google Drive API is disabled in your Google Cloud Project (627024998523). Click below to enable it.","Enable Google Drive API").then(o=>{o==="Enable Google Drive API"&&d.env.openExternal(d.Uri.parse("https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=627024998523"))}):d.window.showErrorMessage(`Antigravity Anywhere Google Drive Sync Failed: ${e.message}`))}finally{L=null}};r?await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Syncing all conversations to Google Drive...",cancellable:!1},i):await i()}async function it(){let r=I();if(!r.googleDriveToken){d.window.showErrorMessage("Antigravity Anywhere: Google Sign-In is required to restore backups.","Sign In").then(o=>{o==="Sign In"&&d.commands.executeCommand("antigravityAnywhere.googleLogin")});return}L=new AbortController;let t=new H(r.googleDriveToken,L.signal),i=r.driveFileId;if(!i){B("Searching Google Drive...","$(sync~spin)"),$(!0,10,"\u{1F50D} Searching Google Drive for backup file...","\u{1F4E5} Restoring from Google Drive...");let o=await t.findBackupFileId();if(o)i=o,await ue(i);else{B("Restore Error","$(error)"),$(!0,0,"\u274C No backup found on Google Drive","Restore Error"),d.window.showErrorMessage("Antigravity Anywhere: No cloud backup found in Google Drive account. Perform a Sync first on your main computer."),L=null;return}}if(await d.window.showWarningMessage("Restoring from Google Drive will update local chat history and SQLite databases. A local backup snapshot will be created automatically. Proceed?","Yes, Restore","Cancel")!=="Yes, Restore"){B("Idle","$(cloud-check)"),L=null;return}await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Restoring all conversations from Google Drive...",cancellable:!1},async()=>{try{B("Restoring...","$(sync~spin)"),$(!0,20,"\u{1F4F8} Creating Safety Snapshot local backup...","\u{1F4E5} Restoring from Google Drive..."),await ee.createSnapshot(r.antigravityDataDir),$(!0,45,"\u2601\uFE0F Downloading encrypted payload from Google Drive...","\u{1F4E5} Restoring from Google Drive...");let o=await t.downloadSyncPayload(i);$(!0,70,"\u{1F513} Decrypting payload & uncompressing files...","\u{1F4E5} Restoring from Google Drive...");let n=Te(o,r.encryptionPassword),c=JSON.parse(n);$(!0,85,`\u{1F4C1} Restoring ${c.files?.length||0} transcript files and databases to disk...`,"\u{1F4E5} Restoring from Google Drive...");let a=await T.restoreBundle(r.antigravityDataDir,c);B("Restored","$(cloud-check)"),$(!0,100,`\u2705 Restored ${a} chat files! \u26A0\uFE0F Please Quit & Restart Antigravity IDE (Cmd+Q) to reload history.`,"\u{1F4E5} Restore Complete (Restart App)"),d.window.showInformationMessage(`Antigravity Cloud: Successfully restored ${a} conversation & database files! Please Quit & Restart Antigravity IDE to reload SQLite chat history.`,"\u{1F6AA} Quit Antigravity","\u{1F504} Reload Window","Later").then(s=>{s==="\u{1F6AA} Quit Antigravity"?d.commands.executeCommand("workbench.action.quit"):s==="\u{1F504} Reload Window"&&d.commands.executeCommand("workbench.action.reloadWindow")})}catch(o){B("Restore Error","$(error)"),$(!0,0,`\u274C Restore Failed: ${o.message}`,"Restore Error"),d.window.showErrorMessage(`Antigravity Anywhere Google Drive Restore Failed: ${o.message}`)}finally{L=null}})}function Ue(r,t){let i=A.dirname(r),e=T.getAppSupportDir();if(t==="global-config")return[A.join(r,"config"),A.join(r,"state.vscdb"),A.join(r,"state.vscdb.backup"),A.join(i,"antigravity","config"),A.join(i,"antigravity-ide","config"),A.join(e,"shared_proto_db")];let o=[r,A.join(i,"antigravity"),A.join(i,"antigravity-ide")],n=[];for(let c of o)n.push(A.join(c,"brain",t),A.join(c,"conversations",`${t}.db`),A.join(c,"conversations",`${t}.db-wal`),A.join(c,"conversations",`${t}.db-shm`),A.join(c,"implicit",`${t}.pb`));return n}function B(r,t){X&&(X.text=`${t} Antigravity: ${r}`)}function nt(){z&&z.stopWatching()}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
