import { useState, useEffect } from "react";
import Icon from "@mdi/react";
import { icons } from "../../plugins/IconLibrary";
import { getSubRegistroIncidenceImageApi } from "../../api/operador/registroIncidenceApi";

const ImageViewer = ({ Path, originalName, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función auxiliar para detectar tipo
  const getFileType = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const videoTypes = ["mp4", "webm", "ogg"];

    if (imageTypes.includes(extension)) return "image";
    if (videoTypes.includes(extension)) return "video";
    return null;
  };

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const blob = await getSubRegistroIncidenceImageApi(Path);
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        setMediaType(getFileType(Path));
      } catch (err) {
        console.error("Error fetching media:", err);
        setError("Error al cargar el archivo");
      } finally {
        setLoading(false);
      }
    };
    console.log("Loading media from path:", Path);

    if (Path) fetchMedia();
  }, [Path]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleDownload = () => {
    if (!mediaUrl) return;
    const a = document.createElement("a");
    a.href = mediaUrl;
    a.download = originalName || "archivo";
    a.click();
  };

  return (
    <>
      <div className="absolute top-2 right-3 flex gap-2">
        <button
          type="button"
          onClick={toggleVisibility}
          title="Ver archivo"
          className="text-gray-500 hover:text-gray-800 transition-all duration-200 ease-in cursor-pointer"
        >
          <Icon path={isVisible ? icons.eye : icons.eyeOff} size={0.9} />
        </button>

        {mediaUrl && (
          <button
            type="button"
            onClick={handleDownload}
            title="Descargar archivo"
            className="text-gray-500 hover:text-gray-800 transition-all duration-200 ease-in cursor-pointer"
          >
            <Icon path={icons.download} size={0.9} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Eliminar archivo"
            className="text-red-500 hover:text-red-600 transition-all duration-200 ease-in cursor-pointer"
          >
            <Icon path={icons.delete} size={0.9} />
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Cargando...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {isVisible && mediaUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
          <div className="relative">
            <div className="bg-white px-6 py-8 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="absolute bg-white w-10 h-10 -top-4 -right-4 rounded-full flex items-center justify-center shadow-lg">
                <button
                  onClick={toggleVisibility}
                  className="absolute top-0.5 right-0.5 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  <Icon path={icons.close} size={1.4} />
                </button>
              </div>

              {mediaType === "image" && (
                <img
                  src={mediaUrl}
                  alt={originalName}
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {mediaType === "video" && (
                <video
                  controls
                  src={mediaUrl}
                  className="max-w-full max-h-full"
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;
