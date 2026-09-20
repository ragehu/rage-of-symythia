'use strict';
const catalog = window.CATALOG;
const byId = new Map(catalog.map(item => [item.id, item]));
const parts = ['Lucifer Ascension', 'Lucifer Dominion', 'Saviour'];
const roman = ['I', 'II', 'III'];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const displayTitle = item => item.title.replace(/^Rage of Symythia - /, '');
const imageButton = (item, album = false) => `<button class="image-button" data-play="${item.id}" aria-label="${escapeHTML((album ? 'Listen to ' : 'Play ') + item.title)}"><img src="assets/${item.id}.jpg" alt="${escapeHTML(item.title)} artwork" loading="lazy" width="1280" height="720"><span class="play" aria-hidden="true">▷</span></button>`;
const description = item => `<details class="source-description"><summary>${item.kind === 'album' ? 'Album story & tracklist' : 'Original description'}</summary><div class="description">${escapeHTML(item.description)}</div></details>`;
function card(item) {
  return `<article class="video-card">${imageButton(item)}<p class="eyebrow">${item.part ? `Part ${roman[item.part-1]} · ${parts[item.part-1]}` : 'Standalone story'}</p><h4>${escapeHTML(displayTitle(item))}</h4>${description(item)}</article>`;
}
document.querySelector('#albums').innerHTML = catalog.filter(item => item.kind === 'album').map(item => `<article class="album">${imageButton(item,true)}<div class="album-meta"><span class="roman" aria-hidden="true">${roman[item.part-1]}</span><div><p class="eyebrow">Part ${roman[item.part-1]} · Full album</p><h3>${parts[item.part-1]}</h3></div></div><button class="text-button" data-play="${item.id}">Listen to the full album <span aria-hidden="true">↗</span></button>${description(item)}</article>`).join('');
document.querySelector('#trilogy-videos').innerHTML = [3,6,4,5,8,2,7].map(index => card(catalog[index])).join('');
document.querySelector('#standalone-videos').innerHTML = catalog.filter(item => item.kind === 'video' && !item.part).map(card).join('');
document.querySelector('#featured-description .description').textContent = catalog[0].description;
const player = document.querySelector('#player');
const frame = document.querySelector('#player-frame');
if (location.protocol === 'file:') {
  const notice = document.createElement('div');
  notice.className = 'local-file-notice';
  notice.setAttribute('role', 'status');
  notice.textContent = 'A videók lejátszásához zárd be ezt a lapot, és indítsd el a mappában található START-WEBSITE.cmd fájlt. Az index.html közvetlen megnyitását a YouTube nem támogatja megfelelően.';
  document.querySelector('main').prepend(notice);
}
let opener;
let currentVideo;
function playVideo(id, trigger) {
  const item = byId.get(id);
  if (!item) return;
  opener = trigger;
  currentVideo = id;
  document.querySelector('#player-title').textContent = item.title;
  document.querySelector('#player-category').textContent = item.part ? `Lucifer Trilogy · Part ${roman[item.part-1]} · ${item.kind === 'album' ? 'Full album' : 'Music video'}` : 'Other Worlds · Standalone story';
  document.querySelector('#player-description').textContent = item.description;
  document.querySelector('#youtube-link').href = item.url;
  player.querySelector('details').open = false;
  const iframe = document.createElement('iframe');
  const url = new URL(`https://www.youtube.com/embed/${item.id}`);
  // Full albums always begin at the start; original timestamped URLs remain in catalog.js.
  url.search = new URLSearchParams({autoplay:'1',playsinline:'1',rel:'0',fs:'1'}).toString();
  // Identify the actual embedding site, including local previews and Pages subpaths.
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    url.searchParams.set('origin', location.origin);
    url.searchParams.set('widget_referrer', location.href.split('#')[0]);
  }
  iframe.title = item.title;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.src = url.href;
  frame.replaceChildren(iframe);
  document.body.classList.add('modal-open');
  player.showModal();
  document.querySelector('#close-player').focus();
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-play]');
  if (trigger) playVideo(trigger.dataset.play, trigger);
});
document.querySelector('#close-player').addEventListener('click', () => player.close());
document.querySelector('#retry-player').addEventListener('click', () => {
  const iframe = frame.querySelector('iframe');
  if (!iframe) return;
  const url = new URL(iframe.src);
  url.searchParams.set('reload', Date.now().toString());
  iframe.src = url.href;
});
player.addEventListener('click', event => {
  const bounds = player.getBoundingClientRect();
  if (event.target === player && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) player.close();
});
player.addEventListener('close', () => {
  frame.replaceChildren();
  document.body.classList.remove('modal-open');
  opener?.focus({preventScroll:true});
});

// The original concept's compact music shelf, using only verified catalog entries.
document.querySelector('#preview-videos').innerHTML = [3,2,0,1].map(index => card(catalog[index])).join('');
document.querySelector('#lyrics-link').addEventListener('click', () => {document.querySelector('#featured-description').open = true;});