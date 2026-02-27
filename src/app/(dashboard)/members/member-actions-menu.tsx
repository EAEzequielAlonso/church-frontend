import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, UserCog, Trash2 } from "lucide-react";
import { useState } from "react";
import { MemberDetailsDialog } from "./member-details-dialog";
import { UpdateMemberDialog } from "./update-member-dialog";
import { DeleteMemberAlert } from "./delete-member-alert";
import { ArchiveMemberAlert } from "./archive-member-alert";
import api from "@/lib/api";
import { toast } from "sonner";

interface MemberActionsMenuProps {
    member: any;
    onRefresh: () => void;
}

export function MemberActionsMenu({ member, onRefresh }: MemberActionsMenuProps) {
    const [updateOpen, setUpdateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [memberDetails, setMemberDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleViewDetails = async () => {
        setDetailsOpen(true);
        setLoadingDetails(true);
        try {
            const res = await api.get(`/members/${member.id}/details`);
            setMemberDetails(res.data);
        } catch (error) {
            console.error(error);
            toast.error("No se pudo cargar la información");
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleViewDetails}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
                        <UserCog className="w-4 h-4 mr-2" />
                        Editar Roles/Estado
                    </DropdownMenuItem>

                    {member.membershipStatus !== 'ARCHIVED' ? (
                        <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                            <Trash2 className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="text-orange-500">Archivar</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
                            <UserCog className="w-4 h-4 mr-2 text-green-600" />
                            <span className="text-green-600">Restaurar</span>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Miembro
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <MemberDetailsDialog
                isOpen={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                member={memberDetails || member}
                loading={loadingDetails}
                onEdit={() => {
                    setDetailsOpen(false);
                    setUpdateOpen(true);
                }}
            />

            <UpdateMemberDialog
                isOpen={updateOpen}
                onClose={() => setUpdateOpen(false)}
                member={member}
                onSuccess={onRefresh}
            />

            <ArchiveMemberAlert
                isOpen={archiveOpen}
                onClose={() => setArchiveOpen(false)}
                member={member}
                onSuccess={onRefresh}
            />

            <DeleteMemberAlert
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                member={member}
                onSuccess={onRefresh}
            />
        </>
    );
}
