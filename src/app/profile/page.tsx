'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { set, get, del } from 'idb-keyval';
import styles from './page.module.css';

interface UserProfile {
  bio: string;
  githubUrl: string;
  linkedInUrl: string;
  portfolioUrl: string;
  techStack: string[];
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile>({
    bio: '',
    githubUrl: '',
    linkedInUrl: '',
    portfolioUrl: '',
    techStack: [],
  });
  
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [localResumeUrl, setLocalResumeUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'USERS', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            bio: data.bio || '',
            githubUrl: data.githubUrl || '',
            linkedInUrl: data.linkedInUrl || '',
            portfolioUrl: data.portfolioUrl || '',
            techStack: data.techStack || [],
          });
        }

        // 로컬 저장소(IndexedDB)에서 이력서 불러오기
        const savedResume = await get(`resume_${user.uid}`);
        if (savedResume instanceof File || savedResume instanceof Blob) {
          const url = URL.createObjectURL(savedResume);
          setLocalResumeUrl(url);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  // Object URL 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (localResumeUrl) {
        URL.revokeObjectURL(localResumeUrl);
      }
    };
  }, [localResumeUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (techInput.trim() && !profile.techStack.includes(techInput.trim())) {
      setProfile(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== techToRemove)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('5MB 이하의 파일만 업로드 가능합니다.');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!user || !resumeFile) return;
    setUploadingResume(true);
    
    try {
      // 로컬(IndexedDB)에 저장
      await set(`resume_${user.uid}`, resumeFile);
      
      const url = URL.createObjectURL(resumeFile);
      setLocalResumeUrl(url);
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('이력서가 로컬에 안전하게 저장되었습니다!');
    } catch (error: any) {
      console.error('Error saving file:', error);
      alert('로컬 저장에 실패했습니다.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const docRef = doc(db, 'USERS', user.uid);
      await setDoc(docRef, {
        bio: profile.bio,
        githubUrl: profile.githubUrl,
        linkedInUrl: profile.linkedInUrl,
        portfolioUrl: profile.portfolioUrl,
        techStack: profile.techStack,
      }, { merge: true });
      alert('프로필이 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className={styles.loadingWrapper}>프로필 불러오는 중...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>내 프로필</h1>
        <button 
          className={styles.saveButton} 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </header>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>기본 정보</h2>
        
        <div className={styles.readonlyInfo} style={{ marginBottom: '1.5rem' }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className={styles.avatar} />
          ) : (
            <div className={styles.avatar}>{user?.displayName?.charAt(0) || 'U'}</div>
          )}
          <div className={styles.userInfo}>
            <h3>{user?.displayName || '이름 없음'}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="bio">한 줄 소개 (Bio)</label>
          <textarea 
            id="bio"
            name="bio"
            className={styles.textarea} 
            placeholder="자신을 자유롭게 소개해보세요!"
            value={profile.bio}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>이력서 (PDF)</h2>
        <div className={styles.fileInputWrapper}>
          <input 
            type="file" 
            accept="application/pdf"
            className={styles.fileInput}
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <button 
            className={styles.uploadButton}
            onClick={handleUploadResume}
            disabled={!resumeFile || uploadingResume}
          >
            {uploadingResume ? '업로드 중...' : '업로드'}
          </button>
        </div>
        
        {localResumeUrl ? (
          <div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              등록된 이력서가 있습니다.
            </p>
            <iframe 
              src={localResumeUrl} 
              className={styles.pdfViewer}
              title="Resume PDF Viewer"
            />
            <button 
              style={{ marginTop: '0.5rem', background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
              onClick={async () => {
                await del(`resume_${user?.uid}`);
                setLocalResumeUrl('');
                alert('로컬에 저장된 이력서가 삭제되었습니다.');
              }}
            >
              이력서 삭제
            </button>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>아직 등록된 이력서가 없습니다.</p>
        )}
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>외부 링크 (포트폴리오)</h2>
        <div className={styles.linksGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="githubUrl">GitHub URL</label>
            <input 
              type="url" 
              id="githubUrl"
              name="githubUrl"
              className={styles.input} 
              placeholder="https://github.com/..."
              value={profile.githubUrl}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="linkedInUrl">LinkedIn URL</label>
            <input 
              type="url" 
              id="linkedInUrl"
              name="linkedInUrl"
              className={styles.input} 
              placeholder="https://linkedin.com/in/..."
              value={profile.linkedInUrl}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="portfolioUrl">개인 포트폴리오/블로그 URL</label>
            <input 
              type="url" 
              id="portfolioUrl"
              name="portfolioUrl"
              className={styles.input} 
              placeholder="https://..."
              value={profile.portfolioUrl}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>기술 스택 (Tech Stack)</h2>
        <div className={styles.techStackContainer}>
          <form onSubmit={handleAddTech} className={styles.techInputWrapper}>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="예: React, TypeScript, Firebase..."
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
            />
            <button type="submit" className={styles.addButton}>추가</button>
          </form>
          
          <div className={styles.tags}>
            {profile.techStack.length === 0 && (
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>아직 등록된 기술 스택이 없습니다.</span>
            )}
            {profile.techStack.map((tech) => (
              <span key={tech} className={styles.tag}>
                {tech}
                <button type="button" className={styles.removeTag} onClick={() => handleRemoveTech(tech)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
