import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Styles ─────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .ab-page *,
    .ab-page *::before,
    .ab-page *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .ab-page {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #fafaf7;
      color: #1a1f1c;
      min-height: 100vh;
    }

    .ab-page h1, .ab-page h2, .ab-page h3, .ab-page h4 {
      font-family: 'Playfair Display', serif;
      line-height: 1.15;
    }

    /* Scrollbar */
    .ab-page ::-webkit-scrollbar { width: 5px; }
    .ab-page ::-webkit-scrollbar-track { background: #f0faf4; }
    .ab-page ::-webkit-scrollbar-thumb { background: #4caf7d; border-radius: 3px; }

    /* Top nav */
    .ab-topnav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,.96);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid #e5e7eb;
      padding: 0 24px;
    }
    .ab-topnav-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      height: 62px;
    }
    .ab-logo {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
    }
    .ab-logo-icon {
      width: 34px; height: 34px;
      background: linear-gradient(135deg,#2E7D32,#4caf7d);
      border-radius: 9px; display: flex; align-items: center;
      justify-content: center; font-size: .95rem;
      box-shadow: 0 4px 12px rgba(46,125,50,.25);
    }
    .ab-logo-text {
      font-family: 'Playfair Display', serif;
      font-weight: 800; font-size: 1rem; color: #2E7D32;
    }
    .ab-nav-links {
      display: flex; gap: 4px; list-style: none;
    }
    .ab-nav-links a {
      font-size: .82rem; font-weight: 600; color: #6b7280;
      padding: 6px 12px; border-radius: 7px;
      text-decoration: none; transition: all .2s;
    }
    .ab-nav-links a:hover { background: #f0faf4; color: #2E7D32; }
    .ab-nav-links a.active { background: #f0faf4; color: #2E7D32; }
    .ab-nav-right { display: flex; gap: 10px; }
    .ab-btn { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; border-radius: 9px; font-weight: 700; font-size: .82rem; padding: 8px 16px; border: none; transition: all .2s; }
    .ab-btn-g { background: #2E7D32; color: #fff; box-shadow: 0 4px 14px rgba(46,125,50,.25); }
    .ab-btn-g:hover { background: #1b5e20; transform: translateY(-1px); }
    .ab-btn-out { background: #fff; color: #374151; border: 1.5px solid #e5e7eb; }
    .ab-btn-out:hover { border-color: #aee4c5; color: #2E7D32; }

    /* Sidebar + layout */
    .ab-layout {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 240px 1fr;
      gap: 0; min-height: calc(100vh - 62px);
    }
    .ab-sidebar {
      position: sticky; top: 62px; height: calc(100vh - 62px);
      overflow-y: auto; padding: 28px 0;
      border-right: 1px solid #e5e7eb;
      background: #fff;
    }
    .ab-sidebar::-webkit-scrollbar { width: 3px; }
    .ab-sb-group { margin-bottom: 24px; padding: 0 16px; }
    .ab-sb-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: .62rem; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase;
      color: #9ca3af; padding: 0 8px; margin-bottom: 6px;
    }
    .ab-sb-link {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; border-radius: 9px;
      font-size: .82rem; font-weight: 500; color: #6b7280;
      cursor: pointer; transition: all .18s; border: none;
      background: transparent; width: 100%; text-align: left;
      margin-bottom: 2px;
    }
    .ab-sb-link:hover { background: #f0faf4; color: #2E7D32; }
    .ab-sb-link.active { background: #f0faf4; color: #2E7D32; font-weight: 700; }
    .ab-sb-link .sb-icon { font-size: .95rem; width: 20px; text-align: center; }

    /* Main content */
    .ab-main {
      padding: 48px 52px;
      max-width: 860px;
    }

    /* Section blocks */
    .ab-section { margin-bottom: 72px; }
    .ab-section-eye {
      display: inline-flex; align-items: center; gap: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: .68rem; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase;
      color: #2E7D32; background: #f0faf4;
      border: 1px solid #aee4c5; border-radius: 99px;
      padding: 4px 12px; margin-bottom: 14px;
    }
    .ab-section h2 {
      font-size: clamp(1.6rem, 3vw, 2.1rem);
      font-weight: 900; color: #1a1f1c;
      margin-bottom: 14px;
    }
    .ab-section p {
      font-size: .95rem; color: #4b5563;
      line-height: 1.82; margin-bottom: 18px;
    }
    .ab-divider {
      width: 100%; height: 1px;
      background: linear-gradient(90deg, #aee4c5, transparent);
      margin: 56px 0;
    }

    /* Highlight box */
    .ab-highlight {
      background: linear-gradient(135deg, #f0faf4, #e3f2fd);
      border: 1px solid #aee4c5; border-radius: 14px;
      padding: 22px 24px; margin: 20px 0;
    }
    .ab-highlight-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: .72rem; font-weight: 600;
      letter-spacing: .1em; text-transform: uppercase;
      color: #2E7D32; margin-bottom: 10px;
    }

    /* Steps */
    .ab-step {
      display: flex; gap: 18px; margin-bottom: 22px;
      padding: 18px 20px;
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 13px; transition: all .2s;
    }
    .ab-step:hover { border-color: #aee4c5; box-shadow: 0 4px 18px rgba(46,125,50,.07); }
    .ab-step-num {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #2E7D32, #4caf7d);
      color: #fff; font-family: 'JetBrains Mono', monospace;
      font-size: .8rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; box-shadow: 0 4px 12px rgba(46,125,50,.25);
    }
    .ab-step-body h4 {
      font-family: 'Playfair Display', serif;
      font-size: .98rem; font-weight: 700;
      color: #1a1f1c; margin-bottom: 5px;
    }
    .ab-step-body p {
      font-size: .86rem; color: #6b7280;
      line-height: 1.7; margin: 0;
    }

    /* Cards grid */
    .ab-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 20px 0; }
    .ab-card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 13px; padding: 20px;
      transition: all .22s;
    }
    .ab-card:hover { border-color: #aee4c5; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.06); }
    .ab-card-icon {
      width: 44px; height: 44px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; margin-bottom: 12px;
    }
    .ab-card h4 {
      font-family: 'Playfair Display', serif;
      font-size: .95rem; font-weight: 700;
      color: #1a1f1c; margin-bottom: 7px;
    }
    .ab-card p { font-size: .83rem; color: #6b7280; line-height: 1.65; margin: 0; }

    /* Role banners */
    .ab-role-banner {
      border-radius: 16px; padding: 28px 30px;
      margin: 20px 0; position: relative; overflow: hidden;
    }
    .ab-role-banner h3 {
      font-size: 1.2rem; font-weight: 800; margin-bottom: 10px;
    }
    .ab-role-banner p { font-size: .9rem; line-height: 1.75; margin-bottom: 16px; }
    .ab-role-banner ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .ab-role-banner ul li { display: flex; gap: 8px; font-size: .875rem; align-items: flex-start; }
    .ab-role-banner ul li::before { content: "→"; flex-shrink: 0; font-weight: 700; }

    /* Glossary */
    .ab-glossary-item { border-bottom: 1px solid #f3f4f6; padding: 16px 0; }
    .ab-glossary-item:last-child { border-bottom: none; }
    .ab-glossary-term {
      font-family: 'JetBrains Mono', monospace;
      font-size: .82rem; font-weight: 600;
      color: #2E7D32; margin-bottom: 5px;
    }
    .ab-glossary-def { font-size: .875rem; color: #4b5563; line-height: 1.7; }

    /* Callout */
    .ab-callout {
      border-left: 4px solid; border-radius: 0 12px 12px 0;
      padding: 16px 20px; margin: 20px 0;
    }
    .ab-callout-g { border-color: #2E7D32; background: #f0faf4; }
    .ab-callout-b { border-color: #0288D1; background: #e3f2fd; }
    .ab-callout-y { border-color: #d97706; background: #fefce8; }
    .ab-callout strong { display: block; font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; font-family: 'JetBrains Mono', monospace; }
    .ab-callout p { font-size: .875rem; line-height: 1.7; margin: 0; color: #374151; }

    /* Table */
    .ab-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .ab-table th { background: #f9fafb; font-family: 'JetBrains Mono', monospace; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; padding: 10px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .ab-table td { padding: 12px 14px; font-size: .875rem; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .ab-table tr:hover td { background: #f9fafb; }

    /* CTA banner */
    .ab-cta {
      background: linear-gradient(135deg, #1b5e20, #2E7D32 60%, #01579b);
      border-radius: 18px; padding: 40px 36px;
      text-align: center; color: #fff; margin-top: 60px;
    }
    .ab-cta h2 { font-size: 1.8rem; font-weight: 900; margin-bottom: 10px; color: #fff; }
    .ab-cta p { color: rgba(255,255,255,.75); font-size: .95rem; line-height: 1.75; margin-bottom: 24px; max-width: 460px; margin-left: auto; margin-right: auto; }
    .ab-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .ab-cta-btn-w { background: #fff; color: #2E7D32; border: none; border-radius: 10px; padding: 12px 24px; font-weight: 700; font-size: .9rem; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .2s; }
    .ab-cta-btn-w:hover { background: #f0faf4; transform: translateY(-2px); }
    .ab-cta-btn-g { background: rgba(255,255,255,.15); color: #fff; border: 1.5px solid rgba(255,255,255,.3); border-radius: 10px; padding: 12px 24px; font-weight: 700; font-size: .9rem; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .2s; }
    .ab-cta-btn-g:hover { background: rgba(255,255,255,.25); }

    /* Responsive */
    @media (max-width: 900px) {
      .ab-layout { grid-template-columns: 1fr; }
      .ab-sidebar { display: none; }
      .ab-main { padding: 28px 20px; max-width: 100%; }
      .ab-cards { grid-template-columns: 1fr; }
      .ab-topnav .ab-nav-links { display: none; }
    }
  `}</style>
);

/* ─── Sidebar nav config ─────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "Platform",
    items: [
      { id: "about-carbonx",    icon: "🌱", label: "About CarbonX"       },
      { id: "what-is-carbon",   icon: "♻️", label: "What is a Carbon Credit" },
      { id: "co2-contracts",    icon: "📄", label: "CO₂ Contracts Explained" },
      { id: "how-marketplace",  icon: "🌍", label: "How the Marketplace Works" },
    ],
  },
  {
    label: "For Buyers",
    items: [
      { id: "buyer-overview",   icon: "🛒", label: "Buyer Overview"       },
      { id: "how-to-buy",       icon: "💳", label: "How to Purchase Credits" },
      { id: "buyer-portfolio",  icon: "📊", label: "Portfolio & Tracking"  },
      { id: "buyer-impact",     icon: "🌳", label: "Understanding Impact"  },
    ],
  },
  {
    label: "For Sellers",
    items: [
      { id: "seller-overview",  icon: "🌿", label: "Seller Overview"       },
      { id: "how-to-list",      icon: "📋", label: "How to List a Project" },
      { id: "verification",     icon: "✅", label: "Verification Process"  },
      { id: "seller-sales",     icon: "💰", label: "Sales & Revenue"       },
    ],
  },
  {
    label: "Reference",
    items: [
      { id: "impact-types",     icon: "🔬", label: "Project Impact Types"  },
      { id: "glossary",         icon: "📖", label: "Glossary"              },
      { id: "faq-about",        icon: "❓", label: "FAQ"                   },
    ],
  },
];

/* ─── Scroll-spy hook ───────────────────────────────────── */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return [active, setActive];
}

/* ─── Expand/collapse FAQ item ──────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const [h, setH] = useState(0);
  useEffect(() => { if (ref.current) setH(open ? ref.current.scrollHeight : 0); }, [open]);
  return (
    <div style={{ border: `1.5px solid ${open ? "#4caf7d" : "#e5e7eb"}`, borderRadius: 12, overflow: "hidden", marginBottom: 10, background: "#fff", transition: "border-color .25s" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: open ? "#f0faf4" : "#fff", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: ".9rem", fontWeight: 600, color: open ? "#2E7D32" : "#1a1f1c", textAlign: "left", gap: 14 }}>
        <span style={{ flex: 1 }}>{q}</span>
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: open ? "#2E7D32" : "#f0faf4", border: `1.5px solid ${open ? "#2E7D32" : "#aee4c5"}`, display: "flex", alignItems: "center", justifyContent: "center", color: open ? "#fff" : "#2E7D32", fontWeight: 700, fontSize: ".9rem", flexShrink: 0, transform: open ? "rotate(45deg)" : "none", transition: "transform .3s, background .25s" }}>+</span>
      </button>
      <div style={{ maxHeight: h, overflow: "hidden", transition: "max-height .38s cubic-bezier(.4,0,.2,1)" }}>
        <div ref={ref} style={{ padding: "0 20px 16px", borderTop: "1px solid #d6f2e2" }}>
          <p style={{ fontSize: ".875rem", color: "#4b5563", lineHeight: 1.8, paddingTop: 14, margin: 0 }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main About Page ────────────────────────────────────── */
export default function AboutPage() {
  const navigate = useNavigate();

  const allIds = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));
  const [active] = useActiveSection(allIds);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ab-page">
      <Styles />

      {/* ── Top navbar ── */}
      <nav className="ab-topnav">
        <div className="ab-topnav-inner">
          <div className="ab-logo" onClick={() => navigate("/")}>
            <span className="ab-logo-text">CarbonX</span>
          </div>
          <ul className="ab-nav-links">
            {[["/" ,"Home"],[ "/marketplace","Marketplace"],[ "/about","About"],[ "/contact","Contact Us"]].map(([path, lbl]) => (
              <li key={path}><a href={path} className={path === "/about" ? "active" : ""}>{lbl}</a></li>
            ))}
          </ul>
          <div className="ab-nav-right">
            <button className="ab-btn ab-btn-out" onClick={() => navigate("/login")}>Login</button>
            <button className="ab-btn ab-btn-g" onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── Hero banner ── */}
      <div style={{ background: "linear-gradient(155deg,#1b5e20,#2E7D32 55%,#01579b)", padding: "52px 24px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.9)", borderRadius: 99, padding: "4px 14px", fontSize: ".7rem", fontFamily: "'JetBrains Mono',monospace", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>
          📖 Platform Documentation
        </div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: 12 }}>About CarbonX</h1>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: "1rem", maxWidth: 540, margin: "0 auto", lineHeight: 1.75 }}>
          Everything you need to know about carbon credits, how this marketplace works, and how to get the most out of the platform — whether you're a buyer or a seller.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div className="ab-layout">

        {/* Sidebar */}
        <aside className="ab-sidebar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="ab-sb-group">
              <div className="ab-sb-label">{group.label}</div>
              {group.items.map((item) => (
                <button key={item.id} className={`ab-sb-link${active === item.id ? " active" : ""}`} onClick={() => scrollTo(item.id)}>
                  <span className="sb-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="ab-main">

          {/* ════ ABOUT CARBONX ════ */}
          <section id="about-carbonx" className="ab-section">
            <div className="ab-section-eye">🌱 Platform</div>
            <h2>About CarbonX</h2>
            <p>CarbonX is a transparent carbon credit marketplace that connects organizations and individuals who want to offset their carbon emissions with verified sustainability project owners who have earned carbon credits through real environmental work.</p>
            <p>The platform is built as a full-stack fintech simulation — mirroring exactly how real voluntary carbon markets operate — including project verification, credit trading, portfolio tracking, and impact reporting. It is designed for education, research, and demonstration purposes.</p>

            <div className="ab-highlight">
              <div className="ab-highlight-title">🎯 Mission</div>
              <p style={{ fontSize: ".9rem", color: "#374151", lineHeight: 1.75, margin: 0 }}>
                To democratize access to carbon offset markets — making climate action simple, transparent, and accessible to every organization and individual, regardless of size or budget.
              </p>
            </div>

            <div className="ab-cards">
              {[
                { icon:"🛒", bg:"#eff6ff", title:"For Buyers", body:"Browse verified carbon offset projects and purchase credits to neutralize your emissions. Track your entire portfolio and CO₂ impact in one place." },
                { icon:"🌿", bg:"#f0faf4", title:"For Sellers", body:"List your sustainability projects, earn from credit sales, and reach a global network of climate-conscious buyers." },
                { icon:"⚙️", bg:"#fefce8", title:"For Admins", body:"Review and verify projects before they go live, manage users, and monitor all platform transactions in real time." },
                { icon:"📊", bg:"#fdf4ff", title:"Full Transparency", body:"Every credit purchase is recorded atomically. No double-counting. Full traceability from purchase to retirement." },
              ].map((c) => (
                <div key={c.title} className="ab-card">
                  <div className="ab-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="ab-divider" />

          {/* ════ WHAT IS A CARBON CREDIT ════ */}
          <section id="what-is-carbon" className="ab-section">
            <div className="ab-section-eye">♻️ Education</div>
            <h2>What is a Carbon Credit?</h2>
            <p>A <strong>carbon credit</strong> is a tradeable certificate representing the removal or prevention of <strong>exactly 1 metric tonne of CO₂ equivalent (tCO₂e)</strong> from the atmosphere. It is the fundamental unit of trade in all carbon markets.</p>
            <p>Carbon credits are generated by projects that actively reduce, remove, or avoid greenhouse gas emissions — such as planting forests, installing wind farms, distributing clean cookstoves, or capturing methane from landfills. Each project undergoes independent measurement and verification before credits are issued.</p>

            <div className="ab-callout ab-callout-g">
              <strong>The Core Rule</strong>
              <p>1 Carbon Credit = 1 Tonne of CO₂ removed or avoided. Once purchased and retired, that credit cannot be sold or used again — ever. This is what prevents double-counting.</p>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.15rem", margin: "28px 0 14px" }}>How Credits Are Created</h3>
            <div className="ab-step"><div className="ab-step-num">01</div><div className="ab-step-body"><h4>Project Activity</h4><p>A sustainability project (forest, wind farm, solar installation, etc.) reduces or removes greenhouse gases through its real-world operations.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">02</div><div className="ab-step-body"><h4>Measurement & Monitoring</h4><p>The project tracks and measures exactly how much CO₂ was reduced or removed using scientifically accepted methodologies.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">03</div><div className="ab-step-body"><h4>Third-Party Verification</h4><p>An independent auditor reviews the data, confirms the methodology, and signs off on the number of credits that can be issued.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">04</div><div className="ab-step-body"><h4>Credits Issued & Listed</h4><p>Verified credits are registered, given unique serial numbers, and made available for purchase on platforms like CarbonX.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">05</div><div className="ab-step-body"><h4>Purchased & Retired</h4><p>A buyer purchases credits to offset their emissions. The credits are permanently retired — removed from circulation — so they can never be sold again.</p></div></div>

            <div className="ab-callout ab-callout-b">
              <strong>Real-World Equivalents (per 1 credit)</strong>
              <p>🌳 5 trees planted and grown for 10 years &nbsp;·&nbsp; 🚗 2,481 car miles not driven &nbsp;·&nbsp; 🏠 1/8 of a home powered for 1 year &nbsp;·&nbsp; ✈️ ~4 hours of flight avoided</p>
            </div>
          </section>

          <div className="ab-divider" />

          {/* ════ CO2 CONTRACTS ════ */}
          <section id="co2-contracts" className="ab-section">
            <div className="ab-section-eye">📄 Contracts</div>
            <h2>CO₂ Contracts Explained</h2>
            <p>A <strong>CO₂ contract</strong> in the context of voluntary carbon markets is the binding agreement between a buyer and a seller when carbon credits change hands. Unlike compliance markets (where governments mandate emissions limits), voluntary markets are driven by organizations choosing to offset their footprint.</p>

            <div className="ab-highlight">
              <div className="ab-highlight-title">📌 On CarbonX (Simulation)</div>
              <p style={{ fontSize: ".9rem", color: "#374151", lineHeight: 1.75, margin: 0 }}>
                CarbonX simulates the mechanics of real CO₂ contracts. Each credit purchase records: the buyer, the seller, the project, the number of credits, the price per credit, the total amount, and the exact timestamp. This data is immutable — it cannot be changed after the transaction completes.
              </p>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.15rem", margin: "28px 0 14px" }}>Types of Carbon Market Contracts</h3>
            <table className="ab-table">
              <thead><tr><th>Contract Type</th><th>Description</th><th>Who Uses It</th></tr></thead>
              <tbody>
                {[
                  ["Spot Contract","Credits bought and delivered immediately at the current market price.","Most buyers on voluntary markets"],
                  ["Forward Contract","Agreement to buy credits at a future date at a pre-agreed price.","Large corporates locking in future prices"],
                  ["Futures Contract","Standardised contracts traded on exchanges for future delivery.","Institutional investors, compliance markets"],
                  ["Retirement Contract","Credits purchased specifically to be permanently retired.","Offset buyers — what CarbonX simulates"],
                ].map(([t,d,w]) => (
                  <tr key={t}><td style={{ fontWeight: 600, color: "#2E7D32" }}>{t}</td><td>{d}</td><td style={{ color: "#6b7280", fontSize: ".82rem" }}>{w}</td></tr>
                ))}
              </tbody>
            </table>

            <div className="ab-callout ab-callout-y">
              <strong>⚠️ Additionality</strong>
              <p>A key concept in carbon contracts is <em>additionality</em> — the reduction must be additional to what would have happened anyway. A forest that was never going to be cut down cannot generate valid credits. CarbonX's verification process checks for this.</p>
            </div>
          </section>

          <div className="ab-divider" />

          {/* ════ HOW THE MARKETPLACE WORKS ════ */}
          <section id="how-marketplace" className="ab-section">
            <div className="ab-section-eye">🌍 Marketplace</div>
            <h2>How the Marketplace Works</h2>
            <p>CarbonX operates as a two-sided marketplace. Sellers list projects and earn from credit sales. Buyers browse and purchase credits to offset their emissions. Admins ensure quality by verifying every project before it goes live.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "22px 0" }}>
              {[
                { emoji:"🌿", title:"Sellers List", desc:"Submit projects with descriptions, locations, methodologies, credit volumes, and pricing." },
                { emoji:"✅", title:"Admins Verify", desc:"Every project is reviewed. Only verified projects appear in the public marketplace." },
                { emoji:"🛒", title:"Buyers Purchase", desc:"Browse, filter, and buy credits. Each purchase is atomic and instantly reflected in your portfolio." },
              ].map(c => (
                <div key={c.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 13, padding: "20px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 10 }}>{c.emoji}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: ".95rem", marginBottom: 7 }}>{c.title}</div>
                  <p style={{ fontSize: ".82rem", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            <div className="ab-callout ab-callout-g">
              <strong>🔐 Atomic Transactions</strong>
              <p>All credit purchases on CarbonX use database-level transactions. This means either the full purchase completes (credits deducted, portfolio updated, record created) or nothing happens at all. There is no partial state — your credits are always accurate.</p>
            </div>
          </section>

          <div className="ab-divider" />

          {/* ════ BUYER OVERVIEW ════ */}
          <section id="buyer-overview" className="ab-section">
            <div className="ab-section-eye">🛒 For Buyers</div>
            <h2>Buyer Overview</h2>

            <div className="ab-role-banner" style={{ background: "linear-gradient(135deg,#eff6ff,#e3f2fd)", border: "1px solid #bfdbfe" }}>
              <h3 style={{ color: "#1e40af" }}>You are a Buyer if you want to offset your emissions</h3>
              <p style={{ color: "#1e3a8a" }}>As a buyer you browse the marketplace, select projects that match your values, purchase carbon credits, and track your environmental impact — all from your personal portfolio dashboard.</p>
              <ul style={{ color: "#1e40af" }}>
                {["Browse and filter verified carbon projects by type, location, and price","Purchase credits with a single click — no broker needed","Track total CO₂ offset in your live portfolio dashboard","See real-world impact equivalents (trees, car miles, homes powered)","View your complete transaction history","Diversify holdings across multiple project types"].map(it => <li key={it}>{it}</li>)}
              </ul>
            </div>
          </section>

          {/* ════ HOW TO BUY ════ */}
          <section id="how-to-buy" className="ab-section">
            <div className="ab-section-eye">💳 Purchasing</div>
            <h2>How to Purchase Credits</h2>
            <p>Buying carbon credits on CarbonX takes less than 60 seconds. Here's the full process:</p>

            <div className="ab-step"><div className="ab-step-num">1</div><div className="ab-step-body"><h4>Create a Buyer Account</h4><p>Register at <strong>/register</strong> and select <em>Buyer</em> as your account type. No documents or fees required.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">2</div><div className="ab-step-body"><h4>Browse the Marketplace</h4><p>Go to <strong>/marketplace</strong>. Filter projects by impact type (Forest Conservation, Renewable Energy, Blue Carbon, etc.) or search by name and location.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">3</div><div className="ab-step-body"><h4>Select a Project</h4><p>Click any project card to open the purchase modal. Review the description, location, verification status, available credits, and price per credit.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">4</div><div className="ab-step-body"><h4>Choose Your Credit Amount</h4><p>Use the stepper to select how many credits you want. Each credit = 1 tonne of CO₂ offset. The total cost updates live as you adjust the quantity.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">5</div><div className="ab-step-body"><h4>Confirm Purchase</h4><p>Click the Buy button. The transaction is atomic — credits are deducted from the project's supply and added to your portfolio simultaneously.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">6</div><div className="ab-step-body"><h4>Track in Portfolio</h4><p>Navigate to <strong>/portfolio</strong> to see your holdings, CO₂ offset total, and environmental impact breakdown by project.</p></div></div>

            <div className="ab-callout ab-callout-y">
              <strong>💡 Tip</strong>
              <p>You can only purchase credits from <em>verified</em> projects. Projects marked as "Pending" or "Rejected" are not available for purchase. You also cannot buy credits from projects you yourself listed as a seller.</p>
            </div>
          </section>

          {/* ════ BUYER PORTFOLIO ════ */}
          <section id="buyer-portfolio" className="ab-section">
            <div className="ab-section-eye">📊 Portfolio</div>
            <h2>Portfolio & Tracking</h2>
            <p>Your Portfolio dashboard at <strong>/portfolio</strong> gives you a complete view of your carbon offset activity.</p>
            <div className="ab-cards">
              {[
                { icon:"🌿", bg:"#f0faf4", title:"Total Credits", body:"The total number of carbon credits you own across all projects. Each credit = 1 tonne of CO₂ permanently offset." },
                { icon:"💰", bg:"#fefce8", title:"Total Invested", body:"The total amount you have spent on carbon credits, plus your average cost per credit across all purchases." },
                { icon:"📦", bg:"#eff6ff", title:"Projects Backed", body:"A breakdown of which projects you've invested in, with individual holding percentages and amounts." },
                { icon:"📈", bg:"#fdf4ff", title:"Monthly Activity", body:"A bar chart showing when you made purchases, letting you track your offset activity over time." },
              ].map(c => (
                <div key={c.title} className="ab-card">
                  <div className="ab-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ════ BUYER IMPACT ════ */}
          <section id="buyer-impact" className="ab-section">
            <div className="ab-section-eye">🌳 Impact</div>
            <h2>Understanding Your Impact</h2>
            <p>Raw tonne numbers can feel abstract. CarbonX converts your CO₂ offset into intuitive real-world equivalents so you can feel the scale of your contribution.</p>
            <table className="ab-table">
              <thead><tr><th>Equivalent</th><th>Formula</th><th>Example (100 credits)</th></tr></thead>
              <tbody>
                {[
                  ["🌳 Trees planted","Credits × 5","500 trees"],
                  ["🚗 Car miles avoided","Credits × 2,481","248,100 miles"],
                  ["🏠 Homes powered / year","Credits ÷ 7.5","13 homes"],
                  ["✈️ Flight hours avoided","Credits ÷ 0.255","392 hours"],
                  ["💧 Olympic pools saved","Credits × 0.3","30 pools"],
                  ["⚡ kWh clean energy equiv.","Credits × 1,000","100,000 kWh"],
                ].map(([e,f,ex]) => (
                  <tr key={e}><td style={{ fontWeight: 600 }}>{e}</td><td style={{ fontFamily: "monospace", fontSize: ".8rem", color: "#6b7280" }}>{f}</td><td style={{ color: "#2E7D32", fontFamily: "monospace", fontWeight: 600 }}>{ex}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="ab-divider" />

          {/* ════ SELLER OVERVIEW ════ */}
          <section id="seller-overview" className="ab-section">
            <div className="ab-section-eye">🌿 For Sellers</div>
            <h2>Seller Overview</h2>

            <div className="ab-role-banner" style={{ background: "linear-gradient(135deg,#f0faf4,#e8f5e9)", border: "1px solid #aee4c5" }}>
              <h3 style={{ color: "#1b5e20" }}>You are a Seller if you run a sustainability project</h3>
              <p style={{ color: "#2E7D32" }}>As a seller you list carbon offset projects, set your credit price, go through admin verification, and earn revenue from buyers who purchase your credits.</p>
              <ul style={{ color: "#1b5e20" }}>
                {["List unlimited sustainability projects with full descriptions","Set your own price per credit in USD","Get reviewed and verified by platform admins","Reach buyers globally from a single dashboard","Track sales, revenue, and credits sold in real time","Edit pending projects before they go live"].map(it => <li key={it}>{it}</li>)}
              </ul>
            </div>
          </section>

          {/* ════ HOW TO LIST ════ */}
          <section id="how-to-list" className="ab-section">
            <div className="ab-section-eye">📋 Listing</div>
            <h2>How to List a Project</h2>
            <p>Listing your carbon offset project on CarbonX is a straightforward process. Follow these steps:</p>

            <div className="ab-step"><div className="ab-step-num">1</div><div className="ab-step-body"><h4>Create a Seller Account</h4><p>Register at <strong>/register</strong> and select <em>Seller</em> as your account type. Your dashboard will be ready immediately.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">2</div><div className="ab-step-body"><h4>Go to New Project</h4><p>From your seller dashboard, click <strong>New Project</strong> or navigate to <strong>/seller/create</strong>.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">3</div><div className="ab-step-body"><h4>Fill in Project Details</h4><p>Complete all required fields — project title, description (min 20 characters), location, impact type, total credit volume, and price per credit in USD.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">4</div><div className="ab-step-body"><h4>Choose an Impact Type</h4><p>Select the category that best describes your project: Forest Conservation, Renewable Energy, Blue Carbon, Clean Cooking, Peatland Conservation, Biodiversity Conservation, Soil Carbon, Methane Capture, or Other.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">5</div><div className="ab-step-body"><h4>Submit for Verification</h4><p>Click Submit. Your project is immediately sent to admin review with <em>Pending</em> status. Buyers cannot see or purchase from it yet.</p></div></div>
            <div className="ab-step"><div className="ab-step-num">6</div><div className="ab-step-body"><h4>Wait for Verification</h4><p>An admin reviews your project. If approved, status changes to <em>Verified</em> and it instantly appears in the public marketplace. If rejected, you'll see the reason and can edit and resubmit.</p></div></div>

            <div className="ab-callout ab-callout-g">
              <strong>✏️ Editing Projects</strong>
              <p>You can edit a project while it is in <em>Pending</em> status. Editing automatically re-sets it to Pending for re-review. Once a project is <em>Verified</em>, it cannot be edited — contact admin support for changes to live projects.</p>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.1rem", margin: "24px 0 14px" }}>What Makes a Good Project Description?</h3>
            <div className="ab-cards">
              {[
                { icon:"✅", bg:"#f0faf4", title:"Clear Methodology", body:"Explain how your project reduces or removes CO₂. Reviewers look for specifics — hectares of forest, MW of energy capacity, number of households." },
                { icon:"📍", bg:"#eff6ff", title:"Precise Location", body:"Include the country and region. Buyers often filter by geography. Specific location data also builds trust." },
                { icon:"📊", bg:"#fefce8", title:"Realistic Pricing", body:"Research comparable projects. Forest conservation typically ranges $10–$50/credit. Renewable energy $5–$30. Blue carbon can be $20–$80." },
                { icon:"🔢", bg:"#fdf4ff", title:"Accurate Credit Volume", body:"List the total number of credits you can offer. This cannot be increased after verification — plan accordingly." },
              ].map(c => (
                <div key={c.title} className="ab-card">
                  <div className="ab-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ════ VERIFICATION ════ */}
          <section id="verification" className="ab-section">
            <div className="ab-section-eye">✅ Verification</div>
            <h2>Verification Process</h2>
            <p>Every project on CarbonX goes through an admin review before it appears in the marketplace. This ensures that buyers can trust the quality of what they are purchasing.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "20px 0" }}>
              {[
                { status:"Pending", color:"#d97706", bg:"#fefce8", border:"#fde68a", icon:"⏳", desc:"Submitted and awaiting admin review. Not visible to buyers." },
                { status:"Verified", color:"#166534", bg:"#f0faf4", border:"#aee4c5", icon:"✓", desc:"Approved and live in the marketplace. Buyers can purchase." },
                { status:"Rejected", color:"#991b1b", bg:"#fef2f2", border:"#fecaca", icon:"✗", desc:"Not approved. A reason is provided. You can edit and resubmit." },
              ].map(s => (
                <div key={s.status} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 13, padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: s.color, marginBottom: 8 }}>{s.status}</div>
                  <p style={{ fontSize: ".82rem", color: "#4b5563", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: "1.1rem", margin: "24px 0 14px" }}>What Admins Check</h3>
            {[
              ["Project Description", "Is the methodology clearly explained? Does the description give buyers enough context to make an informed decision?"],
              ["Impact Type Match", "Does the selected impact type (Forest Conservation, Renewable Energy, etc.) accurately match what the project does?"],
              ["Credit Volume Plausibility", "Is the number of credits offered reasonable for the project size and type described?"],
              ["Pricing Sanity", "Is the price per credit within a plausible range for the project type and geography?"],
              ["Additionality", "Would this CO₂ reduction have happened anyway without the carbon credit mechanism? Projects must demonstrate additionality."],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2E7D32", flexShrink: 0, marginTop: 6 }} />
                <div><div style={{ fontWeight: 700, fontSize: ".875rem", marginBottom: 4 }}>{title}</div><p style={{ fontSize: ".85rem", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{desc}</p></div>
              </div>
            ))}
          </section>

          {/* ════ SELLER SALES ════ */}
          <section id="seller-sales" className="ab-section">
            <div className="ab-section-eye">💰 Revenue</div>
            <h2>Sales & Revenue</h2>
            <p>Your Sales dashboard at <strong>/seller/sales</strong> gives you a complete picture of your commercial performance.</p>
            <div className="ab-cards">
              {[
                { icon:"💰", bg:"#f0faf4", title:"Total Revenue", body:"The sum of all credit sales across all your projects, updated in real time as buyers make purchases." },
                { icon:"🌿", bg:"#eff6ff", title:"Credits Sold", body:"Total credits that have been purchased from your projects. Helps you gauge demand by project type." },
                { icon:"📋", bg:"#fefce8", title:"Transaction Count", body:"Number of individual purchase transactions completed. Useful for understanding buyer frequency." },
                { icon:"📈", bg:"#fdf4ff", title:"Revenue by Project", body:"Bar chart showing which of your projects generates the most revenue, helping you optimize pricing." },
              ].map(c => (
                <div key={c.title} className="ab-card">
                  <div className="ab-card-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="ab-divider" />

          {/* ════ PROJECT IMPACT TYPES ════ */}
          <section id="impact-types" className="ab-section">
            <div className="ab-section-eye">🔬 Reference</div>
            <h2>Project Impact Types</h2>
            <p>CarbonX supports 9 categories of carbon offset projects. Each category has different mechanisms, co-benefits, and typical price ranges.</p>
            <table className="ab-table">
              <thead><tr><th>Type</th><th>How It Works</th><th>Typical Price</th></tr></thead>
              <tbody>
                {[
                  ["🌿 Forest Conservation","Protects existing forests from deforestation, preventing the release of stored carbon.","$10–$50/credit"],
                  ["💨 Renewable Energy","Replaces fossil fuel electricity generation with solar, wind, or hydro energy.","$5–$25/credit"],
                  ["🌊 Blue Carbon","Restores mangroves, seagrasses, and saltmarshes — some of the most carbon-dense ecosystems.","$20–$80/credit"],
                  ["☀️ Clean Cooking","Distributes efficient cookstoves replacing wood-burning fires, reducing both CO₂ and indoor air pollution.","$8–$20/credit"],
                  ["🏔️ Peatland Conservation","Protects peat bogs, which store 2× more carbon per hectare than forests.","$15–$45/credit"],
                  ["🦧 Biodiversity Conservation","Protects habitats and species while also sequestering carbon through vegetation preservation.","$12–$40/credit"],
                  ["🌱 Soil Carbon","Promotes farming practices (no-till, cover crops) that increase organic carbon stored in agricultural soil.","$8–$30/credit"],
                  ["♻️ Methane Capture","Captures methane from landfills, wastewater, or livestock — methane is 28× more potent than CO₂.","$6–$18/credit"],
                  ["🔧 Other","Projects that don't fit neatly into the above categories but still generate verified CO₂ reductions.","Varies"],
                ].map(([t, h, p]) => (
                  <tr key={t}><td style={{ fontWeight: 600 }}>{t}</td><td style={{ fontSize: ".85rem", color: "#4b5563" }}>{h}</td><td style={{ fontFamily: "monospace", color: "#2E7D32", fontWeight: 600, whiteSpace: "nowrap" }}>{p}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ════ GLOSSARY ════ */}
          <section id="glossary" className="ab-section">
            <div className="ab-section-eye">📖 Glossary</div>
            <h2>Glossary</h2>
            <p>Key terms used throughout the CarbonX platform and in carbon markets generally.</p>
            {[
              ["Carbon Credit","A tradeable certificate representing the removal or prevention of 1 metric tonne of CO₂ equivalent from the atmosphere."],
              ["Carbon Offset","The act of compensating for greenhouse gas emissions by funding equivalent CO₂ reductions elsewhere. Buying and retiring credits is the mechanism."],
              ["Voluntary Carbon Market (VCM)","A market where organizations and individuals choose to buy carbon credits, as opposed to compliance markets where governments mandate it."],
              ["Additionality","The principle that a carbon reduction must be additional to what would have occurred without the carbon credit mechanism."],
              ["Retirement","The permanent cancellation of a carbon credit after purchase. Retired credits cannot be resold or reused — this prevents double-counting."],
              ["Verification","The independent review process that confirms a project's claimed CO₂ reductions are real, measurable, and additional."],
              ["tCO₂e","Tonnes of CO₂ equivalent. A unit that expresses the warming impact of all greenhouse gases in terms of the equivalent amount of CO₂."],
              ["Project Methodology","The scientific approach used to measure and verify a project's CO₂ reductions. Different project types use different approved methodologies."],
              ["Portfolio","On CarbonX, a buyer's collection of purchased and retired carbon credits, organised by project."],
              ["Atomic Transaction","A database operation that either fully completes or fully fails — no partial states. CarbonX uses atomic transactions for all credit purchases."],
              ["JWT (JSON Web Token)","The authentication mechanism CarbonX uses to securely identify logged-in users and control access to protected routes."],
              ["Role-Based Access Control","CarbonX restricts what each user can do based on their role: Buyers purchase credits, Sellers list projects, Admins verify and manage."],
            ].map(([term, def]) => (
              <div key={term} className="ab-glossary-item">
                <div className="ab-glossary-term">{term}</div>
                <div className="ab-glossary-def">{def}</div>
              </div>
            ))}
          </section>

          {/* ════ FAQ ════ */}
          <section id="faq-about" className="ab-section">
            <div className="ab-section-eye">❓ FAQ</div>
            <h2>Frequently Asked Questions</h2>
            {[
              ["Is CarbonX a real carbon trading platform?","CarbonX is a full-stack simulation platform built to demonstrate and teach carbon market mechanics. It mirrors a real voluntary carbon market in every way — project listing, verification, trading, and portfolio tracking — but does not involve real money or legally binding CO₂ contracts."],
              ["What currencies are used?","The marketplace displays prices in USD. On the platform's Indian-facing variant, prices are shown in Indian Rupees (₹). The currency display is a frontend formatting choice and does not affect the underlying data model."],
              ["Can I have both a Buyer and Seller account?","No — each registered account has a single role (Buyer or Seller). If you want to both list projects and purchase credits, you would need two separate accounts with different email addresses."],
              ["What happens if I want to delete a project?","You can delete any project that has zero sales. Projects with existing transactions cannot be deleted to preserve transaction history integrity. Contact an admin if you need to remove a live project with existing sales."],
              ["How are credits priced?","Sellers set their own price per credit when listing a project. There is no platform-mandated pricing — market forces determine credit values. Typical voluntary market prices range from $5 to $80 per tonne depending on project type and quality."],
              ["Can admins buy or sell credits?","No. Admin accounts are restricted to platform management functions — project verification, user management, and transaction monitoring. Admins cannot make purchases or list projects."],
              ["What is the maximum number of credits I can buy?","You can purchase any number of credits up to the project's current available supply. The stepper in the purchase modal enforces this limit automatically."],
              ["Why was my project rejected?","Admins provide a written rejection reason for every rejected project. Common reasons include: insufficient description, implausible credit volume, mismatched impact type, or concerns about additionality. Edit your project to address the feedback and resubmit."],
            ].map(([q, a]) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </section>

          {/* ════ CTA ════ */}
          <div className="ab-cta">
            <h2>Ready to Get Started?</h2>
            <p>Join CarbonX as a buyer to offset your emissions, or as a seller to monetize your sustainability projects. Registration is free and takes less than a minute.</p>
            <div className="ab-cta-btns">
              <button className="ab-cta-btn-w" onClick={() => navigate("/register")}>🌿 Create Account</button>
              <button className="ab-cta-btn-g" onClick={() => navigate("/marketplace")}>Browse Marketplace →</button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}