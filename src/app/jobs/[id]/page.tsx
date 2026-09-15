'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { get } from 'idb-keyval';
import styles from './page.module.css';
import { Heart, ArrowLeft, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

interface Company {
  company_id: string;
  name: string;
  company_type: string;
  domain: string;
  core_tech_stack_ids: string[];
}

interface JobPosting {
  job_id: string;
  company_id: string;
  title: string;
  min_experience: number;
  max_experience: number;
  has_coding_test: boolean;
  has_assignment: boolean;
  required_tech_stack_ids: string[];
  description: string;
  requirements?: string;
  preferred_qualifications?: string;
  deadline_date?: string | null;
  manual_status?: string;
  is_active?: boolean;
  snapshot_date?: string;
  fit_level?: string;
  verdict?: string;
  source_url?: string;
  portfolio_version?: string;
  portfolio_total_pages?: number;
  portfolio_index?: string;
  portfolio_recommended_pages?: string;
  portfolio_strengths?: string;
  portfolio_gaps?: string;
  portfolio_improvements?: string;
}

interface AnalysisResult {
  matchPercentage: number;
  strengths: string[];
  improvements: string[];
  interviewQuestions: string[];
}

// File을 Base64 문자열로 변환하는 유틸리티
function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Failed to extract base64 data'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // AI 분석 관련 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const jobId = resolvedParams.id;
        // 1. Fetch Job
        const jobRef = doc(db, 'JOB_POSTINGS', jobId);
        const jobSnap = await getDoc(jobRef);
        
        if (!jobSnap.exists()) {
          setLoading(false);
          return;
        }
        
        const jobData = jobSnap.data() as JobPosting;
        setJob(jobData);

        // 2. Fetch Company
        const compRef = doc(db, 'COMPANIES', jobData.company_id);
        const compSnap = await getDoc(compRef);
        if (compSnap.exists()) {
          setCompany(compSnap.data() as Company);
        }

        // 3. Fetch Save Status
        if (user) {
          const userJobId = `${user.uid}_${jobId}`;
          const userJobSnap = await getDoc(doc(db, 'USER_JOBS', userJobId));
          if (userJobSnap.exists()) {
            const status = userJobSnap.data().status;
            if (status === 'saved' || status === 'applied' || status === 'interviewing') {
              setIsSaved(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resolvedParams.id, user]);

  const toggleSaveJob = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!job) return;

    const userJobId = `${user.uid}_${job.job_id}`;
    const userJobRef = doc(db, 'USER_JOBS', userJobId);
    
    try {
      if (isSaved) {
        await deleteDoc(userJobRef);
        setIsSaved(false);
      } else {
        await setDoc(userJobRef, {
          user_job_id: userJobId,
          user_id: user.uid,
          job_id: job.job_id,
          status: 'saved',
          target_apply_date: ""
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling saved status", error);
      alert("오류가 발생했습니다.");
    }
  };

  const handleAIAnalysis = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setShowAnalysisModal(true);
      setAnalysisResult(null); // 기존 결과 초기화

      // 1. IndexedDB에서 이력서 파일 불러오기
      const savedResume = await get(`resume_${user.uid}`);
      
      if (!savedResume || !(savedResume instanceof File || savedResume instanceof Blob)) {
        alert("이력서가 없습니다. 프로필 페이지에서 PDF 이력서를 먼저 업로드해주세요.");
        setShowAnalysisModal(false);
        setIsAnalyzing(false);
        return;
      }

      // 2. Base64 변환
      const base64Pdf = await fileToBase64(savedResume);

      // 3. API Route 호출
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Pdf,
          jobData: {
            description: job?.description,
            requirements: job?.requirements,
            preferred_qualifications: job?.preferred_qualifications,
            required_tech_stack_ids: job?.required_tech_stack_ids
          }
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }

      // 4. 결과 저장
      setAnalysisResult(data);
    } catch (error: any) {
      console.error("Analysis Error:", error);
      alert(error.message || "오류가 발생했습니다. 나중에 다시 시도해주세요.");
      setShowAnalysisModal(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>불러오는 중입니다...</div>;
  }

  if (!job) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>존재하지 않거나 삭제된 채용공고입니다.</h2>
          <Link href="/jobs" className={styles.backButton}>목록으로 돌아가기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/jobs" className={styles.backButton}>
        <ArrowLeft size={20} /> 목록으로 돌아가기
      </Link>

      <div className={styles.headerCard}>
        <div className={styles.titleArea}>
          <div>
            <h1 className={styles.companyName}>{company?.name || job.company_id}</h1>
            <p className={styles.jobTitle}>{job.title}</p>
            <span className={styles.domainBadge}>{company?.domain || 'Unknown Domain'}</span>
            {job.fit_level && <span className={styles.fitBadge}>Fit {job.fit_level} · {job.verdict}</span>}
          </div>
          <div className={styles.actionArea}>
            <button 
              className={styles.likeButton} 
              onClick={toggleSaveJob}
              title={isSaved ? "관심 공고 해제" : "관심 공고 등록"}
            >
              <Heart 
                fill={isSaved ? "#ef4444" : "transparent"} 
                color={isSaved ? "#ef4444" : "#94a3b8"} 
                size={24} 
              />
            </button>
            <button 
              className={styles.analyzeButton} 
              onClick={handleAIAnalysis} 
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <Loader2 className={styles.spinIcon} size={20} /> : <Sparkles size={20} />}
              {isAnalyzing ? "분석 중..." : "AI 합격률 분석"}
            </button>
            <Link href={`/jobs/${job.job_id}/interview`} className={styles.interviewButton}>
              💬 모의 면접 시작
            </Link>
            <button className={styles.applyButton} onClick={() => {
              if (!user) alert("로그인이 필요합니다.");
              else alert("지원하기 기능은 현재 준비 중입니다.");
            }}>
              지원하기
            </button>
          </div>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <strong>경력 사항</strong>
            <span>
              {job.min_experience === 0 ? '신입' : `${job.min_experience}년`} 
              {' ~ '}
              {job.max_experience === 99 ? '무관' : `${job.max_experience}년`}
            </span>
          </div>
          <div className={styles.metaItem}>
            <strong>마감</strong>
            <span>{job.deadline_date ? job.deadline_date.replace('T', ' ').replace('+09:00', '') : '미기재'}</span>
          </div>
          <div className={styles.metaItem}>
            <strong>원문</strong>
            {job.source_url ? <a href={job.source_url} target="_blank" rel="noreferrer" className={styles.sourceLink}>공고 원문 열기 ↗</a> : <span>URL 미기재</span>}
          </div>
          <div className={styles.metaItem}>
            <strong>전형 절차</strong>
            <span>
              {job.has_coding_test && '코딩테스트 '}
              {job.has_assignment && (job.has_coding_test ? '+ 사전과제' : '사전과제')}
              {!job.has_coding_test && !job.has_assignment && '서류전형 ➔ 면접전형'}
            </span>
          </div>
          <div className={styles.metaItem}>
            <strong>필수 기술 스택</strong>
            <div className={styles.techStack}>
              {job.required_tech_stack_ids.length > 0 
                ? job.required_tech_stack_ids.map(tech => (
                    <span key={tech} className={styles.techBadge}>{tech}</span>
                  ))
                : <span>제한 없음</span>
              }
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentSection}>
        <div className={styles.descriptionSection}>
          <h3>상세 설명</h3>
          <div className={styles.description}>
            {job.description}
          </div>
        </div>

        {job.requirements && (
          <div className={styles.descriptionSection}>
            <h3>자격 요건</h3>
            <div className={styles.description}>
              {job.requirements}
            </div>
          </div>
        )}

        {job.preferred_qualifications && (
          <div className={styles.descriptionSection}>
            <h3>우대 사항</h3>
            <div className={styles.description}>
              {job.preferred_qualifications}
            </div>
          </div>
        )}

        {job.portfolio_version && (
          <div className={styles.portfolioSection}>
            <h3>포트폴리오 기준 매칭</h3>
            <p className={styles.portfolioVersion}>{job.portfolio_version} · 총 {job.portfolio_total_pages || 24}페이지</p>
            <div className={styles.portfolioGrid}>
              <div><strong>추천 페이지</strong><p>{job.portfolio_recommended_pages || '전체'}</p></div>
              <div><strong>강점</strong><p>{job.portfolio_strengths}</p></div>
              <div><strong>갭</strong><p>{job.portfolio_gaps}</p></div>
              <div><strong>개선할 부분</strong><p>{job.portfolio_improvements}</p></div>
            </div>
          </div>
        )}
      </div>

      {showAnalysisModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={() => setShowAnalysisModal(false)}>
              <X size={24} />
            </button>
            
            {isAnalyzing ? (
              <div className={styles.analyzingState}>
                <Loader2 className={styles.spinIconLarge} size={48} />
                <h3>AI가 이력서를 분석 중입니다...</h3>
                <p>채용 공고와 지원자의 경험을 비교하고 있습니다.</p>
              </div>
            ) : analysisResult ? (
              <div className={styles.resultState}>
                <h2>AI 직무 적합도 분석 결과</h2>
                <div className={styles.matchScore}>
                  <span>직무 매칭률</span>
                  <strong>{analysisResult.matchPercentage}%</strong>
                </div>
                
                <div className={styles.resultSection}>
                  <h3 className={styles.sectionTitle}>✨ 지원자의 핏(Fit) 강점</h3>
                  <ul>
                    {analysisResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className={styles.resultSection}>
                  <h3 className={styles.sectionTitle}>📈 보완하면 좋을 포인트</h3>
                  <ul>
                    {analysisResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>

                <div className={styles.resultSection}>
                  <h3 className={styles.sectionTitle}>🎯 예상 면접 질문</h3>
                  <ul>
                    {analysisResult.interviewQuestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
