import dayjs from "dayjs";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { useTheme } from "../../contexts/ThemeContext";

const RegistrosList = ({ records = [] }) => {
  const { isDark } = useTheme();
  
  if (!records.length) {
    return <p className={`${isDark ? 'text-gray-400' : 'text-[#a89878]'} text-sm`}>No hay registros aún.</p>;
  }
  return (
    <div className={`mt-8 ${isDark ? 'text-gray-100' : 'text-[#3d2f1f]'}`}>
      <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-[#3d2f1f]'} mb-4`}>
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
              className={`border rounded-lg p-5 shadow-sm transition-colors duration-300 ${isDark ? 'border-[#404040] bg-[#2a2a2a]' : 'border-[#e8dfc8] bg-[#fdfbf5]'}`}
              style={isDark ? {backgroundColor: '#2a2a2a', borderColor: '#404040'} : {}}
            >
              <div className="flex justify-between items-start mb-2">
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

              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-[#7a6a52]'}`}>
                {rec.description || "Sin descripción del registro."}
              </p>

              {rec.evidences && rec.evidences.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-[#3d2f1f]'}`}>Archivos adjuntas:</p>
                  <div className="flex flex-wrap gap-3">
                    {rec.evidences.map((img) => (
                      <div
                        key={img.id}
                        className={`border rounded-md p-2 flex flex-col items-center w-40 transition-colors duration-300 ${isDark ? 'bg-[#404040] border-[#525252]' : 'bg-[#f0e6d0] border-[#e8dfc8]'}`}
                      >
                        <Icon path={icons.camera} size={1.2} className={`mb-1 ${isDark ? 'text-gray-300' : 'text-[#a89878]'}`} />
                        <span className={`text-xs text-center line-clamp-1 w-20 ${isDark ? 'text-gray-300' : 'text-[#7a6a52]'}`}>
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
