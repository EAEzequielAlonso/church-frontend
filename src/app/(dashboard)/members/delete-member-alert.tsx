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

interface DeleteMemberAlertProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    onSuccess: () => void;
}

export function DeleteMemberAlert({ isOpen, onClose, member, onSuccess }: DeleteMemberAlertProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await api.delete(`/members/${member.id}`);
            toast.success("Miembro eliminado correctamente");
            onSuccess();
            onClose();
        } catch (error: any) {
            // Only log unexpected errors
            if (error.response?.status !== 409) {
                console.error(error);
            }

            const message = error.response?.data?.message || "Error al eliminar el miembro";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará a <strong>{member?.person?.fullName}</strong> del registro de miembros.
                        Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
                        {loading ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
