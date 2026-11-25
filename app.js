'use strict';
const $ = s => document.querySelector(s);
const cle = 'oracle-favoris-v1';
let citations = [], courante = null, favoris = [], installation = null;
try { const data = JSON.parse(localStorage.getItem(cle) || '[]'); if(Array.isArray(data)) favoris = data.filter(c => c && Number.isInteger(c.id) && typeof c.citation === 'string' && typeof c.auteur === 'string' && typeof c.source === 'string'); } catch(e) { $('#stockage').textContent = 'Lecture des favoris impossible.'; }
function sauvegarder(prochains) {
  try { localStorage.setItem(cle, JSON.stringify(prochains)); favoris = prochains; $('#stockage').textContent = ''; return true; }
  catch(e) { $('#stockage').textContent = 'Sauvegarde impossible : vérifiez le stockage du navigateur.'; return false; }
}
function actualiserCoeur(){ const actif = !!courante && favoris.some(c => c.id === courante.id); $('#favori').setAttribute('aria-pressed', String(actif)); $('#favori').textContent = actif ? '♥ Retirer des favoris' : '♡ Ajouter aux favoris'; }
function basculer(c){ const existe = favoris.some(f => f.id === c.id); if(sauvegarder(existe ? favoris.filter(f => f.id !== c.id) : [...favoris,c])) { actualiserCoeur(); afficherFavoris(); } }
function afficherFavoris(){ const liste = $('#liste'); liste.replaceChildren(); $('#vide').hidden = favoris.length > 0; for(const c of favoris){ const article = document.createElement('article'); const q = document.createElement('blockquote'); q.textContent = `« ${c.citation} »`; const a = document.createElement('p'); a.textContent = c.auteur + ' — ' + c.source; const b = document.createElement('button'); b.textContent = '♥ Retirer des favoris'; b.addEventListener('click',()=>basculer(c)); article.append(q,a,b); liste.append(article); } }
function indexAleatoire(n){ const limite = Math.floor(2 ** 32 / n) * n; const valeur = new Uint32Array(1); do { crypto.getRandomValues(valeur); } while(valeur[0] >= limite); return valeur[0] % n; }
async function charger(){ try { const r = await fetch('./citations.json'); if(!r.ok) throw Error(r.status); const d = await r.json(); if(!Array.isArray(d)||!d.length||!d.every(c=>Number.isInteger(c.id)&&c.citation&&c.auteur&&c.source)||new Set(d.map(c=>c.id)).size!==d.length) throw Error('Banque invalide'); citations=d; $('#statut').textContent=`${d.length} citations disponibles`; $('#tirage').disabled=false; } catch(e){ $('#statut').textContent='Chargement impossible. Utilisez Live Server.'; console.error(e); } }
$('#tirage').addEventListener('click',()=>{ if(!citations.length)return; courante=citations[indexAleatoire(citations.length)]; $('#citation').textContent=`« ${courante.citation} »`; $('#auteur').textContent=courante.auteur; $('#source').textContent=courante.source; $('#tirage').textContent='Nouveau tirage'; $('#favori').hidden=false; actualiserCoeur(); });
$('#favori').addEventListener('click',()=>{if(courante)basculer(courante);});
for(const b of document.querySelectorAll('nav button')) b.addEventListener('click',()=>{for(const p of document.querySelectorAll('.page'))p.hidden=p.id!==b.dataset.page; for(const n of document.querySelectorAll('nav button'))n.removeAttribute('aria-current'); b.setAttribute('aria-current','page'); if(b.dataset.page==='favoris')afficherFavoris(); window.scrollTo(0,0);});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault(); installation=e; $('#installer').hidden=false;});
$('#installer').addEventListener('click',async()=>{if(!installation)return; const p=installation; installation=null; $('#installer').hidden=true; try{await p.prompt(); await p.userChoice;}catch(e){console.error(e);}});
window.addEventListener('appinstalled',()=>{$('#installer').hidden=true; installation=null;});
if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{$('#offline').textContent='Ressources mises en cache : mode hors connexion prêt.';}).catch(()=>{$('#offline').textContent='Mode hors connexion indisponible.';}); }else{$('#offline').textContent='Le mode hors connexion nécessite HTTPS ou localhost.';}
afficherFavoris(); charger();
