'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableUnassignedListProps {
  children?: React.ReactNode;
}

export function DroppableUnassignedList({ children }: DroppableUnassignedListProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned'
  });

  return (
    <div 
      ref={setNodeRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: '200px',
        padding: '0.5rem',
        borderRadius: '8px',
        background: isOver ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
        border: isOver ? '2px dashed #38bdf8' : '2px dashed transparent',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </div>
  );
}
