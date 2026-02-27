'use client';

import PageContainer from '@/components/ui/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, CalendarHeart, LayoutGrid } from 'lucide-react';
import { GroupList } from '@/features/groups/components/GroupList';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function CommunityPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentTab = searchParams.get('tab') || 'ALL';

    const handleTabChange = (val: string) => {
        router.push(`/community?tab=${val}`);
    };

    return (
        <PageContainer
            title="Centro de Comunidad"
            description="Explora y administra todos los grupos, cursos y actividades."
        >
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full lg:w-[600px] grid-cols-4 mb-6 bg-white border border-slate-200 shadow-sm h-12">
                    <TabsTrigger value="ALL" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 hidden sm:block" />
                        Todo
                    </TabsTrigger>
                    <TabsTrigger value="SMALL_GROUP" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 flex items-center gap-2">
                        <Users className="w-4 h-4 hidden sm:block" />
                        Grupos
                    </TabsTrigger>
                    <TabsTrigger value="COURSE" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 hidden sm:block" />
                        Cursos
                    </TabsTrigger>
                    <TabsTrigger value="ACTIVITY" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 flex items-center gap-2">
                        <CalendarHeart className="w-4 h-4 hidden sm:block" />
                        Actividades
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ALL" className="mt-0 outline-none">
                    <GroupList type="ALL" />
                </TabsContent>

                <TabsContent value="SMALL_GROUP" className="mt-0 outline-none">
                    <GroupList type="SMALL_GROUP" />
                </TabsContent>

                <TabsContent value="COURSE" className="mt-0 outline-none">
                    <GroupList type="COURSE" />
                </TabsContent>

                <TabsContent value="ACTIVITY" className="mt-0 outline-none">
                    <GroupList type="ACTIVITY" />
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<div className="p-8">Cargando comunidad...</div>}>
            <CommunityPageContent />
        </Suspense>
    );
}
