import dayjs from "dayjs";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import ImageViewer from "./ImageViewer";
import { toast } from 'sonner';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';
import { deleteRecordApi, updateRecordApi } from '../../api/record/recordApi';
import { useState } from "react";
import UpdateFormRecord from "../Record/UpdateFormRecord";
import { useTheme } from "../../contexts/ThemeContext";

const RegistrosList = ({ records = [], fetchRecords = () => {}, readOnly = false }) => {

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const { isDark } = useTheme();

  const confirmDelete = useDeleteConfirmation({
    fetchData: fetchRecords,
    deleteApiFn: deleteRecordApi,
    entityName: "el Registro",
  });

  const handleEdit = (record) => {
    setRecordToEdit(record);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setRecordToEdit(null);
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      await updateRecordApi(recordToEdit.id, updatedData);
      toast.success("Registro actualizado exitosamente.");
      fetchRecords();
      handleCloseEditModal();
    } catch (error) {
      toast.error("Error al actualizar el registro: "+error.message);
    }
  };

  const handleDelete = async (record) => {
    confirmDelete(record, (r) => {
      const camera = r.camera?.name ?? "Cámara desconocida";
      const fecha = dayjs(r.date).format("YYYY-MM-DD HH:mm");
      return `${camera} - ${fecha}`;
    });
  };

  if (!records.length) {
    return <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-[#a89878]'}`}>No hay registros aún.</p>;
  }


  return (
    <div className="mt-8">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-[#3d2f1f]'}`}>
        Registros ({records.length})
      </h3>

      <div className="space-y-4 overflow-y-auto max-h-[40vh] my-4">
        {records.map((rec, idx) => {
          const recordDate = dayjs(rec.date);
          const isPM = recordDate.hour() >= 12;
          const evidencesCount = rec.evidences?.length || 0;

          return (
            <div
              key={rec.id}
              className={`border rounded-lg p-5 shadow-sm transition-colors duration-300 ${isDark ? 'border-gray-600 bg-gray-800' : 'border-[#e8dfc8] bg-[#fdfbf5]'}`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">

                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${isDark ? 'bg-gray-600 text-gray-200' : 'bg-[#f0e6d0] text-[#7a6a52]'}`}>
                      #{idx + 1}
                    </span>
                    {rec.camera?.name || "Sin cámara asociada"}
                  </div>

                  <div className={`flex gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-[#a89878]'}`}>
                    <span className="flex items-center gap-1">
                      <Icon path={icons.calendar} size={0.7} /> {recordDate.format("YYYY-MM-DD")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon path={icons.clock} size={0.7} /> {recordDate.format("HH:mm")} {isPM ? "p.m." : "a.m."}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <Icon path={icons.camera} size={0.7} /> {evidencesCount} imagen{evidencesCount === 1 ? "" : "es"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3 items-center shrink-0">
                {!readOnly && (
                    <>
                      <button
                        onClick={() => handleEdit(rec)}
                        className={`cursor-pointer transition ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        title="Editar registro"
                      >
                        <Icon path={icons.edit} size={0.8} />
                      </button>
                      <button
                        onClick={() => handleDelete(rec)}
                        className={`cursor-pointer transition ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                        title="Eliminar registro"
                      >
                        <Icon path={icons.delete} size={0.8} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-[#7a6a52]'}`}>
                {rec.description || "Sin descripción del registro."}
              </p>

              {rec.evidences && rec.evidences.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Imágenes adjuntas:</p>
                  <div className="flex flex-wrap gap-3">
                    {rec.evidences.map((img) => (
                      <div
                        key={img.id}
                        className={`border rounded-md p-2 flex flex-col items-center justify-center w-35 h-25 relative ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-[#f0e6d0] border-[#e8dfc8]'}`}
                      >
                        <Icon path={icons.camera} size={1.5} className={`${isDark ? 'text-gray-400' : 'text-[#a89878]'}`} />
                        <span className={`text-xs text-center line-clamp-1 w-full ${isDark ? 'text-gray-300' : 'text-[#7a6a52]'}`}>
                          {img.originalName}
                        </span>
                         <ImageViewer Path={img.path} originalName={img.originalName} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {editModalOpen && recordToEdit && (
        <UpdateFormRecord
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          data={recordToEdit}
          onSubmit={handleUpdateSubmit}
        />
      )}
    </div>
  );
};

export default RegistrosList;
