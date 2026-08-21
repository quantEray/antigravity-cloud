"use strict";var Oe=Object.create;var ae=Object.defineProperty;var We=Object.getOwnPropertyDescriptor;var je=Object.getOwnPropertyNames;var He=Object.getPrototypeOf,qe=Object.prototype.hasOwnProperty;var Ve=(r,t)=>{for(var n in t)ae(r,n,{get:t[n],enumerable:!0})},ke=(r,t,n,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of je(t))!qe.call(r,o)&&o!==n&&ae(r,o,{get:()=>t[o],enumerable:!(e=We(t,o))||e.enumerable});return r};var k=(r,t,n)=>(n=r!=null?Oe(He(r)):{},ke(t||!r||!r.__esModule?ae(n,"default",{value:r,enumerable:!0}):n,r)),Je=r=>ke(ae({},"__esModule",{value:!0}),r);var rt={};Ve(rt,{activate:()=>nt,deactivate:()=>st});module.exports=Je(rt);var d=k(require("vscode")),N=k(require("fs")),C=k(require("path"));var I=k(require("vscode")),Ce=k(require("os")),Ae=k(require("path"));function E(){let r=I.workspace.getConfiguration("antigravityAnywhere"),t=Ce.homedir(),n=Ae.join(t,".gemini","antigravity-ide"),e=r.get("googleDriveToken","").trim(),o=r.get("googleRefreshToken","").trim(),i=r.get("driveFileId","").trim();return{googleDriveToken:e,googleRefreshToken:o,driveFileId:i,googleUserEmail:r.get("googleUserEmail","").trim(),googleUserName:r.get("googleUserName","").trim(),googleUserPicture:r.get("googleUserPicture","").trim(),encryptionPassword:r.get("encryptionPassword",""),enableAutoSync:r.get("enableAutoSync",!1),syncIntervalSeconds:r.get("syncIntervalSeconds",10),antigravityDataDir:n}}async function De(r){await I.workspace.getConfiguration("antigravityAnywhere").update("enableAutoSync",r,I.ConfigurationTarget.Global)}async function ue(r){await I.workspace.getConfiguration("antigravityAnywhere").update("driveFileId",r,I.ConfigurationTarget.Global)}async function fe(r,t){let n=I.workspace.getConfiguration("antigravityAnywhere");await n.update("googleDriveToken",r,I.ConfigurationTarget.Global),t&&await n.update("googleRefreshToken",t,I.ConfigurationTarget.Global)}async function Pe(r,t,n){let e=I.workspace.getConfiguration("antigravityAnywhere");await e.update("googleUserEmail",r,I.ConfigurationTarget.Global),await e.update("googleUserName",t,I.ConfigurationTarget.Global),await e.update("googleUserPicture",n,I.ConfigurationTarget.Global)}async function Ee(){let r=I.workspace.getConfiguration("antigravityAnywhere");await r.update("googleDriveToken","",I.ConfigurationTarget.Global),await r.update("googleRefreshToken","",I.ConfigurationTarget.Global),await r.update("googleUserEmail","",I.ConfigurationTarget.Global),await r.update("googleUserName","",I.ConfigurationTarget.Global),await r.update("googleUserPicture","",I.ConfigurationTarget.Global),await r.update("driveFileId","",I.ConfigurationTarget.Global)}async function me(r){await I.workspace.getConfiguration("antigravityAnywhere").update("encryptionPassword",r,I.ConfigurationTarget.Global)}var A=k(require("fs")),S=k(require("path")),Te=k(require("os")),se=k(require("crypto")),ee=k(require("zlib"));var Ie=k(require("os")),X=class{static userHome=Ie.homedir();static normalize(t){if(!t)return t;let n=t.replace(/\\/g,"/"),e=this.userHome.replace(/\\/g,"/");return n.startsWith(e)&&(n=n.replace(e,"${USER_HOME}")),n}static denormalize(t){if(!t)return t;let n=this.userHome.replace(/\\/g,"/");return t.replace(/\${USER_HOME}/g,n)}};var T=class{static getAppSupportDir(){let t=Te.homedir();return process.platform==="win32"?process.env.APPDATA?S.join(process.env.APPDATA,"Antigravity IDE"):S.join(t,"AppData","Roaming","Antigravity IDE"):process.platform==="darwin"?S.join(t,"Library","Application Support","Antigravity IDE"):S.join(t,".config","Antigravity IDE")}static getFileContentBuffer(t){try{if(t.content.startsWith("gz64:")){let n=Buffer.from(t.content.substring(5),"base64");return ee.inflateSync(n)}else{if(t.content.startsWith("base64:"))return Buffer.from(t.content.substring(7),"base64");{let n=X.denormalize(t.content);return Buffer.from(n,"utf-8")}}}catch{return Buffer.from([])}}static getFileContentText(t){try{if(t.content.startsWith("gz64:")){let n=Buffer.from(t.content.substring(5),"base64");return ee.inflateSync(n).toString("utf-8")}else if(t.content.startsWith("base64:"))return Buffer.from(t.content.substring(7),"base64").toString("utf-8");return t.content}catch{return""}}static getCacheFilePath(t){return S.join(t,"delta_sync_state.json")}static loadDeltaState(t){try{let n=this.getCacheFilePath(t);if(A.existsSync(n)){let e=A.readFileSync(n,"utf-8");return JSON.parse(e)}}catch{}return null}static async saveDeltaState(t,n){try{let e=this.getCacheFilePath(t),o={};for(let c of n)o[c.relativePath]={mtimeMs:c.mtimeMs,sizeBytes:c.sizeBytes,hash:c.hash};let i={timestamp:new Date().toISOString(),filesState:o};await A.promises.mkdir(S.dirname(e),{recursive:!0}),await A.promises.writeFile(e,JSON.stringify(i,null,2),"utf-8")}catch{}}static async scanDataDirectory(t){let n=S.dirname(t),e=[],o=[t,S.join(n,"antigravity"),S.join(n,"antigravity-ide"),S.join(n,"antigravity-cli")],i=new Set;for(let s of o)if(A.existsSync(s))for(let a of["conversations","brain","implicit"]){let l=S.join(s,a);A.existsSync(l)&&!i.has(l)&&(i.add(l),await this.scanDirRecursive(l,s,e,!1))}let c=S.join(n,"config");return A.existsSync(c)&&!i.has(c)&&(i.add(c),await this.scanDirRecursive(c,n,e,!1)),this.buildBundle(e)}static async scanForSync(t,n=!1){let e=S.dirname(t),o=[],i=[t,S.join(e,"antigravity"),S.join(e,"antigravity-ide"),S.join(e,"antigravity-cli")],c=new Set;for(let f of i)if(A.existsSync(f))for(let b of["conversations","brain","implicit"]){let p=S.join(f,b);A.existsSync(p)&&!c.has(p)&&(c.add(p),await this.scanDirRecursive(p,f,o,!1))}let s=S.join(e,"config");A.existsSync(s)&&!c.has(s)&&(c.add(s),await this.scanDirRecursive(s,e,o,!1));let a=this.getAppSupportDir();if(A.existsSync(a)){let f=S.join(a,"shared_proto_db");A.existsSync(f)&&await this.scanDirRecursive(f,a,o,!1,"app_support");let b=S.join(a,"User","globalStorage","state.vscdb");if(A.existsSync(b))try{let p=await A.promises.stat(b);if(p.size<=10*1024*1024){let m="base64:"+(await A.promises.readFile(b)).toString("base64"),v="app_support/User/globalStorage/state.vscdb",y=se.createHash("sha256").update(m).digest("hex");o.push({relativePath:v,content:m,hash:y,sizeBytes:p.size,mtimeMs:p.mtimeMs})}}catch{}}let l=n?null:this.loadDeltaState(t),g=o,u=!1;if(l&&l.filesState){let f=new Set,b=new Set;for(let p of o){let x=l.filesState[p.relativePath],m=p.relativePath.startsWith("config/")||p.relativePath.startsWith("app_support/");if((!x||x.mtimeMs!==p.mtimeMs||x.sizeBytes!==p.sizeBytes)&&(b.add(p.relativePath),!m)){let v=p.relativePath.split("/"),y="";v[0]==="conversations"?y=v[1].replace(/\.(db|db-wal|db-shm)$/,""):v[0]==="brain"&&v.length>=2?y=v[1]:v[0]==="implicit"&&v.length>=2&&(y=v[1].replace(/\.pb$/,"")),y&&f.add(y)}}b.size>0&&b.size<o.length&&(u=!0,g=o.filter(p=>{if(p.relativePath.startsWith("config/")||p.relativePath.startsWith("app_support/"))return!0;let m=p.relativePath.split("/"),v="";return m[0]==="conversations"?v=m[1].replace(/\.(db|db-wal|db-shm)$/,""):m[0]==="brain"&&m.length>=2?v=m[1]:m[0]==="implicit"&&m.length>=2&&(v=m[1].replace(/\.pb$/,"")),f.has(v)||b.has(p.relativePath)}))}g.sort((f,b)=>b.mtimeMs-f.mtimeMs);let h=this.buildBundle(g);return h.isIncremental=u,h}static buildBundle(t){let n=[...t].sort((s,a)=>s.relativePath.localeCompare(a.relativePath)),e=n.reduce((s,a)=>s+a.sizeBytes,0),o=(e/(1024*1024)).toFixed(2),i=n.map(s=>`${s.relativePath}:${s.hash}`).join(`
`),c=se.createHash("sha256").update(i).digest("hex");return{timestamp:new Date().toISOString(),totalSizeBytes:e,totalSizeMB:o,files:n,manifestHash:c}}static groupFilesByConversation(t,n){let e=new Map,o=[],i=n?this.loadDeltaState(n):null;for(let s of t.files){let a=s.relativePath.split("/"),l="global-config";if(a[0]==="brain"&&a.length>1)l=a[1];else if(a[0]==="conversations"&&a.length>1)l=a[1].replace(/\.(db|db-wal|db-shm)$/,"");else if(a[0]==="implicit"&&a.length>1)l=a[1].replace(/\.pb$/,"");else{o.push(s);continue}e.has(l)||e.set(l,[]),e.get(l).push(s)}let c=[];for(let[s,a]of e.entries()){let l="",g=a.reduce((x,m)=>x+m.sizeBytes,0),u=(g/(1024*1024)).toFixed(2),h=Math.max(...a.map(x=>x.mtimeMs),0),f=h>0?new Date(h).toLocaleDateString():"Unknown";for(let x of a){let m=this.getFileContentText(x);if(x.relativePath.endsWith("metadata.json"))try{let v=JSON.parse(m);v.Summary?l=v.Summary.substring(0,65):v.title&&(l=v.title.substring(0,65))}catch{}else if(x.relativePath.endsWith("transcript.jsonl")){let v=m.split(`
`);for(let y of v)if(y.trim())try{let D=JSON.parse(y);if(D.type==="USER_INPUT"&&D.content){let w=D.content;if(w.includes("<USER_REQUEST>")){let U=w.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);U&&U[1]&&(w=U[1].trim())}if(w=w.replace(/^[\/\s\n\r\t]+/,"").trim(),w.length>10){l=w.substring(0,65);break}}}catch{}}if(l)break}if(!l){for(let x of a)if(x.relativePath.endsWith(".db"))try{let v=this.getFileContentText(x).match(/[\x20-\x7E]{12,70}/g);if(v&&v.length>0){let y=v.filter(D=>D.length>=12&&/[a-zA-Z]/.test(D));for(let D of y){let w=D.replace(/[\r\n\t]+/g," ").replace(/\s+/g," ").trim();if(w=w.replace(/^[\/\s\n\r\t]+/,"").replace(/^SQLite format \d+/,"").trim(),w.length>=12&&!w.includes("sqlite")&&!w.includes("TABLE")&&!w.includes("INDEX")&&!w.includes("file:///")&&!w.includes("http")&&!w.includes("trajectory")&&!w.includes("battle_mode")&&!w.includes("Along with each USER request")&&!w.includes("conversation_summaries")&&!w.includes("System prompt")&&!w.includes("toolAction")&&!w.includes("PRIMARY KEY")&&!w.startsWith("function")&&!w.startsWith("import ")&&!w.startsWith("export ")&&!/^[0-9a-f\-]{30,}$/i.test(w)){l=w.substring(0,65);break}}}}catch{}}if(l?(l=l.replace(/^[\/\s\n\r\t]+/,"").replace(/^SQLite format \d+/,"").replace(/^\\n/,"").trim(),l.length>65&&(l=l.substring(0,65)+"...")):l=`Chat Session (${s.substring(0,8)})`,g<10240&&l.startsWith("Chat Session")&&s!=="global-config")continue;let p="local";i&&i.filesState&&(p=a.every(m=>{let v=i.filesState[m.relativePath];return v&&v.mtimeMs===m.mtimeMs&&v.sizeBytes===m.sizeBytes})?"synced":"modified"),c.push({id:s,title:l,totalSizeBytes:g,totalSizeMB:u,lastUpdated:f,status:p,files:a})}if(o.length>0){let s=o.reduce((l,g)=>l+g.sizeBytes,0),a="local";i&&i.filesState&&(a=o.every(g=>{let u=i.filesState[g.relativePath];return u&&u.mtimeMs===g.mtimeMs&&u.sizeBytes===g.sizeBytes})?"synced":"modified"),c.push({id:"global-config",title:"Global Config & System Indexes",totalSizeBytes:s,totalSizeMB:(s/(1024*1024)).toFixed(2),lastUpdated:"Current",status:a,files:o})}return c}static async scanDirRecursive(t,n,e,o=!1,i=""){let c=await A.promises.readdir(t,{withFileTypes:!0});for(let s of c){let a=S.join(t,s.name);if(s.isDirectory()){if(s.name==="node_modules"||s.name===".git"||s.name==="tasks")continue;await this.scanDirRecursive(a,n,e,o,i)}else if(s.isFile()){let l=S.extname(s.name).toLowerCase();if([".webp",".png",".jpg",".jpeg",".gif",".mp4",".webm",".zip",".gz"].includes(l)||s.name.endsWith(".log")&&!s.name.includes("transcript")&&!a.includes("shared_proto_db"))continue;try{let g=await A.promises.stat(a);if(g.size>50*1024*1024)continue;let u=[".db",".db-wal",".db-shm",".pb",".vscdb"].includes(l)||a.includes("shared_proto_db");if(o&&u)continue;let h="",f;if(u)f=await A.promises.readFile(a);else{let x=await A.promises.readFile(a,"utf-8"),m=X.normalize(x);f=Buffer.from(m,"utf-8")}f.length>256?h="gz64:"+ee.deflateSync(f).toString("base64"):u?h="base64:"+f.toString("base64"):h=f.toString("utf-8");let b=S.relative(n,a).replace(/\\/g,"/");i&&(b=`${i}/${b}`);let p=se.createHash("sha256").update(h).digest("hex");e.push({relativePath:b,content:h,hash:p,sizeBytes:g.size,mtimeMs:g.mtimeMs})}catch{}}}}static async restoreBundle(t,n){let e=S.dirname(t),o=this.getAppSupportDir(),i=0,c=[t,S.join(e,"antigravity"),S.join(e,"antigravity-ide")];for(let s of n.files){let a=s.relativePath;if(s.relativePath.startsWith("config/")){let g=S.join(e,a.replace(/\//g,S.sep));try{await A.promises.mkdir(S.dirname(g),{recursive:!0});let u=this.getFileContentBuffer(s);await A.promises.writeFile(g,u)}catch{}i++;continue}if(s.relativePath.startsWith("app_support/")){a=s.relativePath.substring(12);let g=S.join(o,a.replace(/\//g,S.sep));try{await A.promises.mkdir(S.dirname(g),{recursive:!0});let u=this.getFileContentBuffer(s);await A.promises.writeFile(g,u)}catch{}i++;continue}let l=a.replace(/\//g,S.sep);for(let g of c){let u=S.join(g,l),h=S.dirname(u);try{await A.promises.mkdir(h,{recursive:!0});let f=this.getFileContentBuffer(s);await A.promises.writeFile(u,f)}catch{}}i++}return await this.saveDeltaState(t,n.files),i}};var G=k(require("crypto")),be=k(require("zlib")),ve="aes-256-gcm",Ye=12,Qe=16,he=32,Be=1e4;async function $e(r,t,n){if(n?.aborted)throw new Error("Operation canceled by user.");let e=Buffer.from(r,"utf-8");if(!t)return JSON.stringify({version:1,compressed:!1,unencrypted:!0,data:e.toString("base64")});if(n?.aborted)throw new Error("Operation canceled by user.");let o=G.randomBytes(Qe),i=G.randomBytes(Ye),c=await new Promise((g,u)=>{G.pbkdf2(t,o,Be,he,"sha256",(h,f)=>{h?u(h):g(f)})});if(n?.aborted)throw new Error("Operation canceled by user.");let s=G.createCipheriv(ve,c,i),a=Buffer.concat([s.update(e),s.final()]),l=s.getAuthTag();return JSON.stringify({version:1,compressed:!1,salt:o.toString("hex"),iv:i.toString("hex"),tag:l.toString("hex"),data:a.toString("base64")})}async function ye(r,t){let n=JSON.parse(r),e;if(n.unencrypted)e=Buffer.from(n.data,"base64");else{if(!t)throw new Error("Encryption password is required to decrypt cloud backup.");let o=n,i=Buffer.from(o.salt,"hex"),c=Buffer.from(o.iv,"hex"),s=Buffer.from(o.tag,"hex"),l=/^[0-9a-f]+$/i.test(o.data)&&o.data.length%2===0?Buffer.from(o.data,"hex"):Buffer.from(o.data,"base64"),g=await new Promise((u,h)=>{G.pbkdf2(t,i,Be,he,"sha256",(f,b)=>{f?h(f):u(b)})});try{let u=G.createDecipheriv(ve,g,c);u.setAuthTag(s),e=Buffer.concat([u.update(l),u.final()])}catch{let u=await new Promise((f,b)=>{G.pbkdf2(t,i,1e5,he,"sha256",(p,x)=>{p?b(p):f(x)})}),h=G.createDecipheriv(ve,u,c);h.setAuthTag(s),e=Buffer.concat([h.update(l),h.final()])}}return n.compressed?(await new Promise((i,c)=>{be.gunzip(e,(s,a)=>s?c(s):i(a))})).toString("utf-8"):e.toString("utf-8")}var le=k(require("https"));var xe=k(require("http")),re=k(require("https")),ce=k(require("crypto")),q=k(require("vscode"));var we="627024998523-13an3bmndm293rvgu9faomi6ao9bepks.apps.googleusercontent.com",ze="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",Ke=["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"].join(" "),Ze=12e4,O=class{static async startLoginFlow(){let t=await tt(),n=`http://127.0.0.1:${t}`,e=Me(ce.randomBytes(32)),o=Me(ce.createHash("sha256").update(e).digest()),i=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(we)}&redirect_uri=${encodeURIComponent(n)}&response_type=code&scope=${encodeURIComponent(Ke)}&access_type=offline&prompt=consent&code_challenge=${o}&code_challenge_method=S256`,c=et(t);await q.env.openExternal(q.Uri.parse(i)),q.window.showInformationMessage("\u{1F511} Google sign-in page opened \u2014 authorize in browser to complete login.",{modal:!1});let s;try{s=await ot(c,Ze)}catch{throw new Error("Google Sign-In timed out or was cancelled. Please try again.")}let a=await Xe(s,e,n);await fe(a.accessToken,a.refreshToken);try{await this.fetchAndStoreUserProfile(a.accessToken)}catch{}return a}static fetchAndStoreUserProfile(t){return new Promise((n,e)=>{let o={hostname:"www.googleapis.com",path:"/oauth2/v3/userinfo",method:"GET",headers:{Authorization:`Bearer ${t}`,"User-Agent":"Antigravity-Cloud-IDE"}},i=re.request(o,c=>{let s="";c.on("data",a=>s+=a),c.on("end",async()=>{try{if(c.statusCode===200){let a=JSON.parse(s),l={email:a.email||"",name:a.name||a.email||"Google User",picture:a.picture||""};await Pe(l.email,l.name,l.picture),n(l)}else e(new Error(`Userinfo API error (${c.statusCode}): ${s}`))}catch(a){e(a)}})});i.on("error",c=>e(c)),i.end()})}static refreshAccessToken(t){return new Promise((n,e)=>{if(!t)return e(new Error("No Refresh Token available. Please sign in with Google again."));let o=new URLSearchParams({grant_type:"refresh_token",client_id:we,client_secret:ze,refresh_token:t}).toString(),i={hostname:"oauth2.googleapis.com",path:"/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(o)}},c=re.request(i,s=>{let a="";s.on("data",l=>a+=l),s.on("end",async()=>{try{let l=JSON.parse(a);l.access_token?(await fe(l.access_token),this.fetchAndStoreUserProfile(l.access_token).catch(()=>{}),n(l.access_token)):e(new Error("Failed to refresh Google Access Token: "+(l.error_description||JSON.stringify(l))))}catch(l){e(new Error("Failed to parse refresh response: "+l.message))}})});c.on("error",s=>e(s)),c.write(o),c.end()})}static async logout(){await Ee()}static async validateOrRefreshToken(){let t=E();if(!t.googleDriveToken)return!1;try{return await this.fetchAndStoreUserProfile(t.googleDriveToken),!0}catch{if(t.googleRefreshToken)try{let n=await this.refreshAccessToken(t.googleRefreshToken);return await this.fetchAndStoreUserProfile(n),!0}catch{return await this.logout(),!1}return await this.logout(),!1}}};function Xe(r,t,n){return new Promise((e,o)=>{let i=new URLSearchParams({code:r,client_id:we,client_secret:ze,redirect_uri:n,grant_type:"authorization_code",code_verifier:t}).toString(),c={hostname:"oauth2.googleapis.com",path:"/token",method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Content-Length":Buffer.byteLength(i)}},s=re.request(c,a=>{let l="";a.on("data",g=>l+=g),a.on("end",()=>{try{let g=JSON.parse(l);g.access_token?e({accessToken:g.access_token,refreshToken:g.refresh_token}):o(new Error("OAuth Token Exchange Error: "+(g.error_description||JSON.stringify(g))))}catch(g){o(new Error("Failed to parse token response: "+g.message))}})});s.on("error",a=>o(a)),s.write(i),s.end()})}function et(r){return new Promise((t,n)=>{let e=xe.createServer((o,i)=>{try{let c=new URL(o.url||"/",`http://127.0.0.1:${r}`),s=c.searchParams.get("code"),a=c.searchParams.get("error");if(a){i.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),i.end(Fe("\u274C Sign-In Cancelled","You can close this tab and return to Antigravity IDE.",!1)),e.close(),n(new Error("Google Sign-In was denied: "+a));return}s&&(i.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),i.end(Fe("\u2705 Signed In!","You can close this tab and return to Antigravity IDE.",!0)),e.close(),t(s))}catch(c){n(c),e.close()}});e.on("error",n),e.listen(r,"127.0.0.1")})}function tt(){return new Promise((r,t)=>{let n=xe.createServer();n.listen(0,"127.0.0.1",()=>{let o=n.address().port;n.close(()=>r(o))}),n.on("error",t)})}function Me(r){return r.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function ot(r,t){return new Promise((n,e)=>{let o=setTimeout(()=>e(new Error("Timeout")),t);r.then(i=>{clearTimeout(o),n(i)},i=>{clearTimeout(o),e(i)})})}function Fe(r,t,n){return`<!DOCTYPE html>
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
    h1 { font-size: 22px; font-weight: 700; color: ${n?"#4ade80":"#f87171"}; margin-bottom: 10px; }
    p  { font-size: 14px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${n?"\u{1F680}":"\u{1F512}"}</div>
    <h1>${r}</h1>
    <p>${t}</p>
  </div>
</body>
</html>`}var j=class{token;abortSignal;constructor(t,n){this.token=t.trim(),this.abortSignal=n}async uploadSyncPayload(t,n,e){let o="antigravity_cloud_backup.enc",i=Buffer.from(t,"utf-8"),c=n;if(c||(c=await this.findBackupFileId()||void 0),c)try{return await this.request("PATCH",`/upload/drive/v3/files/${c}?uploadType=media`,i,"application/octet-stream",!0,!1,!1,e),c}catch{if(this.abortSignal?.aborted)throw new Error("Operation canceled by user.");let h=await this.findBackupFileId();if(h&&h!==c)try{return await this.request("PATCH",`/upload/drive/v3/files/${h}?uploadType=media`,i,"application/octet-stream",!0,!1,!1,e),h}catch{}}let a=(await this.requestFullResponse("POST","/upload/drive/v3/files?uploadType=resumable",Buffer.from(JSON.stringify({name:o,mimeType:"application/octet-stream"}),"utf-8"),"application/json; charset=UTF-8",!1)).headers.location;if(!a)throw new Error("Google Drive Resumable Upload initialization failed: Location header missing.");let l=new URL(a);return(await this.requestUrl("PUT",l.hostname,l.pathname+l.search,i,"application/octet-stream",e)).id}async downloadSyncPayload(t){if(t)try{return await this.request("GET",`/drive/v3/files/${t}?alt=media`,void 0,void 0,!1,!0)}catch{}let n=await this.findBackupFileId();if(!n)throw new Error("No backup file (antigravity_cloud_backup.enc) found in your Google Drive account. Please perform a Sync first.");return await this.request("GET",`/drive/v3/files/${n}?alt=media`,void 0,void 0,!1,!0)}static async cleanupDuplicates(t){try{await t.findBackupFileId()}catch{}}async findBackupFileId(){let t=encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false"),n=await this.request("GET",`/drive/v3/files?q=${t}&fields=files(id,modifiedTime)`);if(n.files&&n.files.length>0){if(n.files.length>1){let e=[...n.files].sort((i,c)=>{let s=i.modifiedTime?new Date(i.modifiedTime).getTime():0;return(c.modifiedTime?new Date(c.modifiedTime).getTime():0)-s}),o=e[0].id;for(let i=1;i<e.length;i++)try{await this.request("DELETE",`/drive/v3/files/${e[i].id}`)}catch{}return o}return n.files[0].id}return null}async getBackupFileDetails(){try{let t=encodeURIComponent("name='antigravity_cloud_backup.enc' and trashed=false"),n=await this.request("GET",`/drive/v3/files?q=${t}&fields=files(id,name,size,modifiedTime)`);if(n.files&&n.files.length>0){let e=n.files[0];return{id:e.id,name:e.name||"antigravity_cloud_backup.enc",size:e.size||"0",modifiedTime:e.modifiedTime||new Date().toISOString()}}return null}catch{return null}}async findExistingFileId(){return this.findBackupFileId()}async requestUrl(t,n,e,o,i,c){let s=E(),l=(this.token||s.googleDriveToken).replace(/^["']|["']$/g,"").trim(),g=l.startsWith("Bearer ")?l:`Bearer ${l}`;return new Promise((u,h)=>{let f={hostname:n,path:e,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:g,...i?{"Content-Type":i}:{},...o?{"Content-Length":o.length}:{}}},b=le.request(f,p=>{let x="";p.on("data",m=>x+=m),p.on("end",()=>{if(p.statusCode&&p.statusCode>=200&&p.statusCode<350)try{u(JSON.parse(x))}catch{u(x)}else h(new Error(`Google Drive Resumable Upload Error (${p.statusCode}): ${x.substring(0,500)}`))})});if(this.abortSignal){if(this.abortSignal.aborted)return b.destroy(),h(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{b.destroy(),h(new Error("Operation canceled by user."))})}if(b.on("error",p=>h(p)),o)if(c){let x=0,m=o.length,v=()=>{if(!this.abortSignal?.aborted){for(;x<m;){let y=o.subarray(x,Math.min(x+2097152,m));if(x+=y.length,c(x,m),!b.write(y)){b.once("drain",v);return}}b.end()}};v()}else b.write(o),b.end();else b.end()})}async requestFullResponse(t,n,e,o,i=!1){let c=E(),a=(this.token||c.googleDriveToken).replace(/^["']|["']$/g,"").trim(),l=a.startsWith("Bearer ")?a:`Bearer ${a}`,g=i?"upload.googleapis.com":"www.googleapis.com";return new Promise((u,h)=>{let f={hostname:g,path:n,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:l,...o?{"Content-Type":o}:{},...e?{"Content-Length":e.length}:{}}},b=le.request(f,p=>{let x="";p.on("data",m=>x+=m),p.on("end",()=>{p.statusCode&&p.statusCode>=200&&p.statusCode<350?u({headers:p.headers,statusCode:p.statusCode,body:x}):h(new Error(`Google Drive Resumable Init Error (${p.statusCode}): ${x.substring(0,500)}`))})});if(this.abortSignal){if(this.abortSignal.aborted)return b.destroy(),h(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{b.destroy(),h(new Error("Operation canceled by user."))})}b.on("error",p=>h(p)),e&&b.write(e),b.end()})}async request(t,n,e,o,i=!1,c=!1,s=!1,a){let l=E(),u=(this.token||l.googleDriveToken).replace(/^["']|["']$/g,"").trim(),h=u.startsWith("Bearer ")?u:`Bearer ${u}`,f=i?"upload.googleapis.com":"www.googleapis.com";return new Promise((b,p)=>{let x={hostname:f,path:n,method:t,timeout:18e4,headers:{"User-Agent":"Antigravity-Anywhere-Extension",Authorization:h,...o?{"Content-Type":o}:{},...e?{"Content-Length":e.length}:{}}},m=le.request(x,y=>{let D="";y.on("data",w=>D+=w),y.on("end",async()=>{if(y.statusCode&&y.statusCode>=200&&y.statusCode<300)if(c)b(D);else try{b(JSON.parse(D))}catch{b(D)}else if(y.statusCode===401&&!s&&l.googleRefreshToken)try{let w=await O.refreshAccessToken(l.googleRefreshToken);this.token=w;let U=await this.request(t,n,e,o,i,c,!0,a);b(U)}catch(w){p(new Error("Google Access Token expired and background refresh failed: "+w.message))}else{let w=`Google Drive API Error (${y.statusCode}): ${D.substring(0,500)}`;y.statusCode===401?w='Google Drive API 401 Unauthorized: Access token expired. Please click "\u{1F511} Sign in with Google" to re-authorize.':y.statusCode===404&&(w=`Google Drive API 404 Not Found. Google response: ${D.substring(0,300)}`),p(new Error(w))}})}),v=!1;if(this.abortSignal){if(this.abortSignal.aborted)return m.destroy(),v=!0,p(new Error("Operation canceled by user."));this.abortSignal.addEventListener("abort",()=>{m.destroy(),v||(v=!0,p(new Error("Operation canceled by user.")))})}if(m.on("timeout",()=>{m.destroy(),v||(v=!0,p(new Error("Google Drive API Connection Timed Out (180s). Check network connection.")))}),m.on("error",y=>{v||(y.code==="EPIPE"||y.code==="ECONNRESET"?setTimeout(()=>{v||(v=!0,p(y))},500):(v=!0,p(y)))}),e)if(a){let D=0,w=e.length,U=()=>{if(!this.abortSignal?.aborted){for(;D<w;){let ie=e.subarray(D,Math.min(D+2097152,w));if(D+=ie.length,a(D,w),!m.write(ie)){m.once("drain",U);return}}m.end()}};U()}else m.write(e),m.end();else m.end()})}};var _=k(require("fs")),W=k(require("path")),te=class{static async createSnapshot(t){let n=W.join(t,"brain");if(!_.existsSync(n))return null;let e=new Date().toISOString().replace(/[:.]/g,"-"),o=W.join(t,"local_backups"),i=W.join(o,`backup_${e}`);return await _.promises.mkdir(i,{recursive:!0}),await this.copyRecursive(n,W.join(i,"brain")),await this.cleanupOldBackups(o,10),i}static async copyRecursive(t,n){if((await _.promises.stat(t)).isDirectory()){await _.promises.mkdir(n,{recursive:!0});let o=await _.promises.readdir(t);for(let i of o)await this.copyRecursive(W.join(t,i),W.join(n,i))}else await _.promises.copyFile(t,n)}static async cleanupOldBackups(t,n){try{if(!_.existsSync(t))return;let o=(await _.promises.readdir(t)).filter(i=>i.startsWith("backup_")).sort();if(o.length>n){let i=o.slice(0,o.length-n);for(let c of i)await _.promises.rm(W.join(t,c),{recursive:!0,force:!0})}}catch{}}};var J=k(require("fs")),Re=k(require("path")),V=class{watcher=null;debounceTimer=null;onTriggerSync;debounceMs;constructor(t,n){this.debounceMs=t*1e3,this.onTriggerSync=n}startWatching(t){let n=Re.join(t,"brain");if(!J.existsSync(n))try{J.mkdirSync(n,{recursive:!0})}catch{return}try{this.watcher=J.watch(n,{recursive:!0},(e,o)=>{o&&o.endsWith(".log")||this.handleChange()})}catch{}}handleChange(){this.debounceTimer&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>{this.onTriggerSync()},this.debounceMs)}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null),this.debounceTimer&&(clearTimeout(this.debounceTimer),this.debounceTimer=null)}};var P=k(require("vscode"));var Q=k(require("os")),Le=k(require("crypto")),de=k(require("vscode")),Y=class{static cachedDevice=null;static getDeviceInfo(){if(this.cachedDevice)return this.cachedDevice;let t=de.workspace.getConfiguration("antigravityAnywhere"),n=t.get("deviceId","").trim();n||(n="dev_"+Le.randomBytes(8).toString("hex"),t.update("deviceId",n,de.ConfigurationTarget.Global));let e=Q.platform(),o="linux";e==="darwin"?o="mac":e==="win32"&&(o="windows");let s=`${Q.hostname()} (${o==="mac"?"macOS":o==="windows"?"Windows":"Linux"})`;return this.cachedDevice={deviceId:n,deviceName:s,platform:o,osRelease:Q.release(),lastSyncTime:new Date().toISOString()},this.cachedDevice}};var F=class r{static currentPanel;static show(t){let n=P.window.activeTextEditor?P.window.activeTextEditor.viewColumn:void 0;if(r.currentPanel){r.currentPanel.reveal(n);return}let e=P.window.createWebviewPanel("antigravityAnywhereDashboard","\u2601\uFE0F Antigravity Cloud Hub",n||P.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0});r.currentPanel=e,e.onDidDispose(()=>{r.currentPanel=void 0},null,t.subscriptions),e.webview.onDidReceiveMessage(async o=>{switch(o.command){case"googleLogin":await P.commands.executeCommand("antigravityAnywhere.googleLogin"),this.updateWebviewHtml(e);break;case"googleLogout":await P.commands.executeCommand("antigravityAnywhere.googleLogout"),this.updateWebviewHtml(e);break;case"deepScan":await P.commands.executeCommand("antigravityAnywhere.deepScan"),this.updateWebviewHtml(e);break;case"syncNow":await P.commands.executeCommand("antigravityAnywhere.syncNow"),this.updateWebviewHtml(e);break;case"restore":await P.commands.executeCommand("antigravityAnywhere.restore"),this.updateWebviewHtml(e);break;case"cancelSync":await P.commands.executeCommand("antigravityAnywhere.cancelSync"),this.updateWebviewHtml(e);break;case"toggleAutoSync":await P.commands.executeCommand("antigravityAnywhere.toggleAutoSync"),this.updateWebviewHtml(e);break;case"openGithubStar":P.env.openExternal(P.Uri.parse("https://github.com/quantEray/antigravity-cloud"));break;case"openGithubIssues":P.env.openExternal(P.Uri.parse("https://github.com/quantEray/antigravity-cloud/issues"));break;case"setEncryptionPassword":await P.commands.executeCommand("antigravityAnywhere.setEncryptionPassword"),this.updateWebviewHtml(e);break;case"deleteAll":await P.commands.executeCommand("antigravityAnywhere.deleteAllFiles",!0),this.updateWebviewHtml(e);break;case"deleteFile":await P.commands.executeCommand("antigravityAnywhere.deleteFile",o.relativePath,!0),this.updateWebviewHtml(e);break;case"deleteConversation":await P.commands.executeCommand("antigravityAnywhere.deleteConversation",o.convId,!0),this.updateWebviewHtml(e);break;case"deleteBatchConversations":await P.commands.executeCommand("antigravityAnywhere.deleteBatchConversations",o.convIds),this.updateWebviewHtml(e);break;case"refresh":this.updateWebviewHtml(e);break}},void 0,t.subscriptions),setImmediate(()=>{this.updateWebviewHtml(e)})}static refreshCurrentPanel(){r.currentPanel&&r.updateWebviewHtml(r.currentPanel)}static async updateWebviewHtml(t){let n=E(),e=Y.getDeviceInfo(),o=0,i=0,c="0",s="";try{let m=await T.scanDataDirectory(n.antigravityDataDir);o=m.files.length,c=m.totalSizeMB;let v=T.groupFilesByConversation(m,n.antigravityDataDir);i=v.length,s=v.map((y,D)=>{let w=y.files.map(pe=>`<div class="sub-file-item">
                <span class="sub-file-name">\u{1F4C4} ${pe.relativePath}</span>
                <span class="sub-file-size">${(pe.sizeBytes/1048576).toFixed(2)} MB</span>
                <button class="btn-sub-del" onclick="confirmDeleteFile('${pe.relativePath}')" title="Delete file">\u{1F5D1}\uFE0F</button>
              </div>`).join(""),U=y.title.replace(/"/g,"&quot;").replace(/'/g,"&#39;"),ie=y.id.substring(0,12),Se=y.status==="synced"?'<span class="sync-badge synced">\u{1F7E2} Synced</span>':y.status==="modified"?'<span class="sync-badge modified" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4);">\u{1F7E1} Modified</span>':'<span class="sync-badge local" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.4);">\u26AA Local</span>';return`<div class="conv-card" data-title="${U.toLowerCase()}" data-id="${y.id}">
            <div class="conv-header">
              <div class="conv-info">
                <div class="conv-title-row">
                  <input type="checkbox" class="conv-checkbox" data-id="${y.id}" onchange="updateBatchState()">
                  <div class="conv-title">\u{1F4AC} ${U}</div>
                  ${Se}
                </div>
                <div class="conv-sub">
                  ID: ${ie}... \u2022 ${y.files.length} Files (${y.totalSizeMB} MB) \u2022 Updated: ${y.lastUpdated}
                </div>
              </div>
              <div class="conv-actions">
                <button class="btn-toggle-files" onclick="toggleFiles('files_${D}')">\u25B6 Files (${y.files.length})</button>
                <button class="btn-del-conv" onclick="confirmDeleteConv('${y.id}', '${U}')" title="Delete chat">\u{1F5D1}\uFE0F Delete Chat</button>
              </div>
            </div>
            <div class="conv-files" id="files_${D}">
              ${w}
            </div>
          </div>`}).join("")}catch{s='<div class="empty-state">No conversation files found. Click "Deep Scan & Re-Index".</div>'}let a=!!n.googleDriveToken,l=n.googleUserEmail||"",g=n.googleUserName||l||"Google User",u=n.googleUserPicture||"",h='<div class="empty-state">Not signed in to Google Drive. Sign in above to view cloud backups.</div>',f="0",b="Never";if(a)try{let v=await new j(n.googleDriveToken).getBackupFileDetails();v?(f=(parseInt(v.size||"0")/(1024*1024)).toFixed(2),b=new Date(v.modifiedTime).toLocaleString(),h=`
            <div class="cloud-info-card">
              <div class="cloud-info-header">
                <div class="cloud-info-title">\u2601\uFE0F Google Drive Backup File</div>
                <div class="status-badge" style="color: #34d399;"><span class="pulse-dot"></span> Backup File Active</div>
              </div>
              <div class="cloud-info-grid">
                <div class="cloud-info-item">
                  <div class="cloud-info-label">File Name</div>
                  <div class="cloud-info-val">${v.name}</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Backup Size</div>
                  <div class="cloud-info-val">${f} MB</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Last Cloud Sync</div>
                  <div class="cloud-info-val">${b}</div>
                </div>
                <div class="cloud-info-item">
                  <div class="cloud-info-label">Google Drive File ID</div>
                  <div class="cloud-info-val" style="font-family: monospace; font-size: 11px;">${v.id}</div>
                </div>
              </div>
              <div class="cloud-actions-row">
                <button class="btn btn-secondary" onclick="sendMessage('restore')">\u{1F4E5} Pull & Restore from Cloud</button>
                <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Push & Overwrite Cloud</button>
              </div>
            </div>
          `):h=`
            <div class="cloud-info-card">
              <div class="cloud-info-title">\u2601\uFE0F No Cloud Backup Found Yet</div>
              <p style="color: var(--text-muted); font-size: 13px; margin: 8px 0 16px 0;">No backup file named <code>antigravity_cloud_backup.enc</code> exists in your Google Drive yet. Click "Sync All Conversations" to upload your first backup.</p>
              <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Perform Initial Cloud Sync</button>
            </div>
          `}catch(m){h=`<div class="empty-state">Unable to query Google Drive backup info: ${m.message}</div>`}let p=u?`<img src="${u}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`:'<div class="user-avatar-fallback">\u{1F464}</div>',x=`<!DOCTYPE html>
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
      border: 1px solid ${a?"rgba(16, 185, 129, 0.4)":"rgba(239, 68, 68, 0.4)"};
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
      color: ${a?"#34d399":"#f87171"};
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${a?"#34d399":"#f87171"};
      box-shadow: 0 0 10px ${a?"#34d399":"#f87171"};
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
        <button class="btn btn-secondary" onclick="sendMessage('setEncryptionPassword')" style="padding: 8px 14px; font-size: 12px; border-color: rgba(59, 130, 246, 0.4); color: #60a5fa;" title="Set or change backup encryption password">
          \u{1F511} Set Password
        </button>
        <button class="btn btn-secondary" onclick="sendMessage('openGithubStar')" style="padding: 8px 14px; font-size: 12px; border-color: rgba(251, 191, 36, 0.4); color: #fde047;" title="Star project on GitHub">
          \u2B50 Star Project
        </button>
        <button class="btn btn-secondary" onclick="sendMessage('openGithubIssues')" style="padding: 8px 14px; font-size: 12px; border-color: rgba(168, 85, 247, 0.4); color: #c084fc;" title="Feedback & Issue Tracker">
          \u{1F4AC} Feedback
        </button>
      </div>

      <div class="user-profile-badge">
        ${a?`${p}
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

  ${a?"":`<div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 16px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
          <div>
            <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 6px;">\u{1F680} Welcome to Antigravity Anywhere!</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Connect your Google Drive account to sync your Antigravity IDE chat history, SQLite databases, and trajectory metadata across all your computers seamlessly.</p>
          </div>
          <button class="btn btn-login" style="padding: 12px 24px; font-size: 14px; white-space: nowrap;" onclick="sendMessage('googleLogin')">\u{1F511} Sign in with Google</button>
        </div>`}

  <div class="action-bar">
    <button class="btn ${n.enableAutoSync?"btn-scan":"btn-secondary"}" onclick="sendMessage('toggleAutoSync')">\u26A1 Auto Sync: ${n.enableAutoSync?"ON (Click to Disable)":"OFF (Click to Enable)"}</button>
    ${a?`<button class="btn btn-logout" onclick="sendMessage('googleLogout')">\u{1F6AA} Sign Out (${g.split(" ")[0]})</button>`:`<button class="btn btn-login" onclick="sendMessage('googleLogin')">\u{1F511} Sign in with Google</button>`}
    <button class="btn btn-scan" onclick="sendMessage('deepScan')">\u{1F50D} Deep Scan & Re-Index</button>
    <button class="btn btn-primary" onclick="sendMessage('syncNow')">\u26A1 Sync All Conversations (Push)</button>
    <button class="btn btn-secondary" onclick="sendMessage('restore')">\u{1F4E5} Restore from Google Drive (Pull)</button>
    <button class="btn btn-danger" onclick="confirmDeleteAll()">\u{1F5D1}\uFE0F Delete All Local Files</button>
  </div>

  <div class="grid">
    <div class="card stat-card">
      <div class="stat-label">Active Conversations</div>
      <div class="stat-val">${i} Chats</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Local Data Size</div>
      <div class="stat-val">${c} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Cloud Backup Size</div>
      <div class="stat-val">${f} MB</div>
    </div>
    <div class="card stat-card">
      <div class="stat-label">Device Info</div>
      <div class="stat-val" style="font-size: 16px;">${e.deviceName} (${e.platform})</div>
    </div>
  </div>

  <div class="tabs-nav">
    <button class="tab-btn active" id="tabLocal" onclick="switchTab('local')">\u{1F4BB} Local Conversations (${i})</button>
    <button class="tab-btn" id="tabCloud" onclick="switchTab('cloud')">\u2601\uFE0F Cloud Backup Info (${f} MB)</button>
  </div>

  <div class="tab-content active" id="contentLocal">
    <div class="search-bar">
      <input type="text" id="searchInput" class="search-input" placeholder="\u{1F50D} Search conversations by title or ID..." onkeyup="filterConversations()">
      <div class="batch-bar">
        <label class="master-select-box" title="Select / Deselect all visible conversations">
          <input type="checkbox" id="masterCheckbox" class="conv-checkbox" onchange="toggleSelectAll(this.checked)">
          <span id="masterSelectLabel">Select All (${i})</span>
        </label>
        <button class="btn-batch-del" id="batchDelBtn" onclick="confirmBatchDelete()">\u{1F5D1}\uFE0F Delete Selected (<span id="selectedCount">0</span>)</button>
      </div>
    </div>

    <div class="conv-list" id="convList">
      ${s}
    </div>
  </div>

  <div class="tab-content" id="contentCloud">
    ${h}
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
</html>`;t.webview.html=x}};var B=k(require("vscode"));var H=class r{constructor(t){this._extensionUri=t}static viewType="antigravityAnywhereSidebarView";static currentView;_view;resolveWebviewView(t,n,e){this._view=t,r.currentView=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},t.webview.onDidReceiveMessage(async o=>{switch(o.command){case"googleLogin":await B.commands.executeCommand("antigravityAnywhere.googleLogin"),this.refresh();break;case"googleLogout":await B.commands.executeCommand("antigravityAnywhere.googleLogout"),this.refresh();break;case"deepScan":await B.commands.executeCommand("antigravityAnywhere.deepScan"),this.refresh();break;case"syncNow":await B.commands.executeCommand("antigravityAnywhere.syncNow"),this.refresh();break;case"restore":await B.commands.executeCommand("antigravityAnywhere.restore"),this.refresh();break;case"deleteAll":await B.commands.executeCommand("antigravityAnywhere.deleteAllFiles",!0),this.refresh();break;case"deleteFile":await B.commands.executeCommand("antigravityAnywhere.deleteFile",o.relativePath),this.refresh();break;case"deleteConversation":await B.commands.executeCommand("antigravityAnywhere.deleteConversation",o.convId),this.refresh();break;case"openDashboard":await B.commands.executeCommand("antigravityAnywhere.openDashboard");break;case"cancelSync":await B.commands.executeCommand("antigravityAnywhere.cancelSync"),this.refresh();break;case"toggleAutoSync":await B.commands.executeCommand("antigravityAnywhere.toggleAutoSync"),this.refresh();break;case"openGithubStar":B.env.openExternal(B.Uri.parse("https://github.com/quantEray/antigravity-cloud"));break;case"openGithubIssues":B.env.openExternal(B.Uri.parse("https://github.com/quantEray/antigravity-cloud/issues"));break;case"setEncryptionPassword":await B.commands.executeCommand("antigravityAnywhere.setEncryptionPassword"),this.refresh();break;case"refresh":this.refresh();break}}),this.refresh()}async refresh(){this._view&&(this._view.webview.html=await this._getHtmlForWebview())}async _getHtmlForWebview(){let t=E(),n=Y.getDeviceInfo(),e=0,o="0",i="";try{let u=await T.scanDataDirectory(t.antigravityDataDir);o=u.totalSizeMB;let h=T.groupFilesByConversation(u,t.antigravityDataDir);e=h.length,i=h.map(f=>`<div class="conv-item">
              <div class="conv-header">
                <div class="conv-title">${f.status==="synced"?"\u{1F7E2}":f.status==="modified"?"\u{1F7E1}":"\u26AA"} ${f.title}</div>
                <button class="btn-del-mini" onclick="send('deleteConversation', '${f.id}')" title="Delete conversation">\u{1F5D1}\uFE0F</button>
              </div>
              <div class="conv-meta">ID: ${f.id.substring(0,8)}... \u2022 ${f.files.length} Files (${f.totalSizeMB} MB)</div>
            </div>`).join("")}catch{i='<div class="conv-item empty">No chat data found.</div>'}let c=!!t.googleDriveToken,s=t.googleUserEmail||"Google User",a=t.googleUserName||s,l=t.googleUserPicture||"",g=l?`<img src="${l}" class="user-avatar" alt="Avatar" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://lh3.googleusercontent.com/a/default-user';" />`:'<div class="user-avatar-fallback">\u{1F464}</div>';return`<!DOCTYPE html>
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
            <div class="user-name">${a}</div>
            <div class="user-email">${s}</div>
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
    ${c?`<button class="logout" onclick="send('googleLogout')">\u{1F6AA} Sign Out (${a.split(" ")[0]})</button>`:`<button class="login" onclick="send('googleLogin')">\u{1F511} Sign in with Google</button>`}
    <button class="scan" onclick="send('deepScan')">\u{1F50D} Deep Scan & Re-Index</button>
    <button onclick="send('syncNow')">\u26A1 Sync All (Google Drive)</button>
    <button class="secondary" onclick="send('restore')">\u{1F4E5} Restore from Google Drive</button>
    <button class="secondary" onclick="send('refresh')">\u{1F504} Refresh UI</button>
    <div style="display: flex; gap: 6px; width: 100%;">
      <button class="secondary" onclick="send('setEncryptionPassword')" style="flex: 1; font-size: 11px; padding: 6px;" title="Set Encryption Password">\u{1F511} Password</button>
      <button class="secondary" onclick="send('openGithubStar')" style="flex: 1; font-size: 11px; padding: 6px;" title="Star on GitHub">\u2B50 Star</button>
      <button class="secondary" onclick="send('openGithubIssues')" style="flex: 1; font-size: 11px; padding: 6px;" title="Report Feedback">\u{1F4AC} Feedback</button>
    </div>
    <button class="danger" onclick="send('deleteAll')">\u{1F5D1}\uFE0F Delete All Files</button>
  </div>

  <div class="stats-card">
    <div class="stat-row">
      <span class="stat-label">Device:</span>
      <span class="stat-val">${n.deviceName}</span>
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
    ${i}
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
</html>`}};var L=k(require("vscode")),oe=k(require("https")),K=k(require("fs")),Ge=k(require("path")),Ue=k(require("os")),ne=class r{strokeRepo="quantEray/antigravity-cloud";static async checkForUpdates(t,n=!1){let e=t.extension?.packageJSON?.version||"0.1.0";try{let o=await r.fetchLatestRelease();if(!o||!o.tag_name){n&&L.window.showInformationMessage("\u2601\uFE0F Antigravity Cloud: Unable to check for updates right now.");return}let i=o.tag_name.replace(/^v/,"");if(r.compareVersions(i,e)>0){let a=o.assets?.find(g=>g.name.endsWith(".vsix"))?.browser_download_url||`https://github.com/quantEray/antigravity-cloud/releases/download/${o.tag_name}/antigravity-anywhere-${i}.vsix`;await L.window.showInformationMessage(`\u{1F680} Antigravity Cloud update v${i} is available! (Current: v${e})`,"\u26A1 Update Now","Later")==="\u26A1 Update Now"&&await r.downloadAndInstallUpdate(a,i)}else n&&L.window.showInformationMessage(`\u2728 Antigravity Cloud is up to date (v${e}).`)}catch(o){n&&L.window.showErrorMessage(`Update check failed: ${o.message}`)}}static async fetchLatestRelease(){return new Promise(t=>{let e=oe.request({hostname:"api.github.com",path:"/repos/quantEray/antigravity-cloud/releases/latest",method:"GET",headers:{"User-Agent":"Antigravity-Cloud-Extension"}},o=>{if(o.statusCode===301||o.statusCode===302){let c=o.headers.location;if(c){oe.get(c,{headers:{"User-Agent":"Antigravity-Cloud-Extension"}},s=>{let a="";s.on("data",l=>a+=l),s.on("end",()=>{try{t(JSON.parse(a))}catch{t(null)}})});return}}let i="";o.on("data",c=>i+=c),o.on("end",()=>{try{t(JSON.parse(i))}catch{t(null)}})});e.on("error",()=>t(null)),e.end()})}static async downloadAndInstallUpdate(t,n){await L.window.withProgress({location:L.ProgressLocation.Notification,title:`\u{1F4E5} Downloading Antigravity Cloud v${n}...`,cancellable:!1},async e=>{let o=Ge.join(Ue.tmpdir(),`antigravity-anywhere-${n}.vsix`);await r.downloadFile(t,o,e),e.report({message:"Installing extension package..."}),await L.commands.executeCommand("workbench.extensions.installExtension",L.Uri.file(o));try{K.unlinkSync(o)}catch{}await L.window.showInformationMessage(`\u{1F389} Antigravity Cloud updated to v${n} successfully!`,"\u{1F504} Reload Window")==="\u{1F504} Reload Window"&&await L.commands.executeCommand("workbench.action.reloadWindow")})}static downloadFile(t,n,e){return new Promise((o,i)=>{let c=K.createWriteStream(n),s=a=>{oe.get(a,{headers:{"User-Agent":"Antigravity-Cloud-Extension"}},l=>{if((l.statusCode===301||l.statusCode===302)&&l.headers.location){s(l.headers.location);return}if(l.statusCode!==200){i(new Error(`Failed to download: HTTP status ${l.statusCode}`));return}let g=parseInt(l.headers["content-length"]||"0",10),u=0;l.on("data",h=>{if(u+=h.length,g>0){let f=Math.round(u/g*100);e.report({message:`${f}% (${(u/(1024*1024)).toFixed(2)} MB)`})}}),l.pipe(c),c.on("finish",()=>{c.close(),o()})}).on("error",l=>{K.unlink(n,()=>i(l))})};s(t)})}static compareVersions(t,n){let e=t.split(".").map(Number),o=n.split(".").map(Number),i=Math.max(e.length,o.length);for(let c=0;c<i;c++){let s=e[c]||0,a=o[c]||0;if(s>a)return 1;if(s<a)return-1}return 0}};var Z,R=null,Ne="",z=null;function nt(r){ne.checkForUpdates(r).catch(()=>{}),Z=d.window.createStatusBarItem(d.StatusBarAlignment.Right,100),Z.command="antigravityAnywhere.openDashboard",M("Not Logged In","$(account)"),Z.show(),r.subscriptions.push(Z);let t=new H(r.extensionUri);r.subscriptions.push(d.window.registerWebviewViewProvider(H.viewType,t)),O.validateOrRefreshToken().then(e=>{if(e){let o=E();M(o.googleUserName?`Signed in as ${o.googleUserName.split(" ")[0]}`:"Signed In","$(cloud-check)")}else M("Not Logged In","$(account)");t.refresh(),F.refreshCurrentPanel()}),r.subscriptions.push(d.commands.registerCommand("antigravityAnywhere.googleLogin",async()=>{try{M("Signing in...","$(sync~spin)"),await O.startLoginFlow();let e=E();M(e.googleUserName?`${e.googleUserName.split(" ")[0]}`:"Signed In","$(cloud-check)"),d.window.showInformationMessage("Antigravity Cloud: Successfully signed in with Google! You can now sync manually."),t.refresh(),F.refreshCurrentPanel()}catch(e){M("Login Error","$(error)"),d.window.showErrorMessage("Antigravity Cloud Google Login Failed: "+e.message)}}),d.commands.registerCommand("antigravityAnywhere.openDashboard",()=>F.show(r)),d.commands.registerCommand("antigravityAnywhere.checkForUpdates",async()=>{await ne.checkForUpdates(r,!0)}),d.commands.registerCommand("antigravityAnywhere.cancelSync",()=>{z&&(z.abort(),z=null,M("Canceled","$(x)"),$(!1,0,"\u23F9\uFE0F Sync canceled by user.","Canceled"),d.window.showInformationMessage("Antigravity Cloud: Sync operation canceled by user."),t.refresh(),F.refreshCurrentPanel())}),d.commands.registerCommand("antigravityAnywhere.toggleAutoSync",async()=>{let e=E(),o=!e.enableAutoSync;await De(o),o?(e.googleDriveToken&&(R||(R=new V(e.syncIntervalSeconds,()=>ge(!1))),R.startWatching(e.antigravityDataDir)),d.window.showInformationMessage("Antigravity Cloud: Automatic Sync is now ENABLED \u26A1")):(R&&(R.stopWatching(),R=null),d.window.showInformationMessage("Antigravity Cloud: Automatic Sync is now DISABLED \u{1F6D1} (Manual Sync only)")),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.syncNow",async()=>{await ge(!0),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.restore",async()=>{await at(),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.setEncryptionPassword",async()=>{let e=E(),o=await d.window.showInputBox({prompt:"\u{1F511} Set Encryption Password for Antigravity Cloud backups (leave blank for default mode):",password:!0,value:e.encryptionPassword,placeHolder:"Enter custom encryption password..."});o!==void 0&&(await me(o.trim()),o.trim()?d.window.showInformationMessage("\u{1F511} Antigravity Cloud: Custom encryption password saved!"):d.window.showInformationMessage("\u{1F513} Antigravity Cloud: Encryption password cleared."),t.refresh(),F.refreshCurrentPanel())}),d.commands.registerCommand("antigravityAnywhere.googleLogout",async()=>{await O.logout(),M("Not Logged In","$(account)"),d.window.showInformationMessage("Antigravity Cloud: Signed out of Google."),t.refresh(),F.refreshCurrentPanel()}),d.commands.registerCommand("antigravityAnywhere.deepScan",async()=>{await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Deep Scanning all conversation directories...",cancellable:!1},async()=>{let e=E(),o=await T.scanDataDirectory(e.antigravityDataDir),i=T.groupFilesByConversation(o);t.refresh(),d.window.showInformationMessage(`Antigravity Anywhere Deep Scan Complete: Found ${i.length} Conversations (${o.files.length} Total Files, ${o.totalSizeMB} MB).`)})}),d.commands.registerCommand("antigravityAnywhere.deleteConversation",async(e,o)=>{if(!e||e==="global-config"||!o&&await d.window.showWarningMessage(`Are you sure you want to delete conversation "${e}" and all its associated files?`,"Yes, Delete Conversation","Cancel")!=="Yes, Delete Conversation")return;let i=E(),c=_e(i.antigravityDataDir,e);try{let s=!1;for(let a of c)N.existsSync(a)&&(await N.promises.rm(a,{recursive:!0,force:!0}),s=!0);s&&(t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Deleted conversation ${e}`))}catch(s){d.window.showErrorMessage(`Antigravity Anywhere: Failed to delete conversation: ${s.message}`)}}),d.commands.registerCommand("antigravityAnywhere.deleteBatchConversations",async e=>{if(!Array.isArray(e)||e.length===0)return;let o=E();for(let i of e){if(!i)continue;let c=_e(o.antigravityDataDir,i);for(let s of c)if(N.existsSync(s))try{await N.promises.rm(s,{recursive:!0,force:!0})}catch{}}t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Successfully deleted ${e.length} selected conversation(s).`)}),d.commands.registerCommand("antigravityAnywhere.deleteFile",async(e,o)=>{if(!e||!o&&await d.window.showWarningMessage(`Are you sure you want to delete "${e}"?`,"Yes, Delete","Cancel")!=="Yes, Delete")return;let i=E(),c=C.dirname(i.antigravityDataDir),s=C.join(i.antigravityDataDir,e);if(e.startsWith("config/"))s=C.join(c,e);else if(e.startsWith("app_support/")){let a=T.getAppSupportDir();s=C.join(a,e.substring(12))}try{N.existsSync(s)&&(await N.promises.rm(s,{recursive:!0,force:!0}),t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage(`Antigravity Anywhere: Deleted ${e}`))}catch(a){d.window.showErrorMessage(`Antigravity Anywhere: Failed to delete file: ${a.message}`)}}),d.commands.registerCommand("antigravityAnywhere.deleteAllFiles",async e=>{let o=E();if(!e){if(await d.window.showWarningMessage("\u26A0\uFE0F DANGER: Are you sure you want to DELETE ALL local conversation files in brain/, conversations/, and implicit/?","Yes, Delete All Files","Cancel")!=="Yes, Delete All Files")return;if(await d.window.showInputBox({prompt:"Type DELETE to confirm wiping all local conversation files:",placeHolder:"DELETE",ignoreFocusOut:!0})!=="DELETE"){d.window.showInformationMessage("Antigravity Anywhere: Delete All cancelled.");return}}try{await te.createSnapshot(o.antigravityDataDir);let i=C.dirname(o.antigravityDataDir),c=T.getAppSupportDir(),s=[C.join(o.antigravityDataDir,"brain"),C.join(o.antigravityDataDir,"conversations"),C.join(o.antigravityDataDir,"implicit"),C.join(i,"antigravity","brain"),C.join(i,"antigravity","conversations"),C.join(i,"antigravity","implicit"),C.join(i,"antigravity-ide","brain"),C.join(i,"antigravity-ide","conversations"),C.join(i,"antigravity-ide","implicit"),C.join(c,"shared_proto_db")];for(let l of s)N.existsSync(l)&&await N.promises.rm(l,{recursive:!0,force:!0});let a=T.getCacheFilePath(o.antigravityDataDir);N.existsSync(a)&&await N.promises.unlink(a),t.refresh(),F.refreshCurrentPanel(),d.window.showInformationMessage("Antigravity Anywhere: All local conversation files wiped (safety snapshot created).")}catch(i){d.window.showErrorMessage(`Antigravity Anywhere: Delete All failed: ${i.message}`)}}));let n=E();n.enableAutoSync&&n.googleDriveToken&&(R=new V(n.syncIntervalSeconds,()=>ge(!1)),R.startWatching(n.antigravityDataDir)),r.subscriptions.push(d.workspace.onDidChangeConfiguration(e=>{e.affectsConfiguration("antigravityAnywhere")&&it()}))}function it(){R&&(R.stopWatching(),R=null);let r=E();r.enableAutoSync&&r.googleDriveToken&&(R=new V(r.syncIntervalSeconds,()=>ge(!1)),R.startWatching(r.antigravityDataDir))}function $(r,t,n,e="\u{1F680} Syncing to Google Drive..."){let o={command:"syncProgress",progress:{active:r,percentage:t,statusText:n,title:e}};F.currentPanel&&F.currentPanel.webview.postMessage(o),H.currentView&&H.currentView.webview.postMessage(o)}async function ge(r=!1){let t=E();if(!t.googleDriveToken){r&&d.window.showWarningMessage("Antigravity Anywhere: Please sign in with Google first.","Sign In").then(e=>{e==="Sign In"&&d.commands.executeCommand("antigravityAnywhere.googleLogin")});return}z=new AbortController;let n=async()=>{try{M("Syncing...","$(sync~spin)"),$(!0,10,"\u{1F50D} Scanning local chat transcripts & databases... (Do not close Antigravity IDE)","\u{1F680} Syncing to Google Drive...");let e=await T.scanForSync(t.antigravityDataDir);if(z?.signal.aborted)throw new Error("Operation canceled by user.");if(e.files.length===0){r&&d.window.showInformationMessage("Antigravity Anywhere: No chat data found to sync."),M("Idle","$(cloud-check)"),$(!1,0,"");return}if(e.manifestHash===Ne){M("Up to Date","$(cloud-check)"),$(!0,100,"\u26A1 Already Up to Date! No changes detected since last sync.","\u{1F680} Up to Date"),r&&d.window.showInformationMessage(`Antigravity Anywhere: Cloud backup is already up-to-date! All ${e.files.length} conversation files match Google Drive.`);return}$(!0,30,`\u26A1 Processing ${e.files.length} chat files (${e.totalSizeMB} MB)...`,"\u{1F680} Syncing to Google Drive...");let o=JSON.stringify(e);if(z?.signal.aborted)throw new Error("Operation canceled by user.");$(!0,55,"\u{1F512} Compressing & Encrypting payload (AES-256-GCM)...","\u{1F680} Syncing to Google Drive...");let i=await $e(o,t.encryptionPassword,z?.signal);if(z?.signal.aborted)throw new Error("Operation canceled by user.");$(!0,75,`\u2601\uFE0F Uploading encrypted bundle (${(i.length/(1024*1024)).toFixed(2)} MB) to Google Drive... Please wait...`,"\u{1F680} Syncing to Google Drive...");let c=new j(t.googleDriveToken,z?.signal),s=t.driveFileId;if(!s){let l=await c.findBackupFileId();l&&(s=l)}let a=await c.uploadSyncPayload(i,s,(l,g)=>{let u=Math.min(89,Math.floor(75+l/g*14)),h=(l/(1024*1024)).toFixed(1),f=(g/(1024*1024)).toFixed(1);$(!0,u,`\u2601\uFE0F Uploading: ${h} MB / ${f} MB (${u}%)... Please wait...`,"\u{1F680} Uploading to Google Drive...")});if(a!==t.driveFileId&&await ue(a),$(!0,90,"\u{1F4BE} Saving local delta state cache...","\u{1F680} Syncing to Google Drive..."),await T.saveDeltaState(t.antigravityDataDir,e.files),Ne=e.manifestHash,M("Synced","$(cloud-check)"),$(!0,100,`\u2705 Synced ${e.files.length} chat files (${e.totalSizeMB} MB) to Google Drive!`,"\u{1F680} Sync Complete"),r){let l=T.groupFilesByConversation(e),g=e.isIncremental?"\u26A1 Incremental Delta Sync":"\u{1F504} Full Backup Sync";d.window.showInformationMessage(`Antigravity Anywhere [${g}]: Synced ${l.length} active/modified chats (${e.files.length} files, ${e.totalSizeMB} MB) to Google Drive!`)}}catch(e){M("Sync Error","$(error)"),$(!0,0,`\u274C Sync Failed: ${e.message}`,"Sync Error"),r&&!z?.signal.aborted&&(e.message&&e.message.includes("console.developers.google.com")?d.window.showErrorMessage("Antigravity Cloud: Google Drive API is disabled in your Google Cloud Project (627024998523). Click below to enable it.","Enable Google Drive API").then(o=>{o==="Enable Google Drive API"&&d.env.openExternal(d.Uri.parse("https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=627024998523"))}):d.window.showErrorMessage(`Antigravity Anywhere Google Drive Sync Failed: ${e.message}`))}finally{z=null}};r?await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Syncing all conversations to Google Drive...",cancellable:!1},n):await n()}async function at(){let r=E();if(!r.googleDriveToken){d.window.showErrorMessage("Antigravity Anywhere: Google Sign-In is required to restore backups.","Sign In").then(o=>{o==="Sign In"&&d.commands.executeCommand("antigravityAnywhere.googleLogin")});return}z=new AbortController;let t=new j(r.googleDriveToken,z.signal),n=r.driveFileId;if(!n){M("Searching Google Drive...","$(sync~spin)"),$(!0,10,"\u{1F50D} Searching Google Drive for backup file...","\u{1F4E5} Restoring from Google Drive...");let o=await t.findBackupFileId();if(o)n=o,await ue(n);else{M("Restore Error","$(error)"),$(!0,0,"\u274C No backup found on Google Drive","Restore Error"),d.window.showErrorMessage("Antigravity Anywhere: No cloud backup found in Google Drive account. Perform a Sync first on your main computer."),z=null;return}}if(await d.window.showWarningMessage("Restoring from Google Drive will update local chat history and SQLite databases. A local backup snapshot will be created automatically. Proceed?","Yes, Restore","Cancel")!=="Yes, Restore"){M("Idle","$(cloud-check)"),z=null;return}await d.window.withProgress({location:d.ProgressLocation.Notification,title:"Antigravity Anywhere: Restoring all conversations from Google Drive...",cancellable:!1},async()=>{try{M("Restoring...","$(sync~spin)"),$(!0,20,"\u{1F4F8} Creating Safety Snapshot local backup...","\u{1F4E5} Restoring from Google Drive..."),await te.createSnapshot(r.antigravityDataDir),$(!0,45,"\u2601\uFE0F Downloading encrypted payload from Google Drive...","\u{1F4E5} Restoring from Google Drive...");let o=await t.downloadSyncPayload(n);$(!0,70,"\u{1F513} Decrypting payload & uncompressing files...","\u{1F4E5} Restoring from Google Drive...");let i=null,c=r.encryptionPassword;try{i=await ye(o,c)}catch{i=null}if(!i){let l=c?"\u274C Saved encryption password is incorrect. Please enter the valid Encryption Password:":"\u{1F511} This cloud backup is encrypted with a password. Please enter the Encryption Password:";for(;!i;){let g=await d.window.showInputBox({prompt:l,password:!0,ignoreFocusOut:!0,placeHolder:"Enter your encryption password..."});if(g===void 0)throw new Error("Restore canceled: Valid encryption password is required to decrypt cloud backup.");try{i=await ye(o,g.trim()),await me(g.trim()),d.window.showInformationMessage("\u{1F511} Antigravity Cloud: Valid encryption password saved!")}catch{l="\u274C Incorrect password. Please try again (or press Esc to cancel):"}}}let s=JSON.parse(i);$(!0,85,`\u{1F4C1} Restoring ${s.files?.length||0} transcript files and databases to disk...`,"\u{1F4E5} Restoring from Google Drive...");let a=await T.restoreBundle(r.antigravityDataDir,s);M("Restored","$(cloud-check)"),$(!0,100,`\u2705 Restored ${a} chat files! \u26A0\uFE0F Please Quit & Restart Antigravity IDE (Cmd+Q) to reload history.`,"\u{1F4E5} Restore Complete (Restart App)"),d.window.showInformationMessage(`Antigravity Cloud: Successfully restored ${a} conversation & database files! Please Quit & Restart Antigravity IDE to reload SQLite chat history.`,"\u{1F6AA} Quit Antigravity","\u{1F504} Reload Window","Later").then(l=>{l==="\u{1F6AA} Quit Antigravity"?d.commands.executeCommand("workbench.action.quit"):l==="\u{1F504} Reload Window"&&d.commands.executeCommand("workbench.action.reloadWindow")})}catch(o){M("Restore Error","$(error)"),$(!0,0,`\u274C Restore Failed: ${o.message}`,"Restore Error"),d.window.showErrorMessage(`Antigravity Anywhere Google Drive Restore Failed: ${o.message}`)}finally{z=null}})}function _e(r,t){let n=C.dirname(r),e=T.getAppSupportDir();if(t==="global-config")return[C.join(r,"config"),C.join(r,"state.vscdb"),C.join(r,"state.vscdb.backup"),C.join(n,"antigravity","config"),C.join(n,"antigravity-ide","config"),C.join(e,"shared_proto_db")];let o=[r,C.join(n,"antigravity"),C.join(n,"antigravity-ide")],i=[];for(let c of o)i.push(C.join(c,"brain",t),C.join(c,"conversations",`${t}.db`),C.join(c,"conversations",`${t}.db-wal`),C.join(c,"conversations",`${t}.db-shm`),C.join(c,"implicit",`${t}.pb`));return i}function M(r,t){Z&&(Z.text=`${t} Antigravity: ${r}`)}function st(){R&&R.stopWatching()}0&&(module.exports={activate,deactivate});
//# sourceMappingURL=extension.js.map
