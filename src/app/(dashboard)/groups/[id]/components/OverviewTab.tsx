import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Clock, Map, BookOpen, Quote } from 'lucide-react';
import { SmallGroup } from '@/types/small-group';

interface OverviewTabProps {
    group: SmallGroup;
}

export function OverviewTab({ group }: OverviewTabProps) {
    return (
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Objetivo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-800 font-medium leading-relaxed">
                        {group.objective || 'Sin objetivo definido'}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Horario
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{group.meetingDay || 'A confirmar'}</div>
                    <p className="text-slate-500">{group.meetingTime ? `${group.meetingTime} hs` : ''}</p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Map className="w-4 h-4" /> Ubicación
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-800 font-medium">
                        {group.address || 'Rotativa / A confirmar'}
                    </p>
                </CardContent>
            </Card>

            {group.currentTopic && (
                <Card className="md:col-span-3 bg-slate-900 text-white border-none shadow-md">
                    <CardContent className="flex items-center gap-6 p-8">
                        <div className="p-4 bg-white/10 rounded-full shrink-0">
                            <BookOpen className="w-8 h-8 text-indigo-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 mb-1">Tema Actual</h3>
                            <p className="text-2xl font-medium">"{group.currentTopic}"</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {group.description && (
                <Card className="md:col-span-3 bg-slate-50 border-slate-200">
                    <CardContent className="p-8 relative">
                        <Quote className="absolute top-6 left-6 w-8 h-8 text-slate-200 -z-0" />
                        <p className="text-slate-600 italic text-lg leading-loose pl-8 relative z-10">
                            {group.description}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
