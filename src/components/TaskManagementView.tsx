import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, AlertTriangle, User, CheckCircle2, Filter, Kanban, List } from 'lucide-react';
import { CaseTask } from '../types';

interface TaskManagementViewProps {
  tasks: CaseTask[];
  onAddTask: (task: CaseTask) => void;
  onUpdateTaskStatus: (taskId: string, status: CaseTask['status']) => void;
}

export const TaskManagementView: React.FC<TaskManagementViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTaskStatus
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newOfficer, setNewOfficer] = useState('Cmdr. V. R. Sharma');
  const [newPriority, setNewPriority] = useState<CaseTask['priority']>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('2026-08-30');

  const filteredTasks = tasks.filter(t => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const blockedCount = tasks.filter(t => t.status === 'BLOCKED').length;
  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const completionPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask: CaseTask = {
      id: `tsk-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      assignedOfficer: newOfficer,
      priority: newPriority,
      dueDate: newDueDate,
      status: 'TODO',
      createdDate: new Date().toISOString().split('T')[0]
    };
    onAddTask(newTask);
    setNewTitle('');
    setNewDesc('');
    setIsNewTaskOpen(false);
  };

  const getPriorityBadge = (p: CaseTask['priority']) => {
    switch (p) {
      case 'URGENT': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (s: CaseTask['status']) => {
    switch (s) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'BLOCKED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'TODO': return 'bg-[#1A1A1F] text-slate-400 border-white/5';
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header & Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <CheckSquare className="w-6 h-6 text-cyan-400" />
              <span>Case Tasks & Operations</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Manage investigative deliverables, task assignments, priorities, and workflow progress.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-[#0F0F12] border border-white/10 rounded p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-xs font-mono flex items-center space-x-1.5 ${
                  viewMode === 'list' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded text-xs font-mono flex items-center space-x-1.5 ${
                  viewMode === 'kanban' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
            </div>
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded text-xs flex items-center space-x-2 transition-all font-mono"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>NEW TASK</span>
            </button>
          </div>
        </div>

        {/* Progress Overview Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Total Tasks</div>
            <div className="text-xl font-bold text-white font-mono mt-1">{tasks.length}</div>
          </div>
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Completed</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">{completedCount}</div>
          </div>
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase">In Progress</div>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{inProgressCount}</div>
          </div>
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Blocked</div>
            <div className="text-xl font-bold text-red-400 font-mono mt-1">{blockedCount}</div>
          </div>
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 col-span-2 md:col-span-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
              <span>COMPLETION</span>
              <span className="text-cyan-400 font-bold">{completionPercent}%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase text-slate-400">Filter By:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-[#1A1A1F] border border-white/5 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1A1A1F] border border-white/5 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>

        {/* Main View: List or Kanban */}
        {viewMode === 'list' ? (
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0A0A0B] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Status</th>
                  <th className="p-4">Task Title & Description</th>
                  <th className="p-4">Assigned Officer</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold border focus:outline-none ${getStatusBadge(task.status)}`}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="BLOCKED">BLOCKED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{task.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{task.description}</div>
                      {task.evidenceRef && (
                        <div className="text-[10px] text-cyan-400 mt-1">Ref: {task.evidenceRef}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 flex items-center space-x-1.5 pt-5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{task.assignedOfficer}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{task.dueDate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED')}
                        className={`p-1.5 rounded border transition-all ${
                          task.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-[#1A1A1F] text-slate-400 hover:text-white border-white/5'
                        }`}
                        title="Toggle Completion"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'] as const).map(colStatus => {
              const colTasks = filteredTasks.filter(t => t.status === colStatus);
              return (
                <div key={colStatus} className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
                      {colStatus.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colTasks.map(task => (
                      <div key={task.id} className="bg-[#1A1A1F] border border-white/5 rounded-lg p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{task.dueDate}</span>
                        </div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <p className="text-[11px] text-slate-400 font-sans line-clamp-2">{task.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                          <span>{task.assignedOfficer}</span>
                          <select
                            value={task.status}
                            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                            className="bg-[#0F0F12] border border-white/10 rounded text-[10px] text-cyan-400 px-1 py-0.5"
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">PROG</option>
                            <option value="BLOCKED">BLOCK</option>
                            <option value="COMPLETED">DONE</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-xs font-mono text-slate-600">No tasks in this column</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Task Modal */}
        {isNewTaskOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl relative font-mono">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="text-sm font-bold text-white">Create New Investigation Task</h3>
                <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 mb-1 block">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Audit bank statement..."
                    className="w-full bg-[#1A1A1F] border border-white/10 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Description</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Task details and evidence references..."
                    className="w-full bg-[#1A1A1F] border border-white/10 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 mb-1 block">Assigned Officer</label>
                    <select
                      value={newOfficer}
                      onChange={(e) => setNewOfficer(e.target.value)}
                      className="w-full bg-[#1A1A1F] border border-white/10 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Cmdr. V. R. Sharma">Cmdr. V. R. Sharma</option>
                      <option value="Priya Nair">Priya Nair</option>
                      <option value="R. K. Deshmukh">R. K. Deshmukh</option>
                      <option value="Vikram Joshi">Vikram Joshi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 mb-1 block">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-[#1A1A1F] border border-white/10 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-white/10 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsNewTaskOpen(false)}
                    className="px-4 py-2 rounded bg-[#1A1A1F] hover:bg-white/5 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
