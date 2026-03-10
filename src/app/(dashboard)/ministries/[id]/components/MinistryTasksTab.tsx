import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckSquare, CheckCircle2, Calendar as CalendarIcon, Users, EyeOff, Eye, Trash2, ClipboardList, Pencil, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ministry, MinistryTask } from '@/types/ministry';

interface MinistryTasksTabProps {
    ministry: Ministry;
    tasks: MinistryTask[];
    tasksPage: number;
    tasksTotal: number;
    isTasksLoading: boolean;
    activeTaskTab: 'pending' | 'finished';
    setActiveTaskTab: (tab: 'pending' | 'finished') => void;
    fetchTasks: (page: number, status: 'pending' | 'finished') => void;
    isLeaderOrCoordinator: boolean;
    canManageTask: (task: MinistryTask) => boolean;
    setIsCreateTaskOpen: (open: boolean) => void;
    handleToggleTask: (task: MinistryTask) => void;
    handleDeleteTask: (taskId: string) => void;
    handleEditTask: (task: MinistryTask) => void;
}

export function MinistryTasksTab({
    ministry,
    tasks,
    tasksPage,
    tasksTotal,
    isTasksLoading,
    activeTaskTab,
    setActiveTaskTab,
    fetchTasks,
    isLeaderOrCoordinator,
    canManageTask,
    setIsCreateTaskOpen,
    handleToggleTask,
    handleDeleteTask,
    handleEditTask
}: MinistryTasksTabProps) {
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
    const [taskToDelete, setTaskToDelete] = useState<MinistryTask | null>(null);

    const toggleExpandTask = (taskId: string) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    return (
        <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Tareas</h3>
                    <p className="text-sm text-slate-500 font-medium">Gestiona las responsabilidades del equipo.</p>
                </div>
                {isLeaderOrCoordinator && (
                    <Button className="font-bold gap-2 shadow-lg shadow-primary/20" onClick={() => setIsCreateTaskOpen(true)}>
                        <CheckCircle2 className="w-5 h-5" />
                        Nueva Misión
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl w-fit mb-6 ring-1 ring-slate-200/50">
                <button
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTaskTab === 'pending' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => { setActiveTaskTab('pending'); fetchTasks(1, 'pending'); }}
                >
                    Pendientes
                </button>
                <button
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTaskTab === 'finished' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => { setActiveTaskTab('finished'); fetchTasks(1, 'finished'); }}
                >
                    Finalizadas
                </button>
            </div>

            {isTasksLoading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-sm font-bold text-slate-400">Cargando tareas...</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.map((task) => {
                        const hasPermission = canManageTask(task);

                        return (
                            <div key={task.id} className="flex items-start justify-between p-3 md:p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors group">
                                <div className="flex items-start gap-4 w-full min-w-0">
                                    <div
                                        className={`w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center ${hasPermission ? 'cursor-pointer transition-colors' : 'cursor-not-allowed opacity-50'} ${task.status === 'pending' ? 'bg-slate-100 border-slate-300 hover:border-indigo-500' :
                                            task.status === 'in_progress' ? 'bg-indigo-50 border-indigo-500 hover:bg-indigo-100' :
                                                'bg-slate-100 border-slate-300'
                                            }`}
                                        onClick={() => hasPermission && handleToggleTask(task)}
                                        title={!hasPermission ? "No tienes permisos para alterar esta tarea" : ""}
                                    >
                                        {task.status === 'in_progress' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                                        {task.status === 'completed' && <CheckSquare className="w-3 h-3 text-green-600" />}
                                        {task.status === 'incomplete' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                                        {task.status === 'cancelled' && <span className="w-3 h-0.5 rounded-full bg-red-400"></span>}
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between w-full gap-3 md:gap-4 min-w-0">
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold text-sm ${task.status !== 'pending' && task.status !== 'in_progress' ? 'text-slate-400 line-through decoration-slate-300/50' : 'text-slate-900'}`}>
                                                    {task.title}
                                                </p>
                                                {task.status === 'in_progress' && (
                                                    <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50 shadow-sm shadow-indigo-100/50">EN CURSO</Badge>
                                                )}
                                                {task.status === 'completed' && (
                                                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 shadow-sm shadow-green-100/50">COMPLETADA</Badge>
                                                )}
                                                {task.status === 'incomplete' && (
                                                    <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200 bg-orange-50 shadow-sm shadow-orange-100/50">A MEDIAS</Badge>
                                                )}
                                                {task.status === 'cancelled' && (
                                                    <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50 shadow-sm shadow-red-100/50">CANCELADA</Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 ml-1 rounded-md"
                                                    onClick={() => toggleExpandTask(task.id)}
                                                    title={expandedTasks[task.id] ? "Ocultar detalles" : "Ver detalles"}
                                                >
                                                    {expandedTasks[task.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </Button>
                                            </div>

                                            {task.description && (
                                                <p className={`text-sm text-slate-500 leading-relaxed max-w-full ${!expandedTasks[task.id] ? 'truncate' : 'whitespace-pre-wrap wrap-anywhere'}`}>
                                                    {task.description}
                                                </p>
                                            )}

                                            {task.observation && (
                                                <div className={`bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 text-xs text-slate-600 mt-2 max-w-xl flex gap-1.5 ${expandedTasks[task.id] ? 'flex-col items-start' : 'items-center'}`}>
                                                    <span className="font-bold uppercase text-[9px] text-slate-400 mt-0.5 whitespace-nowrap">Nota:</span>
                                                    <span className={!expandedTasks[task.id] ? 'truncate' : 'whitespace-pre-wrap break-words'}>{task.observation}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 md:gap-1.5 pt-1 md:pt-0 flex-shrink-0">
                                            {task.dueDate && (
                                                <span className={`text-xs font-medium flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500' : 'text-slate-400'}`}>
                                                    <CalendarIcon className="w-3.5 h-3.5" />
                                                    {format(new Date(task.dueDate), 'd MMM yyyy', { locale: es })}
                                                </span>
                                            )}

                                            {task.assignedTo ? (
                                                <div className="flex items-center gap-2 bg-indigo-50/50 pl-1 pr-2 py-0.5 rounded-full border border-indigo-100/50">
                                                    <div className="w-5 h-5 rounded-full bg-white border border-indigo-100 flex items-center justify-center overflow-hidden">
                                                        {task.assignedTo.person.avatarUrl ? (
                                                            <img src={task.assignedTo.person.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : <Users className="w-3 h-3 text-indigo-400" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-indigo-700">
                                                        {task.assignedTo.person.firstName} {task.assignedTo.person.lastName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs text-slate-400 italic">
                                                    <Users className="w-3.5 h-3.5" />
                                                    Sin asignar
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isLeaderOrCoordinator && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 ml-2 flex-shrink-0 transition-opacity"
                                                title="Opciones de la tarea"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-100">
                                            <DropdownMenuItem
                                                onClick={() => handleEditTask(task)}
                                                className="gap-2 cursor-pointer font-medium text-slate-700 group focus:bg-indigo-50"
                                            >
                                                <Pencil className="w-4 h-4 text-slate-400 group-focus:text-indigo-600" />
                                                <span className="group-focus:text-indigo-600">Editar Misión</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setTaskToDelete(task)}
                                                className="gap-2 cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" /> Eliminar Tarea
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>)
                    })}

                    {(!tasks || tasks.length === 0) && (
                        <div className="py-20 text-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200/50">
                            <ClipboardList className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                            <p className="text-sm font-bold text-slate-400">{activeTaskTab === 'pending' ? 'Todo al día' : 'No hay historial'}</p>
                            <p className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">
                                {activeTaskTab === 'pending' ? 'No hay misiones pendientes' : 'Aún no has finalizado misiones'}
                            </p>
                        </div>
                    )}

                    {tasksTotal > 10 && (
                        <div className="flex items-center justify-between pt-4 pb-2 border-t border-slate-100">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={tasksPage === 1 || isTasksLoading}
                                onClick={() => fetchTasks(tasksPage - 1, activeTaskTab)}
                            >
                                Anterior
                            </Button>
                            <span className="text-xs font-medium text-slate-500">
                                Página {tasksPage} de {Math.ceil(tasksTotal / 10)}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={tasksPage >= Math.ceil(tasksTotal / 10) || isTasksLoading}
                                onClick={() => fetchTasks(tasksPage + 1, activeTaskTab)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
                <AlertDialogContent className="rounded-3xl p-6">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black text-slate-900 tracking-tight">Eliminar Misión</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar la misión <span className="font-bold text-slate-700">"{taskToDelete?.title}"</span>? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="font-bold rounded-xl border-slate-200">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => {
                                if (taskToDelete) handleDeleteTask(taskToDelete.id);
                            }}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
