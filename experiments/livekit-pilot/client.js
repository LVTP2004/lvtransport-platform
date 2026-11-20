// Isolated browser pilot. No LVTransport auth/booking integration.
const $ = id => document.getElementById(id);
const status = text => { $('state').textContent = text; };
let room=null, micOn=false, camOn=false;
const media = $('remoteMedia');
const local = $('localMedia');
const remoteTracks = new Map();
const setButtons=connected=>{
  $('join').disabled=connected;
  $('role').disabled=connected;
  $('leave').disabled=!connected;
  $('mic').disabled=!connected;
  $('cam').disabled=!connected;
};

function clearMedia() {
  for (const [track, element] of remoteTracks) { track.detach(element); element.remove(); }
  remoteTracks.clear(); media.replaceChildren(); local.replaceChildren();
}
async function join() {
  if (room) return;
  const SDK=window.LivekitClient;
  if (!SDK?.Room) { status('No se pudo cargar el cliente LiveKit.'); return; }
  $('join').disabled=true;
  try {
    const response = await fetch('/token', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({role:$('role').value}),cache:'no-store'
    });
    if (!response.ok) throw Error('No se pudo obtener acceso local');
    const {token,serverUrl}=await response.json();
    room=new SDK.Room({adaptiveStream:true,dynacast:true});
    room.on(SDK.RoomEvent.TrackSubscribed,(track)=>{
      if (track.kind !== SDK.Track.Kind.Audio && track.kind !== SDK.Track.Kind.Video) return;
      const element=track.attach();
      if(track.kind===SDK.Track.Kind.Video) element.playsInline=true;
      element.autoplay=true; media.appendChild(element); remoteTracks.set(track,element);
    });
    room.on(SDK.RoomEvent.TrackUnsubscribed,track=>{
      const el=remoteTracks.get(track);
      if(el){track.detach(el); el.remove(); remoteTracks.delete(track);}
    });
    room.on(SDK.RoomEvent.Disconnected,()=>{
      room=null;micOn=false;camOn=false;clearMedia();setButtons(false);
      $('mic').textContent='Activar micrófono';$('cam').textContent='Activar cámara';
      status('Desconectado');
    });
    await room.connect(serverUrl,token);
    setButtons(true);
    status('Conectado. Activa el micrófono o la cámara cuando quieras.');
  } catch(e) {
    if(room) await room.disconnect().catch(()=>{});
    room=null;setButtons(false);status('Conexión fallida. Comprueba LiveKit en 127.0.0.1:7880.');
  }
}
$('join').addEventListener('click',join);
$('leave').addEventListener('click',async()=>{if(room) await room.disconnect();});
$('mic').addEventListener('click',async()=>{
  if(!room)return;
  try {
    await room.localParticipant.setMicrophoneEnabled(!micOn);
    micOn=!micOn;$('mic').textContent=micOn?'Silenciar micrófono':'Activar micrófono';
  }catch{status('No se pudo activar el micrófono. Revisa los permisos del navegador.');}
});
$('cam').addEventListener('click',async()=>{
  if(!room)return;
  try {
    await room.localParticipant.setCameraEnabled(!camOn);
    camOn=!camOn; $('cam').textContent=camOn?'Apagar cámara':'Activar cámara';
    local.replaceChildren();
    if(camOn) for(const publication of room.localParticipant.videoTrackPublications.values()) {
      const element=publication.videoTrack?.attach();
      if(element){element.muted=true;element.playsInline=true;local.appendChild(element);}
    }
  }catch{status('No se pudo activar la cámara. Revisa los permisos o úsala solo en una pestaña.');}
});
window.addEventListener('pagehide',()=>{room?.disconnect();});
