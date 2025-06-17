import dayjs from "dayjs";
import 'dayjs/locale/es';
import { getIncidenceCodesApi } from "../../api/operador/incidenceApi";

const IncidenciaDetalles = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [incidence, setIncidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    const fetchIncidenceData = async () => {
      try {
        // 1. Primero intenta cargar de localStorage
        const savedData = localStorage.getItem(`incidence_${code}`);
        if (savedData) {
          setIncidence(JSON.parse(savedData));
          return;
        }

        // 2. Si no está en localStorage, hace fetch a la API
        const response = await getIncidenceCodesApi(code); // Necesitarás implementar esta función
        if (response.success) {
          setIncidence(response.data);
          // Guarda en localStorage para futuras visitas
          localStorage.setItem(`incidence_${code}`, JSON.stringify(response.data));
        } else {
          navigate('/dashboard/operador/incidencia', { replace: true });
        }
      } catch (error) {
        console.error("Error fetching incidence:", error);
        navigate('/dashboard/operador/incidencia', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchIncidenceData();
  }, [code, navigate]);

  // Valores de respaldo mientras carga
  if (loading || !incidence) {
    return <div>Cargando...</div>;
  }

  // Valores de respaldo si el estado no está disponible
  const incidenceStateDefault= state || {
    name: "Sin título",
    date: "2025-06-10T00:00:00Z",
    description: "Sin descripción",
    createdAt: "2025-06-10T00:00:00Z",
  };

  // Analizar la fecha y la hora de la cadena ISO 8601 combinada
  const incidentDate = dayjs(incidence.date);
  const createdAtDate = dayjs(incidence.createdAt);

  const [openModal, setOpenModal] = useState(false); // Estado para controlar el modal

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Registros ({records.length})
      </h3>

      <div className="space-y-4">
        {records.map((rec, idx) => {
          const recordDate = dayjs(rec.date);
          const isPM = recordDate.hour() >= 12;
          const imagesCount = rec.images?.length || 0;

          return (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-base text-gray-800 font-medium">
                  <span className="bg-gray-50 border-1 leading-tight border-gray-300 text-gray-700 rounded-lg px-2 py-0.5 text-xs font-semibold">
                    #{idx + 1}
                  </span>
                  {rec.cameraId ? "Entrada Principal" : "Sin cámara asociada"}
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

              <p className="text-base text-gray-700 leading-relaxed mb-3">
                {rec.description || "Sin descripción del registro."}
              </p>

              {rec.images && rec.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-2">Imágenes adjuntas:</p>
                  <div className="flex flex-wrap gap-3">
                    {rec.images.map((img) => (
                      <div
                        key={img.id}
                        className="bg-gray-100 border border-gray-300 rounded-md p-2 flex flex-col items-center w-40"
                      >
                        <Icon path={icons.camera} size={1.2} className="text-gray-500 mb-1" />
                        <span className="text-xs text-gray-700 text-center truncate">
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
