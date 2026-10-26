/* Logo führt in die eigene Startübersicht, ohne Neuladen oder Abmelden. */
(()=>{
'use strict';
const kind=document.currentScript?.dataset.appHome;
const selector={hauptapp:'main.wrap>header .brand img',infotafel:'#application>header .brand img',mostrechner:'#most-app .winery-mark img',weintour:'header h1 img',kasse:'header .brand .mark'}[kind];
if(!selector)return;
const logo=document.querySelector(selector);if(!logo)return;
const button=document.createElement('button');button.type='button';button.className='app-home-logo-v1';button.setAttribute('aria-label','Zur Startübersicht');button.title='Zur Startübersicht';
logo.replaceWith(button);button.append(logo);
const style=document.createElement('style');style.textContent='.app-home-logo-v1{display:inline-flex!important;align-items:center;justify-content:center;border:0!important;background:transparent!important;padding:0!important;margin:0!important;width:auto!important;min-height:0!important;flex:0 0 auto;cursor:pointer;border-radius:12px;color:inherit;box-shadow:none!important;vertical-align:middle}.app-home-logo-v1:focus-visible{outline:3px solid #a88ab8;outline-offset:4px}.app-home-logo-v1 img{display:block}.app-home-logo-v1:hover{opacity:.87}';document.head.append(style);
button.onclick=()=>{
 if(kind==='hauptapp'||kind==='weintour'){document.getElementById('back')?.click();return}
 if(kind==='kasse'){document.querySelector('nav [data-view="sale"]')?.click();return}
 if(kind==='mostrechner'){
  const panel=document.getElementById('settingsPanel');
  if(panel&&!panel.hidden){if(!confirm('Zur Berechnung zurückkehren? Nicht gespeicherte Einstellungen werden verworfen.'))return;document.getElementById('closeSettings')?.click()}
 }
 if(kind==='infotafel')document.querySelectorAll('header details[open]').forEach(x=>x.open=false);
 window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
};
})();
