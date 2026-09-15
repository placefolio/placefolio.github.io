'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { Heart } from 'lucide-react';

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
  deadline_date?: string | null;
  manual_status?: string;
  is_active?: boolean;
  snapshot_date?: string;
  fit_level?: string;
  verdict?: string;
  source_url?: string;
  portfolio_version?: string;
  portfolio_recommended_pages?: string;
  portfolio_improvements?: string;
}

const CURRENT_SNAPSHOT_DATE = '2026-09-15';

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechStacks, setSelectedTechStacks] = useState<Set<string>>(new Set());
  const [expLevel, setExpLevel] = useState<string>('all'); // 'all', 'newbie', '1-3', '3-5', '5+'
  const [hasCodingTest, setHasCodingTest] = useState(false);
  const [hasAssignment, setHasAssignment] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const jobsSnapshot = await getDocs(collection(db, 'JOB_POSTINGS'));
        const companiesSnapshot = await getDocs(collection(db, 'COMPANIES'));

        const jobsData = jobsSnapshot.docs
          .map(doc => doc.data() as JobPosting)
          .filter(job => job.snapshot_date === CURRENT_SNAPSHOT_DATE)
          .filter(job => job.is_active !== false);
        const companiesData = companiesSnapshot.docs.reduce((acc, doc) => {
          const data = doc.data() as Company;
          acc[data.company_id] = data;
          return acc;
        }, {} as Record<string, Company>);

        setJobs(jobsData);
        setCompanies(companiesData);

        // Fetch user's saved jobs
        if (user) {
          const userJobsRef = collection(db, 'USER_JOBS');
          const q = query(userJobsRef, where("user_id", "==", user.uid));
          const snapshot = await getDocs(q);
          const savedIds = new Set<string>();
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'saved') {
              savedIds.add(data.job_id);
            }
          });
          setSavedJobIds(savedIds);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const toggleSaveJob = async (jobId: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const userJobId = `${user.uid}_${jobId}`;
    const userJobRef = doc(db, 'USER_JOBS', userJobId);
    
    try {
      if (savedJobIds.has(jobId)) {
        // Unlike
        await deleteDoc(userJobRef);
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        // Like
        await setDoc(userJobRef, {
          user_job_id: userJobId,
          user_id: user.uid,
          job_id: jobId,
          status: 'saved',
          target_apply_date: ""
        });
        setSavedJobIds(prev => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error toggling saved status", error);
      alert("오류가 발생했습니다.");
    }
  };

  const toggleTechStack = (stack: string) => {
    setSelectedTechStacks(prev => {
      const next = new Set(prev);
      if (next.has(stack)) next.delete(stack);
      else next.add(stack);
      return next;
    });
  };

  // Derive unique tech stacks from jobs
  const allTechStacks = useMemo(() => {
    const stacks = new Set<string>();
    jobs.forEach(job => {
      job.required_tech_stack_ids.forEach(stack => stacks.add(stack));
    });
    return Array.from(stacks).sort();
  }, [jobs]);

  // Filter Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const company = companies[job.company_id];
      const companyName = company?.name || job.company_id;
      
      // 1. Search Query (matches company name or job description)
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        if (
          !companyName.toLowerCase().includes(queryLower) &&
          !job.title.toLowerCase().includes(queryLower) &&
          !job.description.toLowerCase().includes(queryLower) &&
          !(job.portfolio_improvements || '').toLowerCase().includes(queryLower)
        ) {
          return false;
        }
      }

      // 2. Tech Stack Filter
      if (selectedTechStacks.size > 0) {
        const hasAllSelectedStacks = Array.from(selectedTechStacks).every(stack => 
          job.required_tech_stack_ids.includes(stack)
        );
        if (!hasAllSelectedStacks) return false;
      }

      // 3. Experience Filter
      if (expLevel !== 'all') {
        if (expLevel === 'newbie' && job.min_experience > 0) return false;
        if (expLevel === '1-3' && (job.min_experience > 3 || job.max_experience < 1)) return false;
        if (expLevel === '3-5' && (job.min_experience > 5 || job.max_experience < 3)) return false;
        if (expLevel === '5+' && job.max_experience < 5) return false;
      }

      // 4. Process Filter
      if (hasCodingTest && !job.has_coding_test) return false;
      if (hasAssignment && !job.has_assignment) return false;

      return true;
    });
  }, [jobs, companies, searchQuery, selectedTechStacks, expLevel, hasCodingTest, hasAssignment]);

  if (loading) {
    return <div className={styles.container}><p style={{ textAlign: 'center' }}>채용 공고를 불러오는 중입니다...</p></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🚀 채용 공고 게시판</h1>
        <p>2026-09-15 기준 · Portfolio_v6.pdf 기준 분석 공고를 탐색하세요.</p>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>검색</h3>
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="기업명 또는 내용 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <h3>경력</h3>
            <label className={styles.filterLabel}>
              <input type="radio" name="exp" checked={expLevel === 'all'} onChange={() => setExpLevel('all')} /> 전체
            </label>
            <label className={styles.filterLabel}>
              <input type="radio" name="exp" checked={expLevel === 'newbie'} onChange={() => setExpLevel('newbie')} /> 신입
            </label>
            <label className={styles.filterLabel}>
              <input type="radio" name="exp" checked={expLevel === '1-3'} onChange={() => setExpLevel('1-3')} /> 1~3년
            </label>
            <label className={styles.filterLabel}>
              <input type="radio" name="exp" checked={expLevel === '3-5'} onChange={() => setExpLevel('3-5')} /> 3~5년
            </label>
            <label className={styles.filterLabel}>
              <input type="radio" name="exp" checked={expLevel === '5+'} onChange={() => setExpLevel('5+')} /> 5년 이상
            </label>
          </div>

          <div className={styles.filterGroup}>
            <h3>기술 스택</h3>
            <div className={styles.techStackGrid}>
              {allTechStacks.map(stack => (
                <label key={stack} className={styles.filterLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedTechStacks.has(stack)} 
                    onChange={() => toggleTechStack(stack)}
                  /> 
                  {stack}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h3>전형 절차</h3>
            <label className={styles.filterLabel}>
              <input type="checkbox" checked={hasCodingTest} onChange={(e) => setHasCodingTest(e.target.checked)} /> 코딩테스트 포함
            </label>
            <label className={styles.filterLabel}>
              <input type="checkbox" checked={hasAssignment} onChange={(e) => setHasAssignment(e.target.checked)} /> 사전과제 포함
            </label>
          </div>
        </aside>

        {/* Main Job Grid */}
        <main className={styles.mainContent}>
          {filteredJobs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>조건에 맞는 공고가 없습니다.</p>
            </div>
          ) : (
            <div className={styles.jobGrid}>
              {filteredJobs.map((job) => {
                const company = companies[job.company_id];
                const isSaved = savedJobIds.has(job.job_id);
                return (
                  <div 
                    key={job.job_id} 
                    className={styles.jobCard}
                    onClick={() => router.push(`/jobs/${job.job_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.cardHeader}>
                      <div>
                        <h2>{company?.name || job.company_id}</h2>
                        <p className={styles.jobTitle}>{job.title}</p>
                      </div>
                      <div className={styles.badgeGroup}>
                        <span className={styles.badge}>{company?.domain}</span>
                        {job.fit_level && <span className={styles.fitBadge}>Fit {job.fit_level}</span>}
                      </div>
                    </div>
                    
                    <div className={styles.cardBody}>
                      <p className={styles.description}>{job.description}</p>
                      
                      <div className={styles.details}>
                        <div className={styles.detailItem}>
                          <strong>경력</strong>
                          <span>
                            {job.min_experience === 0 ? '신입' : `${job.min_experience}년`} ~ 
                            {job.max_experience === 99 ? '무관' : `${job.max_experience}년`}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <strong>전형</strong>
                          <span>
                            {job.has_coding_test && '코딩테스트 '}
                            {job.has_assignment && '사전과제'}
                            {!job.has_coding_test && !job.has_assignment && '서류/면접'}
                          </span>
                        </div>
                        <div className={styles.detailItem}>
                          <strong>마감</strong>
                          <span>{job.deadline_date ? job.deadline_date.replace('T', ' ').replace('+09:00', '') : '미기재'}</span>
                        </div>
                      </div>

                      <p className={styles.verdict}>{job.verdict || '검토 필요'}</p>
                      {job.portfolio_recommended_pages && (
                        <p className={styles.portfolioNote}>V6 연결: {job.portfolio_recommended_pages}</p>
                      )}

                      <div className={styles.techStack}>
                        {job.required_tech_stack_ids.map(tech => (
                          <span key={tech} className={styles.techBadge}>{tech}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.cardFooter}>
                      <button 
                        className={styles.likeButton} 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.job_id);
                        }}
                        aria-label={isSaved ? "관심 공고 해제" : "관심 공고 등록"}
                      >
                        <Heart 
                          fill={isSaved ? "#ef4444" : "transparent"} 
                          color={isSaved ? "#ef4444" : "#94a3b8"} 
                          size={28} 
                          className={styles.heartIcon} 
                        />
                      </button>
                      <button className={styles.applyButton} onClick={(e) => {
                        e.stopPropagation();
                        if (!user) alert("로그인이 필요합니다.");
                        else alert("실제 지원하기 기능은 연동 대기 중입니다.");
                      }}>
                        지원하기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
