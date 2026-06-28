import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: '#111109', padding: '48px 0 24px', borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <img
              src="https://kvuidnkmxqftbmlyvlyl.supabase.co/storage/v1/object/public/assets/paintbookco-logo.png"
              alt="PaintBookCo"
              style={{ height: '26px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.55, display: 'block', marginBottom: '12px' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{ fontSize: '12px', color: '#6B6860', lineHeight: '1.7', maxWidth: '200px' }}>
              The UK's only painter-exclusive marketplace. Verified, protected, built for tradespeople.
            </p>
          </div>
          {[
            {
              title: 'Platform',
              links: [
                { label: 'Post a job', to: '/post-job' },
                { label: 'Find painters', to: '/find-painters' },
                { label: 'Paint Vestimator', to: '/vestimator' },
                { label: 'How it works', to: '/how-it-works/customers' },
              ],
            },
            {
              title: 'Painters/Decorators',
              links: [
                { label: 'Join as painter/decorator', to: '/join-painter' },
                { label: 'Verification process', to: '/how-it-works/painters' },
                { label: 'Protected payments', to: '/trust-safety' },
                { label: 'Painter dashboard', to: '/dashboard' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About us', to: '/about' },
                { label: 'Trust & safety', to: '/trust-safety' },
                { label: 'Support', to: '/support' },
                { label: 'Contact', to: '/contact' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3D3C36', marginBottom: '14px' }}>{col.title}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {col.links.map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    style={{ fontSize: '12px', color: '#6B6860', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#9E9A8E')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#6B6860')}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: '#3D3C36' }}>© {new Date().getFullYear()} The PaintBook Company Ltd · Company No. 16690724</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'Privacy policy', to: '/privacy' },
              { label: 'Terms of service', to: '/terms' },
              { label: 'Cookies', to: '/cookies' },
            ].map(l => (
              <Link
                key={l.label}
                to={l.to}
                style={{ fontSize: '11px', color: '#3D3C36', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#6B6860')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#3D3C36')}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
