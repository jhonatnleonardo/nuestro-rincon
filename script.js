// El acceso y los recuerdos compartidos se validan en el servidor.
const $ = id => document.getElementById(id);
let usuario='',urlMusica='',urlVideo='';
// Música y video incluidos, disponibles al volver a abrir la página.
$('musica').src='el-recuerdo.mp3';
$('nombreMusica').textContent='La Tormenta de Arena · El recuerdo';
$('fondoVideo').src='fondo.mp4';
function iniciarAmbiente(){
 if($('fondoVideo').getAttribute('src')){
  $('fondoVideo').style.display='block';
  $('fondoVideo').play().catch(()=>avisar('Inicia el video desde Música y fondo.'));
  $('pausarVideo').textContent='Pausar video';
 }
 $('musica').play().catch(()=>avisar('Pulsa reproducir en Música y fondo para escuchar la canción.'));
}
function leer(clave,defecto){try{return JSON.parse(localStorage.getItem(clave))??defecto;}catch{return defecto;}}
function guardar(clave,valor){try{localStorage.setItem(clave,JSON.stringify(valor));return true;}catch{avisar('El navegador no permite guardar los cambios.');return false;}}
function avisar(texto){$('aviso').textContent=texto;setTimeout(()=>$('aviso').textContent='',4500);}
function mostrar(id){document.querySelectorAll('.seccion').forEach(s=>s.hidden=s.id!==id);document.querySelectorAll('[data-seccion]').forEach(b=>b.classList.toggle('activo',b.dataset.seccion===id));if(id==='mensajes')dibujarNotas();}
document.querySelectorAll('[data-seccion]').forEach(b=>b.onclick=()=>mostrar(b.dataset.seccion));
$('verCarta').onclick=()=>mostrar('carta');
document.querySelector('header a').onclick=e=>{e.preventDefault();mostrar('inicio');};
function tema(noche){document.body.classList.toggle('noche',noche);$('tema').textContent=noche?'☀ Modo día':'☾ Modo noche';}
tema(leer('amor-noche',false));
$('tema').onclick=()=>{const noche=!document.body.classList.contains('noche');tema(noche);guardar('amor-noche',noche);};
const fechas=leer('amor-fechas',{});if(leer('amor-fechas-version','')!=='fechas-confirmadas-1'){fechas.conocimos='2023-10-02';fechas.juntos='2026-10-13';if(guardar('amor-fechas',fechas))guardar('amor-fechas-version','fechas-confirmadas-1');}$('conocimos').value=fechas.conocimos||'2023-10-02';$('juntos').value=fechas.juntos||'2026-10-13';
function contar(){const fecha=$('juntos').value;if(!fecha){$('contador').textContent='Tenemos tantos recuerdos por crear.';return;}const dias=Math.floor((Date.now()-new Date(fecha+'T00:00:00'))/86400000);$('contador').textContent=dias>=0?`${dias.toLocaleString('es')} días escribiendo nuestra historia.`:'Nuestra próxima aventura ya tiene fecha.';}
contar();$('guardarFechas').onclick=()=>{if(guardar('amor-fechas',{conocimos:$('conocimos').value,juntos:$('juntos').value}))avisar('Fechas guardadas ♡');contar();};
$('archivoMusica').onchange=()=>{const archivo=$('archivoMusica').files[0];if(!archivo)return;if(urlMusica)URL.revokeObjectURL(urlMusica);urlMusica=URL.createObjectURL(archivo);$('musica').src=urlMusica;$('nombreMusica').textContent=archivo.name;$('musica').play().catch(()=>avisar('Pulsa reproducir para escuchar la canción.'));};
$('musica').onerror=()=>avisar('No se pudo reproducir este audio. Prueba un archivo MP3.');
$('archivoVideo').onchange=()=>{const archivo=$('archivoVideo').files[0];if(!archivo)return;if(urlVideo)URL.revokeObjectURL(urlVideo);urlVideo=URL.createObjectURL(archivo);$('fondoVideo').src=urlVideo;$('fondoVideo').style.display='block';$('pausarVideo').textContent='Pausar video';$('fondoVideo').play().catch(()=>avisar('Pulsa el botón de video para reproducirlo.'));};
$('fondoVideo').onerror=()=>avisar('No se pudo reproducir este video. Prueba un archivo MP4.');
$('pausarVideo').onclick=()=>{const v=$('fondoVideo');if(!v.getAttribute('src')){avisar('Selecciona un video primero.');return;}if(v.paused){v.play().then(()=>$('pausarVideo').textContent='Pausar video').catch(()=>avisar('El video no se pudo reproducir.'));}else{v.pause();$('pausarVideo').textContent='Reproducir video';}};
$('quitarVideo').onclick=()=>{const v=$('fondoVideo');v.pause();v.removeAttribute('src');v.load();v.style.display='none';if(urlVideo)URL.revokeObjectURL(urlVideo);urlVideo='';$('archivoVideo').value='';};
const color=leer('amor-color','#fff7f1');if(/^#[0-9a-f]{6}$/i.test(color)){$('color').value=color;document.body.style.setProperty('--color-dia',color);}
$('color').oninput=e=>{document.body.classList.remove('noche');$('tema').textContent='☾ Modo noche';guardar('amor-noche',false);document.body.style.setProperty('--color-dia',e.target.value);guardar('amor-color',e.target.value);};

// Lista de canciones incluidas y canciones añadidas en este navegador.
(()=>{
 const audio=$('musica');audio.loop=false;
 let seleccion=0,base=null;
 const canciones=[{nombre:'La Tormenta de Arena · El recuerdo',src:'el-recuerdo.mp3'},...['AMOR4','AMOR','AMOR2','AMOR3'].map(nombre=>({nombre,src:`${nombre}.mp3`}))];
 function dibujar(){
  $('listaMusica').replaceChildren();
  canciones.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.className='suave cancion'+(i===seleccion?' elegida':'');b.textContent=(i===seleccion?'♫ ':'')+c.nombre;b.setAttribute('aria-pressed',String(i===seleccion));b.onclick=()=>reproducir(i);$('listaMusica').append(b);});
 }
 function reproducir(i){seleccion=(i+canciones.length)%canciones.length;const c=canciones[seleccion];audio.src=c.src;$('nombreMusica').textContent=c.nombre;dibujar();audio.play().catch(()=>avisar('Pulsa reproducir para escuchar la canción.'));}
 function agregar(f){canciones.push({nombre:f.name,src:URL.createObjectURL(f)});}
 $('musicaAnterior').onclick=()=>reproducir(seleccion-1);
 $('musicaSiguiente').onclick=()=>reproducir(seleccion+1);
 audio.onended=()=>reproducir(seleccion+1);
 if('indexedDB' in window){
  const apertura=indexedDB.open('nuestro-futuro-musica',1);
  apertura.onupgradeneeded=()=>apertura.result.createObjectStore('canciones',{autoIncrement:true});
  apertura.onsuccess=()=>{base=apertura.result;const q=base.transaction('canciones','readonly').objectStore('canciones').getAll();q.onsuccess=()=>{q.result.forEach(agregar);dibujar();};};
 }
 $('archivoMusica').onchange=()=>{
  const archivos=Array.from($('archivoMusica').files).filter(f=>f.type.startsWith('audio/')||/\.(mp3|mpeg|m4a|ogg|wav|aac|flac)$/i.test(f.name));
  if(!archivos.length){avisar('Selecciona archivos de música compatibles.');return;}
  const validos=archivos.filter(f=>f.size<=30*1024*1024);
  if(validos.length!==archivos.length)avisar('Solo se añaden canciones de hasta 30 MB.');
  if(!validos.length)return;
  const primera=canciones.length;validos.forEach(agregar);dibujar();reproducir(primera);$('archivoMusica').value='';
  if(base){const tx=base.transaction('canciones','readwrite');const tabla=tx.objectStore('canciones');validos.forEach(f=>tabla.add(f));tx.oncomplete=()=>avisar('Canciones añadidas y guardadas en este navegador ♡');tx.onabort=()=>avisar('Se pueden escuchar ahora, pero no se guardaron. Revisa el espacio del navegador.');}
  else avisar('Canciones añadidas para esta sesión. El navegador no pudo guardarlas.');
 };
 dibujar();
})();
