import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Camera, ClipboardList, Pencil, Play, Plus, Trash2, X } from 'lucide-react';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';
import { deleteRecordApi, updateRecordApi } from '../../api/record/recordApi';
import { getSubRegistroIncidenceImageApi } from '../../api/operador/registroIncidenceApi';
import { getToken } from '../../api/config';
import UpdateFormRecord from '../Record/UpdateFormRecord';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const fileType = (name = '') => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    return null;
};

/* Las cámaras suelen venir solo con su número ("85") */
export const cameraLabel = (camera) => {
    const name = camera?.name?.trim();
    if (!name) return 'Sin cámara asociada';
    return /^c[aá]m/i.test(name) ? name : `Cámara ${name}`;
};

/* Visor a pantalla completa */
const Lightbox = ({ url, type, name, onClose }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-6" onClick={onClose}>
            <button
                onClick={onClose}
                title="Cerrar"
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
                <X className="h-5 w-5" />
            </button>
            <div onClick={(e) => e.stopPropagation()} className="max-w-5xl max-h-full flex flex-col items-center gap-3">
                {type === 'video'
                    ? <video controls autoPlay src={url} className="max-h-[80vh] max-w-full rounded-lg" />
                    : <img src={url} alt={name} className="max-h-[80vh] max-w-full object-contain rounded-lg" />}
                <span className="text-xs text-white/70">{name}</span>
            </div>
        </div>,
        document.body
    );
};

/* Miniatura de evidencia: carga la imagen protegida como blob */
export const EvidenceThumb = ({ evidence, sizeClass = 'h-20 w-28' }) => {
    const type = fileType(evidence.path);
    const [url, setUrl] = useState(null);
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!evidence.path || !type) return;
        if (type === 'video') {
            const token = getToken();
            setUrl(`${BASE_URL}/evidence/${evidence.path}${token ? `?token=${token}` : ''}`);
            return;
        }
        let objectUrl = null;
        let cancelled = false;
        getSubRegistroIncidenceImageApi(evidence.path)
            .then((blob) => {
                objectUrl = URL.createObjectURL(blob);
                if (cancelled) URL.revokeObjectURL(objectUrl);
                else setUrl(objectUrl);
            })
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [evidence.path, type]);

    return (
        <>
            <button
                type="button"
                onClick={() => url && setOpen(true)}
                disabled={!url}
                title={evidence.originalName}
                className={`relative ${sizeClass} shrink-0 rounded-lg overflow-hidden bg-[#f0e6d0] dark:bg-white/5 ring-1 ring-[#e8dfc8] dark:ring-white/10 hover:ring-2 hover:ring-orange-500 transition-all disabled:cursor-default`}
            >
                {type === 'image' && url && (
                    <img src={url} alt={evidence.originalName} className="h-full w-full object-cover" />
                )}
                {type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Play className="h-5 w-5 text-white fill-white" />
                    </span>
                )}
                {(!url || failed) && type !== 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        {failed
                            ? <Camera className="h-5 w-5 text-[#a89878]" />
                            : <span className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />}
                    </span>
                )}
            </button>
            {open && url && (
                <Lightbox url={url} type={type} name={evidence.originalName} onClose={() => setOpen(false)} />
            )}
        </>
    );
};

/* Descripción recortada con "ver más" */
export const ClampedText = ({ text }) => {
    const [expanded, setExpanded] = useState(true);
    const long = text.length > 180;
    return (
        <p className="max-w-4xl text-sm leading-relaxed text-[#7a6a52] dark:text-gray-400 whitespace-pre-line">
            {long && !expanded ? `${text.slice(0, 180).trimEnd()}…` : text}
            {long && (
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="ml-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                >
                    {expanded ? 'ver menos' : 'ver más'}
                </button>
            )}
        </p>
    );
};

const RecordsTimeline = ({ records = [], fetchRecords = async () => {}, readOnly = false, onAdd = undefined, locked = false }) => {
    const [recordToEdit, setRecordToEdit] = useState(null);

    const confirmDelete = useDeleteConfirmation({
        fetchData: fetchRecords,
        deleteApiFn: deleteRecordApi,
        entityName: 'el Registro',
    });

    const handleDelete = (record) => {
        confirmDelete(record, (r) => `${r.camera?.name ?? 'Cámara desconocida'} - ${dayjs(r.date).format('YYYY-MM-DD HH:mm')}`);
    };

    const handleUpdateSubmit = async (updatedData) => {
        try {
            await updateRecordApi(recordToEdit.id, updatedData);
            toast.success('Registro actualizado exitosamente.');
            fetchRecords();
            setRecordToEdit(null);
        } catch (error) {
            toast.error('Error al actualizar el registro: ' + error.message);
        }
    };

    if (!records.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <ClipboardList className="h-10 w-10 text-[#d8cba8] dark:text-gray-600" />
                <p className="text-sm font-medium text-[#7a6a52] dark:text-gray-300">Aún no hay registros</p>
                <p className="text-xs text-[#a89878] dark:text-gray-500">Los cazadores todavía no han reportado avances</p>
                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Agregar primer registro
                    </button>
                )}
            </div>
        );
    }

    // Más reciente primero
    const sorted = [...records].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return (
        <>
            <ol className="relative">
                {sorted.map((rec, idx) => {
                    const date = dayjs(rec.date);
                    const isLast = idx === sorted.length - 1;
                    return (
                        <li key={rec.id} className="group relative flex gap-4 pb-6 last:pb-0">
                            {/* Riel de la línea de tiempo */}
                            <div className="relative flex flex-col items-center shrink-0 w-3">
                                <span className={`mt-1.5 h-3 w-3 rounded-full ring-4 ring-[#fdfbf5] dark:ring-[#111827] ${idx === 0 ? 'bg-orange-500' : 'bg-[#d8cba8] dark:bg-gray-600'}`} />
                                {!isLast && <span className="flex-1 w-px mt-1 bg-[#e8dfc8] dark:bg-white/10" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-[#3d2f1f] dark:text-white">
                                            {date.format('HH:mm')}
                                            <span className="ml-2 text-xs font-normal text-[#a89878] dark:text-gray-500">
                                                {date.format('DD/MM/YYYY')}
                                            </span>
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#7a6a52] dark:text-gray-400">
                                            <Camera className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{cameraLabel(rec.camera)}</span>
                                        </p>
                                    </div>

                                    {!readOnly && (
                                        <div
                                            className="flex items-center gap-1.5 shrink-0"
                                            title={locked ? 'La incidencia no está en proceso: sus registros no se pueden modificar' : undefined}
                                        >
                                            <button
                                                onClick={() => setRecordToEdit(rec)}
                                                disabled={locked}
                                                className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50 dark:disabled:hover:bg-blue-500/10"
                                            >
                                                <Pencil className="h-3.5 w-3.5" /> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rec)}
                                                disabled={locked}
                                                className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50 dark:disabled:hover:bg-red-500/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {rec.description && (
                                    <div className="mt-2">
                                        <ClampedText text={rec.description} />
                                    </div>
                                )}

                                {rec.evidences?.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {rec.evidences.map((ev) => <EvidenceThumb key={ev.id} evidence={ev} />)}
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>

            {recordToEdit && (
                <UpdateFormRecord
                    isOpen={!!recordToEdit}
                    onClose={() => setRecordToEdit(null)}
                    data={recordToEdit}
                    onSubmit={handleUpdateSubmit}
                />
            )}
        </>
    );
};

export default RecordsTimeline;
