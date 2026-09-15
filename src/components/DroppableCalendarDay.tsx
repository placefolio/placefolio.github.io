'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableCalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  children?: React.ReactNode;
}

export function DroppableCalendarDay({ date, isCurrentMonth, children }: DroppableCalendarDayProps) {
  // Format date to YYYY-MM-DD for the ID
  const dateStr = date.toISOString().split('T')[0];
  
  const { isOver, setNodeRef } = useDroppable({
    id: dateStr,
    data: {
      date: dateStr
    }
  });

  const isToday = new Date().toISOString().split('T')[0] === dateStr;

  return (
    <div 
      ref={setNodeRef}
      style={{
        height: '180px',
        background: isOver ? 'rgba(56, 189, 248, 0.2)' : (isCurrentMonth ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.3)'),
        border: isOver ? '2px dashed #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        opacity: isCurrentMonth ? 1 : 0.4,
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      <div style={{
        fontSize: '0.8rem',
        fontWeight: isToday ? 800 : 500,
        color: isToday ? '#38bdf8' : '#94a3b8',
        marginBottom: '0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{date.getDate()}</span>
        {isToday && <span style={{ fontSize: '0.6rem', background: '#38bdf8', color: '#0f172a', padding: '2px 6px', borderRadius: '10px' }}>오늘</span>}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
