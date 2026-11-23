import { useState } from 'react';
import { Hourglass, PlayCircle } from 'lucide-react';

/* Recordatorio para incidencias en estado "previous" (preincidencia aún sin
   aceptar): el backend no admite registros hasta que pase a "process". */
const PreviousStatusNotice = ({ onAccept, className = '' }: { onAccept?: () => Promise<void> | void; className?: string }) => {
    const [accepting, setAccepting] = useState(false);

    const handleAccept = async () => {
        if (!onAccept) return;
        setAccepting(true);
        try { await onAccept(); } finally { setAccepting(false); }
    };

    return (
        <div
            role="status"
            className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-violet-200 dark:border-violet-400/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-3 ${className}`}
        >
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <Hourglass className="h-5 w-5 mt-0.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">
                        Esta incidencia aún está en Previo
                    </p>
                    <p className="text-xs leading-relaxed text-violet-800/80 dark:text-violet-200/70">
                        Todavía no ha sido aceptada. Mientras siga en Previo no se pueden agregar, editar ni eliminar registros.
                        {onAccept ? ' Pásala a En proceso para empezar a trabajarla.' : ' Pide a tu supervisor que la pase a En proceso.'}
                    </p>
                </div>
            </div>
            {onAccept && (
                <button
                    type="button"
                    onClick={handleAccept}
                    disabled={accepting}
                    className="h-9 shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 transition-colors"
                >
                    {accepting
                        ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        : <PlayCircle className="h-4 w-4" />}
                    Pasar a En proceso
                </button>
            )}
        </div>
    );
};

export default PreviousStatusNotice;
