import { useState, useEffect } from "react";

// ── Airtable ─────────────────────────────────────────────────────────────────
const AIRTABLE_TOKEN = "patK7kjE55Kcp9KOK.7ac6bfb26b6a94e2c817fc100656745c9b22e0c8b96bac02aaf9990104f88101";
const AIRTABLE_BASE = "appNz7QfwVM7GNp94";
const AIRTABLE_TABLE = "Leads";

async function saveToAirtable(formData) {
const l = parseFloat(formData.length), w = parseFloat(formData.width), d = parseFloat(formData.depth);
const sqft = l && w ? Math.round(l * w) : null;
const cy = l && w && d ? parseFloat(((l * w * d) / 324).toFixed(2)) : null;
const fields = {
"First Name": formData.firstName, "Last Name": formData.lastName,
"Phone": formData.phone, "Email": formData.email,
"Address": formData.address, "City": formData.city,
"Service": formData.service, "Submitted At": new Date().toISOString(),
};
if (formData.length) fields["Length (ft)"] = l;
if (formData.width) fields["Width (ft)"] = w;
if (formData.depth) fields["Depth (in)"] = d;
if (sqft) fields["Square Feet"] = sqft;
if (cy) fields["Cubic Yards"] = cy;
const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`, {
method: "POST",
headers: { "Authorization": `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
body: JSON.stringify({ fields }),
});
if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message || "Airtable error"); }
return res.json();
}

// ── Local backup (localStorage — works on any browser) ───────────────────────
function saveLeadLocally(data) {
try {
const leads = JSON.parse(localStorage.getItem("fmd_leads") || "[]");
leads.push({ ...data, id: Date.now(), submittedAt: new Date().toISOString() });
localStorage.setItem("fmd_leads", JSON.stringify(leads));
} catch (e) { console.warn("localStorage unavailable", e); }
}
function getLeadsLocally() {
try { return JSON.parse(localStorage.getItem("fmd_leads") || "[]"); } catch { return []; }
}
function leadsToCSV(leads) {
if (!leads.length) return "";
const keys = Object.keys(leads[0]);
return [keys.join(","), ...leads.map(l => keys.map(k => `"${String(l[k]??"")}"`).join(","))].join("\n");
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PHONE = "7738440807";
const CITIES = ["Boulder","Niwot","Gunbarrel","Longmont","Louisville","Lafayette","Erie"];
const REVIEWS = [
{ name:"Sarah M.", city:"Boulder", text:"Incredible service! They delivered and spread mulch in my entire front yard in under two hours. My garden beds look amazing." },
{ name:"Tom & Lisa K.", city:"Niwot", text:"Best decision we made this spring. Saved us a full weekend of backbreaking work. Highly recommend for anyone in the area." },
{ name:"Derek R.", city:"Lafayette", text:"Great price, fast delivery, and the arborist chips look so natural. Our trees are much happier. Will use again every year." },
{ name:"Jenny P.", city:"Louisville", text:"They did the weed pulling add-on too and my beds look professionally done. Super friendly team and easy to reach via text." },
];
const FAQS = [
{ q:"What is arborist mulch?", a:"Arborist mulch consists of natural wood chips from tree trimming and removal crews. It's eco-friendly, free of dyes, and excellent for moisture retention, weed suppression, and soil health — far superior to dyed bagged mulch." },
{ q:"How much mulch do I need?", a:"Use our Mulch Calculator above! A good rule: 3 inches deep for garden beds and tree rings, 2 inches for general coverage. Our calculator gives you exact cubic yards." },
{ q:"Do you spread the mulch?", a:"Yes! Our Delivery + Spreading service includes professional installation in your beds, around trees, and throughout landscaping areas. We also offer optional weed pulling, bed cleanup, and edge touch-ups." },
{ q:"How quickly can you deliver?", a:"We typically schedule deliveries within 2–5 business days. Reach out via text for the fastest response and we'll do our best to accommodate your timeline." },
{ q:"What areas do you serve?", a:"We proudly serve Boulder, Niwot, Gunbarrel, Longmont, Louisville, Lafayette, and Erie, Colorado. If you're on the edge of our service area, just ask!" },
];

// ── Styles ───────────────────────────────────────────────────────────────────
const S = {
// layout
page: { fontFamily:"'Segoe UI',Arial,sans-serif", color:"#1a1a1a", margin:0, padding:0 },
maxW: { maxWidth:1100, margin:"0 auto", padding:"0 20px" },
// nav
nav: { background:"#fff", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" },
navInner: { maxWidth:1100, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 },
navLogo: { display:"flex", alignItems:"center", gap:10, cursor:"pointer", textDecoration:"none" },
navLinks: { display:"flex", alignItems:"center", gap:28 },
navLink: { color:"#4b5563", fontWeight:500, fontSize:15, cursor:"pointer", background:"none", border:"none", padding:0 },
// hero
hero: { background:"linear-gradient(135deg,#0a2e0a 0%,#1a4a1a 45%,#2d5a1b 75%,#143a0a 100%)", color:"#fff", padding:"80px 20px", textAlign:"center", position:"relative", overflow:"hidden" },
heroTitle: { fontFamily:"Georgia,serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:900, lineHeight:1.15, margin:"0 0 20px", maxWidth:700, marginLeft:"auto", marginRight:"auto" },
heroSub: { fontSize:20, color:"#bbf7d0", marginBottom:36, maxWidth:520, marginLeft:"auto", marginRight:"auto", lineHeight:1.6 },
heroBtns: { display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" },
// buttons
btnGreen: { background:"#166534", color:"#fff", border:"none", borderRadius:6, padding:"14px 30px", fontWeight:700, fontSize:16, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 },
btnOutline: { background:"transparent", color:"#fff", border:"2px solid #fff", borderRadius:6, padding:"12px 28px", fontWeight:700, fontSize:16, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none" },
btnGreenSm: { background:"#166534", color:"#fff", border:"none", borderRadius:6, padding:"10px 22px", fontWeight:600, fontSize:14, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6 },
// sections
section: { padding:"72px 20px" },
sectionGray: { padding:"72px 20px", background:"#f9fafb" },
sectionDark: { padding:"64px 20px", background:"#111827", color:"#fff" },
sectionGreen: { padding:"64px 20px", background:"#14532d", color:"#fff" },
sectionTag: { display:"inline-block", background:"#dcfce7", color:"#166534", fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 14px", borderRadius:4, marginBottom:12 },
sectionTagDark: { display:"inline-block", background:"rgba(255,255,255,0.1)", color:"#86efac", fontSize:12, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", padding:"4px 14px", borderRadius:4, marginBottom:12 },
h2: { fontFamily:"Georgia,serif", fontSize:"clamp(1.6rem,4vw,2.6rem)", fontWeight:900, margin:"0 0 12px" },
h2sub: { color:"#6b7280", marginTop:8, marginBottom:0, fontSize:16, lineHeight:1.6 },
// cards
cardGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24, marginTop:40 },
card: { background:"#fff", border:"2px solid #e5e7eb", borderRadius:10, padding:28 },
cardHL: { background:"#f0fdf4", border:"2px solid #166534", borderRadius:10, padding:28 },
// why bar
whyBar: { background:"#f3f4f6", borderBottom:"1px solid #e5e7eb", padding:"28px 20px" },
whyGrid: { maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:20, textAlign:"center" },
whyIcon: { fontSize:32, marginBottom:8 },
whyTitle: { fontWeight:700, fontSize:15, marginBottom:4 },
whySub: { fontSize:13, color:"#6b7280" },
// form
formBox: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:36 },
formGrid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 },
formGrid3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 },
label: { display:"block", fontSize:14, fontWeight:600, color:"#374151", marginBottom:6 },
input: { width:"100%", border:"1.5px solid #d1d5db", borderRadius:6, padding:"10px 14px", fontSize:15, boxSizing:"border-box", fontFamily:"inherit" },
select: { width:"100%", border:"1.5px solid #d1d5db", borderRadius:6, padding:"10px 14px", fontSize:15, boxSizing:"border-box", background:"#fff", cursor:"pointer", fontFamily:"inherit" },
mb16: { marginBottom:16 },
// calc
calcBox: { background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:12, padding:36 },
calcResult: { background:"linear-gradient(135deg,#0a2e0a,#166534)", color:"#fff", borderRadius:10, padding:28, marginTop:20 },
calcResultGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, textAlign:"center" },
calcNum: { fontSize:36, fontWeight:900 },
calcLabel: { color:"#86efac", fontSize:14, marginTop:4 },
depthGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 },
depthOpt: (active) => ({ border:`2px solid ${active?"#166534":"#d1d5db"}`, background:active?"#f0fdf4":"#fff", borderRadius:8, padding:"12px 8px", cursor:"pointer", textAlign:"center", fontSize:14, fontWeight:active?700:400, color:active?"#166534":"#6b7280" }),
// reviews
reviewCard: { background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:24, borderLeft:"4px solid #166534" },
// faq
faqItem: { borderBottom:"1px solid #e5e7eb" },
faqQ: { width:"100%", background:"none", border:"none", textAlign:"left", padding:"20px 0", fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" },
faqA: { paddingBottom:20, fontSize:15, color:"#4b5563", lineHeight:1.7 },
// admin
adminOverlay: { position:"fixed", inset:0, background:"#f3f4f6", zIndex:200, overflowY:"auto", padding:32 },
table: { width:"100%", borderCollapse:"collapse", fontSize:14 },
th: { textAlign:"left", padding:"10px 16px", background:"#f9fafb", borderBottom:"2px solid #e5e7eb", fontWeight:600, color:"#6b7280", fontSize:13 },
td: { padding:"12px 16px", borderBottom:"1px solid #f3f4f6" },
// modal
modalBg: { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
modalBox: { background:"#fff", borderRadius:12, padding:36, maxWidth:360, width:"100%" },
// float
floatBtn: { position:"fixed", bottom:24, right:24, zIndex:50, background:"#166534", color:"#fff", border:"none", borderRadius:50, padding:"14px 22px", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 6px 24px rgba(22,101,52,0.45)", display:"flex", alignItems:"center", gap:8, textDecoration:"none" },
// footer
footer: { background:"#111827", color:"#9ca3af", padding:"48px 20px 24px" },
footerGrid: { maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:40, marginBottom:36 },
footerTitle: { color:"#fff", fontWeight:600, fontSize:15, marginBottom:14 },
// chips
chip: { display:"inline-block", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#86efac", fontSize:13, fontWeight:600, padding:"5px 14px", borderRadius:20, margin:4 },
// service radio
svcGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 },
svcOpt: (active) => ({ border:`2px solid ${active?"#166534":"#d1d5db"}`, background:active?"#f0fdf4":"#fff", borderRadius:8, padding:"12px 8px", cursor:"pointer", textAlign:"center", fontSize:14, fontWeight:active?700:400, color:active?"#166534":"#6b7280" }),
successBox: { textAlign:"center", background:"#fff", border:"2px solid #166534", borderRadius:12, padding:60 },
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
const [calcL,setCalcL]=useState(""), [calcW,setCalcW]=useState(""), [calcD,setCalcD]=useState("3"), [calcResult,setCalcResult]=useState(null);
const [form,setForm]=useState({ firstName:"",lastName:"",phone:"",email:"",address:"",city:"",length:"",width:"",depth:"3",service:"delivery-spreading",honey:"" });
const [submitted,setSubmitted]=useState(false), [loading,setLoading]=useState(false), [formError,setFormError]=useState("");
const [openFaq,setOpenFaq]=useState(null);
const [adminMode,setAdminMode]=useState(false), [showLogin,setShowLogin]=useState(false), [adminPass,setAdminPass]=useState(""), [leads,setLeads]=useState([]);
const [mobileOpen,setMobileOpen]=useState(false);

useEffect(() => { document.title = "Flatirons Mulch Delivery | Boulder County Mulch & Wood Chips"; }, []);

function calc() {
const l=parseFloat(calcL),w=parseFloat(calcW),d=parseFloat(calcD);
if(!l||!w) return;
setCalcResult({ sqft:Math.round(l*w), cy:((l*w*d)/324).toFixed(2) });
}

function smsBody() {
const name=form.firstName||"[Name]", addr=form.address||"[Address]";
const l=parseFloat(form.length||calcL),w=parseFloat(form.width||calcW),d=parseFloat(form.depth||calcD);
const sqft=l&&w?Math.round(l*w):"[Square Feet]";
const cy=l&&w&&d?((l*w*d)/324).toFixed(2):"[Cubic Yards]";
return encodeURIComponent(`Hi, my name is ${name}.\n\nMy address is ${addr}.\n\nMy landscaping area is approximately ${sqft} square feet and I need approximately ${cy} cubic yards of mulch.\n\nPlease send me a quote.`);
}

async function handleSubmit(e) {
e.preventDefault();
if(form.honey) return;
setLoading(true); setFormError("");
try { await saveToAirtable(form); } catch(err) { console.warn("Airtable:",err); }
saveLeadLocally(form);
setLoading(false); setSubmitted(true);
}

function adminLogin() {
if(adminPass==="flatirons2024") { setAdminMode(true); setShowLogin(false); setLeads(getLeadsLocally()); }
else alert("Incorrect password");
}

function exportCSV() {
const blob=new Blob([leadsToCSV(leads)],{type:"text/csv"});
const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="flatirons_leads.csv"; a.click();
}

const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); setMobileOpen(false); };

return (
<div style={S.page}>
{/* NAV */}
<nav style={S.nav}>
<div style={S.navInner}>
<div style={S.navLogo} onClick={()=>scrollTo("hero")}>
<div style={{width:34,height:34,background:"#166534",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18}}>🌿</div>
<div>
<div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:15,lineHeight:1.2}}>Flatirons Mulch</div>
<div style={{fontSize:12,color:"#166534",lineHeight:1.2}}>Boulder County, CO</div>
</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:24}}>
{[["Services","services"],["Calculator","calculator"],["Quote","quote"],["Reviews","reviews"],["FAQ","faq"]].map(([l,id])=>(
<button key={id} style={{...S.navLink,display:window.innerWidth<640?"none":"block"}} onClick={()=>scrollTo(id)}>{l}</button>
))}
<a href={`tel:${PHONE}`} style={{...S.btnGreenSm,textDecoration:"none"}}>📞 Call Now</a>
</div>
</div>
{mobileOpen && (
<div style={{background:"#fff",borderTop:"1px solid #e5e7eb",padding:"12px 20px"}}>
{[["Services","services"],["Calculator","calculator"],["Quote","quote"],["Reviews","reviews"],["FAQ","faq"]].map(([l,id])=>(
<div key={id} style={{padding:"10px 0",cursor:"pointer",fontWeight:500}} onClick={()=>scrollTo(id)}>{l}</div>
))}
</div>
)}
</nav>

{/* HERO */}
<section id="hero" style={S.hero}>
<div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 50%,rgba(255,255,255,0.03) 0%,transparent 60%)",pointerEvents:"none"}}/>
<div style={{maxWidth:760,margin:"0 auto",position:"relative"}}>
<div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 18px",fontSize:14,marginBottom:24}}>
📍 Serving Boulder County, CO
</div>
<h1 style={S.heroTitle}>Affordable Mulch Delivery & Spreading in Boulder County</h1>
<p style={S.heroSub}>We haul, deliver, and spread natural wood chip mulch so you don't have to.</p>
<div style={S.heroBtns}>
<button style={S.btnGreen} onClick={()=>scrollTo("quote")}>Get Free Quote</button>
<a href={`sms:${PHONE}?body=${smsBody()}`} style={S.btnOutline}>💬 Text Us Now</a>
</div>
<div style={{marginTop:32,display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8}}>
{CITIES.map(c=><span key={c} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 14px",fontSize:13}}>{c}</span>)}
</div>
</div>
</section>

{/* WHY BAR */}
<div style={S.whyBar}>
<div style={S.whyGrid}>
{[["🌿","Eco-Friendly","100% natural arborist chips"],["🚛","Full Service","Pickup, delivery & spreading"],["⏱️","Fast Turnaround","Typically 2–5 business days"],["💬","Text-Friendly","Easy quotes via text"]].map(([icon,title,sub])=>(
<div key={title}><div style={S.whyIcon}>{icon}</div><div style={S.whyTitle}>{title}</div><div style={S.whySub}>{sub}</div></div>
))}
</div>
</div>

{/* SERVICES */}
<section id="services" style={S.section}>
<div style={{...S.maxW,textAlign:"center"}}>
<span style={S.sectionTag}>Our Services</span>
<h2 style={S.h2}>Everything Your Yard Needs</h2>
<p style={S.h2sub}>From pickup to final installation — we handle the heavy lifting.</p>
<div style={S.cardGrid}>
{[
{icon:"🚛",tag:"Delivery",title:"Mulch Delivery",desc:"We source and pick up natural arborist mulch from local tree crews and deliver it right to your property. No bags, no store trips.",hl:false},
{icon:"🌱",tag:"Most Popular",title:"Delivery + Spreading",desc:"We deliver AND professionally spread mulch in garden beds, around trees, and throughout all landscaping areas.",hl:true},
{icon:"✂️",tag:"Optional Add-On",title:"Yard Refresh",desc:"Complement your mulch with weed pulling, bed cleanup, and edge touch-ups for a truly finished, professional look.",hl:false},
].map(s=>(
<div key={s.title} style={s.hl?S.cardHL:S.card}>
<div style={{fontSize:40,marginBottom:16}}>{s.icon}</div>
<div style={{fontSize:12,fontWeight:700,color:"#166534",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{s.tag}</div>
<h3 style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,margin:"0 0 12px"}}>{s.title}</h3>
<p style={{color:"#4b5563",fontSize:15,lineHeight:1.7,margin:"0 0 20px"}}>{s.desc}</p>
<button style={{...S.btnGreenSm,background:"none",color:"#166534",padding:0,fontWeight:700}} onClick={()=>scrollTo("quote")}>Get a Quote →</button>
</div>
))}
</div>
</div>
</section>

{/* SERVICE AREA */}
<section style={S.sectionDark}>
<div style={{...S.maxW,textAlign:"center"}}>
<span style={S.sectionTagDark}>Service Area</span>
<h2 style={{...S.h2,color:"#fff"}}>Serving All of Boulder County</h2>
<p style={{color:"#9ca3af",marginBottom:28}}>If your city isn't listed, reach out — we often accommodate nearby areas.</p>
<div>{CITIES.map(c=><span key={c} style={S.chip}>📍 {c}, CO</span>)}</div>
</div>
</section>

{/* CALCULATOR */}
<section id="calculator" style={S.section}>
<div style={{maxWidth:640,margin:"0 auto"}}>
<div style={{textAlign:"center",marginBottom:36}}>
<span style={S.sectionTag}>Free Tool</span>
<h2 style={S.h2}>Mulch Calculator</h2>
<p style={S.h2sub}>Find out exactly how much mulch you need.</p>
</div>
<div style={S.calcBox}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
<div><label style={S.label}>Length (ft)</label><input style={S.input} type="number" min="0" placeholder="e.g. 20" value={calcL} onChange={e=>setCalcL(e.target.value)}/></div>
<div><label style={S.label}>Width (ft)</label><input style={S.input} type="number" min="0" placeholder="e.g. 10" value={calcW} onChange={e=>setCalcW(e.target.value)}/></div>
</div>
<label style={S.label}>Desired Depth</label>
<div style={S.depthGrid}>
{[["2","2 inches (light)"],["3","3 inches (recommended)"],["4","4 inches (thick)"]].map(([v,l])=>(
<div key={v} style={S.depthOpt(calcD===v)} onClick={()=>setCalcD(v)}>{l}</div>
))}
</div>
<button style={{...S.btnGreen,width:"100%",justifyContent:"center",fontSize:16,padding:"14px"}} onClick={calc}>Calculate My Mulch Needs</button>
{calcResult && (
<div style={S.calcResult}>
<div style={S.calcResultGrid}>
<div><div style={S.calcNum}>{calcResult.sqft.toLocaleString()}</div><div style={S.calcLabel}>Square Feet</div></div>
<div><div style={S.calcNum}>{calcResult.cy}</div><div style={S.calcLabel}>Cubic Yards Needed</div></div>
</div>
<p style={{textAlign:"center",color:"#bbf7d0",fontSize:15,margin:"20px 0 16px"}}>We recommend {calcResult.cy} cubic yards for your space.</p>
<div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
<button style={S.btnOutline} onClick={()=>scrollTo("quote")}>Get Quote</button>
<a href={`sms:${PHONE}?body=${smsBody()}`} style={S.btnOutline}>💬 Text for Quote</a>
</div>
</div>
)}
</div>
</div>
</section>

{/* QUOTE FORM */}
<section id="quote" style={S.sectionGray}>
<div style={{maxWidth:640,margin:"0 auto"}}>
<div style={{textAlign:"center",marginBottom:36}}>
<span style={S.sectionTag}>Free Estimate</span>
<h2 style={S.h2}>Get Your Free Quote</h2>
<p style={S.h2sub}>We'll review your details and reach out with pricing.</p>
</div>
{submitted ? (
<div style={S.successBox}>
<div style={{fontSize:56,marginBottom:16}}>✅</div>
<h3 style={{fontFamily:"Georgia,serif",fontSize:26,color:"#166534",margin:"0 0 10px"}}>Thank You!</h3>
<p style={{fontSize:18,color:"#4b5563",margin:0}}>We will contact you shortly with a quote.</p>
<button style={{...S.btnGreenSm,marginTop:24}} onClick={()=>setSubmitted(false)}>Submit another request</button>
</div>
) : (
<form onSubmit={handleSubmit} style={S.formBox}>
{/* honeypot */}
<input type="text" value={form.honey} onChange={e=>setForm({...form,honey:e.target.value})} style={{display:"none"}} tabIndex={-1} aria-hidden />
<div style={S.formGrid2}>
<div><label style={S.label}>First Name *</label><input required style={S.input} value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})}/></div>
<div><label style={S.label}>Last Name *</label><input required style={S.input} value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})}/></div>
</div>
<div style={S.formGrid2}>
<div><label style={S.label}>Phone *</label><input required type="tel" style={S.input} placeholder="(303) 555-0000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
<div><label style={S.label}>Email *</label><input required type="email" style={S.input} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
</div>
<div style={S.mb16}><label style={S.label}>Property Address *</label><input required style={S.input} placeholder="123 Main St" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
<div style={S.mb16}><label style={S.label}>City *</label>
<select required style={S.select} value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>
<option value="">Select city...</option>
{CITIES.map(c=><option key={c}>{c}</option>)}
<option value="Other">Other</option>
</select>
</div>
<div style={S.formGrid3}>
<div><label style={S.label}>Length (ft)</label><input type="number" min="0" style={S.input} placeholder="20" value={form.length} onChange={e=>setForm({...form,length:e.target.value})}/></div>
<div><label style={S.label}>Width (ft)</label><input type="number" min="0" style={S.input} placeholder="10" value={form.width} onChange={e=>setForm({...form,width:e.target.value})}/></div>
<div><label style={S.label}>Depth</label>
<select style={S.select} value={form.depth} onChange={e=>setForm({...form,depth:e.target.value})}>
<option value="2">2 inches</option><option value="3">3 inches</option><option value="4">4 inches</option>
</select>
</div>
</div>
<div style={S.mb16}><label style={S.label}>Service Requested *</label>
<div style={S.svcGrid}>
{[["delivery","Delivery Only"],["delivery-spreading","Delivery + Spreading"]].map(([v,l])=>(
<div key={v} style={S.svcOpt(form.service===v)} onClick={()=>setForm({...form,service:v})}>{l}</div>
))}
</div>
</div>
{formError && <p style={{color:"#dc2626",marginBottom:16,fontSize:14}}>{formError}</p>}
<button type="submit" disabled={loading} style={{...S.btnGreen,width:"100%",justifyContent:"center",padding:"15px",fontSize:16,opacity:loading?0.7:1}}>
{loading?"Submitting...":"Submit Quote Request"}
</button>
<p style={{fontSize:13,color:"#9ca3af",textAlign:"center",marginTop:12}}>No spam. We'll only contact you about your quote.</p>
</form>
)}
<div style={{textAlign:"center",marginTop:28}}>
<p style={{color:"#6b7280",fontSize:15,marginBottom:12}}>Prefer to text? Send your info directly:</p>
<a href={`sms:${PHONE}?body=${smsBody()}`} style={{...S.btnGreen,display:"inline-flex",textDecoration:"none"}}>💬 Open Pre-Filled Text Message</a>
</div>
</div>
</section>

{/* REVIEWS */}
<section id="reviews" style={S.section}>
<div style={S.maxW}>
<div style={{textAlign:"center",marginBottom:40}}>
<span style={S.sectionTag}>Testimonials</span>
<h2 style={S.h2}>What Customers Are Saying</h2>
</div>
<div style={S.cardGrid}>
{REVIEWS.map((r,i)=>(
<div key={i} style={S.reviewCard}>
<div style={{color:"#f59e0b",fontSize:18,marginBottom:10}}>★★★★★</div>
<p style={{color:"#374151",lineHeight:1.7,marginBottom:16,fontSize:15}}>"{r.text}"</p>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:38,height:38,background:"#166534",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>{r.name[0]}</div>
<div><div style={{fontWeight:700,fontSize:14}}>{r.name}</div><div style={{fontSize:13,color:"#9ca3af"}}>{r.city}, CO</div></div>
</div>
</div>
))}
</div>
</div>
</section>

{/* GALLERY */}
<section style={S.sectionGray}>
<div style={S.maxW}>
<div style={{textAlign:"center",marginBottom:40}}>
<span style={S.sectionTag}>Gallery</span>
<h2 style={S.h2}>Before & After</h2>
<p style={S.h2sub}>Real results from real Boulder County yards.</p>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
{[{label:"Before",bg:"#78350f",emoji:"🪨",desc:"Overgrown beds with bare soil"},{label:"After",bg:"#14532d",emoji:"🌿",desc:"Fresh arborist mulch installed"},{label:"Before",bg:"#57534e",emoji:"🪨",desc:"Tree ring needing refresh"},{label:"After",bg:"#166534",emoji:"🌿",desc:"3-inch deep mulch ring"}].map((img,i)=>(
<div key={i} style={{background:img.bg,borderRadius:10,aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff",padding:20,position:"relative"}}>
<span style={{position:"absolute",top:12,left:12,background:img.label==="After"?"#16a34a":"#6b7280",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:4}}>{img.label}</span>
<div style={{fontSize:40,marginBottom:10}}>{img.emoji}</div>
<p style={{fontSize:13,textAlign:"center",opacity:0.85,margin:0}}>{img.desc}</p>
</div>
))}
</div>
<p style={{textAlign:"center",fontSize:13,color:"#9ca3af",marginTop:16}}>Gallery will fill with real project photos as jobs are completed.</p>
</div>
</section>

{/* FAQ */}
<section id="faq" style={S.section}>
<div style={{maxWidth:680,margin:"0 auto"}}>
<div style={{textAlign:"center",marginBottom:40}}>
<span style={S.sectionTag}>FAQ</span>
<h2 style={S.h2}>Common Questions</h2>
</div>
{FAQS.map((f,i)=>(
<div key={i} style={S.faqItem}>
<button style={S.faqQ} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
<span>{f.q}</span><span style={{color:"#166534",fontSize:20}}>{openFaq===i?"−":"+"}</span>
</button>
{openFaq===i && <div style={S.faqA}>{f.a}</div>}
</div>
))}
</div>
</section>

{/* CTA BAND */}
<section style={S.sectionGreen}>
<div style={{textAlign:"center",maxWidth:600,margin:"0 auto"}}>
<h2 style={{...S.h2,color:"#fff",marginBottom:12}}>Ready to Transform Your Yard?</h2>
<p style={{color:"#bbf7d0",marginBottom:32,fontSize:16,lineHeight:1.6}}>Get a free quote in minutes. We serve Boulder, Niwot, Gunbarrel, Longmont, Louisville, Lafayette, and Erie.</p>
<div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
<button style={{...S.btnGreen,background:"#fff",color:"#166534"}} onClick={()=>scrollTo("quote")}>Get Free Quote</button>
<a href={`sms:${PHONE}?body=${smsBody()}`} style={S.btnOutline}>💬 Text for a Quote</a>
<a href={`tel:${PHONE}`} style={S.btnOutline}>📞 Call Us</a>
</div>
</div>
</section>

{/* FOOTER */}
<footer style={S.footer}>
<div style={S.footerGrid}>
<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
<div style={{width:30,height:30,background:"#166534",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🌿</div>
<span style={{color:"#fff",fontWeight:700,fontFamily:"Georgia,serif"}}>Flatirons Mulch Delivery</span>
</div>
<p style={{fontSize:13,lineHeight:1.7,margin:0}}>Eco-friendly arborist wood chip mulch delivery and spreading for Boulder County homeowners.</p>
</div>
<div>
<div style={S.footerTitle}>Service Areas</div>
{CITIES.map(c=><div key={c} style={{fontSize:14,marginBottom:6}}>{c}, CO</div>)}
</div>
<div>
<div style={S.footerTitle}>Contact</div>
<a href={`tel:${PHONE}`} style={{display:"flex",alignItems:"center",gap:8,color:"#9ca3af",textDecoration:"none",marginBottom:10,fontSize:14}}>📞 (773) 844-0807</a>
<a href={`sms:${PHONE}?body=${smsBody()}`} style={{display:"flex",alignItems:"center",gap:8,color:"#9ca3af",textDecoration:"none",fontSize:14}}>💬 Text for a Quote</a>
<div style={{marginTop:20,fontSize:12,lineHeight:1.8,color:"#6b7280"}}>
Mulch Delivery Boulder · Wood Chips Boulder<br/>
Mulch Spreading Boulder County · Arborist Mulch CO
</div>
</div>
</div>
<div style={{maxWidth:1100,margin:"0 auto",borderTop:"1px solid #1f2937",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,flexWrap:"wrap",gap:10}}>
<span>© {new Date().getFullYear()} Flatirons Mulch Delivery. All rights reserved.</span>
<button style={{background:"none",border:"none",color:"#4b5563",cursor:"pointer",fontSize:13}} onClick={()=>setShowLogin(true)}>Admin</button>
</div>
</footer>

{/* FLOATING BUTTON */}
<a href={`sms:${PHONE}?body=${smsBody()}`} style={S.floatBtn}>💬 Text a Quote</a>

{/* ADMIN LOGIN */}
{showLogin && (
<div style={S.modalBg}>
<div style={S.modalBox}>
<h3 style={{fontFamily:"Georgia,serif",fontSize:22,margin:"0 0 20px"}}>Admin Login</h3>
<input type="password" style={{...S.input,marginBottom:16}} placeholder="Password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&adminLogin()}/>
<div style={{display:"flex",gap:10}}>
<button style={{...S.btnGreen,flex:1,justifyContent:"center"}} onClick={adminLogin}>Login</button>
<button style={{border:"1px solid #d1d5db",borderRadius:6,padding:"10px 16px",cursor:"pointer",background:"#fff"}} onClick={()=>setShowLogin(false)}>Cancel</button>
</div>
</div>
</div>
)}

{/* ADMIN PANEL */}
{adminMode && (
<div style={S.adminOverlay}>
<div style={{maxWidth:1000,margin:"0 auto"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
<h2 style={{fontFamily:"Georgia,serif",fontSize:26,margin:0}}>Lead Dashboard</h2>
<div style={{display:"flex",gap:12}}>
<button style={S.btnGreenSm} onClick={exportCSV}>⬇️ Export CSV</button>
<button style={{border:"1px solid #d1d5db",borderRadius:6,padding:"8px 16px",cursor:"pointer",background:"#fff"}} onClick={()=>setAdminMode(false)}>Close</button>
</div>
</div>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,overflow:"hidden"}}>
{leads.length===0 ? (
<div style={{padding:60,textAlign:"center",color:"#9ca3af"}}>No leads yet. Submissions will appear here.</div>
) : (
<div style={{overflowX:"auto"}}>
<table style={S.table}>
<thead><tr>{["Date","Name","Phone","Email","City","Service","Sq Ft"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
<tbody>
{leads.map((l,i)=>{
const sqft=l.length&&l.width?Math.round(parseFloat(l.length)*parseFloat(l.width)):"–";
return (
<tr key={i} style={{background:i%2?"#f9fafb":"#fff"}}>
<td style={S.td}>{new Date(l.submittedAt).toLocaleDateString()}</td>
<td style={{...S.td,fontWeight:600}}>{l.firstName} {l.lastName}</td>
<td style={S.td}><a href={`tel:${l.phone}`} style={{color:"#166534"}}>{l.phone}</a></td>
<td style={S.td}>{l.email}</td>
<td style={S.td}>{l.city}</td>
<td style={S.td}>{l.service}</td>
<td style={S.td}>{sqft}</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</div>
<p style={{fontSize:13,color:"#9ca3af",textAlign:"center",marginTop:12}}>Admin password: flatirons2024 — change before going live.</p>
</div>
</div>
)}
</div>
);
}
