'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';

interface DraggableJobCardProps {
  id: string; // The user_job_id
  jobId: string; // The original job_id
  companyName?: string;
  jobDescription?: string;
  domain?: string;
  status?: string;
  targetApplyDate?: string | null;
}

export function DraggableJobCard({ id, jobId, companyName, jobDescription, domain, status, targetApplyDate }: DraggableJobCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { jobId }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onClick={() => {
        if (!isDragging) {
          router.push(`/jobs/${jobId}`);
        }
      }}
    >
      <div style={{
        background: 'rgba(30, 41, 59, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.8rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        cursor: isDragging ? 'grabbing' : 'pointer',
        color: '#f8fafc',
        boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        transition: 'all 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            fontWeight: 700, 
            color: '#f8fafc',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {companyName || jobId}
          </h4>
        </div>

        {jobDescription && (
          <p style={{
            margin: '0.2rem 0',
            fontSize: '0.75rem',
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {jobDescription}
          </p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
          {domain ? (
            <span style={{ 
              fontSize: '0.65rem', 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: '#38bdf8', 
              padding: '2px 6px', 
              borderRadius: '4px',
              whiteSpace: 'nowrap'
            }}>
              {domain}
            </span>
          ) : <span />}
          
          {targetApplyDate && (
            <span style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              whiteSpace: 'nowrap'
            }}>
              📅 {targetApplyDate.split('T')[0]}
            </span>
          )}
          
          {status && (
            <strong style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: status === 'saved' ? 'rgba(148, 163, 184, 0.15)' : 
                          status === 'applied' ? 'rgba(56, 189, 248, 0.15)' : 
                          status === 'accepted' ? 'rgba(16, 185, 129, 0.15)' : 
                          status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: status === 'saved' ? '#94a3b8' : 
                     status === 'applied' ? '#38bdf8' : 
                     status === 'accepted' ? '#10b981' : 
                     status === 'rejected' ? '#ef4444' : '#f59e0b',
              whiteSpace: 'nowrap'
            }}>
              {status === 'saved' ? '관심' : 
               status === 'applied' ? '접수' : 
               status === 'interviewing' ? '면접중' : 
               status === 'accepted' ? '합격' : '불합격'}
            </strong>
          )}
        </div>
      </div>
    </div>
  );
}
