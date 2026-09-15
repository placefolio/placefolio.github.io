import { useDroppable } from '@dnd-kit/core';

interface DroppableKanbanColumnProps {
  id: string; // The status (e.g. "saved", "applied", "interviewing", etc)
  title: string;
  children: React.ReactNode;
}

export function DroppableKanbanColumn({ id, title, children }: DroppableKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `kanban-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? 'rgba(56, 189, 248, 0.1)' : 'rgba(30, 41, 59, 0.5)',
        border: isOver ? '2px dashed #38bdf8' : '2px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1rem',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.2s ease',
      }}
    >
      <h3 style={{
        fontSize: '1.1rem',
        color: '#f8fafc',
        margin: '0 0 1rem 0',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
