// CAMBIA AQUÍ SU CONTRASEÑA COMPARTIDA.
// Este acceso es visual: el código y el contenido se pueden inspeccionar.
const CONTRASENA = 'NuestroAmor';
const $ = id => document.getElementById(id);
let usuario='',urlMusica='',urlVideo='';
// Música y video incluidos, disponibles al volver a abrir la página.
$('musica').src='AMOR4.mp3';
$('nombreMusica').textContent='AMOR4 · Nuestra canción';
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
function mostrar(id){document.querySelectorAll('.seccion').forEach(s=>s.hidden=s.id!==id);document.querySelectorAll('[data-seccion]').forEach(b=>b.classList.toggle('activo',b.dataset.seccion===id));}
document.querySelectorAll('[data-seccion]').forEach(b=>b.onclick=()=>mostrar(b.dataset.seccion));
$('verCarta').onclick=()=>mostrar('carta');
document.querySelector('header a').onclick=e=>{e.preventDefault();mostrar('inicio');};
$('acceso').onsubmit=e=>{e.preventDefault();if($('clave').value!==CONTRASENA){$('error').textContent='La contraseña no es correcta. Inténtalo otra vez.';return;}usuario=$('perfil').value;$('clave').value='';$('error').textContent='';$('entrada').hidden=true;$('pagina').hidden=false;mostrar('inicio');iniciarAmbiente();};
$('salir').onclick=()=>{usuario='';$('pagina').hidden=true;$('entrada').hidden=false;$('musica').pause();$('fondoVideo').pause();$('clave').focus();};
function tema(noche){document.body.classList.toggle('noche',noche);$('tema').textContent=noche?'☀ Modo día':'☾ Modo noche';}
tema(leer('amor-noche',false));
$('tema').onclick=()=>{const noche=!document.body.classList.contains('noche');tema(noche);guardar('amor-noche',noche);};
const fechas=leer('amor-fechas',{});$('conocimos').value=fechas.conocimos||'';$('juntos').value=fechas.juntos||'';
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
