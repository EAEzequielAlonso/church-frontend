import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Pencil, Trash2, Clock, Calendar, Users, FileText, User, BookOpen, Star, Briefcase, HeartHandshake, Church, GraduationCap, UserPlus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CalendarEventType, EVENT_TYPE_COLORS, EVENT_TYPE_ICONS } from '@/types/agenda';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface UniversalMeetingCardProps {
    id: string;
    date: Date | string;
    title: string;
    timeLabel?: string;
    location?: string;
    description?: string;
    isPast?: boolean;
    attendeeCount?: number;
    extraBadge?: React.ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    actions?: React.ReactNode; 
    customClassName?: string;
    type?: CalendarEventType;
}

export function UniversalMeetingCard({
    id,
    date,
    title,
    timeLabel,
    location,
    description,
    isPast = false,
    attendeeCount,
    extraBadge,
    onEdit,
    onDelete,
    actions,
    customClassName = '',
    type
}: UniversalMeetingCardProps) {
    const meetDate = new Date(date);
    
    return (
        <div className={`group flex flex-col md:flex-row md:items-start gap-4 p-4 rounded-2xl transition-all border ${
            isPast 
                ? 'bg-slate-50/50 border-slate-100 opacity-90 hover:opacity-100' 
                : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md'
            } ${customClassName}`}
        >
            <div className={`flex-shrink-0 w-14 text-center rounded-xl py-2 border relative group/icon ${
                isPast 
                    ? 'bg-white text-slate-400 border-slate-100' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 shadow-inner'
            }`}
            style={!isPast && type ? { backgroundColor: `${EVENT_TYPE_COLORS[type]}15`, borderColor: `${EVENT_TYPE_COLORS[type]}30`, color: EVENT_TYPE_COLORS[type] } : {}}>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 group-hover/icon:scale-110 transition-transform">
                    {(() => {
                        const iconName = type ? EVENT_TYPE_ICONS[type] : 'Calendar';
                        const Icon = (LucideIcons as any)[iconName] || Calendar;
                        return <Icon className="w-3.5 h-3.5" style={type ? { color: EVENT_TYPE_COLORS[type] } : {}} />;
                    })()}
                </div>
                <p className="text-[10px] font-bold uppercase">{format(meetDate, 'MMM', { locale: es })}</p>
                <p className="text-xl font-black leading-none mt-1">{format(meetDate, 'd')}</p>
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`font-bold truncate ${isPast ? 'text-slate-700' : 'text-slate-900'}`}>{title}</h4>
                    {extraBadge}
                    {attendeeCount !== undefined && attendeeCount > 0 && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none hover:bg-slate-200 text-xs gap-1 py-0 h-5">
                            <Users className="w-3 h-3" />
                            {attendeeCount}
                        </Badge>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
                    {timeLabel && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            {timeLabel}
                        </span>
                    )}
                    {location && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 opacity-70" />
                            <span className="truncate">{location}</span>
                        </span>
                    )}
                </div>
                
                {description && (
                    <p className={`text-sm mt-2 line-clamp-2 ${isPast ? 'text-slate-400' : 'text-slate-500'}`}>
                        {description}
                    </p>
                )}
                
                {actions && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 mt-2 border-t border-slate-100/80">
                        {actions}
                    </div>
                )}
            </div>
            
            {(onEdit || onDelete) && (
                <div className="flex items-center gap-1 self-end md:self-start opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={onEdit}>
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={onDelete}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
