'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { DndContext, DragEndEvent, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { DraggableJobCard } from '@/components/DraggableJobCard';
import { DroppableCalendarDay } from '@/components/DroppableCalendarDay';
import { DroppableUnassignedList } from '@/components/DroppableUnassignedList';
import { DroppableKanbanColumn } from '@/components/DroppableKanbanColumn';
import styles from './page.module.css';

interface UserJob {
  user_job_id: string;
  user_id: string;
  job_id: string;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected' | 'accepted';
  target_apply_date: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userJobs, setUserJobs] = useState<UserJob[]>([]);
  const [jobsData, setJobsData] = useState<Record<string, any>>({});
  const [companiesData, setCompaniesData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('calendar');

  // Calendar logic
  const [currentDate, setCurrentDate] = useState(new Date());

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    async function fetchUserJobs() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const userJobsRef = collection(db, 'USER_JOBS');
        const q = query(userJobsRef, where("user_id", "==", user.uid));
        const snapshot = await getDocs(q);
        setUserJobs(snapshot.docs.map(doc => doc.data() as UserJob));

        // Fetch jobs and companies for rich card display
        const jobsSnap = await getDocs(collection(db, 'JOB_POSTINGS'));
        const jobsMap: Record<string, any> = {};
        jobsSnap.forEach(doc => { jobsMap[doc.id] = doc.data(); });
        setJobsData(jobsMap);

        const compSnap = await getDocs(collection(db, 'COMPANIES'));
        const compMap: Record<string, any> = {};
        compSnap.forEach(doc => { compMap[doc.id] = doc.data(); });
        setCompaniesData(compMap);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchUserJobs();
    }
  }, [user, authLoading]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const userJobId = active.id as string;
      const overId = over.id as string;

      if (overId.startsWith('kanban-')) {
        const newStatus = overId.replace('kanban-', '') as UserJob['status'];
        
        // Update local state
        setUserJobs(prevJobs => 
          prevJobs.map(job => 
            job.user_job_id === userJobId 
              ? { ...job, status: newStatus } 
              : job
          )
        );

        // Update DB
        try {
          const jobRef = doc(db, 'USER_JOBS', userJobId);
          await updateDoc(jobRef, { status: newStatus });
        } catch (error) {
          console.error("Failed to update status in DB:", error);
        }
      } else {
        let targetDateStr = "";

        if (overId !== 'unassigned') {
          targetDateStr = new Date(overId).toISOString();
        }
        
        setUserJobs(prevJobs => 
          prevJobs.map(job => 
            job.user_job_id === userJobId 
              ? { ...job, target_apply_date: targetDateStr } 
              : job
          )
        );

        try {
          const jobRef = doc(db, 'USER_JOBS', userJobId);
          await updateDoc(jobRef, { target_apply_date: targetDateStr });
        } catch (error) {
          console.error("Failed to update date in DB:", error);
          alert("일정 업데이트에 실패했습니다.");
        }
      }
    }
  };

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Find the first day to show (previous month overflow)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Find the last day to show (next month overflow)
    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [currentDate]);

  if (authLoading || loading) {
    return <div className={styles.container}><p style={{ textAlign: 'center' }}>로딩 중입니다...</p></div>;
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <h2>로그인이 필요합니다</h2>
          <p style={{ color: '#94a3b8', marginTop: '1rem' }}>대시보드를 확인하려면 우측 상단의 로그인 버튼을 클릭해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📊 내 지원 일정 및 현황</h1>
        <p>공고 카드를 드래그하여 일정을 계획하거나 지원 상태를 관리하세요.</p>
      </header>

      <div className={styles.tabContainer}>
        <div className={styles.tabSwitcher}>
          <button 
            className={`${styles.tabButton} ${viewMode === 'calendar' ? styles.active : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            일정 달력
          </button>
          <button 
            className={`${styles.tabButton} ${viewMode === 'kanban' ? styles.active : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            지원 현황 (칸반)
          </button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {viewMode === 'calendar' ? (
          <div className={styles.dashboardGrid}>
            
            <aside className={styles.sidebar}>
              <div className={styles.unassignedList}>
                <h3>📥 대기열 (관심 공고)</h3>
                <p className={styles.helperText}>공고를 달력으로 끌어다 놓으세요</p>
                
                <DroppableUnassignedList>
                  {userJobs
                  .filter(job => job.status === 'saved' && !job.target_apply_date)
                  .map(job => {
                    const jobDetails = jobsData[job.job_id];
                    const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                    return (
                      <DraggableJobCard 
                        key={job.user_job_id} 
                        id={job.user_job_id} 
                        jobId={job.job_id}
                        companyName={compDetails?.name}
                        jobDescription={jobDetails?.description}
                        domain={compDetails?.domain}
                        status={job.status}
                        targetApplyDate={job.target_apply_date}
                      />
                    );
                  })}
                  {userJobs.filter(job => job.status === 'saved' && !job.target_apply_date).length === 0 && (
                    <p className={styles.emptyText}>대기 중인 공고가 없습니다.</p>
                  )}
                </DroppableUnassignedList>
              </div>
            </aside>

            <section className={styles.calendarSection}>
              <div className={styles.calendarHeader}>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className={styles.navButton}
                >
                  ◀
                </button>
                <h2>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</h2>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className={styles.navButton}
                >
                  ▶
                </button>
              </div>

              <div className={styles.calendarGrid}>
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className={styles.dayHeader}>{day}</div>
                ))}
                
                {calendarDays.map((day, i) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  
                  // Find jobs assigned to this date
                  // Target apply date from DB might be full ISO string, we compare just YYYY-MM-DD
                  const jobsForDay = userJobs.filter(job => {
                    if (job.status !== 'saved') return false; // for now, only showing saved ones that have been scheduled
                    if (!job.target_apply_date) return false;
                    return job.target_apply_date.split('T')[0] === dateStr;
                  });

                  return (
                    <DroppableCalendarDay 
                      key={`${dateStr}-${i}`}
                      date={day} 
                      isCurrentMonth={isCurrentMonth}
                    >
                      {jobsForDay.map(job => {
                      const jobDetails = jobsData[job.job_id];
                      const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                      return (
                        <DraggableJobCard 
                          key={job.user_job_id} 
                          id={job.user_job_id} 
                          jobId={job.job_id}
                          companyName={compDetails?.name}
                          jobDescription={jobDetails?.description}
                          domain={compDetails?.domain}
                          status={job.status}
                          targetApplyDate={job.target_apply_date}
                        />
                      );
                    })}
                    </DroppableCalendarDay>
                  );
                })}
              </div>
            </section>

          </div>
        ) : (
          <div className={styles.kanbanBoard}>
            <DroppableKanbanColumn id="saved" title="📥 관심 공고">
              {userJobs.filter(j => j.status === 'saved').map(job => {
                const jobDetails = jobsData[job.job_id];
                const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                return <DraggableJobCard key={job.user_job_id} id={job.user_job_id} jobId={job.job_id} companyName={compDetails?.name} jobDescription={jobDetails?.description} domain={compDetails?.domain} status={job.status} targetApplyDate={job.target_apply_date} />;
              })}
            </DroppableKanbanColumn>
            <DroppableKanbanColumn id="applied" title="📝 서류 접수">
              {userJobs.filter(j => j.status === 'applied').map(job => {
                const jobDetails = jobsData[job.job_id];
                const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                return <DraggableJobCard key={job.user_job_id} id={job.user_job_id} jobId={job.job_id} companyName={compDetails?.name} jobDescription={jobDetails?.description} domain={compDetails?.domain} status={job.status} targetApplyDate={job.target_apply_date} />;
              })}
            </DroppableKanbanColumn>
            <DroppableKanbanColumn id="interviewing" title="🗣️ 면접 진행 중">
              {userJobs.filter(j => j.status === 'interviewing').map(job => {
                const jobDetails = jobsData[job.job_id];
                const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                return <DraggableJobCard key={job.user_job_id} id={job.user_job_id} jobId={job.job_id} companyName={compDetails?.name} jobDescription={jobDetails?.description} domain={compDetails?.domain} status={job.status} targetApplyDate={job.target_apply_date} />;
              })}
            </DroppableKanbanColumn>
            <DroppableKanbanColumn id="accepted" title="🎉 최종 합격">
              {userJobs.filter(j => j.status === 'accepted').map(job => {
                const jobDetails = jobsData[job.job_id];
                const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                return <DraggableJobCard key={job.user_job_id} id={job.user_job_id} jobId={job.job_id} companyName={compDetails?.name} jobDescription={jobDetails?.description} domain={compDetails?.domain} status={job.status} targetApplyDate={job.target_apply_date} />;
              })}
            </DroppableKanbanColumn>
            <DroppableKanbanColumn id="rejected" title="❌ 불합격">
              {userJobs.filter(j => j.status === 'rejected').map(job => {
                const jobDetails = jobsData[job.job_id];
                const compDetails = jobDetails ? companiesData[jobDetails.company_id] : null;
                return <DraggableJobCard key={job.user_job_id} id={job.user_job_id} jobId={job.job_id} companyName={compDetails?.name} jobDescription={jobDetails?.description} domain={compDetails?.domain} status={job.status} targetApplyDate={job.target_apply_date} />;
              })}
            </DroppableKanbanColumn>
          </div>
        )}
      </DndContext>
    </div>
  );
}
