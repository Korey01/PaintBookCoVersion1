import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, BadgeCheck, Lock, Handshake, CheckCircle, ArrowRight } from "lucide-react";
import { useScrollAnimation, useScrollAnimationList } from "@/hooks/useScrollAnimation";

// ── Shared label ──────────────────────────────────────────────────────────────
function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`editorial-label text-primary mb-4 flex items-center gap-3 ${className}`}>
      <span className="inline-block h-px w-8 bg-current" />
      {children}
    </p>
  );
}

const VIDEO_SRC = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/hero-background.mp4";
const LOGO_SRC = "https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png";

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const brushCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;

    const COLS = ['#D85A30','#2D5A3D','#C4A882','#8B1A1A','#1A3A5C','#D4A843','#4A2C6B','#3A7D6B','#8B5E3C','#C45E2A','#1A5C3A','#9B4A20','#3A1A5C','#5C8B3A','#B85C30'];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const hexRgb = (h: string): [number,number,number] => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const toHex = (rgb: number[]) => `#${rgb.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`;
    const toRgba = (rgb: number[], a: number) => `rgba(${rgb.map(v=>Math.round(v)).join(',')},${a})`;

    let W = 0, H = 0, strokes: any[] = [], fn = 0, rafId = 0;
    let dR=245,dG=240,dB=232,tR=245,tG=240,tB=232;
    let aR=216,aG=90,aB=48,taR=216,taG=90,taB=48;

    function resize() {
      const r = wrap!.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W; canvas.height = H;
    }

    function buildPath(type: number) {
      const pts: {x:number,y:number}[] = [], N = 120;
      if(type===0){const y=rnd(H*.05,H*.95),wA=rnd(4,18),wF=rnd(1,3);for(let i=0;i<=N;i++){const t=i/N;pts.push({x:lerp(-W*.1,W*1.1,t),y:y+Math.sin(t*Math.PI*wF)*wA});}}
      else if(type===1){const x=rnd(W*.05,W*.95),wA=rnd(4,14),wF=rnd(1,2.5);for(let i=0;i<=N;i++){const t=i/N;pts.push({x:x+Math.sin(t*Math.PI*wF)*wA,y:lerp(-H*.1,H*1.1,t)});}}
      else if(type===2){const sY=rnd(-H*.1,H*.6),eY=rnd(H*.4,H*1.1);for(let i=0;i<=N;i++){const t=i/N;pts.push({x:lerp(-W*.05,W*1.05,t),y:lerp(sY,eY,t)+Math.sin(t*Math.PI*rnd(1,2))*rnd(5,20)});}}
      else if(type===3){const pX=rnd(W*.25,W*.75),pY=rnd(H*.25,H*.75),gD=Math.random()>.5,half=Math.floor(N/2);for(let i=0;i<=half;i++){const t=i/half;pts.push({x:lerp(-W*.05,pX,t),y:pY+Math.sin(t*Math.PI)*rnd(5,12)});}for(let i=0;i<=half;i++){const t=i/half;pts.push({x:pX+Math.sin(t*Math.PI)*rnd(5,12),y:lerp(pY,gD?H*1.1:-H*.1,t)});}}
      else if(type===4){const pX=rnd(W*.25,W*.75),pY=rnd(H*.25,H*.75),half=Math.floor(N/2);for(let i=0;i<=half;i++){const t=i/half;pts.push({x:pX+Math.sin(t*Math.PI)*rnd(4,10),y:lerp(-H*.05,pY,t)});}for(let i=0;i<=half;i++){const t=i/half;pts.push({x:lerp(pX,W*1.05,t),y:pY+Math.sin(t*Math.PI)*rnd(4,10)});}}
      else{const cx=rnd(W*.15,W*.85),cy=rnd(H*.15,H*.85),r=rnd(H*.2,H*.55),sa=rnd(0,Math.PI*2),sp=rnd(Math.PI*.5,Math.PI*1.4);for(let i=0;i<=N;i++){const a=sa+sp*(i/N);pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});}}
      return pts;
    }

    function makeStroke() {
      return { col: COLS[Math.floor(Math.random()*COLS.length)], thick: rnd(H*.05,H*.13), maxAlpha: rnd(0.30,0.45), totalFrames: Math.floor(rnd(320,520)), pts: buildPath(Math.floor(rnd(0,6))), frame: 0, phase: rnd(0,Math.PI*2) };
    }

    function getAlpha(s: any) {
      const t = s.frame/s.totalFrames;
      if(t<0.15) return s.maxAlpha*(t/0.15);
      if(t>0.75) return s.maxAlpha*(1-(t-0.75)/0.25);
      return s.maxAlpha;
    }

    function drawStroke(ctx: CanvasRenderingContext2D, s: any) {
      const pts = s.pts; if(!pts.length) return;
      const alpha = getAlpha(s); if(alpha<0.01) return;
      const drawLen = s.frame/s.totalFrames < 0.30 ? ease((s.frame/s.totalFrames)/0.30) : 1.0;
      const tipIdx = Math.max(2, Math.floor(drawLen*pts.length));
      const [r,g,b] = hexRgb(s.col);
      const top: {x:number,y:number}[] = [], bot: {x:number,y:number}[] = [];
      for(let i=0;i<tipIdx;i++){
        const t=i/(pts.length-1), pt=pts[i];
        let nx=0, ny=1;
        if(i<pts.length-1){const dx=pts[i+1].x-pt.x,dy=pts[i+1].y-pt.y;const l=Math.hypot(dx,dy)||1;nx=-dy/l;ny=dx/l;}
        let taper=1;
        if(t<0.04)taper=t/0.04; else if(t>0.96)taper=(1-t)/0.04;
        const dT=i/tipIdx; if(dT>0.92)taper*=(1-dT)/0.08;
        const hw=s.thick*0.5*taper;
        top.push({x:pt.x+nx*(hw+Math.sin(i*0.18+s.phase)*hw*0.10),y:pt.y+ny*(hw+Math.sin(i*0.18+s.phase)*hw*0.10)});
        bot.push({x:pt.x-nx*(hw+Math.sin(i*0.18+s.phase+1.2)*hw*0.10),y:pt.y-ny*(hw+Math.sin(i*0.18+s.phase+1.2)*hw*0.10)});
      }
      if(top.length<2) return;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(top[0].x,top[0].y);
      for(let i=1;i<top.length;i++) ctx.lineTo(top[i].x,top[i].y);
      for(let i=bot.length-1;i>=0;i--) ctx.lineTo(bot[i].x,bot[i].y);
      ctx.closePath();
      const mid = pts[Math.floor(tipIdx/2)];
      const grad = ctx.createRadialGradient(mid.x,mid.y,0,mid.x,mid.y,s.thick*2.2);
      grad.addColorStop(0,`rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.55,`rgba(${r},${g},${b},${alpha*0.82})`);
      grad.addColorStop(1,`rgba(${r},${g},${b},${alpha*0.30})`);
      ctx.fillStyle=grad; ctx.fill();
      const hc=Math.floor(tipIdx*0.03);
      for(let h=0;h<hc;h++){
        const i=Math.floor(rnd(0,tipIdx)), t2=i/(pts.length-1);
        if(t2<0.05||t2>0.93) continue;
        const side=Math.random()>.5, ep=side?top[i]:bot[i]; if(!ep) continue;
        const hl2=rnd(s.thick*0.04,s.thick*0.09), pt2=pts[i];
        let nx=0,ny=1;
        if(i<pts.length-1){const dx=pts[i+1].x-pt2.x,dy=pts[i+1].y-pt2.y;const l=Math.hypot(dx,dy)||1;nx=-dy/l;ny=dx/l;}
        const sa=rnd(-0.5,0.5), hx=nx*Math.cos(sa)-ny*Math.sin(sa), hy=nx*Math.sin(sa)+ny*Math.cos(sa);
        ctx.beginPath(); ctx.lineWidth=rnd(0.3,0.8);
        ctx.strokeStyle=`rgba(${r},${g},${b},${rnd(0.05,0.12)*alpha/s.maxAlpha})`;
        ctx.moveTo(ep.x,ep.y); const dir=side?1:-1;
        ctx.lineTo(ep.x+hx*dir*hl2,ep.y+hy*dir*hl2); ctx.stroke();
      }
      ctx.restore();
    }

    function getDominant() {
      const hlEl = document.getElementById('hero-headline');
      if(!hlEl) return;
      const hlR = hlEl.getBoundingClientRect(), wR = wrap!.getBoundingClientRect();
      const cx=(hlR.left+hlR.width/2-wR.left)/W, cy=(hlR.top+hlR.height/2-wR.top)/H;
      let rS=0,gS=0,bS=0,wS=0,arS=0,agS=0,abS=0,awS=0;
      strokes.forEach(s => {
        if(!s.pts.length) return;
        const alpha=getAlpha(s); if(alpha<0.04) return;
        const mI=Math.floor(s.pts.length*.5), pt=s.pts[mI];
        const [r,g,b]=hexRgb(s.col);
        const dist=Math.hypot(pt.x/W-cx,pt.y/H-cy);
        if(dist<.65){const w=alpha*(1-dist/.65);rS+=r*w;gS+=g*w;bS+=b*w;wS+=w;}
        const aw=alpha*alpha; arS+=r*aw;agS+=g*aw;abS+=b*aw;awS+=aw;
      });
      if(wS>0.2){tR=lerp(rS/wS,245,0.38);tG=lerp(gS/wS,240,0.38);tB=lerp(bS/wS,232,0.38);}
      if(awS>0.1){taR=lerp(arS/awS,216,0.25);taG=lerp(agS/awS,90,0.25);taB=lerp(abS/awS,48,0.25);}
    }

    function applyAccent() {
      const hex = toHex([aR,aG,aB]);
      const el = (id: string) => document.getElementById(id) as HTMLElement|null;
      const cta=el('main-cta'); if(cta)cta.style.background=hex;
      const cw=el('coral-word'); if(cw)cw.style.color=hex;
      const av=el('painter-av'); if(av)av.style.background=hex;
      const eLine=el('eyebrow-line'); if(eLine)eLine.style.background=hex;
      const lt=el('live-tag'); if(lt)lt.style.borderColor=toRgba([aR,aG,aB],0.5);
    }

    function loop() {
      fn++;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0,0,W,H);
      strokes.forEach(s => {
        s.frame++;
        if(s.frame>s.totalFrames){const ns=makeStroke();ns.frame=0;Object.assign(s,ns);}
        drawStroke(ctx,s);
      });
      if(fn%5===0) getDominant();
      dR=lerp(dR,tR,.005);dG=lerp(dG,tG,.005);dB=lerp(dB,tB,.005);
      aR=lerp(aR,taR,.008);aG=lerp(aG,taG,.008);aB=lerp(aB,taB,.008);
      const hlEl=document.getElementById('hero-headline') as HTMLElement|null;
      const sbEl=document.getElementById('hero-sub') as HTMLElement|null;
      if(hlEl)hlEl.style.color=`rgb(${Math.round(dR)},${Math.round(dG)},${Math.round(dB)})`;
      if(sbEl)sbEl.style.color=toRgba([dR,dG,dB],0.68);
      applyAccent();
      rafId = requestAnimationFrame(loop);
    }

    resize();
    strokes = Array.from({length:4},(_,i)=>{const s=makeStroke();s.frame=Math.floor(i*(s.totalFrames/4));return s;});
    rafId = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize',resize); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#111109' }}>

      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video className="w-full h-full object-cover" autoPlay muted loop playsInline src={VIDEO_SRC} />
      </div>

      {/* Dark overlay — 60% */}
      <div className="absolute inset-0 z-[1]" style={{ background: '#111109', opacity: 0.60 }} />

      {/* Brush stroke canvas */}
      <canvas ref={brushCanvasRef} className="absolute inset-0 z-[2] pointer-events-none" style={{ width: '100%', height: '100%' }} />

      {/* Paint wave SVG */}
      <svg className="absolute bottom-0 left-0 w-full z-[3] pointer-events-none" viewBox="0 0 1440 80" preserveAspectRatio="xMidYMax slice">
        <path d="M0 55 Q360 25 720 50 Q1080 75 1440 40 L1440 80 L0 80 Z" fill="#D85A30" opacity="0.10"/>
        <path d="M0 65 Q480 45 960 62 Q1200 70 1440 58 L1440 80 L0 80 Z" fill="#2D5A3D" opacity="0.14"/>
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 page-container">
        <div className="flex items-center gap-3 mt-36 mb-5">
          <div className="h-px w-6" id="eyebrow-line" style={{ background: '#D85A30', transition: 'background 0.8s ease' }} />
          <span className="editorial-label" style={{ color: 'rgba(196,168,130,0.9)' }}>
            Verified painters · Protected payments · UK-wide
          </span>
        </div>

        <h1
          id="hero-headline"
          className="text-serif mb-5"
          style={{ color: '#F5F0E8', textShadow: '0 2px 20px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)', transition: 'color 0.8s ease' }}
        >
          Transform your home<br />
          with{' '}
          <em id="coral-word" style={{ color: '#D85A30', transition: 'color 0.8s ease' }}>
            the best painters
          </em>
        </h1>

        <p
          id="hero-sub"
          className="text-lg mb-10"
          style={{ color: 'rgba(245,240,232,0.68)', maxWidth: '480px', lineHeight: '1.75', fontWeight: 400, textShadow: '0 1px 12px rgba(0,0,0,0.9)', transition: 'color 0.8s ease' }}
        >
          Get matched to verified painters near you. Visualise your colours with our AI tool. Your money is held safely and released only when you're happy.
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to="/post-job"
            id="main-cta"
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-sm text-sm font-medium hover:-translate-y-0.5 transition-all duration-500"
            style={{ background: '#D85A30' }}
          >
            Get free quotes →
          </Link>
          <Link
            to="/join-painter"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-sm text-sm font-medium transition-all duration-300"
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.22)' }}
          >
            Join as painter/decorator →
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Open for bookings</span>
          </div>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.14)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Protected payments</span>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.14)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Verified painters only</span>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.14)' }} />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Dispute resolution included</span>
        </div>
      </div>

      {/* Painter match card */}
      <div className="relative z-10 page-container pb-10">
        <div className="inline-flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: 'rgba(20,18,14,0.85)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div id="painter-av" className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0" style={{ background: '#D85A30', transition: 'background 0.8s ease' }}>KA</div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#F5F0E8' }}>Korey A. — Manchester</p>
            <span className="text-xs" style={{ color: '#9E9A8E' }}>Painter/decorator · Verified</span>
          </div>
          <div id="live-tag" className="ml-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'rgba(45,90,61,0.4)', border: '0.5px solid rgba(71,140,71,0.4)', color: '#97C459', transition: 'border-color 0.8s ease' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-7 right-10 z-10 flex items-center gap-2">
        <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.22)' }}>Scroll</span>
      </div>

    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
const STEPS = [
  { number: "01", title: "Post your job", description: "Describe your painting job, set your budget, and choose your preferred start date. Free to post — no commitments." },
  { number: "02", title: "Get matched", description: "Our system matches your job to KYC-verified painters in your area based on skills, availability, and reviews." },
  { number: "03", title: "Pay securely", description: "Confirm your painter by paying into FCA-authorised escrow. Funds release only when you confirm the work is complete." },
];

function HowItWorks() {
  const ref = useScrollAnimationList();
  return (
    <section className="py-28 px-6" style={{ background: '#111109' }}>
      <div className="mx-auto max-w-6xl">
        <div ref={useScrollAnimation()} className="scroll-animate mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6" style={{ background: '#D85A30' }} />
            <span className="editorial-label" style={{ color: '#C4A882' }}>Simple process</span>
          </div>
          <h2 className="font-display max-w-lg" style={{ color: '#F5F0E8', fontFamily: 'DM Serif Display, serif', fontSize: '42px', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            From estimate to booking,<br />in three steps.
          </h2>
        </div>
        <div ref={ref} className="grid md:grid-cols-3 gap-0 scroll-stagger" style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}>
          {STEPS.map(({ number, title, description }) => (
            <div
              key={number}
              className="scroll-animate group flex flex-col p-10 transition-colors duration-300"
              style={{ borderRight: '0.5px solid rgba(255,255,255,0.08)', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', color: '#D85A30', opacity: 0.45, marginBottom: '20px', lineHeight: 1 }}>{number}</span>
              <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', fontWeight: 400, color: '#F5F0E8', marginBottom: '12px' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: '#6B6860', lineHeight: '1.75', flex: 1 }}>{description}</p>
              <div style={{ height: '1px', width: 0, background: '#D85A30', marginTop: '20px', transition: 'width 0.4s ease' }} className="step-bar" />
            </div>
          ))}
        </div>
        <div className="mt-10 scroll-animate" ref={useScrollAnimation()}>
          <Link to="/how-it-works/customers" className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200" style={{ color: '#C4A882' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F5F0E8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#C4A882')}
          >
            See the full process
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Trust Signals ─────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: BadgeCheck, title: "Verified Painters", description: "Every painter passes identity, address, and insurance verification before joining." },
  { icon: ShieldCheck, title: "FCA Authorised Escrow", description: "All payments held by Transpact (FCA Ref: 546279). PaintBookCo never holds your funds." },
  { icon: Lock, title: "Secure Payments", description: "Your payment is locked in escrow until you confirm the job is complete." },
  { icon: Handshake, title: "Dispute Protection", description: "If something goes wrong, raise a dispute — funds are frozen until resolved." },
];

function TrustSignals() {
  const ref = useScrollAnimationList();
  return (
    <section className="py-28 px-6" style={{ background: '#1A1A14' }}>
      <div className="mx-auto max-w-6xl">
        <div ref={useScrollAnimation()} className="scroll-animate mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-6" style={{ background: '#D85A30' }} />
            <span className="editorial-label" style={{ color: '#C4A882' }}>Built on trust</span>
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '42px', fontWeight: 400, color: '#F5F0E8', letterSpacing: '-0.02em', lineHeight: '1.1', maxWidth: '480px' }}>
            Why customers choose<br />PaintBookCo
          </h2>
        </div>
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 scroll-stagger">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="scroll-animate flex flex-col p-8 transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
            >
              <div className="w-10 h-10 flex items-center justify-center mb-6 rounded-full" style={{ background: 'rgba(216,90,48,0.12)', border: '0.5px solid rgba(216,90,48,0.3)' }}>
                <Icon className="h-5 w-5" style={{ color: '#D85A30' }} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#F5F0E8', marginBottom: '8px' }}>{title}</h3>
              <p style={{ fontSize: '12px', color: '#6B6860', lineHeight: '1.75' }}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── For Decorators ──────────────────────────────────────────────────────────────
const PAINTER_BENEFITS = [
  { title: "No subscription fees", description: "Zero upfront costs. Commission only on completed jobs — and it reduces as you grow." },
  { title: "Matched jobs sent to you", description: "No bidding wars. The first verified decorator to accept gets the job." },
  { title: "Secure, guaranteed payment", description: "Every job is backed by FCA-authorised escrow. You get paid when the job is done." },
];

function ForPainters() {
  const ref = useScrollAnimation();
  return (
    <section className="py-28 px-6" style={{ background: '#2D5A3D' }}>
      <div ref={ref} className="mx-auto max-w-6xl scroll-animate">
        <div className="grid md:grid-cols-2 gap-20 items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6" style={{ background: '#97C459' }} />
              <span className="editorial-label" style={{ color: '#97C459' }}>For painters/decorators</span>
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '42px', fontWeight: 400, color: '#F5F0E8', letterSpacing: '-0.02em', lineHeight: '1.1', marginBottom: '24px' }}>
              Grow your decorating<br />business with us
            </h2>
            <p style={{ fontSize: '14px', color: '#9FE1CB', lineHeight: '1.8', marginBottom: '32px', maxWidth: '360px' }}>
              Join the UK's only painter-exclusive marketplace. Get matched to quality jobs, receive protected payments, and build your reputation with verified reviews.
            </p>
            <Link
              to="/join-painter"
              className="inline-flex items-center gap-2 font-medium px-8 py-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#F5F0E8', color: '#1A1A14', fontSize: '13px', borderRadius: '3px' }}
            >
              Apply to join
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div style={{ border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            {PAINTER_BENEFITS.map(({ title, description }, i) => (
              <div
                key={title}
                className="flex gap-4 p-6 transition-colors duration-200"
                style={{
                  borderBottom: i < PAINTER_BENEFITS.length - 1 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
                  background: 'rgba(255,255,255,0.06)'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#97C459" strokeWidth="1.5"/><path d="M6 10l3 3 5-5" stroke="#97C459" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 500, color: '#F5F0E8', marginBottom: '4px' }}>{title}</h4>
                  <p style={{ fontSize: '12px', color: '#9FE1CB', lineHeight: '1.7' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Vestimator CTA ────────────────────────────────────────────────────────────
function VestimatorCTA() {
  const ref = useScrollAnimation();
  return (
    <section className="py-24 px-6" style={{ background: '#F5F0E8' }}>
      <div ref={ref} className="mx-auto max-w-5xl scroll-animate">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6" style={{ background: '#D85A30' }} />
              <span className="editorial-label" style={{ color: '#D85A30' }}>Free tool</span>
            </div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '38px', fontWeight: 400, color: '#1A1A14', letterSpacing: '-0.02em', lineHeight: '1.1', marginBottom: '16px' }}>
              See it before<br />you paint it
            </h2>
            <p style={{ fontSize: '13px', color: '#6B6860', lineHeight: '1.8', marginBottom: '24px', maxWidth: '360px' }}>
              Upload a photo of your room. Our AI detects walls and lets you visualise any colour in seconds — before committing to a single tin.
            </p>
            <p style={{ fontSize: '11px', color: '#B4B2A9', lineHeight: '1.6', marginBottom: '24px', paddingTop: '12px', borderTop: '0.5px solid rgba(180,150,100,0.25)' }}>
              Estimates only — actual paint usage may vary depending on surface condition, number of coats and application method.
            </p>
            <Link
              to="/vestimator"
              className="inline-flex items-center gap-2 font-medium px-8 py-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#1A1A14', color: '#F5F0E8', fontSize: '13px', borderRadius: '3px' }}
            >
              Try the Vestimator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { bg: '#2D5A3D', label: 'Forest green', text: 'rgba(255,255,255,0.55)' },
              { bg: '#C4A882', label: 'Sand dune', text: 'rgba(70,45,15,0.65)' },
              { bg: '#8B1A1A', label: 'Deep red', text: 'rgba(255,200,200,0.55)' },
              { bg: '#D85A30', label: 'Coral flame', text: 'rgba(255,235,215,0.65)' },
              { bg: '#1A1A14', label: 'Ink black', text: 'rgba(255,255,255,0.25)' },
              { bg: '#F5F0E8', label: 'Warm ivory', text: '#888780' },
            ].map(s => (
              <div key={s.label} style={{ aspectRatio: '1', background: s.bg, borderRadius: '4px', border: s.bg === '#F5F0E8' ? '0.5px solid #D3D1C7' : 'none', display: 'flex', alignItems: 'flex-end', padding: '10px', cursor: 'pointer', transition: 'transform 0.25s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <span style={{ fontSize: '10px', lineHeight: '1.3', color: s.text, fontFamily: 'DM Sans, sans-serif' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA Band ──────────────────────────────────────────────────────────────────
function CTABand() {
  const ref = useScrollAnimation();
  return (
    <section className="py-28 px-6" style={{ background: '#111109' }}>
      <div ref={ref} className="mx-auto max-w-3xl text-center scroll-animate">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-6" style={{ background: '#D85A30' }} />
          <span className="editorial-label" style={{ color: '#C4A882' }}>Ready to begin</span>
          <div className="h-px w-6" style={{ background: '#D85A30' }} />
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '42px', fontWeight: 400, color: '#F5F0E8', letterSpacing: '-0.02em', lineHeight: '1.1', marginBottom: '20px' }}>
          Your perfect painter/decorator<br />is one click away.
        </h2>
        <p style={{ fontSize: '14px', color: '#6B6860', lineHeight: '1.8', maxWidth: '400px', margin: '0 auto 40px' }}>
          Post your job for free. No commitment. Verified painters/decorators send quotes — you choose the best fit.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/post-job" className="inline-flex items-center gap-2 font-medium px-8 py-4 w-full sm:w-auto justify-center transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: '#D85A30', color: '#F5F0E8', fontSize: '13px', borderRadius: '3px' }}>
            Get free quotes
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/how-it-works/customers" className="inline-flex items-center gap-2 font-medium px-8 py-4 w-full sm:w-auto justify-center transition-all duration-200"
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.2)', fontSize: '13px', borderRadius: '3px' }}>
            Learn how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  useEffect(() => { document.title = "PaintBookCo | Hire Verified Painters"; }, []);
  return (
    <div className="relative">
      <Hero />
      <HowItWorks />
      <TrustSignals />
      <ForPainters />
      <VestimatorCTA />
      <CTABand />
    </div>
  );
}

