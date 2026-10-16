// CAMBIA AQUÍ SU CONTRASEÑA COMPARTIDA.
// Este acceso es visual: el código y el contenido se pueden inspeccionar.
const CONTRASENA = 'NuestroAmor';
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
$('acceso').onsubmit=e=>{e.preventDefault();if($('clave').value!==CONTRASENA){$('error').textContent='La contraseña no es correcta. Inténtalo otra vez.';return;}usuario=$('perfil').value;$('clave').value='';$('error').textContent='';$('entrada').hidden=true;$('pagina').hidden=false;mostrar('inicio');iniciarAmbiente();};
$('salir').onclick=()=>{usuario='';$('pagina').hidden=true;$('entrada').hidden=false;$('musica').pause();$('fondoVideo').pause();$('clave').focus();};
function tema(noche){document.body.classList.toggle('noche',noche);$('tema').textContent=noche?'☀ Modo día':'☾ Modo noche';}
tema(leer('amor-noche',false));
$('tema').onclick=()=>{const noche=!document.body.classList.contains('noche');tema(noche);guardar('amor-noche',noche);};
const fechas=leer('amor-fechas',{});if(leer('amor-fechas-version','')!=='fechas-confirmadas-1'){fechas.conocimos='2023-10-02';fechas.juntos='2026-10-13';if(guardar('amor-fechas',fechas))guardar('amor-fechas-version','fechas-confirmadas-1');}$('conocimos').value=fechas.conocimos||'2023-10-02';$('juntos').value=fechas.juntos||'2026-10-13';
function contar(){const fecha=$('juntos').value;if(!fecha){$('contador').textContent='Tenemos tantos recuerdos por crear.';return;}const dias=Math.floor((Date.now()-new Date(fecha+'T00:00:00'))/86400000);$('contador').textContent=dias>=0?`${dias.toLocaleString('es')} días escribiendo nuestra historia.`:'Nuestra próxima aventura ya tiene fecha.';}
contar();$('guardarFechas').onclick=()=>{if(guardar('amor-fechas',{conocimos:$('conocimos').value,juntos:$('juntos').value}))avisar('Fechas guardadas ♡');contar();};
let notas=leer('amor-futuro-mensajes',[]);if(!Array.isArray(notas))notas=[];
let borrada=null;
function dibujarNotas(){
 const lista=$('notas');lista.replaceChildren();
 if(borrada){const caja=document.createElement('p');caja.textContent='Mensaje borrado. ';const b=document.createElement('button');b.type='button';b.className='suave';b.textContent='Deshacer';b.onclick=()=>{const copia=notas.slice();copia.splice(Math.min(borrada.indice,copia.length),0,borrada.nota);if(guardar('amor-futuro-mensajes',copia)){notas=copia;borrada=null;dibujarNotas();}};caja.append(b);lista.append(caja);}
 notas.forEach((nota,indice)=>{const tarjeta=document.createElement('article');tarjeta.className='papel';const autor=document.createElement('strong');autor.textContent=nota.usuario==='Mi niña'?'Mi niña':nota.usuario==='Leonardo'?'Él':'Ella';const texto=document.createElement('p');texto.textContent=nota.texto;const fecha=document.createElement('small');fecha.textContent=new Date(nota.fecha).toLocaleString('es');const b=document.createElement('button');b.type='button';b.className='suave borrar-nota';b.textContent='Borrar mensaje';b.onclick=()=>{const copia=notas.filter((_,i)=>i!==indice);if(guardar('amor-futuro-mensajes',copia)){borrada={nota,indice};notas=copia;dibujarNotas();}};const acciones=document.createElement('div');acciones.className='acciones-nota';acciones.append(fecha,b);tarjeta.append(autor,texto,acciones);lista.prepend(tarjeta);});
}
$('nuevaNota').onsubmit=e=>{e.preventDefault();const texto=$('textoNota').value.trim();if(!texto)return;const copia=[...notas,{usuario,texto,fecha:new Date().toISOString()}].slice(-200);if(guardar('amor-futuro-mensajes',copia)){notas=copia;$('textoNota').value='';dibujarNotas();avisar('Mensaje guardado ♡');}};
$('archivoMusica').onchange=()=>{const archivo=$('archivoMusica').files[0];if(!archivo)return;if(urlMusica)URL.revokeObjectURL(urlMusica);urlMusica=URL.createObjectURL(archivo);$('musica').src=urlMusica;$('nombreMusica').textContent=archivo.name;$('musica').play().catch(()=>avisar('Pulsa reproducir para escuchar la canción.'));};
$('musica').onerror=()=>avisar('No se pudo reproducir este audio. Prueba un archivo MP3.');
$('archivoVideo').onchange=()=>{const archivo=$('archivoVideo').files[0];if(!archivo)return;if(urlVideo)URL.revokeObjectURL(urlVideo);urlVideo=URL.createObjectURL(archivo);$('fondoVideo').src=urlVideo;$('fondoVideo').style.display='block';$('pausarVideo').textContent='Pausar video';$('fondoVideo').play().catch(()=>avisar('Pulsa el botón de video para reproducirlo.'));};
$('fondoVideo').onerror=()=>avisar('No se pudo reproducir este video. Prueba un archivo MP4.');
$('pausarVideo').onclick=()=>{const v=$('fondoVideo');if(!v.getAttribute('src')){avisar('Selecciona un video primero.');return;}if(v.paused){v.play().then(()=>$('pausarVideo').textContent='Pausar video').catch(()=>avisar('El video no se pudo reproducir.'));}else{v.pause();$('pausarVideo').textContent='Reproducir video';}};
$('quitarVideo').onclick=()=>{const v=$('fondoVideo');v.pause();v.removeAttribute('src');v.load();v.style.display='none';if(urlVideo)URL.revokeObjectURL(urlVideo);urlVideo='';$('archivoVideo').value='';};
const color=leer('amor-color','#fff7f1');if(/^#[0-9a-f]{6}$/i.test(color)){$('color').value=color;document.body.style.setProperty('--color-dia',color);}
$('color').oninput=e=>{document.body.classList.remove('noche');$('tema').textContent='☾ Modo noche';guardar('amor-noche',false);document.body.style.setProperty('--color-dia',e.target.value);guardar('amor-color',e.target.value);};

// Álbum local: IndexedDB conserva las fotos sin publicarlas en GitHub.
(()=>{
 let baseFotos=null;
 const urlsFotos=[];
 const estado=$('estadoFotos'),boton=$('guardarFoto');
 boton.disabled=true;
 if(!('indexedDB' in window)){estado.textContent='Este navegador no permite guardar fotos. Prueba en Chrome.';return;}
 const apertura=indexedDB.open('nuestro-futuro-album',1);
 apertura.onupgradeneeded=()=>apertura.result.createObjectStore('fotos',{keyPath:'id',autoIncrement:true});
 apertura.onerror=()=>{estado.textContent='No se pudo abrir el álbum. Revisa los permisos de almacenamiento del navegador.';};
 apertura.onsuccess=()=>{baseFotos=apertura.result;boton.disabled=false;dibujarFotos();};
 function dibujarFotos(){
  const consulta=baseFotos.transaction('fotos','readonly').objectStore('fotos').getAll();
  consulta.onerror=()=>{estado.textContent='No se pudo leer el álbum.';};
  consulta.onsuccess=()=>{
   urlsFotos.forEach(u=>URL.revokeObjectURL(u));urlsFotos.length=0;
   $('albumFotos').replaceChildren();
   const fotos=consulta.result.reverse();estado.textContent=fotos.length?`${fotos.length} foto${fotos.length===1?'':'s'} en nuestro álbum.`:'Todavía no hay fotos. Guarda el primer recuerdo o sueño ♡';
   fotos.forEach(f=>{
    const figura=document.createElement('figure');figura.className='papel foto-album';
    const foto=document.createElement('img');foto.src=URL.createObjectURL(f.archivo);urlsFotos.push(foto.src);foto.alt=f.texto||f.tipo;foto.loading='lazy';
    const pie=document.createElement('figcaption'),tipo=document.createElement('strong'),texto=document.createElement('p'),fecha=document.createElement('small');
    tipo.textContent=f.tipo;texto.textContent=f.texto;fecha.textContent=new Date(f.fecha).toLocaleDateString('es');pie.append(tipo,texto,fecha);figura.append(foto,pie);$('albumFotos').append(figura);
   });
  };
 }
 $('subirFoto').onsubmit=e=>{
  e.preventDefault();if(!baseFotos)return;
  const archivo=$('fotoArchivo').files[0];if(!archivo)return;
  if(!['image/jpeg','image/png','image/webp'].includes(archivo.type)){estado.textContent='Elige una foto JPG, PNG o WebP.';return;}
  if(archivo.size>10*1024*1024){estado.textContent='La foto supera los 10 MB. Elige una más pequeña.';return;}
  boton.disabled=true;boton.textContent='Guardando…';
  const transaccion=baseFotos.transaction('fotos','readwrite');
  transaccion.objectStore('fotos').add({archivo,texto:$('fotoTexto').value.trim(),tipo:$('fotoTipo').value,fecha:new Date().toISOString()});
  transaccion.oncomplete=()=>{$('subirFoto').reset();boton.disabled=false;boton.textContent='Guardar foto ♡';dibujarFotos();avisar('Foto guardada en este dispositivo ♡');};
  transaccion.onabort=()=>{boton.disabled=false;boton.textContent='Guardar foto ♡';estado.textContent='No se pudo guardar la foto. Puede que no haya espacio disponible.';};
 };
})();

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
