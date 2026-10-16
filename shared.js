// The only public configuration is the endpoint. No database secrets or password here.
const FUTURE_API='https://idlakvkniamrgvomfigq.supabase.co/functions/v1/nuestro-futuro';
let futureToken='';
try{futureToken=sessionStorage.getItem('future-session')||'';}catch{}
let messagesPage=[],photosPage=[],lastDeleted=null,messagesMore=false,photosMore=false;
let readingMessages=false,readingPhotos=false;
const photoUrls=new Map();
function sharedStatus(id,text){$(id).textContent=text;}
async function cloud(action,data,method){
 const headers={};if(futureToken)headers.Authorization='Bearer '+futureToken;
 const form=data instanceof FormData;
 if(data!==undefined&&!form)headers['Content-Type']='application/json';
 let response;try{response=await fetch(FUTURE_API+'?action='+action,{method:method||(data===undefined?'GET':'POST'),headers,body:data===undefined?undefined:form?data:JSON.stringify(data),signal:AbortSignal.timeout(45000)});}catch{throw Error('No se pudo conectar. Tus cambios no se guardaron todavía; revisa internet y vuelve a intentarlo.');}
 let result;try{result=await response.json();}catch{throw Error('El servidor no respondió. Vuelve a intentarlo.');}
 if(!response.ok){if(response.status===401&&action!=='login'){futureToken='';try{sessionStorage.removeItem('future-session');}catch{}$('pagina').hidden=true;$('entrada').hidden=false;$('musica').pause();$('fondoVideo').pause();$('error').textContent='La sesión terminó. Vuelve a entrar.';}throw Error(result.error||'No se pudo completar la acción.');}
 return result;
}
function openSharedPage(){usuario=$('perfil').value;$('entrada').hidden=true;$('pagina').hidden=false;$('error').textContent='';mostrar('inicio');iniciarAmbiente();loadMessages().catch(()=>{});loadPhotos().catch(()=>{});}
$('acceso').onsubmit=async e=>{
 e.preventDefault();const button=$('acceso').querySelector('button');button.disabled=true;button.textContent='Entrando…';$('error').textContent='';
 try{const result=await cloud('login',{password:$('clave').value});futureToken=result.token;try{sessionStorage.setItem('future-session',futureToken);}catch{}$('clave').value='';openSharedPage();}
 catch(error){$('error').textContent=error.message;}finally{button.disabled=false;button.textContent='Entrar a nuestro futuro ♡';}
};
$('salir').onclick=async()=>{const token=futureToken;$('musica').pause();$('fondoVideo').pause();$('pagina').hidden=true;$('entrada').hidden=false;try{await cloud('logout',{});}catch{}finally{if(futureToken===token)futureToken='';try{sessionStorage.removeItem('future-session');}catch{}messagesPage=[];photosPage=[];photoUrls.forEach(u=>URL.revokeObjectURL(u));photoUrls.clear();$('notas').replaceChildren();$('albumFotos').replaceChildren();$('clave').focus();}};
function messageCard(m){
 const card=document.createElement('article');card.className='papel';
 const author=document.createElement('strong');author.textContent=m.author;
 const text=document.createElement('p');text.textContent=m.body;
 const date=document.createElement('small');date.textContent=new Date(m.created_at).toLocaleString('es');
 const button=document.createElement('button');button.type='button';button.className='suave borrar-nota';button.textContent='Borrar mensaje';
 button.onclick=async()=>{button.disabled=true;try{await cloud('delete-message',{id:m.id});lastDeleted=m.id;await loadMessages();sharedStatus('estadoMensajes','Mensaje borrado para ambos. Puedes deshacerlo.');}catch(e){sharedStatus('estadoMensajes',e.message);button.disabled=false;}};
 const actions=document.createElement('div');actions.className='acciones-nota';actions.append(date,button);card.append(author,text,actions);return card;
}
function dibujarNotas(){
 $('notas').replaceChildren();
 if(lastDeleted){const undo=document.createElement('button');undo.type='button';undo.className='suave';undo.textContent='Deshacer último borrado';undo.onclick=async()=>{undo.disabled=true;try{await cloud('restore-message',{id:lastDeleted});lastDeleted=null;await loadMessages();}catch(e){sharedStatus('estadoMensajes',e.message);undo.disabled=false;}};$('notas').append(undo);}
 messagesPage.forEach(m=>$('notas').append(messageCard(m)));
 $('masMensajes').hidden=!messagesMore;
}
async function loadMessages(append=false){
 if(!futureToken||readingMessages)return;readingMessages=true;
 try{const offset=append?messagesPage.length:0;const result=await cloud('messages&offset='+offset);messagesPage=append?[...messagesPage,...result.items]:result.items;messagesMore=result.more;dibujarNotas();sharedStatus('estadoMensajes',messagesPage.length?'Mensajes compartidos · Se guardan para ambos.':'Aquí comienza nuestra colección de mensajes compartidos ♡');}
 catch(e){sharedStatus('estadoMensajes',e.message);throw e;}finally{readingMessages=false;}
}
$('masMensajes').onclick=()=>loadMessages(true).catch(()=>{});
let messageDraftId=null;
$('textoNota').oninput=()=>{messageDraftId=null;};
$('nuevaNota').onsubmit=async e=>{
 e.preventDefault();const body=$('textoNota').value.trim();if(!body)return;const b=$('nuevaNota').querySelector('button');b.disabled=true;b.textContent='Guardando…';messageDraftId ||= crypto.randomUUID();
 try{await cloud('message',{id:messageDraftId,body,author:$('autorMensaje').value.trim()||'Mi niña'});$('textoNota').value='';messageDraftId=null;await loadMessages();sharedStatus('estadoMensajes','Mensaje guardado. Ambos pueden verlo al entrar.');}
 catch(error){sharedStatus('estadoMensajes',error.message);}finally{b.disabled=false;b.textContent='Guardar mensaje ♡';}
};
function photoCard(p){
 const card=document.createElement('figure');card.className='papel foto-album';
 const img=document.createElement('img');img.src=p.url;img.alt=p.caption||p.kind;img.loading='lazy';
 const caption=document.createElement('figcaption'),kind=document.createElement('strong'),text=document.createElement('p'),date=document.createElement('small');kind.textContent=p.kind;text.textContent=p.caption;date.textContent=new Date(p.created_at).toLocaleDateString('es');
 const download=document.createElement('a');download.href=p.url;download.target='_blank';download.rel='noopener';download.textContent='Abrir foto original ↗';download.className='descargar-foto';caption.append(kind,text,date,download);card.append(img,caption);return card;
}
async function loadPhotos(append=false){
 if(!futureToken||readingPhotos)return;readingPhotos=true;
 try{const result=await cloud('photos&offset='+(append?photosPage.length:0));photosPage=append?[...photosPage,...result.items]:result.items;$('albumFotos').replaceChildren();photosPage.forEach(p=>$('albumFotos').append(photoCard(p)));$('masFotos').hidden=!result.more;sharedStatus('estadoFotos',photosPage.length?`${photosPage.length} fotos cargadas del álbum compartido.`:'Nuestro álbum está listo. Guarda la primera foto ♡');}
 catch(e){sharedStatus('estadoFotos',e.message);throw e;}finally{readingPhotos=false;}
}
$('masFotos').onclick=()=>loadPhotos(true).catch(()=>{});
let photoDraftId=null;
['fotoArchivo','fotoTipo','fotoTexto'].forEach(id=>$(id).addEventListener('change',()=>{photoDraftId=null;}));
$('subirFoto').onsubmit=async e=>{
 e.preventDefault();const file=$('fotoArchivo').files[0];if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){sharedStatus('estadoFotos','Elige una foto JPG, PNG o WebP de hasta 10 MB.');return;}
 const b=$('guardarFoto');b.disabled=true;b.textContent='Subiendo…';photoDraftId ||= crypto.randomUUID();
 const form=new FormData();form.set('id',photoDraftId);form.set('file',file);form.set('caption',$('fotoTexto').value.trim());form.set('kind',$('fotoTipo').value);
 try{await cloud('photo',form);$('subirFoto').reset();photoDraftId=null;await loadPhotos();sharedStatus('estadoFotos','Foto guardada en el álbum compartido. Ambos pueden verla.');}
 catch(error){sharedStatus('estadoFotos',error.message);}finally{b.disabled=false;b.textContent='Guardar foto ♡';}
};
// Only import browser-local data on an explicit click. Original local copies remain.
$('importarMensajes').onclick=async()=>{
 const b=$('importarMensajes');b.disabled=true;
 try{const local=leer('amor-futuro-mensajes',[]);if(!Array.isArray(local)||!local.length){sharedStatus('estadoMensajes','No hay mensajes locales para importar en este navegador.');return;}
 const ids=leer('future-imported-messages',{});
 for(let i=0;i<local.length;i++){const n=local[i];if(!n.texto)continue;const k=(n.fecha||'')+'|'+i;let id=ids[k];if(!id){id=crypto.randomUUID();ids[k]=id;if(!guardar('future-imported-messages',ids))throw Error('No se puede registrar la importación en este navegador.');}await cloud('message',{id,body:String(n.texto).slice(0,6000),author:n.usuario==='Leonardo'?'Leonardo':'Mi niña'});}
 await loadMessages();sharedStatus('estadoMensajes','Mensajes locales importados al espacio compartido.');
 }catch(e){sharedStatus('estadoMensajes',e.message);}finally{b.disabled=false;}
};
function oldPhotos(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window)){resolve([]);return;}let fresh=false;const q=indexedDB.open('nuestro-futuro-album');q.onupgradeneeded=()=>{fresh=true;};q.onerror=()=>reject(Error('No se pudo abrir el álbum local.'));q.onsuccess=()=>{const db=q.result;if(fresh||!db.objectStoreNames.contains('fotos')){db.close();resolve([]);return;}const get=db.transaction('fotos','readonly').objectStore('fotos').getAll();get.onerror=()=>{db.close();reject(Error('No se pudieron leer las fotos locales.'));};get.onsuccess=()=>{db.close();resolve(get.result);};};});}
$('importarFotos').onclick=async()=>{
 const b=$('importarFotos');b.disabled=true;
 try{const photos=await oldPhotos();if(!photos.length){sharedStatus('estadoFotos','No hay fotos locales en este navegador.');return;}const ids=leer('future-imported-photos',{});
 for(const p of photos){const k=String(p.id);let id=ids[k];if(!id){id=crypto.randomUUID();ids[k]=id;if(!guardar('future-imported-photos',ids))throw Error('No se puede registrar la importación en este navegador.');}const form=new FormData();form.set('id',id);form.set('file',p.archivo);form.set('caption',p.texto||'');form.set('kind',p.tipo||'Un recuerdo juntos');await cloud('photo',form);}
 await loadPhotos();sharedStatus('estadoFotos','Fotos locales importadas. Conservamos las copias de este navegador.');
 }catch(e){sharedStatus('estadoFotos',e.message);}finally{b.disabled=false;}
};
// The download is an offline copy of the original photos plus message metadata.
$('copiaRecuerdos').onclick=async()=>{
 const b=$('copiaRecuerdos');b.disabled=true;b.textContent='Preparando copia…';
 try{
 const allMessages=[],allPhotos=[];
  for(let offset=0;;offset+=100){const r=await cloud('messages&offset='+offset);allMessages.push(...r.items);if(!r.more)break;}
  for(let offset=0;;offset+=30){const r=await cloud('photos&offset='+offset);allPhotos.push(...r.items);if(!r.more)break;}
  const files=[];const names=[];let totalBytes=0;
  for(const p of allPhotos){const r=await fetch(p.url);if(!r.ok)throw Error('No se pudo descargar una foto. Vuelve a intentar la copia.');const bytes=new Uint8Array(await r.arrayBuffer());totalBytes+=bytes.length;if(totalBytes>200*1024*1024)throw Error('El álbum supera 200 MB. Guarda tus fotos originales por separado desde cada foto para evitar que tu dispositivo se quede sin memoria.');const name=p.object_path.split('/').pop();files.push({name,bytes});names.push({id:p.id,archivo:name,descripcion:p.caption,tipo:p.kind,fecha:p.created_at});}
  files.push({name:'mensajes-y-fotos.json',bytes:new TextEncoder().encode(JSON.stringify({fecha:new Date().toISOString(),mensajes:allMessages,fotos:names},null,2))});
  const blob=makeStoredZip(files),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nuestro-futuro-copia.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);avisar('Copia de recuerdos descargada ♡');
 }catch(e){avisar(e.message);}finally{b.disabled=false;b.textContent='Descargar copia de nuestros recuerdos';}
};
function makeStoredZip(files){
 const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 const chunks=[],central=[];let offset=0;
 function header(size){const b=new Uint8Array(size);return {b,v:new DataView(b.buffer)};}
 for(const f of files){let crc=0xffffffff;for(const n of f.bytes)crc=table[(crc^n)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;const name=new TextEncoder().encode(f.name),local=header(30+name.length);local.v.setUint32(0,0x04034b50,true);local.v.setUint16(4,20,true);local.v.setUint16(6,0x800,true);local.v.setUint32(14,crc,true);local.v.setUint32(18,f.bytes.length,true);local.v.setUint32(22,f.bytes.length,true);local.v.setUint16(26,name.length,true);local.b.set(name,30);chunks.push(local.b,f.bytes);const c=header(46+name.length);c.v.setUint32(0,0x02014b50,true);c.v.setUint16(4,20,true);c.v.setUint16(6,20,true);c.v.setUint16(8,0x800,true);c.v.setUint32(16,crc,true);c.v.setUint32(20,f.bytes.length,true);c.v.setUint32(24,f.bytes.length,true);c.v.setUint16(28,name.length,true);c.v.setUint32(42,offset,true);c.b.set(name,46);central.push(c.b);offset+=local.b.length+f.bytes.length;}
 const end=header(22),size=central.reduce((sum,c)=>sum+c.length,0);end.v.setUint32(0,0x06054b50,true);end.v.setUint16(8,files.length,true);end.v.setUint16(10,files.length,true);end.v.setUint32(12,size,true);end.v.setUint32(16,offset,true);return new Blob([...chunks,...central,end.b],{type:'application/zip'});
}
setInterval(()=>{if(!futureToken||$('pagina').hidden||document.hidden)return;const messages=$('mensajes');if(!messages.hidden&&messagesPage.length<=100)loadMessages().catch(()=>{});if(!$('fotos').hidden&&photosPage.length<=30)loadPhotos().catch(()=>{});},15000);
// The password screen remains the entry point after a reload; data persists on the server.
