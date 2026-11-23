/* FJ Internet Status Card v1.0.1 — original standalone Home Assistant Lovelace card — MIT */
(() => {
  const TYPE = 'fj-internet-status-card';
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
  class FJInternetStatusCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      this._timer = null;
      this._lastKey = '';
    }
    setConfig(config) {
      if (!config.entity || !config.entity.startsWith('binary_sensor.')) {
        throw new Error('Sélectionnez une entité binary_sensor.* provenant de Ping (ICMP).');
      }
      this.config = {title:'Connexion Internet', host:'8.8.8.8', ...config};
      this._lastKey = '';
      this.render();
    }
    set hass(hass) { this._hass = hass; this.render(); }
    connectedCallback() {
      if (!this._timer) this._timer = setInterval(() => this.render(), 10000);
      this.render();
    }
    disconnectedCallback() { clearInterval(this._timer); this._timer = null; }
    getCardSize() { return 3; }
    static getConfigElement() { return document.createElement('fj-internet-status-card-editor'); }
    static getStubConfig(hass) {
      const ids = Object.keys(hass?.states || {}).filter(id => id.startsWith('binary_sensor.'));
      const preferred = ids.find(id => /internet|ping|connexion/i.test(id));
      return {entity: preferred || ids[0] || 'binary_sensor.connexion_internet', title:'Connexion Internet', host:'8.8.8.8'};
    }
    elapsed(state) {
      if (!state?.last_changed) return 'Durée inconnue';
      const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(state.last_changed)) / 60000));
      if (minutes < 1) return 'À l’instant';
      if (minutes < 60) return 'Depuis ' + minutes + ' min';
      if (minutes < 1440) return 'Depuis ' + Math.floor(minutes/60) + ' h ' + (minutes%60) + ' min';
      return 'Depuis ' + Math.floor(minutes/1440) + ' j ' + Math.floor((minutes%1440)/60) + ' h';
    }
    render() {
      if (!this.isConnected || !this._hass || !this.config) return;
      const entity = this._hass.states[this.config.entity];
      const state = entity?.state ?? 'unavailable';
      const online = state === 'on';
      const offline = state === 'off';
      const dark = typeof this._hass.themes?.darkMode === 'boolean'
        ? this._hass.themes.darkMode
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const label = online ? 'Connecté' : offline ? 'Déconnecté' : 'Indisponible';
      const duration = this.elapsed(entity);
      const title = escapeHTML(this.config.title);
      const host = escapeHTML(this.config.host);
      const key = JSON.stringify([state, entity?.last_changed, dark, title, host, duration]);
      if (key === this._lastKey) return;
      this._lastKey = key;
      const accent = online ? (dark ? '#287D60' : '#247155') : offline ? '#C44B4B' : '#89918D';
      this.shadowRoot.innerHTML = `
        <style>
          :host { display:block; --fj-card:${dark?'#101412':'#FFFFFF'}; --fj-panel:${dark?'#171C19':'#F0F2EF'};
            --fj-outline:${dark?'#303632':'#DEE4DD'}; --fj-text:${dark?'#FFFFFF':'#202720'};
            --fj-muted:${dark?'#AAB1AD':'#555F58'}; --fj-button:${dark?'#0D100F':'#FFFFFF'}; --fj-accent:${accent}; }
          ha-card { box-sizing:border-box; border:1px solid var(--fj-outline); border-radius:22px;
            background:var(--fj-card); color:var(--fj-text); padding:20px; overflow:hidden; }
          .eyebrow { color:var(--fj-muted); font-size:11px; letter-spacing:1.5px; font-weight:700; }
          .title { font-size:21px; font-weight:700; margin:6px 0 16px; }
          .panel { background:var(--fj-panel); border:1px solid var(--fj-outline); border-radius:20px;
            padding:16px; display:flex; gap:16px; align-items:center; }
          .dial { box-sizing:border-box; flex-shrink:0; width:142px; height:142px; border-radius:50%;
            border:7px solid var(--fj-accent); display:flex; flex-direction:column; align-items:center;
            justify-content:center; text-align:center; padding:8px; }
          .dial svg { width:42px; height:42px; color:var(--fj-accent); }
          .status { font-weight:750; font-size:13px; margin-top:6px; }
          .time { color:var(--fj-muted); font-size:10px; margin-top:4px; }
          .details { min-width:0; flex:1; display:flex; flex-direction:column; gap:10px; }
          .pill { box-sizing:border-box; padding:13px 8px; text-align:center; border-radius:30px;
            font-size:13px; font-weight:700; overflow-wrap:anywhere; }
          .primary { background:var(--fj-accent); color:white; }
          .secondary { background:var(--fj-button); border:1px solid var(--fj-outline); color:var(--fj-text); }
          @media(max-width:380px) { .panel{padding:10px;gap:9px}.dial{width:115px;height:115px}
            .pill{padding:10px 5px;font-size:11px} }
        </style>
        <ha-card>
          <div class="eyebrow">FJ INTERNET STATUS CARD</div>
          <div class="title">${title}</div>
          <div class="panel">
            <div class="dial" role="status" aria-live="polite">
              <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="19" stroke="currentColor" stroke-width="3"/>
                <path d="M5 24h38M24 5c-7 7-10 14-10 19s3 12 10 19M24 5c7 7 10 14 10 19s-3 12-10 19M10 14h28M10 34h28"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <div class="status">${label}</div>
              <div class="time">${escapeHTML(duration)}</div>
            </div>
            <div class="details">
              <div class="pill primary">${online?'✓ Internet actif':offline?'✕ Hors ligne':'? État inconnu'}</div>
              <div class="pill secondary">${host}</div>
            </div>
          </div>
        </ha-card>`;
    }
  }
  if (!customElements.get(TYPE)) customElements.define(TYPE, FJInternetStatusCard);
  class FJInternetStatusCardEditor extends HTMLElement {
    constructor() { super(); this.attachShadow({mode:'open'}); }
    setConfig(config) { this.config = config; this.render(); }
    set hass(hass) { this._hass = hass; this.render(); }
    render() {
      if (!this.config || !this._hass) return;
      const ids = Object.keys(this._hass.states).filter(id => id.startsWith('binary_sensor.'));
      const esc = escapeHTML;
      this.shadowRoot.innerHTML = `
        <style>label{display:block;margin:12px 0 5px}select,input{width:100%;box-sizing:border-box;padding:10px}</style>
        <label for="entity">Capteur Ping</label>
        <select id="entity">${ids.map(id=>`<option value="${esc(id)}" ${id===this.config.entity?'selected':''}>${esc(id)}</option>`).join('')}</select>
        <label for="title">Titre</label><input id="title" value="${esc(this.config.title||'Connexion Internet')}">
        <label for="host">Adresse surveillée (affichage)</label><input id="host" value="${esc(this.config.host||'8.8.8.8')}">
      `;
      for (const id of ['entity','title','host']) {
        this.shadowRoot.getElementById(id).addEventListener('change', () => {
          const next = {...this.config};
          for (const field of ['entity','title','host']) next[field] = this.shadowRoot.getElementById(field).value;
          this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:next},bubbles:true,composed:true}));
        });
      }
    }
  }
  if (!customElements.get('fj-internet-status-card-editor')) customElements.define('fj-internet-status-card-editor',FJInternetStatusCardEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some(card => card.type === TYPE)) {
    window.customCards.push({type:TYPE,name:'FJ Internet Status Card',description:'Statut Internet depuis un capteur Ping, en français québécois'});
  }
})();