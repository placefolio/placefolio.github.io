'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, loginWithGoogle, signUpWithGoogle, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">Placefolio</Link>
        </div>
        
        <div className={styles.links}>
          <Link href="/jobs" className={styles.navLink}>채용공고</Link>
          <Link href="/dashboard" className={styles.navLink}>대시보드</Link>
        </div>

        <div className={styles.auth}>
          {user ? (
            <div className={styles.userMenu}>
              <Link href="/profile" className={styles.profileLink}>
                <span className={styles.userName}>{user.displayName || user.email}</span>
              </Link>
              <button onClick={logout} className={styles.logoutButton}>로그아웃</button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button onClick={loginWithGoogle} className={styles.loginButton}>로그인</button>
              <button onClick={signUpWithGoogle} className={styles.signUpButton}>회원가입</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
