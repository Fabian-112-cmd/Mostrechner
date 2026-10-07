'use strict';
// Getrennte Sitzung; vorhandene lokale Rechner-Einstellungen bleiben bestehen.
const mostLogin=document.getElementById('most-login');
const mostApp=document.getElementById('most-app');
const mostMessage=document.getElementById('most-login-message');
const mostAuth=window.supabase?.createClient('https://grrkvuqxjglfuynmxegv.supabase.co','sb_publishable_5P58BQr8tEksRLUqb8vmOg_uEM_MA24',{auth:{storageKey:'mostrechner-auth-v1',persistSession:true,autoRefreshToken:true}});
let mostAuthVersion=0;
function mostLock(){mostApp.hidden=true;mostLogin.hidden=false;}
async function mostCheck(session){
  const version=++mostAuthVersion;mostLock();
  if(!session)return;
  try{
    const result=await mostAuth.rpc('pau_app_allowed',{p_app:'mostrechner'});
    if(version!==mostAuthVersion)return;
    if(result.error)throw result.error;
    if(!result.data)throw Error('Dieser Benutzer ist nicht für den Mostrechner freigeschaltet.');
    mostMessage.textContent='';mostLogin.hidden=true;mostApp.hidden=false;
  }catch(error){if(version===mostAuthVersion)mostMessage.textContent=error.message||'Anmeldung konnte nicht geprüft werden. Bitte Internetverbindung prüfen.';}
}
document.getElementById('most-login-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.target,button=form.querySelector('button');button.disabled=true;
  mostMessage.textContent='Anmeldung wird geprüft …';
  try{
    if(!mostAuth)throw Error('Anmeldedienst nicht geladen. Bitte Internetverbindung prüfen und neu laden.');
    if(form.elements.username.value.trim().toLowerCase()!=='mostrechner')throw Error('Bitte Benutzername Mostrechner verwenden.');
    const result=await mostAuth.auth.signInWithPassword({email:'mostrechner@pau-apps.invalid',password:form.elements.password.value});
    if(result.error)throw result.error;
    form.elements.password.value='';await mostCheck(result.data.session);
  }catch(error){mostMessage.textContent=error.message;}finally{button.disabled=false;}
});
document.getElementById('most-logout').onclick=async()=>{
  if(!mostAuth)return;const result=await mostAuth.auth.signOut({scope:'local'});
  if(result.error){alert(result.error.message);return;}
  ++mostAuthVersion;mostLock();mostMessage.textContent='Abgemeldet';
};
if(mostAuth){
  mostAuth.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>mostCheck(session),0);});
  mostAuth.auth.getSession().then(({data,error})=>{if(error)mostMessage.textContent=error.message;else mostCheck(data.session);});
}else mostMessage.textContent='Anmeldedienst nicht geladen. Bitte Internetverbindung prüfen und neu laden.';
