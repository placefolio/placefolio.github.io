'use client';

import { useEffect, useState, useRef, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { get } from 'idb-keyval';
import styles from './page.module.css';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [jobData, setJobData] = useState<any>(null);
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    async function init() {
      if (!user) {
        alert("로그인이 필요합니다.");
        router.push('/');
        return;
      }

      try {
        // 1. 공고 정보 로드
        const jobRef = doc(db, 'JOB_POSTINGS', resolvedParams.id);
        const jobSnap = await getDoc(jobRef);
        if (!jobSnap.exists()) {
          setError("채용 공고를 찾을 수 없습니다.");
          return;
        }
        const job = jobSnap.data();
        
        // 회사 정보 로드
        const compRef = doc(db, 'COMPANIES', job.company_id);
        const compSnap = await getDoc(compRef);
        if (compSnap.exists()) {
          job.companyName = compSnap.data().name;
        }
        setJobData(job);

        // 2. 이력서 로드
        const savedResume = await get(`resume_${user.uid}`);
        if (!savedResume || !(savedResume instanceof File || savedResume instanceof Blob)) {
          alert("이력서가 없습니다. 프로필 페이지에서 PDF 이력서를 먼저 업로드해주세요.");
          router.push(`/jobs/${resolvedParams.id}`);
          return;
        }
        const b64 = await fileToBase64(savedResume);
        setBase64Pdf(b64);

        // 3. 첫 번째 인사말 생성 요청
        await triggerFirstQuestion(b64, job);
      } catch (err) {
        console.error("Init error:", err);
        setError("초기화 중 오류가 발생했습니다.");
      }
    }
    
    init();
  }, [resolvedParams.id, user, router]);

  const triggerFirstQuestion = async (pdfBase64: string, jobInfo: any) => {
    setIsTyping(true);
    try {
      // 빈 메시지 배열을 보내면 API 단에서 시스템 프롬프트만 가지고 첫 인사를 건넵니다.
      // 하지만 프롬프트 조건 상 role:'user'가 있어야 하므로 빈 메시지를 생성합니다.
      const initialMessages = [{ role: 'user', content: '면접을 시작하겠습니다.' }];
      
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: initialMessages,
          base64Pdf: pdfBase64,
          jobData: jobInfo
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([{ role: 'assistant', content: data.content }]);
    } catch (err: any) {
      console.error(err);
      setError("AI 면접관을 불러오는데 실패했습니다.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping || !base64Pdf || !jobData) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: '면접을 시작하겠습니다.' }, // 초기 컨텍스트 유지를 위해 필요
            ...newMessages
          ],
          base64Pdf,
          jobData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages([...newMessages, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      console.error(err);
      alert("오류가 발생했습니다: " + err.message);
    } finally {
      setIsTyping(false);
    }
  };

  if (error) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>{error}</h2>
        <Link href={`/jobs/${resolvedParams.id}`} className={styles.backButton}>돌아가기</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={`/jobs/${resolvedParams.id}`} className={styles.backButton}>
          <ArrowLeft size={24} />
        </Link>
        <div className={styles.titleArea}>
          <h1>모의 면접실</h1>
          <p>{jobData ? `${jobData.companyName || '회사'} - 실무진 면접` : '준비 중...'}</p>
        </div>
      </div>

      <div className={styles.chatArea}>
        <div className={styles.messageList}>
          {messages.length === 0 && !isTyping && (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: 'auto', marginBottom: 'auto' }}>
              잠시만 기다려주세요...
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.messageWrapper} ${styles[msg.role]}`}>
              <div className={styles.message}>
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.assistant}`}>
              <div className={styles.loadingBubble}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <form onSubmit={handleSendMessage} className={styles.inputForm}>
            <textarea
              className={styles.inputField}
              placeholder="답변을 입력해주세요..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              disabled={isTyping || !jobData}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={isTyping || !inputValue.trim() || !jobData}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
