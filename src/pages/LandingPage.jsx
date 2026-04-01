import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --g50:#f0faf4; --g100:#d6f2e2; --g200:#aee4c5; --g300:#6ecf96;
      --g400:#4caf7d; --g500:#2E7D32; --g600:#1b5e20; --g700:#14451a;
      --b50:#e3f2fd; --b100:#bbdefb; --b400:#42a5f5; --b500:#0288D1; --b600:#01579b;
      --cream:#fafaf7; --white:#ffffff; --ch:#1a1f1c; --sl:#374151;
      --mu:#6b7280; --bd:#e5e7eb; --sand:#f5f0e8;
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--cream); color: var(--ch); overflow-x: hidden; }
    h1,h2,h3,h4 { font-family: 'Playfair Display', serif; line-height: 1.1; }
    a { text-decoration: none; color: inherit; }
    button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--g50); }
    ::-webkit-scrollbar-thumb { background: var(--g400); border-radius: 3px; }

    /* ── Animations ── */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes pulse    { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.5);opacity:0} }
    @keyframes blob     { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
    @keyframes countUp  { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes shimmer  { 0%{opacity:.4} 50%{opacity:1} 100%{opacity:.4} }
    @keyframes slideIn  { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }

    /* ── Scroll reveal ── */
    .rv  { opacity:0; transform:translateY(28px); transition:opacity .65s ease,transform .65s ease; }
    .rv.in { opacity:1; transform:translateY(0); }
    .rvl { opacity:0; transform:translateX(-32px); transition:opacity .65s ease,transform .65s ease; }
    .rvl.in { opacity:1; transform:translateX(0); }
    .rvr { opacity:0; transform:translateX(32px); transition:opacity .65s ease,transform .65s ease; }
    .rvr.in { opacity:1; transform:translateX(0); }
    .d1{transition-delay:.1s} .d2{transition-delay:.18s} .d3{transition-delay:.26s} .d4{transition-delay:.34s} .d5{transition-delay:.42s}

    /* ── Buttons ── */
    .btn { display:inline-flex; align-items:center; gap:8px; border:none; border-radius:10px; font-weight:700; font-size:.9rem; padding:12px 24px; transition:all .22s ease; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; }
    .btn:active { transform:scale(.97); }
    .btn-g { background:linear-gradient(135deg,var(--g500),var(--g400)); color:#fff; box-shadow:0 8px 24px rgba(46,125,50,.25); }
    .btn-g:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(46,125,50,.35); }
    .btn-b { background:linear-gradient(135deg,var(--b500),var(--b400)); color:#fff; box-shadow:0 8px 24px rgba(2,136,209,.25); }
    .btn-b:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(2,136,209,.35); }
    .btn-out { background:#fff; color:var(--sl); border:1.5px solid var(--bd); box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .btn-out:hover { border-color:var(--g300); color:var(--g600); transform:translateY(-2px); }
    .btn-ghost { background:rgba(255,255,255,.12); color:#fff; border:1.5px solid rgba(255,255,255,.25); }
    .btn-ghost:hover { background:rgba(255,255,255,.2); }
    .btn-lg { padding:15px 34px; font-size:1rem; border-radius:12px; }
    .btn-sm { padding:8px 16px; font-size:.82rem; border-radius:8px; }

    /* ── Cards ── */
    .card { background:#fff; border:1px solid var(--bd); border-radius:18px; padding:26px; box-shadow:0 2px 12px rgba(0,0,0,.05); transition:all .28s ease; }
    .card:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,.09); border-color:var(--g200); }

    /* ── Badge / Pill ── */
    .pill { display:inline-flex; align-items:center; gap:5px; font-family:'JetBrains Mono',monospace; font-size:.68rem; font-weight:500; letter-spacing:.08em; text-transform:uppercase; padding:4px 12px; border-radius:99px; }
    .pill-g { background:var(--g50); color:var(--g600); border:1px solid var(--g200); }
    .pill-b { background:var(--b50); color:var(--b600); border:1px solid var(--b100); }
    .pill-w { background:rgba(255,255,255,.15); color:rgba(255,255,255,.9); border:1px solid rgba(255,255,255,.2); }

    /* ── Section ── */
    .sec { padding:90px 24px; }
    .sec-alt { background:#fff; }
    .sec-dark { background:linear-gradient(155deg,var(--g700),var(--g600) 60%,var(--b600)); position:relative; overflow:hidden; }
    .sec-sand { background:var(--sand); }
    .con { max-width:1200px; margin:0 auto; }
    .eye { font-family:'JetBrains Mono',monospace; font-size:.7rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--g500); margin-bottom:14px; display:flex; align-items:center; gap:8px; }
    .eye::before { content:''; display:inline-block; width:20px; height:2px; background:var(--g400); border-radius:2px; }
    .sec-t { font-size:clamp(1.8rem,3.5vw,2.6rem); font-weight:900; color:var(--ch); margin-bottom:14px; }
    .sec-d { font-size:1rem; color:var(--mu); line-height:1.78; max-width:520px; }

    /* ── Grid ── */
    .g2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
    .g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }

    /* ── Navbar ── */
    .navbar { position:fixed; top:0; left:0; right:0; z-index:100; padding:0 24px; transition:all .3s; }
    .nb-inner { max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; height:68px; padding:0 10px; }
    .navbar.sc .nb-inner { background:rgba(255,255,255,.95); backdrop-filter:blur(14px); border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,.08); margin-top:8px; height:58px; }
    .nb-logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
    .nb-logo-icon { width:36px; height:36px; background:linear-gradient(135deg,var(--g500),var(--g400)); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:1rem; box-shadow:0 4px 14px rgba(46,125,50,.3); }
    .nb-links { display:flex; align-items:center; gap:2px; list-style:none; }
    .nb-links a { font-size:.875rem; font-weight:500; color:var(--sl); padding:8px 14px; border-radius:8px; transition:all .2s; }
    .nb-links a:hover { background:var(--g50); color:var(--g600); }
    .nb-links a.act { color:var(--g500); font-weight:700; }
    .nb-right { display:flex; gap:10px; align-items:center; }
    .hbg { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:8px; }
    .hbg span { width:22px; height:2px; background:var(--ch); border-radius:99px; transition:.3s; }
    .mob-menu { display:none; position:fixed; inset:0; z-index:99; background:rgba(255,255,255,.98); backdrop-filter:blur(12px); flex-direction:column; align-items:center; justify-content:center; gap:6px; }
    .mob-menu.open { display:flex; }
    .mob-menu a { font-family:'Playfair Display',serif; font-size:1.8rem; font-weight:700; color:var(--ch); transition:color .2s; padding:8px; }
    .mob-menu a:hover { color:var(--g500); }
    .mob-close { position:absolute; top:22px; right:22px; background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--ch); }

    /* ── Hero ── */
    .hero { min-height:100vh; display:flex; align-items:center; background:linear-gradient(155deg,#f0faf4 0%,var(--cream) 45%,#e3f2fd 100%); overflow:hidden; padding:100px 24px 60px; position:relative; }
    .hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(46,125,50,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(46,125,50,.04) 1px,transparent 1px); background-size:52px 52px; }
    .hero-blob { position:absolute; border-radius:60% 40% 30% 70%/60% 30% 70% 40%; animation:blob 14s ease-in-out infinite; pointer-events:none; }
    .blob1 { width:560px; height:560px; background:radial-gradient(circle,rgba(76,175,125,.15),transparent 70%); top:-80px; right:-60px; }
    .blob2 { width:400px; height:400px; background:radial-gradient(circle,rgba(2,136,209,.1),transparent 70%); bottom:-60px; left:-40px; animation-delay:-7s; }
    .hero-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; position:relative; z-index:1; width:100%; }
    .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; background:#fff; border:1px solid var(--g200); border-radius:99px; padding:6px 16px 6px 8px; font-size:.76rem; font-weight:600; color:var(--g600); margin-bottom:20px; box-shadow:0 2px 12px rgba(46,125,50,.1); animation:fadeUp .5s ease both; }
    .hero-dot { width:22px; height:22px; background:var(--g500); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.7rem; position:relative; }
    .hero-dot::after { content:''; position:absolute; inset:-4px; border:1.5px solid var(--g400); border-radius:50%; animation:pulse 2s ease infinite; }
    .hero-h { font-size:clamp(2.4rem,5.5vw,3.8rem); font-weight:900; line-height:1.06; color:var(--ch); margin-bottom:18px; animation:fadeUp .5s ease .08s both; }
    .hero-acc { color:var(--g500); font-style:italic; position:relative; display:inline; }
    .hero-sub { font-size:1.05rem; color:var(--sl); line-height:1.8; margin-bottom:32px; animation:fadeUp .5s ease .16s both; }
    .hero-ctas { display:flex; gap:13px; flex-wrap:wrap; animation:fadeUp .5s ease .24s both; }
    .hero-trust { margin-top:28px; display:flex; gap:18px; flex-wrap:wrap; animation:fadeUp .5s ease .32s both; }
    .trust-item { display:flex; align-items:center; gap:6px; font-size:.8rem; color:var(--mu); font-weight:500; }
    .trust-item span:first-child { color:var(--g500); }

    /* ── Dashboard Card (hero right) ── */
    .dash-card { background:#fff; border:1px solid var(--bd); border-radius:22px; padding:22px; box-shadow:0 20px 60px rgba(0,0,0,.1); animation:slideIn .6s ease .3s both; position:relative; }
    .dash-card::before { content:''; position:absolute; top:-1px; left:24px; right:24px; height:3px; background:linear-gradient(90deg,var(--g400),var(--b400)); border-radius:3px; }
    .dash-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
    .dash-title { font-family:'JetBrains Mono',monospace; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--mu); }
    .dash-live { display:flex; align-items:center; gap:5px; font-size:.72rem; color:var(--g500); font-weight:600; }
    .dash-live-dot { width:7px; height:7px; background:var(--g400); border-radius:50%; animation:shimmer 1.5s ease infinite; }
    .stat-row { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:18px; }
    .stat-box { background:var(--g50); border:1px solid var(--g100); border-radius:12px; padding:14px 12px; text-align:center; }
    .stat-val { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:900; color:var(--g500); line-height:1; }
    .stat-lbl { font-family:'JetBrains Mono',monospace; font-size:.62rem; letter-spacing:.08em; text-transform:uppercase; color:var(--mu); margin-top:4px; }
    .proj-list { display:flex; flex-direction:column; gap:9px; }
    .proj-item { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--cream); border:1px solid var(--bd); border-radius:10px; }
    .proj-name { font-size:.83rem; font-weight:600; color:var(--ch); }
    .proj-loc  { font-size:.72rem; color:var(--mu); font-family:'JetBrains Mono',monospace; }
    .proj-price { font-family:'Playfair Display',serif; font-size:.95rem; font-weight:800; color:var(--g500); }
    .pbar { height:4px; background:var(--g100); border-radius:99px; overflow:hidden; margin-top:6px; }
    .pfill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--g400),var(--b400)); }

    /* ── Ticker ── */
    .ticker { background:var(--g600); padding:11px 0; overflow:hidden; }
    .ticker-inner { display:flex; white-space:nowrap; animation:marquee 24s linear infinite; }
    .ticker-item { display:inline-flex; align-items:center; gap:8px; padding:0 36px; font-size:.78rem; font-weight:500; color:rgba(255,255,255,.85); }
    .ticker-sep { width:4px; height:4px; background:var(--g300); border-radius:50%; }

    /* ── Problem section ── */
    .prob-card { border-radius:18px; padding:28px; border:1px solid; position:relative; overflow:hidden; }
    .prob-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
    .prob-1 { background:#fff5f5; border-color:#fecaca; } .prob-1::after{background:linear-gradient(90deg,#ef4444,#f87171);}
    .prob-2 { background:#fffbeb; border-color:#fde68a; } .prob-2::after{background:linear-gradient(90deg,#f59e0b,#fbbf24);}
    .prob-3 { background:#eff6ff; border-color:#bfdbfe; } .prob-3::after{background:linear-gradient(90deg,var(--b500),var(--b400));}
    .prob-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin-bottom:16px; }
    .prob-card h3 { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:700; margin-bottom:8px; }
    .prob-card p { font-size:.87rem; color:var(--mu); line-height:1.7; }

    /* ── How it works ── */
    .step-wrap { text-align:center; padding:20px 8px; }
    .step-num { width:52px; height:52px; background:linear-gradient(135deg,var(--g500),var(--g400)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-size:1rem; font-weight:700; color:#fff; margin:0 auto 16px; box-shadow:0 6px 20px rgba(46,125,50,.3); }
    .step-conn { flex:1; height:2px; background:linear-gradient(90deg,var(--g300),var(--b400)); border-radius:2px; margin:0 12px; }
    .step-wrap h3 { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; margin-bottom:10px; }
    .step-wrap p { font-size:.87rem; color:var(--mu); line-height:1.7; }
    .step-tag { display:inline-block; background:var(--g50); color:var(--g600); border:1px solid var(--g200); border-radius:8px; padding:4px 10px; font-family:'JetBrains Mono',monospace; font-size:.7rem; font-weight:600; margin-top:10px; }

    /* ── Project cards ── */
    .pcrd { background:#fff; border:1px solid var(--bd); border-radius:18px; overflow:hidden; transition:all .28s ease; cursor:pointer; }
    .pcrd:hover { transform:translateY(-6px); box-shadow:0 20px 50px rgba(0,0,0,.1); border-color:var(--g200); }
    .pcrd-img { height:155px; display:flex; align-items:center; justify-content:center; font-size:3.2rem; position:relative; overflow:hidden; }
    .pcrd-img::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 25% 50%,rgba(255,255,255,.15),transparent 60%); }
    .pcrd-body { padding:20px; }
    .pcrd-type { font-family:'JetBrains Mono',monospace; font-size:.65rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px; }
    .pcrd-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; margin-bottom:4px; }
    .pcrd-loc { font-size:.78rem; color:var(--mu); margin-bottom:14px; font-family:'JetBrains Mono',monospace; }
    .pcrd-price { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--g500); }
    .pcrd-meta { font-size:.72rem; color:var(--mu); margin-top:2px; }
    .pcrd-footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:14px; }
    .pcrd-btn { background:var(--g50); color:var(--g600); border:1px solid var(--g200); border-radius:8px; padding:7px 14px; font-size:.78rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'Plus Jakarta Sans',sans-serif; }
    .pcrd-btn:hover { background:var(--g500); color:#fff; border-color:var(--g500); }

    /* ── Metrics ── */
    .met-card { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); border-radius:18px; padding:32px 24px; text-align:center; backdrop-filter:blur(8px); transition:background .3s; }
    .met-card:hover { background:rgba(255,255,255,.14); }
    .met-val { font-family:'Playfair Display',serif; font-size:2.8rem; font-weight:900; color:#fff; line-height:1; margin-bottom:6px; }
    .met-lbl { font-size:.85rem; color:rgba(255,255,255,.65); font-weight:500; }
    .met-icon { font-size:1.8rem; margin-bottom:10px; display:block; }

    /* ── Benefits ── */
    .ben-card { background:#fff; border-radius:18px; padding:30px; border:1px solid var(--bd); }
    .ben-card:hover { border-color:transparent; box-shadow:0 20px 50px rgba(0,0,0,.09); transform:translateY(-4px); }
    .ben-role { font-family:'JetBrains Mono',monospace; font-size:.7rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; margin-bottom:8px; }
    .ben-card h3 { font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:800; margin-bottom:16px; }
    .ben-list { list-style:none; display:flex; flex-direction:column; gap:10px; }
    .ben-list li { display:flex; align-items:flex-start; gap:9px; font-size:.9rem; color:var(--sl); line-height:1.6; }
    .ben-check { width:20px; height:20px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.7rem; margin-top:1px; }

    /* ── Features ── */
    .feat-card { background:#fff; border:1px solid var(--bd); border-radius:18px; padding:26px; transition:all .28s; position:relative; overflow:hidden; }
    .feat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--g400),var(--b400)); transform:scaleX(0); transform-origin:left; transition:transform .3s; }
    .feat-card:hover::before { transform:scaleX(1); }
    .feat-card:hover { border-color:var(--g200); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.08); }
    .feat-icon { width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:16px; }

    /* ── Testimonials ── */
    .tmn-card { background:#fff; border:1px solid var(--bd); border-radius:18px; padding:28px; transition:all .28s; }
    .tmn-card:hover { border-color:var(--g200); box-shadow:0 12px 40px rgba(0,0,0,.07); transform:translateY(-3px); }
    .stars { color:#f59e0b; letter-spacing:2px; font-size:.95rem; margin-bottom:14px; }
    .tmn-q { font-family:'Playfair Display',serif; font-size:.97rem; font-style:italic; line-height:1.75; color:var(--sl); margin-bottom:18px; position:relative; padding-left:20px; }
    .tmn-q::before { content:'"'; position:absolute; left:0; top:-4px; font-size:2.5rem; color:var(--g200); line-height:1; }
    .tmn-av { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,var(--g200),var(--b100)); display:flex; align-items:center; justify-content:center; font-size:1rem; font-weight:700; color:var(--g700); flex-shrink:0; }

    /* ── FAQ ── (inline-style driven — no CSS class toggle needed) */

    /* ── CTA ── */
    .cta-inner { background:#fff; border-radius:28px; padding:72px 60px; text-align:center; border:1px solid var(--g100); box-shadow:0 24px 80px rgba(0,0,0,.07); position:relative; overflow:hidden; }
    .cta-inner::before { content:''; position:absolute; width:400px; height:400px; background:radial-gradient(circle,rgba(76,175,125,.06),transparent 70%); border-radius:50%; top:-100px; right:-60px; }
    .cta-inner::after { content:''; position:absolute; width:300px; height:300px; background:radial-gradient(circle,rgba(2,136,209,.05),transparent 70%); border-radius:50%; bottom:-80px; left:-40px; }
    .cta-t { font-size:clamp(2rem,4vw,2.9rem); font-weight:900; margin-bottom:16px; }
    .cta-d { font-size:1rem; color:var(--mu); max-width:460px; margin:0 auto 36px; line-height:1.78; }

     /* ── Contact section ── */
    .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .contact-info-card { background:#fff; border:1px solid var(--bd); border-radius:16px; padding:24px; transition:all .25s; }
    .contact-info-card:hover { border-color:var(--g200); transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,0,0,.07); }
    .contact-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-bottom:14px; }
    .contact-info-card h3 { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; margin-bottom:7px; }
    .contact-info-card p { font-size:.86rem; color:var(--mu); line-height:1.7; }
    .contact-info-card a { color:var(--g500); font-weight:600; text-decoration:none; }
    .contact-form-card { background:#fff; border:1px solid var(--bd); border-radius:18px; padding:32px; position:relative; overflow:hidden; }
    .contact-form-card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg,var(--g400),var(--b400)); }
    .cf-label { display:block; font-size:.73rem; font-weight:700; color:var(--sl); letter-spacing:.05em; text-transform:uppercase; margin-bottom:6px; }
    .cf-input { width:100%; border:1.5px solid var(--bd); border-radius:9px; padding:11px 14px; font-size:.9rem; color:var(--ch); outline:none; transition:border-color .2s,box-shadow .2s; font-family:'Plus Jakarta Sans',sans-serif; background:#fafafa; }
    .cf-input:focus { border-color:var(--g400); box-shadow:0 0 0 3px rgba(76,175,125,.1); background:#fff; }
    .cf-input::placeholder { color:#9ca3af; }
    textarea.cf-input { resize:vertical; min-height:110px; }
    .cf-submit { width:100%; background:linear-gradient(135deg,var(--g500),var(--g400)); color:#fff; border:none; border-radius:10px; padding:13px; font-size:.95rem; font-weight:700; cursor:pointer; transition:all .22s; box-shadow:0 6px 18px rgba(46,125,50,.25); margin-top:4px; font-family:'Plus Jakarta Sans',sans-serif; }
    .cf-submit:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(46,125,50,.32); }
    .cf-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

    /* ── Footer ── */
    .footer { background:var(--ch); color:#fff; padding:64px 24px 28px; }
    .footer-top { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:2.2fr 1fr 1fr 1fr; gap:52px; padding-bottom:44px; border-bottom:1px solid rgba(255,255,255,.08); margin-bottom:28px; }
    .ft-desc { font-size:.875rem; color:rgba(255,255,255,.5); line-height:1.75; max-width:260px; margin-top:12px; }
    .ft-col h4 { font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.35); margin-bottom:16px; }
    .ft-col ul { list-style:none; display:flex; flex-direction:column; gap:9px; }
    .ft-col ul li a { font-size:.87rem; color:rgba(255,255,255,.5); transition:color .2s; }
    .ft-col ul li a:hover { color:var(--g400); }
    .footer-btm { max-width:1200px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; }
    .footer-btm p { font-size:.8rem; color:rgba(255,255,255,.35); }
    .ft-lnks { display:flex; gap:20px; }
    .ft-lnks a { font-size:.78rem; color:rgba(255,255,255,.35); transition:color .2s; }
    .ft-lnks a:hover { color:var(--g400); }

    /* ══════════════════════════════════════════════
       RESPONSIVE — mobile-first, 4 breakpoints
       480px (xs) · 640px (sm) · 768px (md) · 1024px (lg)
    ══════════════════════════════════════════════ */

    /* ── Large tablet / small desktop ── */
    @media(max-width:1024px) {
      .hero-inner { grid-template-columns:1fr; gap:40px; }
      .hero { padding:100px 24px 56px; min-height:auto; }
      .blob1 { width:380px; height:380px; }
      .blob2 { width:280px; height:280px; }
      .footer-top { grid-template-columns:1fr 1fr; gap:36px; }
      .g3 { grid-template-columns:1fr 1fr; }
      .g4 { grid-template-columns:1fr 1fr; gap:14px; }
      .met-card { padding:24px 18px; }
      .met-val  { font-size:2.2rem; }
    }

    /* ── Tablet ── */
    @media(max-width:768px) {
      /* Section padding */
      .sec { padding:64px 20px; }

      /* Navbar */
      .nb-links,.nb-right { display:none; }
      .hbg { display:flex; }
      .navbar { padding:0 16px; }
      .nb-inner { height:60px; }

      /* Hero */
      .hero { padding:88px 20px 52px; min-height:auto; }
      .hero-inner { grid-template-columns:1fr; gap:36px; text-align:center; }
      .hero-eyebrow { margin-left:auto; margin-right:auto; }
      .hero-h { font-size:clamp(2rem,6vw,2.8rem); }
      .hero-sub { font-size:.95rem; }
      .hero-ctas { justify-content:center; }
      .hero-trust { justify-content:center; }
      .blob1 { width:280px; height:280px; top:-40px; right:-40px; }
      .blob2 { width:200px; height:200px; }

      /* Grids */
      .g2,.g3,.g4 { grid-template-columns:1fr; }

      /* Dashboard card in hero — compact on mobile */
      .stat-row { grid-template-columns:repeat(3,1fr); gap:8px; }
      .stat-box { padding:10px 8px; }
      .stat-val  { font-size:1.1rem; }
      .stat-lbl  { font-size:.55rem; }
      .dash-card { padding:16px; }

      /* Solution section inline grid */
      .solution-grid { grid-template-columns:1fr !important; gap:28px !important; }
      .solution-dark-card { border-radius:16px !important; padding:24px !important; }

      /* How it works — stack vertically */
      .steps-row { flex-direction:column !important; align-items:center !important; }
      .steps-row .step-connector-line { display:none !important; }
      .step-wrap { width:100%; max-width:360px; }

      /* Metrics */
      .g4 { grid-template-columns:1fr 1fr; gap:12px; }
      .met-card { padding:22px 16px; }
      .met-val  { font-size:2rem; }

      /* Benefits */
      .g2 { grid-template-columns:1fr; }

      /* Features */
      .g4.features-grid { grid-template-columns:1fr 1fr; }

      /* CTA */
      .cta-inner { padding:40px 20px; }
      .cta-t     { font-size:clamp(1.6rem,5vw,2.2rem); }
      .cta-d     { font-size:.9rem; }

      /* Contact section */
      .contact-section-grid { grid-template-columns:1fr !important; gap:24px !important; }
      .contact-info-grid    { grid-template-columns:1fr 1fr !important; }

      /* Footer */
      .footer { padding:48px 20px 24px; }
      .footer-top { grid-template-columns:1fr; gap:28px; }
      .footer-btm { flex-direction:column; align-items:flex-start; gap:10px; }
      .ft-lnks { flex-wrap:wrap; gap:14px; }

      /* Testimonials — 1 col */
      .g3.testimonials-grid { grid-template-columns:1fr; }

      /* Marketplace preview — 2 cols at tablet */
      .g3.market-grid { grid-template-columns:1fr 1fr; }
    }

    /* ── Mobile (640px) ── */
    @media(max-width:640px) {
      .sec { padding:52px 16px; }

      /* Hero */
      .hero { padding:80px 16px 48px; }
      .hero-h { font-size:clamp(1.75rem,7vw,2.4rem); }
      .hero-sub { font-size:.9rem; }
      .btn-lg { padding:13px 22px; font-size:.9rem; }
      .hero-ctas { flex-direction:column; align-items:center; width:100%; }
      .hero-ctas .btn { width:100%; justify-content:center; }
      .hero-trust { gap:12px; flex-direction:column; align-items:center; }

      /* Stat row — 3 small boxes */
      .stat-row  { grid-template-columns:repeat(3,1fr); gap:6px; }
      .stat-box  { padding:10px 6px; }
      .stat-val  { font-size:1rem; }
      .stat-lbl  { font-size:.52rem; }
      .dash-card { padding:14px; border-radius:16px; }

      /* Grids → single col */
      .g2,.g3,.g4 { grid-template-columns:1fr; }
      .g4.features-grid { grid-template-columns:1fr; }
      .g3.market-grid { grid-template-columns:1fr; }

      /* Metrics — 2×2 */
      .g4 { grid-template-columns:1fr 1fr; gap:10px; }
      .met-card { padding:18px 12px; }
      .met-val  { font-size:1.8rem; }
      .met-lbl  { font-size:.78rem; }

      /* Section titles */
      .sec-t { font-size:clamp(1.5rem,5.5vw,2rem); }

      /* Problem cards */
      .prob-card { padding:20px; }

      /* CTA */
      .cta-inner { padding:32px 16px; border-radius:18px; }
      .cta-btns-row { flex-direction:column; align-items:center; width:100%; }
      .cta-btns-row .btn { width:100%; justify-content:center; }

      /* Contact form grid → 1 col */
      .cf-form-row { grid-template-columns:1fr !important; }
      .contact-info-grid { grid-template-columns:1fr !important; }

      /* Footer */
      .footer-top { grid-template-columns:1fr; gap:22px; }
      .ft-lnks    { flex-direction:column; gap:8px; }

      /* Testimonials */
      .tmn-card { padding:20px; }

      /* Marketplace cards */
      .pcrd-body { padding:14px; }

      /* How it works callout strip */
      .hiw-callout-inner { flex-direction:column !important; gap:12px !important; }
      .hiw-callout-equiv { justify-content:flex-start !important; gap:14px !important; flex-wrap:wrap; }
    }

    /* ── Small mobile (480px) ── */
    @media(max-width:480px) {
      .sec { padding:44px 14px; }
      .hero { padding:74px 14px 44px; }
      .navbar { padding:0 14px; }

      /* Hero buttons full width */
      .hero-ctas { gap:10px; }
      .btn-lg { padding:12px 18px; font-size:.85rem; }

      /* Stats — still 3 col but tiny */
      .stat-row { gap:5px; }
      .stat-box { padding:8px 4px; border-radius:9px; }
      .stat-val  { font-size:.9rem; }
      .stat-lbl  { font-size:.48rem; letter-spacing:0; }

      /* Metrics — 2 col */
      .met-val { font-size:1.6rem; }
      .met-icon { font-size:1.4rem; }

      /* Section heading */
      .sec-t { font-size:clamp(1.35rem,6vw,1.8rem); }
      .sec-d { font-size:.9rem; }

      /* Cards */
      .card { padding:18px; border-radius:14px; }
      .prob-card { padding:18px; }
      .ben-card { padding:20px; }
      .feat-card { padding:18px; }
      .tmn-card { padding:18px; }

      /* Ticker font */
      .ticker-item { font-size:.7rem; padding:0 20px; }

      /* Footer */
      .footer { padding:36px 14px 20px; }
      .footer-btm { flex-direction:column; gap:8px; }

      /* Mob menu links */
      .mob-menu a { font-size:1.5rem; }

      /* CTA inner */
      .cta-inner { padding:26px 14px; }

      /* Contact form */
      .contact-form-card { padding:20px 16px; }
      .contact-info-card { padding:18px; }

      /* Solution dark card */
      .solution-dark-card { padding:18px !important; border-radius:14px !important; }

      /* Project cards */
      .pcrd-img { height:120px; font-size:2.5rem; }
    }
  `}</style>
);

/* ═══════════════════════════════════════════════
   SCROLL REVEAL HOOK
═══════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".rv,.rvl,.rvr");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════ */
function Counter({ target, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const dur = 1800;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(ease * target));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════ */
function Navbar({ activeSec }) {
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
 
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
 
  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mob ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mob]);
 
  const openMenu  = () => setMob(true);
  const closeMenu = () => setMob(false);
 
  const scrollTo = (id) => {
    closeMenu();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, mob ? 240 : 0);
  };
 
  const NAV_LINKS = [
    ["home",       "Home"],
    ["marketplace","Marketplace"],
    ["howitworks", "How It Works"],
  ];
 
  return (
    <>
      {/* ── Desktop / scrolled navbar ── */}
      <nav className={`navbar${scrolled ? " sc" : ""}`} style={{ zIndex: 100 }}>
        <div className="nb-inner">
          {/* Logo */}
          <div className="nb-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--g600)" }}><Link to="/">CarbonX</Link></span>
          </div>
 
          {/* Desktop nav links */}
          <ul className="nb-links">
            {NAV_LINKS.map(([id, lbl]) => (
              <li key={id}>
                <a href="#" className={activeSec === id ? "act" : ""}
                  onClick={e => { e.preventDefault(); scrollTo(id); }}>{lbl}</a>
              </li>
            ))}
            <li><Link to="/about" style={{ fontWeight: 500, color: "var(--sl)", padding: "8px 14px", borderRadius: 8, transition: "all .2s", display: "block" }}>About</Link></li>
            <li><Link to="/contact" style={{ fontWeight: 500, color: "var(--sl)", padding: "8px 14px", borderRadius: 8, transition: "all .2s", display: "block" }}>Contact Us</Link></li>
          </ul>
 
          {/* Desktop auth buttons */}
          <div className="nb-right">
            <Link to="/login" className="btn btn-out btn-sm">Login</Link>
            <Link to="/register" className="btn btn-g btn-sm">Start Offsetting</Link>
          </div>
 
          {/* Hamburger */}
          <div className={`hbg${mob ? " is-open" : ""}`}
            onClick={mob ? closeMenu : openMenu}
            aria-label={mob ? "Close menu" : "Open menu"}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && (mob ? closeMenu() : openMenu())}>
            <span />
            <span />
            <span />
          </div>
        </div>
      </nav>
 
      {/* ── Mobile full-screen menu ── */}
      {mob && (
        <div className="mob-menu open">
          {/* Top bar with logo + close */}
          <div className="mob-menu-topbar">
            <div className="nb-logo" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); closeMenu(); }}>
              <div className="nb-logo-icon">🌱</div>
              <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--g600)" }}>CarbonX</span>
            </div>
            <button className="mob-close-btn" onClick={closeMenu} aria-label="Close menu">✕</button>
          </div>
 
          {/* Nav links */}
          {NAV_LINKS.map(([id, lbl]) => (
            <a key={id} href="#" onClick={e => { e.preventDefault(); scrollTo(id); }}>{lbl}</a>
          ))}
          <Link to="/contact" onClick={closeMenu}>Contact</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
 
          <div className="mob-divider" />
 
          {/* Auth buttons */}
          <div className="mob-menu-btns">
            <Link to="/login" className="btn btn-out" onClick={closeMenu}>Login</Link>
            <Link to="/register" className="btn btn-g" onClick={closeMenu}>Get Started</Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════ */
function Hero({ navigate }) {
  const projects = [
    { emoji: "🌿", name: "Amazon Forest Reserve", loc: "Brazil", price: "₹850", pct: 72, color: "#1b5e20" },
    { emoji: "💨", name: "Turkana Wind Farm", loc: "Kenya", price: "₹680", pct: 45, color: "#01579b" },
    { emoji: "☀️", name: "Himalayan Solar Cookstoves", loc: "Nepal", price: "₹520", pct: 34, color: "#e65100" },
  ];

  return (
    <section className="hero" id="home">
      <div className="hero-grid" />
      <div className="hero-blob blob1" />
      <div className="hero-blob blob2" />
      <div className="hero-inner">
        {/* Left */}
        <div>
          <div className="hero-eyebrow">
            <div className="hero-dot">🌱</div>
            Climate Fintech Platform · Verified Credits
          </div>
          <h1 className="hero-h">
            Trade Carbon Credits &<br />
            <span className="hero-acc">Offset</span> Your Emissions
          </h1>
          <p className="hero-sub">
            A simple marketplace where organizations and individuals can support verified sustainability projects and reduce their carbon footprint — transparently.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-g btn-lg" ><Link to="/marketplace">🌍 Explore Marketplace</Link></button>
            <button className="btn btn-out btn-lg" onClick={() => document.getElementById("howitworks")?.scrollIntoView({ behavior: "smooth" })}>Learn How It Works</button>
          </div>
          <div className="hero-trust">
            {["100% Verified Projects", "Instant Portfolio Tracking", "No Broker Fees"].map(t => (
              <div key={t} className="trust-item"><span>✓</span><span>{t}</span></div>
            ))}
          </div>
        </div>

        {/* Right: Dashboard preview */}
        <div style={{ animation: "fadeUp .6s ease .4s both" }}>
          <div className="dash-card">
            <div className="dash-hdr">
              <div>
                <div className="dash-title">My Carbon Portfolio</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: ".9rem", color: "var(--ch)", marginTop: 2 }}>Aria Chen</div>
              </div>
              <div className="dash-live"><div className="dash-live-dot" /> Live</div>
            </div>

            <div className="stat-row">
              {[["120","Credits Owned"],["120 t","CO₂ Offset"],["3","Projects"]].map(([v,l])=>(
                <div key={l} className="stat-box">
                  <div className="stat-val">{v}</div>
                  <div className="stat-lbl">{l}</div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".65rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mu)", marginBottom: 10 }}>Active Projects</div>
            <div className="proj-list">
              {projects.map((p, i) => (
                <div key={i} className="proj-item" style={{ animation: `fadeUp .4s ease ${.5 + i*.1}s both` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: "1rem" }}>{p.emoji}</span>
                      <div>
                        <div className="proj-name">{p.name}</div>
                        <div className="proj-loc">📍 {p.loc}</div>
                      </div>
                    </div>
                    <div className="pbar"><div className="pfill" style={{ width: `${p.pct}%` }} /></div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 12 }}>
                    <div className="proj-price">{p.price}</div>
                    <div style={{ fontSize: ".68rem", color: "var(--mu)", fontFamily: "'JetBrains Mono',monospace" }}>/credit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   TICKER
═══════════════════════════════════════════════ */
function Ticker() {
  const items = ["🌿 Forest Conservation · Brazil","💨 Wind Energy · Kenya","🌊 Blue Carbon · Vietnam","☀️ Solar Cookstoves · Nepal","🏔️ Peat Bog · Chile","🦧 Biodiversity · Borneo","♻️ Methane Capture · India","🌱 Soil Carbon · Indonesia"];
  return (
    <div className="ticker">
      <div className="ticker-inner">
        {[...items,...items].map((it,i)=>(
          <span key={i} className="ticker-item"><span className="ticker-sep"/>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROBLEM
═══════════════════════════════════════════════ */
function Problem() {
  const cards = [
    { cls:"prob-1", icon:"🔒", iconBg:"#fef2f2", title:"Carbon Markets Are Hard to Access", body:"Traditional carbon trading requires brokers, legal expertise, and significant capital — shutting out most organizations and individuals who want to act." },
    { cls:"prob-2", icon:"🏢", iconBg:"#fffbeb", title:"Organizations Lack Simple Platforms", body:"Companies want to offset emissions but face complex onboarding processes, high minimums, and no clear path to understanding their environmental impact." },
    { cls:"prob-3", icon:"🔍", iconBg:"#eff6ff", title:"Transparency is Often Missing", body:"Buyers can't easily verify project quality, track real-world impact, or trace where their money goes — breeding distrust in voluntary carbon markets." },
  ];
  return (
    <section className="sec sec-alt" id="problem">
      <div className="con">
        <div style={{ maxWidth: 560, marginBottom: 52 }}>
          <div className="rv"><div className="eye">The Problem</div></div>
          <div className="rv"><h2 className="sec-t">The Climate Problem We Are Solving</h2></div>
          <div className="rv"><p className="sec-d">Carbon offset markets hold the potential to channel billions into climate solutions — but they remain opaque, complex, and inaccessible.</p></div>
        </div>
        <div className="g3">
          {cards.map((c,i)=>(
            <div key={i} className={`rv prob-card d${i+1}`} style={{ animationDelay: `${i*.1}s` }}>
              <div className="prob-icon" style={{ background: c.iconBg }}>{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   SOLUTION
═══════════════════════════════════════════════ */
function Solution() {
  return (
    <section className="sec" id="solution">
      <div className="con">
        <div className="solution-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="rvl"><div className="eye">Our Solution</div></div>
            <div className="rvl"><h2 className="sec-t">A Transparent Carbon Credit Marketplace</h2></div>
            <div className="rvl"><p className="sec-d" style={{ marginBottom: 24 }}>Our platform connects carbon credit buyers with verified sustainability projects, enabling organizations and individuals to offset emissions while supporting environmental initiatives.</p></div>
            <div className="rvl">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "✅", t: "Fully Verified Projects", d: "Every project reviewed before listing — ensuring quality and real impact." },
                  { icon: "📊", t: "Real-Time Portfolio Tracking", d: "See exactly how many tons of CO₂ you've offset, live." },
                  { icon: "🔗", t: "Immutable Transaction Ledger", d: "Every purchase recorded with full traceability." },
                ].map((it,i)=>(
                  <div key={i} style={{ display: "flex", gap: 14, padding: "14px 18px", background: "#fff", border: "1px solid var(--bd)", borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, background: "var(--g50)", border: "1px solid var(--g100)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{it.icon}</div>
                    <div><div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 3 }}>{it.t}</div><div style={{ fontSize: ".83rem", color: "var(--mu)", lineHeight: 1.6 }}>{it.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rvr solution-dark-card" style={{ background: "linear-gradient(155deg,var(--g700),var(--g600) 60%,var(--b600))", borderRadius: 24, padding: 32, color: "#fff" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 20 }}>Platform at a Glance</div>
            {[
              ["🌱", "Buyers", "Browse & purchase verified credits"],
              ["🌿", "Sellers", "List sustainability projects"],
              ["⚙️", "Admins", "Verify & monitor the platform"],
              ["📈", "Impact", "Track real CO₂ reductions"],
            ].map(([ic, t, d], i)=>(
              <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
                <div style={{ width: 40, height: 40, background: "rgba(255,255,255,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{ic}</div>
                <div><div style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 2 }}>{t}</div><div style={{ fontSize: ".82rem", color: "rgba(255,255,255,.55)" }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOW IT WORKS
═══════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    { n:"01", icon:"📋", title:"Projects List Carbon Credits", body:"Sellers submit solar, forest restoration, and renewable energy projects. Each credit represents 1 ton of CO₂ reduced or captured.", tag:"Step 1" },
    { n:"02", icon:"🛒", title:"Buyers Purchase Credits", body:"Companies and individuals browse verified projects and buy credits to offset their own emissions — simple, instant, transparent.", tag:"Step 2" },
    { n:"03", icon:"🌍", title:"Offset Your Carbon Footprint", body:"Credits are retired to your portfolio. Track your exact impact: 1 credit = 1 ton CO₂ reduced. View full impact equivalents in your dashboard.", tag:"Step 3" },
  ];
  return (
    <section className="sec sec-alt" id="howitworks">
      <div className="con">
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="rv"><div className="eye" style={{ justifyContent: "center" }}>How It Works</div></div>
          <div className="rv"><h2 className="sec-t">Simple. Transparent. Impactful.</h2></div>
          <div className="rv"><p className="sec-d" style={{ margin: "0 auto" }}>Three steps from listing to real climate impact.</p></div>
        </div>
        {/* Connector row */}
        <div className="steps-row" style={{ display: "flex", alignItems: "flex-start", position: "relative", marginBottom: 0 }}>
          <div className="step-connector-line" style={{ position: "absolute", top: 26, left: "16.66%", right: "16.66%", height: 2, background: "linear-gradient(90deg,var(--g300),var(--b400))", borderRadius: 2 }} />
          {steps.map((s,i)=>(
            <div key={i} className={`step-wrap rv d${i+1}`} style={{ flex: 1 }}>
              <div className="step-num">{s.n}</div>
              <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,var(--g50),var(--b50))", border: "1px solid var(--g100)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 16px" }}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <div className="step-tag">{s.tag}</div>
            </div>
          ))}
        </div>
        <div className="rv" style={{ marginTop: 40, background: "var(--g50)", border: "1px solid var(--g200)", borderRadius: 14, padding: "18px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div className="hiw-callout-inner" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.8rem" }}>♻️</span>
            <div><div style={{ fontWeight: 700, fontSize: ".9rem" }}>1 Carbon Credit = 1 Ton CO₂ Reduced</div><div style={{ fontSize: ".8rem", color: "var(--mu)" }}>Credits are retired permanently — no double-counting.</div></div>
          </div>
          <div className="hiw-callout-equiv" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["🌳","5 trees planted"],["🚗","2,481 miles not driven"],["🏠","1/8 home powered"]].map(([ic,t])=>(
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".82rem", color: "var(--sl)" }}><span>{ic}</span><span>{t}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/*
   MARKETPLACE PREVIEW
 */
function MarketPreview({ navigate }) {
  const projs = [
    { emoji:"☀️", bg:"linear-gradient(135deg,#bf360c,#e64a19)", type:"Renewable Energy", title:"Solar Farm Initiative", loc:"Rajasthan, India", credits:500, price:"₹300", pct:62 },
    { emoji:"🌿", bg:"linear-gradient(135deg,#1b5e20,#2e7d32)", type:"Forest Conservation", title:"Atlantic Forest Restoration", loc:"São Paulo, Brazil", credits:800, price:"₹250", pct:45 },
    { emoji:"💨", bg:"linear-gradient(135deg,#01579b,#0288d1)", type:"Wind Energy", title:"North Sea Wind Initiative", loc:"Denmark, Europe", credits:600, price:"₹280", pct:78 },
    { emoji:"🌊", bg:"linear-gradient(135deg,#003c8f,#1565c0)", type:"Blue Carbon", title:"Mekong Mangrove Restoration", loc:"Vietnam", credits:420, price:"₹340", pct:31 },
    { emoji:"🏔️", bg:"linear-gradient(135deg,#263238,#37474f)", type:"Peatland", title:"Patagonian Peat Protection", loc:"Chile", credits:910, price:"₹420", pct:20 },
    { emoji:"♻️", bg:"linear-gradient(135deg,#4a148c,#6a1b9a)", type:"Methane Capture", title:"Municipal Landfill Gas Recovery", loc:"Maharashtra, India", credits:350, price:"₹190", pct:55 },
  ];

  return (
    <section className="sec" id="marketplace">
      <div className="con">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="rv"><div className="eye">Marketplace</div></div>
            <div className="rv"><h2 className="sec-t" style={{ marginBottom: 0 }}>Explore Carbon Offset Projects</h2></div>
          </div>
          <div className="rv"><button className="btn btn-out" ><Link to="/marketplace">View All Projects →</Link></button></div>
        </div>
        <div className="g3 market-grid" style={{ gap: 22 }}>
          {projs.map((p,i)=>(
            <div key={i} className={`pcrd rv d${(i%3)+1}`}>
              <div className="pcrd-img" style={{ background: p.bg }}>
                <span style={{ position: "relative", zIndex: 1 }}>{p.emoji}</span>
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <span className="pill pill-w">✓ Verified</span>
                </div>
              </div>
              <div className="pcrd-body">
                <div className="pcrd-type" style={{ color: "var(--g500)" }}>{p.type}</div>
                <div className="pcrd-title">{p.title}</div>
                <div className="pcrd-loc">📍 {p.loc}</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--mu)", marginBottom: 5 }}>
                    <span>Available Credits</span><span style={{ color: "var(--g500)", fontWeight: 600 }}>{p.credits.toLocaleString()}</span>
                  </div>
                  <div className="pbar"><div className="pfill" style={{ width: `${p.pct}%` }} /></div>
                </div>
                <div className="pcrd-footer">
                  <div>
                    <div className="pcrd-price">{p.price}</div>
                    <div className="pcrd-meta">per credit · 1 ton CO₂</div>
                  </div>
                  <button className="pcrd-btn" ><Link to="/marketplace">Buy Credits</Link></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="rv" style={{ textAlign: "center", marginTop: 40 }}>
          <button className="btn btn-g btn-lg" ><Link to="/marketplace" >🛒 Browse All Projects →</Link></button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   METRICS
═══════════════════════════════════════════════ */
function Metrics() {
  const mets = [
    { icon: "♻️", target: 720,  suffix: "+", label: "Credits Traded" },
    { icon: "🌍", target: 720,  suffix: " t", label: "CO₂ Offset (tons)" },
    { icon: "🌿", target: 15,   suffix: "+", label: "Active Projects" },
    { icon: "👥", target: 40,   suffix: "+", label: "Registered Users" },
  ];
  return (
    <section className="sec-dark sec" id="metrics">
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 15% 50%,rgba(255,255,255,.05),transparent 50%),radial-gradient(circle at 85% 30%,rgba(255,255,255,.04),transparent 40%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "56px 56px", pointerEvents: "none" }} />
      <div className="con" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="rv"><div className="eye" style={{ justifyContent: "center", color: "rgba(255,255,255,.7)" }}>Impact</div></div>
          <div className="rv"><h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, color: "#fff", marginBottom: 10 }}>Our Climate Impact</h2></div>
          <div className="rv"><p style={{ color: "rgba(255,255,255,.6)", maxWidth: 440, margin: "0 auto", fontSize: "1rem" }}>Real numbers, real impact — every credit purchased represents verified CO₂ removed from our atmosphere.</p></div>
        </div>
        <div className="g4" style={{ gap: 16 }}>
          {mets.map((m,i)=>(
            <div key={i} className={`met-card rv d${i+1}`}>
              <span className="met-icon">{m.icon}</span>
              <div className="met-val"><Counter target={m.target} suffix={m.suffix} /></div>
              <div className="met-lbl">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   BENEFITS
═══════════════════════════════════════════════ */
function Benefits() {
  const buyers = [
    "Offset your organization's carbon emissions",
    "Track exact CO₂ offset in a live dashboard",
    "Support verified, high-quality global projects",
    "Download impact certificates for ESG reporting",
    "Diversify across project types and geographies",
  ];
  const sellers = [
    "Monetize sustainability projects with ease",
    "Reach a global network of buyers",
    "Admin verification builds buyer trust",
    "Live sales dashboard and revenue analytics",
    "Showcase your environmental impact",
  ];

  return (
    <section className="sec sec-sand" id="benefits">
      <div className="con">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="rv"><div className="eye" style={{ justifyContent: "center" }}>Benefits</div></div>
          <div className="rv"><h2 className="sec-t">Built for Every Stakeholder</h2></div>
          <div className="rv"><p className="sec-d" style={{ margin: "0 auto" }}>Whether you're offsetting emissions or listing projects — CarbonX is designed for you.</p></div>
        </div>
        <div className="g2" style={{ gap: 24 }}>
          {[
            { role:"For Buyers", roleC:"var(--b600)", icon:"🛒", title:"Offset Your Carbon Footprint", items:buyers, accent:"linear-gradient(90deg,var(--b400),var(--b500))", iconBg:"var(--b50)", checkBg:"var(--b50)", checkC:"var(--b500)" },
            { role:"For Sellers", roleC:"var(--g600)", icon:"🌿", title:"Monetise Your Sustainability Projects", items:sellers, accent:"linear-gradient(90deg,var(--g400),var(--g500))", iconBg:"var(--g50)", checkBg:"var(--g50)", checkC:"var(--g500)" },
          ].map((card, ci)=>(
            <div key={ci} className={`ben-card rv d${ci+1}`} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "18px 18px 0 0", background: card.accent }} />
              <div style={{ width: 56, height: 56, background: card.iconBg, border: "1px solid var(--bd)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", marginBottom: 18 }}>{card.icon}</div>
              <div className="ben-role" style={{ color: card.roleC }}>{card.role}</div>
              <h3>{card.title}</h3>
              <ul className="ben-list">
                {card.items.map((it,j)=>(
                  <li key={j}>
                    <div className="ben-check" style={{ background: card.checkBg, color: card.checkC }}>✓</div>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════ */
function Features() {
  const feats = [
    { icon:"🌍", iconBg:"var(--g50)", iconBdr:"var(--g100)", t:"Carbon Marketplace", d:"Browse and purchase credits from verified, high-quality sustainability projects worldwide." },
    { icon:"📊", iconBg:"var(--b50)", iconBdr:"var(--b100)", t:"Portfolio Dashboard", d:"Track credits owned, CO₂ offset, and environmental impact equivalents — all in real time." },
    { icon:"🌱", iconBg:"#fff7ed", iconBdr:"#fed7aa", t:"Project Listings", d:"Sellers can submit and manage carbon offset projects for admin verification and public listing." },
    { icon:"🔗", iconBg:"#f5f3ff", iconBdr:"#ddd6fe", t:"Transparent Ledger", d:"Every credit purchase is recorded and fully traceable — no double-counting, ever." },
    { icon:"✅", iconBg:"var(--g50)", iconBdr:"var(--g100)", t:"Admin Verification", d:"A dedicated admin layer reviews and approves projects before they appear in the marketplace." },
    { icon:"📈", iconBg:"var(--b50)", iconBdr:"var(--b100)", t:"Impact Analytics", d:"View CO₂ equivalents: trees planted, car miles avoided, homes powered — per credit purchased." },
    { icon:"🔐", iconBg:"#fef2f2", iconBdr:"#fecaca", t:"Secure Auth", d:"JWT-based authentication with access and refresh tokens. Role-based access for buyers, sellers, admins." },
    { icon:"⚡", iconBg:"#fefce8", iconBdr:"#fde68a", t:"Instant Transactions", d:"Credits are transferred atomically with MongoDB sessions — purchases never leave inconsistent states." },
  ];
  return (
    <section className="sec sec-alt" id="features">
      <div className="con">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="rv"><div className="eye" style={{ justifyContent: "center" }}>Platform Features</div></div>
          <div className="rv"><h2 className="sec-t">Everything You Need to Trade Carbon Credits</h2></div>
          <div className="rv"><p className="sec-d" style={{ margin: "0 auto" }}>A complete fintech-grade marketplace built with transparency and simplicity at its core.</p></div>
        </div>
        <div className="g4 features-grid" style={{ gap: 18 }}>
          {feats.map((f,i)=>(
            <div key={i} className={`feat-card rv d${(i%4)+1}`}>
              <div className="feat-icon" style={{ background: f.iconBg, border: `1px solid ${f.iconBdr}` }}>{f.icon}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{f.t}</div>
              <p style={{ fontSize: ".85rem", color: "var(--mu)", lineHeight: 1.7 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════ */
function Testimonials() {
  const tmns = [
    { stars:"★★★★★", q:"This platform makes carbon markets genuinely easy to understand. We used it in our sustainability cohort — students loved the hands-on simulation.", name:"Dr. Priya Sharma", role:"Sustainability Professor, IIT Delhi", av:"P", avBg:"linear-gradient(135deg,var(--g200),var(--b100))" },
    { stars:"★★★★★", q:"As an NGO running reforestation projects, we finally have a simple way to list and sell credits. The admin verification gives our buyers real confidence.", name:"Marco Reyes", role:"Project Director, GreenEarth NGO", av:"M", avBg:"linear-gradient(135deg,var(--b100),var(--g100))" },
    { stars:"★★★★☆", q:"Purchased 200 credits for our Q3 ESG report. The portfolio dashboard clearly showed which projects we backed and our exact CO₂ impact.", name:"Aria Chen", role:"Head of Sustainability, FinTech Corp", av:"A", avBg:"linear-gradient(135deg,var(--g100),var(--b100))" },
  ];
  return (
    <section className="sec" id="testimonials">
      <div className="con">
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="rv"><div className="eye" style={{ justifyContent: "center" }}>Testimonials</div></div>
          <div className="rv"><h2 className="sec-t">What Our Community Says</h2></div>
        </div>
        <div className="g3 testimonials-grid" style={{ gap: 22 }}>
          {tmns.map((t,i)=>(
            <div key={i} className={`tmn-card rv d${i+1}`}>
              <div className="stars">{t.stars}</div>
              <p className="tmn-q">{t.q}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="tmn-av" style={{ background: t.avBg }}>{t.av}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".88rem" }}>{t.name}</div>
                  <div style={{ fontSize: ".76rem", color: "var(--mu)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CTA
═══════════════════════════════════════════════ */
function CTA({ navigate }) {
  return (
    <section className="sec sec-sand" id="about">
      <div className="con">
        <div className="rv">
          <div className="cta-inner">
            <div className="rv"><div className="eye" style={{ justifyContent: "center", marginBottom: 10 }}>Get Started</div></div>
            <div className="rv"><h2 className="cta-t">Start Your Carbon<br /><span style={{ color: "var(--g500)", fontStyle: "italic" }}>Offset Journey</span></h2></div>
            <div className="rv"><p className="cta-d">Join the marketplace and support projects that reduce global carbon emissions. Free to join — start browsing verified projects in minutes.</p></div>
            <div className="rv cta-btns-row" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24, position: "relative", zIndex: 1 }}>
              <button className="btn btn-g btn-lg" ><Link to="/register">🌿 Create Account</Link></button>
            </div>
            <div className="rv" style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              {["Free to join","No broker fees","Verified projects only","Full impact tracking"].map(t=>(
                <div key={t} className="trust-item"><span>✓</span><span>{t}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════ */
function FaqItem({ faq, index, open, onToggle }) {
  const isOpen = open === index;
  const answerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (answerRef.current) {
      setHeight(isOpen ? answerRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      style={{
        border: `1.5px solid ${isOpen ? "var(--g300)" : "var(--bd)"}`,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 10,
        background: "#fff",
        boxShadow: isOpen ? "0 4px 20px rgba(46,125,50,.08)" : "none",
        transition: "border-color .25s, box-shadow .25s",
      }}
    >
      {/* Question button */}
      <button
        onClick={() => onToggle(index)}
        style={{
          width: "100%",
          background: isOpen ? "var(--g50)" : "#fff",
          border: "none",
          textAlign: "left",
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: ".95rem",
          fontWeight: 600,
          color: isOpen ? "var(--g600)" : "var(--ch)",
          transition: "background .2s, color .2s",
          gap: 16,
        }}
      >
        <span style={{ flex: 1, lineHeight: 1.5 }}>{faq.q}</span>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isOpen ? "var(--g500)" : "var(--g50)",
            border: `1.5px solid ${isOpen ? "var(--g500)" : "var(--g200)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 700,
            color: isOpen ? "#fff" : "var(--g500)",
            flexShrink: 0,
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform .3s ease, background .25s, color .25s, border-color .25s",
          }}
        >
          +
        </span>
      </button>

      {/* Answer — height animated via JS measurement */}
      <div
        style={{
          maxHeight: height,
          overflow: "hidden",
          transition: "max-height .38s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div ref={answerRef} style={{ padding: "0 22px 20px", borderTop: "1px solid var(--g100)" }}>
          <p style={{
            fontSize: ".9rem",
            color: "var(--mu)",
            lineHeight: 1.8,
            paddingTop: 16,
          }}>
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(prev => prev === i ? null : i);

  const faqs = [
    {
      q: "What is a carbon credit?",
      a: "A carbon credit represents the verified removal or prevention of 1 tonne of CO₂ equivalent from the atmosphere. Projects earn credits through activities like reforestation, renewable energy installation, methane capture, or soil carbon sequestration — each independently verified before credits are issued.",
    },
    {
      q: "Is this a real trading platform?",
      a: "CarbonX is currently a simulation platform designed for educational and demonstration purposes. However, the platform is being developed with a scalable architecture, allowing it to evolve in the future into a fully functional marketplace that can support real carbon credit transactions and financial integration, subject to regulatory frameworks and compliance standards.",
    },
    {
      q: "Who can use the platform?",
      a: "Anyone interested in climate action can join. Buyers browse and purchase verified carbon credits to offset their emissions. Sellers list sustainability projects and earn from credit sales. Admins oversee project verification and platform health. Registration is free for all roles.",
    },
    {
      q: "How are projects verified?",
      a: "Sellers submit projects with full descriptions, locations, impact methodologies, total credit volumes, and per-credit pricing. Platform admins independently review each submission and either verify it for public listing or reject it with a clear reason. Only verified projects are visible in the marketplace.",
    },
    {
      q: "What happens when I buy credits?",
      a: "Your purchase is recorded atomically using database transactions — credits are deducted from the project's available supply and instantly added to your portfolio. Every purchase is logged with a timestamp, price snapshot, and project reference, making it fully traceable and non-reversible.",
    },
    {
      q: "Can I track my environmental impact?",
      a: "Yes — your Portfolio dashboard shows your total credits, CO₂ offset in tonnes, and real-world equivalents: trees planted, car miles avoided, homes powered for a year, and flight hours avoided. Holdings are broken down project by project with a monthly activity chart.",
    },
    {
      q: "How do I list a carbon project as a seller?",
      a: "After registering as a Seller, go to My Projects → New Project. Fill in the project title, description, location, impact type (forest, wind, solar, etc.), total credit volume, and price per credit. Submit for admin review — once verified, your project goes live in the marketplace immediately.",
    },
  ];

  return (
    <section className="sec sec-alt" id="faq">
      <div className="con" style={{ maxWidth: 780 }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="rv">
            <div className="eye" style={{ justifyContent: "center" }}>FAQ</div>
          </div>
          <div className="rv">
            <h2 className="sec-t">Common Questions</h2>
          </div>
          <div className="rv">
            <p className="sec-d" style={{ margin: "0 auto" }}>
              Everything you need to know about trading carbon credits on CarbonX.
            </p>
          </div>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="rv" style={{ transitionDelay: `${i * 0.05}s` }}>
              <FaqItem faq={faq} index={i} open={open} onToggle={toggle} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        {/* <div className="rv" style={{ textAlign: "center", marginTop: 36, padding: "24px", background: "var(--g50)", border: "1px solid var(--g100)", borderRadius: 14 }}>
          <p style={{ fontSize: ".9rem", color: "var(--mu)", marginBottom: 12 }}>
            Still have questions? We're happy to help.
          </p>
          <button
            className="btn btn-g-out"
            style={{ background: "transparent", color: "var(--g500)", border: "1.5px solid var(--g300)", borderRadius: 9, padding: "9px 20px", fontWeight: 700, cursor: "pointer", fontSize: ".875rem", fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
          >
            📧 Contact Support
          </button>
        </div> */}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT SECTION 
═══════════════════════════════════════════════ */
function ContactSection({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: "", email: "", message: "" });
  };
 
  const infoCards = [
    { icon:"📧", bg:"#f0faf4", title:"Email Support", body:"General questions, account issues, and platform help.", link:"support@carbonx.io", href:"mailto:support@carbonx.io" },
    { icon:"🌿", bg:"#eff6ff", title:"Seller Enquiries", body:"Listing projects, verification, and sales dashboard help.", link:"support@carbonx.io", href:"mailto:sellers@carbonx.io" },
    { icon:"🤝", bg:"#fefce8", title:"Partnerships", body:"Institutional use, educational licensing, and press enquiries.", link:"support@carbonx.io", href:"mailto:partners@carbonx.io" },
  ];
 
  return (
    <section className="sec sec-alt" id="contact">
      <div className="con">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 44, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="rv"><div className="eye">Contact</div></div>
            <div className="rv"><h2 className="sec-t" style={{ marginBottom: 0 }}>Get in Touch</h2></div>
            <div className="rv"><p className="sec-d" style={{ marginTop: 10 }}>Have questions about CarbonX, your account, or a project? We're here to help.</p></div>
          </div>
          <div className="rv">
            <button className="btn btn-out" ><Link to="/contact">Full Contact Page →</Link></button>
          </div>
        </div>
 
        <div className="contact-section-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 28, alignItems: "start" }}>
          {/* Left: info cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {infoCards.map((c, i) => (
              <div key={i} className={`rv contact-info-card d${i + 1}`}>
                <div className="contact-icon" style={{ background: c.bg }}>{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <a href={c.href} style={{ display: "block", marginTop: 8, color: "var(--g500)", fontWeight: 600, fontSize: ".84rem" }}>{c.link}</a>
              </div>
            ))}
          </div>
 
          {/* Right: quick form */}
          <div className="rv contact-form-card">
            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 16px" }}>
                <div style={{ width: 70, height: 70, background: "linear-gradient(135deg,#f0faf4,#e8f5e9)", border: "2px solid #aee4c5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 16px", animation: "countUp .4s ease" }}>✅</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "1.3rem", marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ fontSize: ".88rem", color: "var(--mu)", lineHeight: 1.7 }}>Thanks for reaching out. We'll reply within 24 hours.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: "1.3rem", marginBottom: 6 }}>Send a Quick Message</h3>
                <p style={{ fontSize: ".85rem", color: "var(--mu)", marginBottom: 22, lineHeight: 1.65 }}>
                  For detailed inquiries, use our <a href="/contact" style={{ color: "var(--g500)", fontWeight: 600 }}>full contact page</a> with inquiry type selection.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="cf-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                    <div>
                      <label className="cf-label">Your Name</label>
                      <input className="cf-input" placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
                    </div>
                    <div>
                      <label className="cf-label">Email Address</label>
                      <input className="cf-input" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} required />
                    </div>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label className="cf-label">Message</label>
                    <textarea className="cf-input" placeholder="How can we help you today?" value={form.message} onChange={set("message")} required />
                  </div>
                  <button type="submit" className="cf-submit" disabled={sending}>
                    {sending ? "⏳ Sending…" : "📬 Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════ */
function Footer({ navigate }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,var(--g400),var(--g300))", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🌱</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, color: "#fff", fontSize: "1rem" }}>CarbonX</span>
          </div>
          <p className="ft-desc">A simulation platform that democratises access to carbon credit markets — making climate action accessible to everyone.</p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(46,125,50,.2)", border:"1px solid rgba(76,175,125,.3)", borderRadius:8, padding:"6px 12px", fontSize:".72rem", color:"var(--g400)", fontWeight:600, marginTop:14, fontFamily:"'JetBrains Mono',monospace" }}>
            🌿 Carbon Neutral Platform
          </div>
        </div>
        {[
          { h:"Platform",  links:[["Marketplace","marketplace"],["How It Works","howitworks"],["Projects","projects"],["About","about"]] },
          { h:"Resources", links:[["Carbon Education","faq"],["FAQ","faq"],["Documentation","faq"],["API Docs","faq"]] },
          { h:"Company",   links:[["About","about"],["Contact","about"],["GitHub","about"],["Report Issue","about"]] },
        ].map(col=>(
          <div key={col.h} className="ft-col">
            <h4>{col.h}</h4>
            <ul>
              {col.links.map(([lbl,id])=>(
                <li key={lbl}><a href="#" onClick={e=>{e.preventDefault();scrollTo(id);}}>{lbl}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-btm">
        <p>© 2026 Carbon Marketplace Simulation Platform</p>
        <div className="ft-lnks">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   ROOT COMPONENT
═══════════════════════════════════════════════ */
export default function LandingPage({ navigate }) {
  const [activeSec, setActiveSec] = useState("home");
  useReveal();

  // Track active section for navbar
  useEffect(() => {
    const sections = ["home","marketplace","howitworks","projects","about"];
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSec(e.target.id); }),
      { threshold: 0.3 }
    );
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Styles />
      <Navbar navigate={navigate} activeSec={activeSec} />
      <Hero navigate={navigate} />
      <Ticker />
      <Problem />
      <Solution />
      <HowItWorks />
      <MarketPreview navigate={navigate} />
      <Metrics />
      <Benefits />
      <Features />
      <Testimonials />
      <CTA navigate={navigate} />
      <FAQ />
      <Footer navigate={navigate} />
    </div>
  );
}