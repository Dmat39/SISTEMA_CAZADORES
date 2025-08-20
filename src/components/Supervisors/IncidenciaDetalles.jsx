import dayjs from "dayjs";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";

const RegistrosList = ({ records = [] }) => {
  if (!records.length) {
    return <p className="text-gray-500 text-sm">No hay registros aún.</p>;
  }
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Registros ({records.length})
      </h3>

      <div className="space-y-4">
        {records.map((rec, idx) => {
          const recordDate = dayjs(rec.date);
          const isPM = recordDate.hour() >= 12;
          const evidencesCount = rec.evidences?.length || 0;

          return (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                  <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold">
                    #{idx + 1}
                  </span>
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
                    <Icon path={icons.camera} size={0.7} /> {evidencesCount} imagen{evidencesCount === 1 ? "" : "es"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                {rec.description || "Sin descripción del registro."}
              </p>

              {rec.evidences && rec.evidences.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-2">Archivos adjuntas:</p>
                  <div className="flex flex-wrap gap-3">
                    {rec.evidences.map((img) => (
                      <div
                        key={img.id}
                        className="bg-gray-100 border border-gray-300 rounded-md p-2 flex flex-col items-center w-40"
                      >
                        <Icon path={icons.camera} size={1.2} className="text-gray-500 mb-1" />
                        <span className="text-xs text-gray-700 text-center line-clamp-1 w-20">
                          {img.originalName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistrosList;
