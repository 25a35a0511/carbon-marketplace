import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .cp * { box-sizing: border-box; margin: 0; padding: 0; }
    .cp {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #fafaf7; color: #1a1f1c;
      min-height: 100vh;
    }
    .cp h1,.cp h2,.cp h3,.cp h4 { font-family: 'Playfair Display', serif; line-height: 1.15; }
    .cp a { text-decoration: none; color: inherit; }
    .cp button { font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
    .cp input,.cp textarea,.cp select { font-family: 'Plus Jakarta Sans', sans-serif; }

    /* Nav */
    .cp-nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,.96); backdrop-filter: blur(14px);
      border-bottom: 1px solid #e5e7eb; padding: 0 24px;
    }
    .cp-nav-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      height: 62px;
    }
    .cp-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
    .cp-logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg,#2E7D32,#4caf7d); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: .95rem; box-shadow: 0 4px 12px rgba(46,125,50,.25); }
    .cp-logo-text { font-family: 'Playfair Display', serif; font-weight: 800; font-size: 1rem; color: #2E7D32; }
    .cp-nav-links { display: flex; gap: 4px; list-style: none; }
    .cp-nav-links a { font-size: .82rem; font-weight: 500; color: #6b7280; padding: 6px 12px; border-radius: 7px; text-decoration: none; transition: all .2s; }
    .cp-nav-links a:hover { background: #f0faf4; color: #2E7D32; }
    .cp-nav-links a.active { background: #f0faf4; color: #2E7D32; font-weight: 700; }
    .cp-nav-right { display: flex; gap: 10px; }
    .cp-btn { border-radius: 9px; font-weight: 700; font-size: .82rem; padding: 8px 16px; border: none; transition: all .2s; cursor: pointer; }
    .cp-btn-g { background: #2E7D32; color: #fff; box-shadow: 0 4px 12px rgba(46,125,50,.2); }
    .cp-btn-g:hover { background: #1b5e20; transform: translateY(-1px); }
    .cp-btn-out { background: #fff; color: #374151; border: 1.5px solid #e5e7eb; }
    .cp-btn-out:hover { border-color: #aee4c5; color: #2E7D32; }

    /* Hero */
    .cp-hero {
      background: linear-gradient(155deg,#1b5e20,#2E7D32 55%,#01579b);
      padding: 60px 24px 52px; text-align: center;
    }
    .cp-hero-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
      color: rgba(255,255,255,.9); border-radius: 99px; padding: 4px 14px;
      font-size: .7rem; font-family: 'JetBrains Mono', monospace;
      letter-spacing: .1em; text-transform: uppercase; margin-bottom: 16px;
    }
    .cp-hero h1 { font-size: clamp(2rem,5vw,3rem); font-weight: 900; color: #fff; margin-bottom: 12px; }
    .cp-hero p { color: rgba(255,255,255,.72); font-size: 1rem; max-width: 480px; margin: 0 auto; line-height: 1.75; }

    /* Layout */
    .cp-body { max-width: 1200px; margin: 0 auto; padding: 56px 24px 80px; }
    .cp-grid { display: grid; grid-template-columns: 1fr 1.6fr; gap: 40px; align-items: start; }

    /* Info panel */
    .cp-info { display: flex; flex-direction: column; gap: 16px; }
    .cp-info-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 16px;
      padding: 22px 24px; transition: all .22s;
    }
    .cp-info-card:hover { border-color: #aee4c5; box-shadow: 0 8px 28px rgba(46,125,50,.08); transform: translateY(-2px); }
    .cp-info-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 12px; }
    .cp-info-card h3 { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 700; color: #1a1f1c; margin-bottom: 6px; }
    .cp-info-card p { font-size: .85rem; color: #6b7280; line-height: 1.7; }
    .cp-info-card a { color: #2E7D32; font-weight: 600; }

    /* Hours table */
    .cp-hours { margin-top: 10px; }
    .cp-hour-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: .83rem; }
    .cp-hour-row:last-child { border-bottom: none; }
    .cp-hour-day { color: #374151; font-weight: 500; }
    .cp-hour-time { color: #2E7D32; font-family: 'JetBrains Mono', monospace; font-size: .78rem; font-weight: 600; }

    /* Channels */
    .cp-channels { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
    .cp-channel { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 10px; transition: all .18s; cursor: pointer; text-decoration: none; }
    .cp-channel:hover { background: #f0faf4; border-color: #aee4c5; }
    .cp-channel-icon { font-size: 1.1rem; }
    .cp-channel-label { font-size: .78rem; font-weight: 700; color: #374151; }
    .cp-channel-sub { font-size: .7rem; color: #9ca3af; }

    /* Form */
    .cp-form-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 20px;
      padding: 36px; position: relative; overflow: hidden;
    }
    .cp-form-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg,#2E7D32,#4caf7d,#0288D1);
    }
    .cp-form-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; color: #1a1f1c; margin-bottom: 6px; }
    .cp-form-sub { font-size: .875rem; color: #6b7280; margin-bottom: 28px; line-height: 1.6; }

    .cp-field { margin-bottom: 18px; }
    .cp-label { display: block; font-size: .75rem; font-weight: 700; color: #374151; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 7px; }
    .cp-input {
      width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
      padding: 12px 16px; font-size: .9rem; color: #1a1f1c; outline: none;
      transition: border-color .2s, box-shadow .2s; background: #fafafa;
    }
    .cp-input:focus { border-color: #4caf7d; box-shadow: 0 0 0 3px rgba(76,175,125,.1); background: #fff; }
    .cp-input::placeholder { color: #9ca3af; }
    .cp-input.err { border-color: #f87171; }
    .cp-err-msg { font-size: .75rem; color: #dc2626; margin-top: 5px; display: block; }
    textarea.cp-input { resize: vertical; min-height: 120px; }

    .cp-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .cp-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .cp-type-opt { position: relative; }
    .cp-type-opt input { position: absolute; opacity: 0; width: 0; height: 0; }
    .cp-type-label {
      display: flex; align-items: center; gap: 8px; padding: 10px 14px;
      border: 1.5px solid #e5e7eb; border-radius: 9px; cursor: pointer;
      font-size: .82rem; font-weight: 600; color: #374151;
      transition: all .18s; background: #fafafa;
    }
    .cp-type-opt input:checked + .cp-type-label { border-color: #2E7D32; background: #f0faf4; color: #2E7D32; }
    .cp-type-label:hover { border-color: #aee4c5; background: #f0faf4; }

    .cp-submit {
      width: 100%; background: linear-gradient(135deg,#2E7D32,#4caf7d);
      color: #fff; border: none; border-radius: 12px; padding: 15px;
      font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 8px;
      transition: all .22s; display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 6px 20px rgba(46,125,50,.25);
    }
    .cp-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(46,125,50,.3); }
    .cp-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* Success state */
    .cp-success {
      text-align: center; padding: 48px 24px;
    }
    .cp-success-icon {
      width: 80px; height: 80px; background: linear-gradient(135deg,#f0faf4,#e8f5e9);
      border: 2px solid #aee4c5; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 2.2rem; margin: 0 auto 20px;
      animation: popIn .4s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .cp-success h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; color: #1a1f1c; margin-bottom: 10px; }
    .cp-success p { font-size: .9rem; color: #6b7280; line-height: 1.75; max-width: 360px; margin: 0 auto 24px; }

    /* FAQ strip */
    .cp-faq-strip { margin-top: 72px; }
    .cp-faq-strip h2 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; color: #1a1f1c; margin-bottom: 6px; text-align: center; }
    .cp-faq-strip p { font-size: .9rem; color: #6b7280; text-align: center; margin-bottom: 32px; }
    .cp-faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .cp-faq-item { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px 22px; transition: all .2s; }
    .cp-faq-item:hover { border-color: #aee4c5; box-shadow: 0 6px 20px rgba(46,125,50,.07); }
    .cp-faq-item h4 { font-family: 'Playfair Display', serif; font-size: .95rem; font-weight: 700; color: #1a1f1c; margin-bottom: 8px; }
    .cp-faq-item p { font-size: .84rem; color: #6b7280; line-height: 1.7; }

    /* Responsive */
    @media (max-width: 860px) {
      .cp-grid { grid-template-columns: 1fr; }
      .cp-channels { grid-template-columns: 1fr 1fr; }
      .cp-faq-grid { grid-template-columns: 1fr; }
      .cp-nav-links { display: none; }
      .cp-row2 { grid-template-columns: 1fr; }
    }
    @media (max-width: 540px) {
      .cp-channels { grid-template-columns: 1fr; }
      .cp-type-grid { grid-template-columns: 1fr; }
      .cp-form-card { padding: 24px 18px; }
    }
  `}</style>
);

const INQUIRY_TYPES = [
  { value: "buyer",    label: "🛒 Buyer Inquiry"   },
  { value: "seller",   label: "🌿 Seller Inquiry"  },
  { value: "platform", label: "⚙️ Platform Issue"  },
  { value: "partner",  label: "🤝 Partnership"     },
  { value: "press",    label: "📰 Press / Media"   },
  { value: "other",    label: "💬 Other"            },
];

const FAQS = [
  { q: "How long does it take to get a response?", a: "We aim to respond to all enquiries within 24 hours on business days. Complex technical or partnership queries may take up to 48 hours." },
  { q: "I submitted a project — how do I check its status?", a: "Log in to your seller dashboard and navigate to My Projects. Each project shows its current status: Pending, Verified, or Rejected with a reason." },
  { q: "Can I change my account role?", a: "Account roles (Buyer / Seller) are set at registration and cannot be changed. You can register a second account with a different email for a different role." },
  { q: "My project was rejected. What do I do?", a: "Check the rejection reason in your dashboard, make the necessary edits to your project, and resubmit. Edited projects are automatically returned to Pending for re-review." },
  { q: "How do I report a technical bug?", a: "Use the contact form and select 'Platform Issue'. Describe the bug, include your browser/device, and paste any error messages you see in the console." },
  { q: "Is there an API for developers?", a: "Yes — CarbonX exposes a full REST API. See our API documentation at /about for endpoint details, authentication, and example requests." },
];

export default function ContactPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", subject: "", inquiryType: "buyer", message: "" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                 e.name    = "Name is required";
    if (!form.email.trim())                e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.subject.trim())              e.subject = "Subject is required";
    if (form.message.trim().length < 20)   e.message = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      await axios.post(`${BASE_URL}/contact`, {
        name:        form.name,
        email:       form.email,
        subject:     form.subject,
        inquiryType: form.inquiryType,
        message:     form.message,
        source:      'contact_page',
      });
      setSent(true);
    } catch (err) {
      // Show server-side validation errors if any
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="cp">
      <S />

      {/* Nav */}
      <nav className="cp-nav">
        <div className="cp-nav-inner">
          <Link to="/" className="cp-logo">
            <div className="cp-logo-icon">🌱</div>
            <span className="cp-logo-text">CarbonX</span>
          </Link>
          <ul className="cp-nav-links">
            {[["/" ,"Home"],["/marketplace","Marketplace"],["/about","About"],["/contact","Contact"]].map(([path,lbl])=>(
              <li key={path}><a href={path} className={path==="/contact"?"active":""}>{lbl}</a></li>
            ))}
          </ul>
          <div className="cp-nav-right">
            <button className="cp-btn cp-btn-out" onClick={() => navigate("/login")}>Login</button>
            <button className="cp-btn cp-btn-g"   onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="cp-hero">
        <div className="cp-hero-pill">📬 Get in Touch</div>
        <h1>Contact Us</h1>
        <p>Have a question about CarbonX, carbon credits, or your account? We're here to help — reach out and we'll get back to you quickly.</p>
      </div>

      <div className="cp-body">
        <div className="cp-grid">

          {/* ── Left: Info panel ── */}
          <div className="cp-info">

            {/* Email */}
            <div className="cp-info-card">
              <div className="cp-info-icon" style={{ background: "#f0faf4" }}>📧</div>
              <h3>Email Support</h3>
              <p>For general inquiries, platform questions, and account issues.</p>
              <p style={{ marginTop: 8 }}>
                <a href="mailto:support@carbonx.io">support@carbonx.io</a>
              </p>
            </div>

            {/* Platform issues */}
            <div className="cp-info-card">
              <div className="cp-info-icon" style={{ background: "#eff6ff" }}>🐛</div>
              <h3>Report a Bug</h3>
              <p>Found a technical issue? Use the contact form and select <strong>Platform Issue</strong> — include your browser, device, and any error messages.</p>
            </div>

            {/* Partnerships */}
            <div className="cp-info-card">
              <div className="cp-info-icon" style={{ background: "#fefce8" }}>🤝</div>
              <h3>Partnerships & Press</h3>
              <p>For media enquiries, institutional partnerships, or educational use, select the appropriate type in the form or email us directly.</p>
              <p style={{ marginTop: 8 }}>
                <a href="mailto:partners@carbonx.io">partners@carbonx.io</a>
              </p>
            </div>

            {/* Contact channels */}
            <div className="cp-info-card">
              <div className="cp-info-icon" style={{ background: "#f5f3ff" }}>🌐</div>
              <h3>Other Channels</h3>
              <div className="cp-channels">
                {[
                  { icon:"🐙", label:"GitHub", sub:"View source code",     href:"https://github.com" },
                  { icon:"📖", label:"Docs",   sub:"API & platform docs",  href:"/about" },
                  { icon:"🛒", label:"Marketplace", sub:"Browse projects", href:"/marketplace" },
                  { icon:"❓", label:"FAQ",    sub:"Common questions",      href:"/about#faq-about" },
                ].map(ch=>(
                  <a key={ch.label} className="cp-channel" href={ch.href}>
                    <span className="cp-channel-icon">{ch.icon}</span>
                    <div>
                      <div className="cp-channel-label">{ch.label}</div>
                      <div className="cp-channel-sub">{ch.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Response hours */}
            <div className="cp-info-card">
              <div className="cp-info-icon" style={{ background: "#fff7ed" }}>🕐</div>
              <h3>Response Times</h3>
              <div className="cp-hours">
                {[
                  ["General Enquiries",  "Within 24 hrs"],
                  ["Technical Issues",   "Within 12 hrs"],
                  ["Project Review",     "1–2 business days"],
                  ["Partnerships",       "2–3 business days"],
                  ["Weekends & Holidays","Next business day"],
                ].map(([d,t])=>(
                  <div key={d} className="cp-hour-row">
                    <span className="cp-hour-day">{d}</span>
                    <span className="cp-hour-time">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Contact form ── */}
          <div className="cp-form-card">
            {sent ? (
              <div className="cp-success">
                <div className="cp-success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out, <strong>{form.name.split(" ")[0]}</strong>. We've received your message and will reply to <strong>{form.email}</strong> within 24 hours.</p>
                <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                  <button className="cp-btn cp-btn-g" onClick={()=>{setSent(false);setForm({name:"",email:"",subject:"",inquiryType:"buyer",message:""});}}>Send Another</button>
                  <button className="cp-btn cp-btn-out" onClick={()=>navigate("/")}>Back to Home</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="cp-form-title">Send Us a Message</h2>
                <p className="cp-form-sub">Fill in the form below and our team will get back to you as quickly as possible.</p>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Name + Email */}
                  <div className="cp-row2">
                    <div className="cp-field">
                      <label className="cp-label">Full Name *</label>
                      <input className={`cp-input${errors.name?" err":""}`} placeholder="Jane Smith" value={form.name} onChange={set("name")} />
                      {errors.name && <span className="cp-err-msg">{errors.name}</span>}
                    </div>
                    <div className="cp-field">
                      <label className="cp-label">Email Address *</label>
                      <input className={`cp-input${errors.email?" err":""}`} type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
                      {errors.email && <span className="cp-err-msg">{errors.email}</span>}
                    </div>
                  </div>

                  {/* Inquiry type */}
                  <div className="cp-field">
                    <label className="cp-label">Inquiry Type *</label>
                    <div className="cp-type-grid">
                      {INQUIRY_TYPES.map(opt=>(
                        <div key={opt.value} className="cp-type-opt">
                          <input type="radio" id={`type-${opt.value}`} name="inquiryType" value={opt.value}
                            checked={form.inquiryType===opt.value} onChange={set("inquiryType")} />
                          <label className="cp-type-label" htmlFor={`type-${opt.value}`}>{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="cp-field">
                    <label className="cp-label">Subject *</label>
                    <input className={`cp-input${errors.subject?" err":""}`} placeholder="Brief description of your inquiry" value={form.subject} onChange={set("subject")} />
                    {errors.subject && <span className="cp-err-msg">{errors.subject}</span>}
                  </div>

                  {/* Message */}
                  <div className="cp-field">
                    <label className="cp-label">Message * <span style={{color:"#9ca3af",fontWeight:400,textTransform:"none",letterSpacing:0}}>(min. 20 chars)</span></label>
                    <textarea className={`cp-input${errors.message?" err":""}`}
                      placeholder={form.inquiryType==="seller"
                        ?"Describe your carbon offset project, location, and what you need help with..."
                        :form.inquiryType==="platform"
                        ?"Describe the issue, your browser/device, and what you were doing when it happened..."
                        :"Tell us how we can help you..."}
                      value={form.message} onChange={set("message")} />
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                      {errors.message
                        ? <span className="cp-err-msg">{errors.message}</span>
                        : <span/>}
                      <span style={{fontSize:".72rem",color:form.message.length>=20?"#2E7D32":"#9ca3af",fontFamily:"monospace"}}>{form.message.length}/20+</span>
                    </div>
                  </div>

                  {/* Privacy note */}
                  <p style={{fontSize:".78rem",color:"#9ca3af",lineHeight:1.6,marginBottom:16}}>
                    By submitting this form you agree to our <a href="#" style={{color:"#2E7D32"}}>Privacy Policy</a>. We'll only use your email to respond to your inquiry.
                  </p>

                  {/* Server error */}
                  {errors.submit && (
                    <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'10px 14px', color:'#dc2626', fontSize:'.875rem', marginBottom:12 }}>
                      ❌ {errors.submit}
                    </div>
                  )}

                  <button type="submit" className="cp-submit" disabled={sending}>
                    {sending
                      ? <><span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .6s linear infinite",display:"inline-block"}}/>Sending…</>
                      : <>📬 Send Message</>}
                  </button>
                </form>

                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </>
            )}
          </div>
        </div>

        {/* FAQ strip */}
        <div className="cp-faq-strip">
          <h2>Quick Answers</h2>
          <p>Common questions before you reach out.</p>
          <div className="cp-faq-grid">
            {FAQS.map(f=>(
              <div key={f.q} className="cp-faq-item">
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}