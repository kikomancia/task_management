import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DndContext, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const columns = [
  { key: 'todo', title: 'To Do', icon: 'lucide:circle-plus' },
  { key: 'in-progress', title: 'In Progress', icon: 'lucide:circle-dot' },
  { key: 'done', title: 'Done', icon: 'lucide:check-circle' }
];

function TaskCard({ task, onDelete, isDeleting }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isDraggingInternal } = useSortable({ id: task._id.toString() });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDraggingInternal ? 0.6 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${isDraggingInternal ? 'task-card-dragging' : ''}`} {...attributes} {...listeners}>
      <div className="task-card-header">
        <strong>{task.title}</strong>
        <button
          aria-label="Delete task"
          type="button"
          disabled={isDeleting}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task._id);
          }}
        >
          <Icon icon="lucide:trash-2" width="18" height="18" />
        </button>
      </div>
      <p>{task.description || 'No description provided.'}</p>
      {(task.startDate || task.endDate) && (
        <div className="task-card-dates">
          {task.startDate && <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>}
          {task.endDate && <span>End: {new Date(task.endDate).toLocaleDateString()}</span>}
        </div>
      )}
      <div className="task-card-meta">Updated {new Date(task.updatedAt).toLocaleString()}</div>
    </div>
  );
}

function Column({ status, title, icon, tasks, onDelete, deletingTaskId }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className={`kanban-column ${isOver ? 'drop-over' : ''}`}>
      <div className="column-header">
        <div>
          <Icon icon={icon} width="18" height="18" />
          <span>{title}</span>
        </div>
        <small>{tasks.length} tasks</small>
      </div>
      <div ref={setNodeRef} className="column-body">
        {tasks.length === 0 ? <div className="empty-state">No tasks</div> : null}
        <SortableContext items={tasks.map((task) => task._id.toString())} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id.toString()} task={task} onDelete={onDelete} isDeleting={deletingTaskId === task._id} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6
      }
    })
  );

  useEffect(() => {
    fetch('/api/tasks')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(setTasks)
      .catch((err) => {
        setError(`Failed to load tasks: ${err.message}`);
        setTasks([]);
      });
  }, []);

  const grouped = useMemo(
    () =>
      columns.reduce((acc, column) => {
        acc[column.key] = tasks.filter((task) => task.status === column.key);
        return acc;
      }, {}),
    [tasks]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        status: 'todo',
        startDate: startDate || null,
        endDate: endDate || null
      })
    });

    if (!response.ok) {
      try {
        const payload = await response.json();
        setError(payload.message || `Error: ${response.status}`);
      } catch {
        setError(`Unable to add task (Status: ${response.status})`);
      }
      return;
    }

    try {
      const task = await response.json();
      setTasks((current) => [task, ...current]);
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
    } catch {
      setError('Failed to parse task response');
    }
  };

  const handleDelete = async (taskId) => {
    if (deletingTaskId) return;

    setDeletingTaskId(taskId);

    const result = await Swal.fire({
      title: 'Delete this task?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#D36135',
      cancelButtonColor: '#7FB069',
      reverseButtons: true,
      focusCancel: true
    });

    if (!result.isConfirmed) {
      setDeletingTaskId(null);
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (response.ok) {
        setTasks((current) => current.filter((task) => task._id !== taskId));
        await Swal.fire({
          title: 'Deleted',
          text: 'The task has been removed.',
          icon: 'success',
          confirmButtonColor: '#D36135',
          timer: 1400,
          showConfirmButton: false
        });
        return;
      }

      const payload = await response.json().catch(() => null);
      await Swal.fire({
        title: 'Unable to delete',
        text: payload?.message || `Delete failed with status ${response.status}.`,
        icon: 'error',
        confirmButtonColor: '#D36135'
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((task) => task._id.toString() === active.id);
    const nextColumn = columns.find((column) => column.key === over.id);

    if (!activeTask || !nextColumn || activeTask.status === nextColumn.key) return;

    const response = await fetch(`/api/tasks/${activeTask._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextColumn.key })
    });

    if (response.ok) {
      const updated = await response.json();
      setTasks((current) => current.map((task) => (task._id === updated._id ? updated : task)));
    }
  };

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <h1>Nexus Task Management</h1>
          <p>Kanban workflow for To Do, In Progress, and Done.</p>
        </div>
      </header>

      <section className="task-form-panel">
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-field">
            <label htmlFor="title">Task title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task title" />
          </div>
          <div className="form-field">
            <label htmlFor="description">Description</label>
            <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="form-field">
            <label htmlFor="startDate">Start Date</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="endDate">End Date</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button type="submit" className="primary-button">
            <Icon icon="lucide:plus" width="18" height="18" />
            Add Task
          </button>
        </form>
        {error && <div className="form-error">{error}</div>}
      </section>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <main className="kanban-board">
          {columns.map((column) => (
            <Column
              key={column.key}
              status={column.key}
              title={column.title}
              icon={column.icon}
              tasks={grouped[column.key] || []}
              onDelete={handleDelete}
              deletingTaskId={deletingTaskId}
            />
          ))}
        </main>
      </DndContext>
    </div>
  );
}
