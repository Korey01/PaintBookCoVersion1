import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Calculator,
  MapPin,
  PaintBucket,
  Star,
  Building2,
} from "lucide-react";
import PainterCard from "@/components/site/PainterCard";
import TestimonialsSection from "@/components/site/TestimonialsSection";
import { painters } from "@/data/painters";
import {
  useScrollAnimation,
  useScrollAnimationList,
} from "@/hooks/useScrollAnimation";

/* ── Motion config ── */
const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay, ease },
  }),
};

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, delay, ease },
  }),
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

/* ── Shared section heading ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="editorial-label text-muted-foreground mb-4 flex items-center gap-3">
      <span className="inline-block h-px w-8 bg-current" />
      {children}
    </p>
  );
}

export default function Index() {
  useEffect(() => { document.title = "PaintBook | Hire Verified Painters"; }, []);

  const navigate   = useNavigate();
  const ref2 = useScrollAnimationList();
  const ref3 = useScrollAnimation();
  const ref4 = useScrollAnimationList();

  const brushCanvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll-animate observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
      }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    const toHex = ([r,g,b]: number[]) => `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`;
    const toRgba = ([r,g,b]: number[], a: number) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;

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
      return {
        col: COLS[Math.floor(Math.random()*COLS.length)],
        thick: rnd(H*.05,H*.13),
        maxAlpha: rnd(0.30,0.45),
        totalFrames: Math.floor(rnd(320,520)),
        pts: buildPath(Math.floor(rnd(0,6))),
        frame: 0,
        phase: rnd(0,Math.PI*2)
      };
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
      const tipIdx = Math.max(2, Math.floor((s.frame/s.totalFrames<0.30?ease((s.frame/s.totalFrames)/0.30):1.0)*pts.length));
      const [r,g,b] = hexRgb(s.col);
      const top: {x:number,y:number}[] = [], bot: {x:number,y:number}[] = [];
      for(let i=0;i<tipIdx;i++){
        const t=i/(pts.length-1),pt=pts[i];
        let nx=0,ny=1;
        if(i<pts.length-1){const dx=pts[i+1].x-pt.x,dy=pts[i+1].y-pt.y;const l=Math.hypot(dx,dy)||1;nx=-dy/l;ny=dx/l;}
        let taper=1;
        if(t<0.04)taper=t/0.04;else if(t>0.96)taper=(1-t)/0.04;
        const dT=i/tipIdx;if(dT>0.92)taper*=(1-dT)/0.08;
        const hw=s.thick*0.5*taper;
        const tw=Math.sin(i*0.18+s.phase)*hw*0.10,bw=Math.sin(i*0.18+s.phase+1.2)*hw*0.10;
        top.push({x:pt.x+nx*(hw+tw),y:pt.y+ny*(hw+tw)});
        bot.push({x:pt.x-nx*(hw+bw),y:pt.y-ny*(hw+bw)});
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
        const i=Math.floor(rnd(0,tipIdx)),t=i/(pts.length-1);
        if(t<0.05||t>0.93) continue;
        const side=Math.random()>.5,ep=side?top[i]:bot[i]; if(!ep) continue;
        const hl2=rnd(s.thick*0.04,s.thick*0.09),pt=pts[i];
        let nx=0,ny=1;
        if(i<pts.length-1){const dx=pts[i+1].x-pt.x,dy=pts[i+1].y-pt.y;const l=Math.hypot(dx,dy)||1;nx=-dy/l;ny=dx/l;}
        const sa=rnd(-0.5,0.5),hx=nx*Math.cos(sa)-ny*Math.sin(sa),hy=nx*Math.sin(sa)+ny*Math.cos(sa);
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
        const mI=Math.floor(s.pts.length*.5),pt=s.pts[mI];
        const [r,g,b]=hexRgb(s.col);
        const dist=Math.hypot(pt.x/W-cx,pt.y/H-cy);
        if(dist<.65){const w=alpha*(1-dist/.65);rS+=r*w;gS+=g*w;bS+=b*w;wS+=w;}
        const aw=alpha*alpha;arS+=r*aw;agS+=g*aw;abS+=b*aw;awS+=aw;
      });
      if(wS>0.2){tR=lerp(rS/wS,245,0.38);tG=lerp(gS/wS,240,0.38);tB=lerp(bS/wS,232,0.38);}
      if(awS>0.1){taR=lerp(arS/awS,216,0.25);taG=lerp(agS/awS,90,0.25);taB=lerp(abS/awS,48,0.25);}
    }

    function applyAccent() {
      const hex = toHex([aR,aG,aB]);
      const el = (id: string) => document.getElementById(id);
      const cta = el('main-cta'); if(cta)(cta as HTMLElement).style.background=hex;
      const cw = el('coral-word'); if(cw)(cw as HTMLElement).style.color=hex;
      const av = el('painter-av'); if(av)(av as HTMLElement).style.background=hex;
      const eLine = el('eyebrow-line'); if(eLine)(eLine as HTMLElement).style.background=hex;
      const lt = el('live-tag'); if(lt)(lt as HTMLElement).style.borderColor=toRgba([aR,aG,aB],0.5);
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
      const hlEl=document.getElementById('hero-headline');
      const sbEl=document.getElementById('hero-sub');
      const tc=`rgb(${Math.round(dR)},${Math.round(dG)},${Math.round(dB)})`;
      if(hlEl)(hlEl as HTMLElement).style.color=tc;
      if(sbEl)(sbEl as HTMLElement).style.color=toRgba([dR,dG,dB],0.68);
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
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#111109' }}>

        {/* Video background */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            autoPlay muted loop playsInline
            src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/hero-background.mp4"
          />
        </div>

        {/* Dark overlay — 60% */}
        <div className="absolute inset-0 z-[1]" style={{ background: '#111109', opacity: 0.60 }} />

        {/* Brush stroke canvas — z-index 2 */}
        <canvas
          ref={brushCanvasRef}
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Paint wave SVG at bottom */}
        <svg className="absolute bottom-0 left-0 w-full z-[3] pointer-events-none" viewBox="0 0 1440 80" preserveAspectRatio="xMidYMax slice">
          <path d="M0 55 Q360 25 720 50 Q1080 75 1440 40 L1440 80 L0 80 Z" fill="#D85A30" opacity="0.10"/>
          <path d="M0 65 Q480 45 960 62 Q1200 70 1440 58 L1440 80 L0 80 Z" fill="#2D5A3D" opacity="0.14"/>
        </svg>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col flex-1 page-container">
          <div className="flex items-center gap-3 mt-32 mb-5 animate-editorial-down">
            <div className="h-px w-6 chameleon-accent" id="eyebrow-line" style={{ background: '#D85A30' }} />
            <span className="editorial-label" style={{ color: 'rgba(196,168,130,0.9)' }}>
              Verified painters · Protected payments · UK-wide
            </span>
          </div>

          <h1
            className="text-serif mb-5 animate-editorial-up chameleon-text"
            id="hero-headline"
            style={{ color: '#F5F0E8', textShadow: '0 2px 20px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)', animationDelay: '0.1s' }}
          >
            Transform your home<br />
            with{' '}
            <em
              className="chameleon-text"
              id="coral-word"
              style={{ color: '#D85A30' }}
            >
              the best painters
            </em>
          </h1>

          <p
            className="text-lg mb-10 animate-editorial-up chameleon-text"
            id="hero-sub"
            style={{
              color: 'rgba(245,240,232,0.68)',
              maxWidth: '480px',
              lineHeight: '1.75',
              fontWeight: 400,
              textShadow: '0 1px 12px rgba(0,0,0,0.9)',
              animationDelay: '0.2s'
            }}
          >
            Get matched to verified painters near you. Visualise your colours with our AI tool. Your money is held safely and released only when you're happy.
          </p>

          <div className="flex flex-wrap gap-4 animate-editorial-up" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/post-job"
              id="main-cta"
              className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-sm text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 chameleon-accent"
              style={{ background: '#D85A30' }}
            >
              Get free quotes →
            </Link>
            <Link
              to="/join-painter"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-sm text-sm font-medium transition-all duration-300 hover:border-white/40"
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.22)' }}
            >
              Join as painter/decorator →
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 mt-8 animate-editorial-up" style={{ animationDelay: '0.4s' }}>
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
        <div className="relative z-10 mx-auto w-full page-container pb-10">
          <div
            className="inline-flex items-center gap-3 rounded-lg px-4 py-3"
            style={{ background: 'rgba(20,18,14,0.85)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 chameleon-accent"
              id="painter-av"
              style={{ background: '#D85A30' }}
            >
              KA
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#F5F0E8' }}>Korey A. — Manchester</p>
              <span className="text-xs" style={{ color: '#9E9A8E' }}>Painter/decorator · Verified</span>
            </div>
            <div
              className="ml-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium chameleon-accent"
              id="live-tag"
              style={{ background: 'rgba(45,90,61,0.4)', border: '0.5px solid rgba(71,140,71,0.4)', color: '#97C459' }}
            >
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

      {/* ══════════════════════════════════════════════
          STATS BAND
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#1A1A14', padding: '40px 0', borderBottom: '1px solid rgba(180,150,100,0.12)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40"
          >
            {[
              { value: "2,400+",  label: "Verified Painters" },
              { value: "18,000+", label: "Jobs Completed" },
              { value: "4.9",     label: "Average Rating", suffix: "★" },
              { value: "100%",    label: "Escrow Protected" },
            ].map(({ value, label, suffix }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex flex-col items-center py-6 px-4 text-center"
              >
                <span className="text-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
                  {value}{suffix}
                </span>
                <span className="editorial-label mt-1.5">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#111109', padding: '64px 0' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>How it works</SectionLabel>
              <h2 className="text-serif max-w-xl mb-16">
                From estimate to booking,<br />in three steps.
              </h2>
            </motion.div>

            <div className="grid gap-0 md:grid-cols-3 border border-border/50">
              {[
                {
                  num: "01",
                  icon: Calculator,
                  title: "Get your estimate",
                  body: "Use the Vestimator to calculate exact paint quantities and a material cost baseline — before you speak to a single painter.",
                  cta: "Open Vestimator",
                  href: "/vestimator",
                },
                {
                  num: "02",
                  icon: MapPin,
                  title: "Find & compare painters",
                  body: "Browse verified, insured painters by location, specialty, rating and price. See real portfolios, not just profiles.",
                  cta: "Find Painters",
                  href: "/find-painter",
                },
                {
                  num: "03",
                  icon: ShieldCheck,
                  title: "Book with confidence",
                  body: "Post your job, receive quotes, and pay securely through escrow. Funds release only when the work is done to your standard.",
                  cta: "Post a Job",
                  href: "/post-job",
                },
              ].map(({ num, icon: Icon, title, body, cta, href }, i) => (
                <motion.div
                  key={num}
                  variants={fadeUp}
                  custom={i * 0.1}
                  className="group flex flex-col p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border/50 last:border-0 transition-colors duration-300 hover:bg-muted/40"
                >
                  <span className="editorial-label text-primary mb-6">{num}</span>
                  <div className="mb-4 p-3 w-fit bg-muted">
                    <Icon className="h-5 w-5 text-foreground/70" />
                  </div>
                  <h3 className="text-serif text-xl mb-3 font-normal">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-[1.7] mb-6 flex-1">{body}</p>
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group-hover:gap-2.5"
                  >
                    {cta} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TOP-RATED PAINTERS
      ══════════════════════════════════════════════ */}
      <section ref={ref2} className="scroll-animate" style={{ background: '#1A1A14', padding: '64px 0' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <SectionLabel>Professionals</SectionLabel>
              <h2 className="text-serif max-w-sm">Top rated near you.</h2>
            </div>
            <Button
              onClick={() => navigate("/find-painter")}
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 scroll-stagger">
            {[...painters]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 3)
              .map((p) => (
                <div key={p.id} className="scroll-animate">
                  <PainterCard painter={p} />
                </div>
              ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Button onClick={() => navigate("/find-painter")} variant="outline" size="sm" className="w-full">
              View all painters <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VESTIMATOR FEATURE
      ══════════════════════════════════════════════ */}
      <section ref={ref3} className="scroll-animate" style={{ background: '#111109', padding: '64px 0' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 md:grid-cols-2 md:items-center">

            {/* Image */}
            <div className="relative order-last md:order-first">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2Fc1db86da96eb40bd97ce4e112a273df4?format=webp&width=1200"
                alt="Vestimator tool"
                className="w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
              {/* Floating card */}
              <div className="absolute -bottom-4 -right-4 bg-background border border-border/40 px-4 py-3 shadow-editorial">
                <div className="flex items-center gap-3">
                  <PaintBucket className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Estimate ready</p>
                    <p className="text-[11px] text-muted-foreground">Under 2 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-8">
              <div>
                <SectionLabel>
                  <span className="text-white/30">Vestimator</span>
                </SectionLabel>
                <h2 className="text-serif text-white mb-6">
                  Estimate your paint<br />
                  <em className="not-italic" style={{ color: "hsl(var(--coral))" }}>in minutes.</em>
                </h2>
                <p className="text-white/55 leading-[1.7] text-base">
                  Enter room dimensions, number of coats and openings.
                  Get exact litres required and a material cost — with brand
                  comparisons across Dulux, Farrow &amp; Ball, and Crown.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Multi-room support with openings & coats",
                  "Brand-by-brand cost comparison",
                  "Instant material cost breakdown",
                  "Attach directly to your job post",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="h-px w-5 bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <Button onClick={() => navigate("/vestimator")} variant="outline-light" size="lg">
                  Open Vestimator
                </Button>
                <Button onClick={() => navigate("/find-painter")} variant="ghost-light" size="lg">
                  Find a Painter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COMMERCIAL / B2B
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#1A1A14', padding: '64px 0' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <div>
              <motion.div variants={fadeUp}>
                <SectionLabel>Commercial</SectionLabel>
                <h2 className="text-serif mb-6">
                  Large-scale projects,<br />handled end-to-end.
                </h2>
                <p className="text-muted-foreground leading-[1.7] mb-8">
                  From multi-site refurbishments to ongoing maintenance contracts,
                  PaintBookCo connects you with verified painting teams and manages
                  scope, payments, and delivery — milestone by milestone.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => navigate("/b2b/find-painter")} variant="default" size="lg">
                    Find Commercial Painters <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => navigate("/b2b/consultation")} variant="outline" size="lg">
                    Book a Consultation
                  </Button>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeUp} custom={0.15} className="space-y-0 border border-border/50">
              {[
                {
                  icon: Sparkles,
                  title: "Milestone-based payments",
                  body: "Funds release at each agreed milestone — keeping projects moving and both parties protected.",
                },
                {
                  icon: ShieldCheck,
                  title: "Regulated escrow",
                  body: "Every payment sits in regulated escrow until work is verified complete.",
                },
                {
                  icon: Building2,
                  title: "Multi-site coordination",
                  body: "Manage multiple locations and teams from one dashboard with a single point of contact.",
                },
              ].map(({ icon: Icon, title, body }, i) => (
                <div
                  key={title}
                  className="flex gap-5 p-6 border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-[1.6]">{body}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════════
          CUSTOMER QUOTES
      ══════════════════════════════════════════════ */}
      <section ref={ref4} className="scroll-animate" style={{ background: '#1A1A14', padding: '64px 0' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-12">
            <SectionLabel>Reviews</SectionLabel>
            <h2 className="text-serif max-w-md">
              Trusted by homeowners &amp; businesses.
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-3 border border-border/50 scroll-stagger">
            {[
              {
                quote: "Flawless finish and super professional. The escrow deposit made payment completely stress-free.",
                name: "Ella R.", location: "London", rating: 5,
              },
              {
                quote: "Booked in a day, loved the portfolio. The estimate tool was spot-on for my budget.",
                name: "James K.", location: "Leeds", rating: 5,
              },
              {
                quote: "Felt completely safe with ID verified and insured badges. Great experience throughout.",
                name: "Priya S.", location: "Bristol", rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="scroll-animate flex flex-col p-8 sm:p-10 border-b md:border-b-0 md:border-r border-border/50 last:border-0 bg-card"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-6">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-[1.75] text-foreground/80 flex-1 mb-8">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BAND — For painters
      ══════════════════════════════════════════════ */}
      <section style={{ background: '#2D5A3D', padding: '64px 0' }} className="overflow-hidden relative">
        {/* Faint decorative rings */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full border border-white/5 animate-spin-slow" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full border border-white/5 animate-spin-slow" style={{ animationDuration: "32s", animationDirection: "reverse" }} />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-8"
          >
            <motion.p variants={fadeIn} custom={0} className="editorial-label text-white/30 tracking-[0.2em]">
              Ready to begin
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={0.05}
              className="text-serif text-white text-4xl sm:text-5xl lg:text-6xl tracking-[-0.03em] leading-[1.05]"
            >
              Your perfect painter<br />is one click away.
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.12} className="text-white/45 text-base leading-[1.7] max-w-lg mx-auto">
              Post your job for free. No commitment. Verified painters send
              quotes — you choose the best fit.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={0.2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              <Button
                onClick={() => navigate("/post-job")}
                variant="outline-light"
                size="xl"
                className="min-w-[200px]"
              >
                Post a Job Free
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/find-painter")}
                variant="ghost-light"
                size="xl"
                className="min-w-[180px]"
              >
                Browse Painters
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
