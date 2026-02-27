import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface ArchiveMemberAlertProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    onSuccess: () => void;
}

export function ArchiveMemberAlert({ isOpen, onClose, member, onSuccess }: ArchiveMemberAlertProps) {
    const [loading, setLoading] = useState(false);
    const isArchived = member?.membershipStatus === 'ARCHIVED';

    const handleAction = async () => {
        setLoading(true);
        try {
            const newStatus = isArchived ? 'MEMBER' : 'ARCHIVED';
            await api.patch(`/members/${member.id}`, { status: newStatus });
            toast.success(isArchived ? "Miembro restaurado correctamente" : "Miembro archivado correctamente");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(isArchived ? "Error al restaurar el miembro" : "Error al archivar el miembro");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{isArchived ? "¿Restaurar miembro?" : "¿Archivar miembro?"}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isArchived ? (
                            <>Esta acción restaurará a <strong>{member?.person?.fullName}</strong> como miembro activo.</>
                        ) : (
                            <>
                                Esta acción moverá a <strong>{member?.person?.fullName}</strong> a la lista de archivados.
                                <br />
                                Podrás restaurarlo en cualquier momento desde el filtro de "Archivados".
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAction}
                        disabled={loading}
                        className={isArchived ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}
                    >
                        {loading ? "Procesando..." : (isArchived ? "Restaurar" : "Archivar")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
