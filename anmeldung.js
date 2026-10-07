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

// Dasselbe Konto-Passwort für Anmeldung und Öffnen der Einstellungen.
async function mostVerifyAccountPassword(password){
 if(!mostAuth)throw Error('Anmeldedienst nicht geladen.');
 const userResult=await mostAuth.auth.getUser();if(userResult.error)throw userResult.error;
 const user=userResult.data.user;if(!user)throw Error('Bitte zuerst anmelden.');
 const permission=await mostAuth.rpc('pau_app_allowed',{p_app:'mostrechner'});if(permission.error)throw permission.error;
 if(!permission.data)throw Error('Keine Berechtigung für den Mostrechner.');
 const check=await mostAuth.auth.signInWithPassword({email:user.email,password});if(check.error)throw check.error;
 if(check.data.user.id!==user.id)throw Error('Das Konto hat sich geändert. Bitte erneut anmelden.');
}
async function mostSetLoginPassword(current,next,again){
 if(next!==again)throw Error('Die neuen Passwörter stimmen nicht überein.');
 if(next.length<6)throw Error('Das Anmeldepasswort braucht mindestens 6 Zeichen.');
 if(next===current)throw Error('Bitte ein anderes neues Passwort wählen.');
 if(!mostAuth)throw Error('Anmeldedienst nicht geladen.');
 await mostVerifyAccountPassword(current);
 const result=await mostAuth.auth.updateUser({password:next});if(result.error)throw result.error;
}
function mostPasswordWindow(kind){
 return new Promise(resolve=>{
  if(mostApp.hidden){resolve(false);return;}
  const unlock=kind==='unlock';
  const dialog=document.createElement('dialog');dialog.className='most-password-dialog';
  dialog.innerHTML=`<form><h2>${unlock?'Einstellungen entsperren':'Anmeldepasswort ändern'}</h2><label>${unlock?'Einstellungs-Passwort':'Aktuelles Passwort'}<input name="current" type="password" autocomplete="current-password" required></label>${unlock?'':`<label>Neues Passwort<input name="next" type="password" minlength="6" autocomplete="new-password" required></label><label>Neues Passwort wiederholen<input name="again" type="password" minlength="6" autocomplete="new-password" required></label>`}<p>Dasselbe Passwort gilt auf allen Geräten für Anmeldung und Einstellungen.</p><p class="error" role="alert"></p><div class="actions"><button type="button" data-cancel>Abbrechen</button><button class="primary" type="submit">${unlock?'Entsperren':'Speichern'}</button></div></form>`;
  document.body.append(dialog);dialog.showModal();
  let busy=false,success=false;
  dialog.querySelector('[data-cancel]').onclick=()=>{if(!busy)dialog.close();};
  dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  dialog.addEventListener('close',()=>{dialog.remove();resolve(success);},{once:true});
  dialog.querySelector('form').onsubmit=async e=>{
   e.preventDefault();if(busy)return;busy=true;
   const form=e.target,fields=form.elements;const buttons=form.querySelectorAll('button');buttons.forEach(b=>b.disabled=true);
   try{
    if(mostApp.hidden)throw Error('Bitte zuerst erneut anmelden.');
    if(unlock)await mostVerifyAccountPassword(fields.current.value);
    else await mostSetLoginPassword(fields.current.value,fields.next.value,fields.again.value);
    success=true;form.reset();dialog.close();
    if(!unlock)alert('Passwort für Anmeldung und Einstellungen geändert.');
   }catch(error){form.querySelector('.error').textContent=error.message||'Passwort konnte nicht geändert werden.';}
   finally{busy=false;buttons.forEach(b=>b.disabled=false);}
  };
 });
}
function mostUnlockSettings(){return mostPasswordWindow('unlock');}
document.getElementById('most-change-login').onclick=()=>mostPasswordWindow('login');

