import dayjs from "dayjs";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import ImageViewer from "./ImageViewer";
import { toast } from 'sonner';
import { useDeleteConfirmation } from '../../hooks/commons/useDeleteConfirmation';
import { deleteRecordApi, updateRecordApi } from '../../api/record/recordApi';
import { useState } from "react";
import UpdateFormRecord from "../Record/UpdateFormRecord";

const RegistrosList = ({ records = [], fetchRecords = () => {} }) => {

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);

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
      toast.error("Error al actualizar el registro.");
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
    return <p className="text-gray-500 text-sm">No hay registros aún.</p>;
  }


  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Registros ({records.length})
      </h3>

      <div className="space-y-4 overflow-y-auto h-[25vh]">
        {records.map((rec, idx) => {
          const recordDate = dayjs(rec.date);
          const isPM = recordDate.hour() >= 12;
          const imagesCount = rec.images?.length || 0;

          return (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold">
                      #{idx + 1}
                    </span>
                    {/* aca */}
                    {rec.camera?.name || "Sin cámara asociada"}
                  </div>

                  <div className="flex gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Icon path={icons.calendar} size={0.7} /> {recordDate.format("YYYY-MM-DD")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon path={icons.clock} size={0.7} /> {recordDate.format("HH:mm")} {isPM ? "p.m." : "a.m."}
                    </span>
                    
                    <span className="flex items-center gap-1">
                      <Icon path={icons.camera} size={0.7} /> {imagesCount} imagen{imagesCount === 1 ? "" : "es"}
                    </span>
                  </div>
                </div>
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar registro"
                    >
                      <Icon path={icons.edit} size={0.8} />
                    </button>
                    <button
                      onClick={() => handleDelete(rec)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar registro"
                    >
                      <Icon path={icons.delete} size={0.8} />
                    </button>
                  </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {rec.description || "Sin descripción del registro."}
              </p>

              {rec.images && rec.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-2">Imágenes adjuntas:</p>
                  <div className="flex flex-wrap gap-3">
                    {rec.images.map((img) => (
                      <div
                        key={img.id}
                        className="bg-gray-100 border border-gray-300 rounded-md p-2 flex flex-col items-center justify-center w-35 h-25 relative"
                      >
                        <Icon path={icons.camera} size={1.5} className="text-gray-500" />
                        <span className="text-xs text-gray-700 text-center line-clamp-1 w-full">
                          {img.originalName}
                        </span>
                         <ImageViewer Path={img.imagePath} originalName={img.originalName} />
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
