import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      background: '#0f172a',
      color: '#f8fafc',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '4rem', 
        fontWeight: 800, 
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Placefolio Job Board
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
        기존 Placefolio Engineering Journal 아키텍처 위에서 구축된 <br/>나만을 위한 맞춤형 채용 공고 대시보드입니다.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/jobs" style={{
          background: '#38bdf8',
          color: '#0f172a',
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '1.1rem',
          transition: 'all 0.2s',
          boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)'
        }}>
          채용 공고 둘러보기
        </Link>
        <Link href="/index.html" style={{
          background: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f8fafc',
          padding: '1rem 2rem',
          borderRadius: '12px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '1.1rem',
          transition: 'all 0.2s'
        }}>
          기존 Journal 보기
        </Link>
      </div>
    </main>
  );
}
