import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const estadoBadge = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
}

export default function CitaCard({ cita, onCancelar, onReprogramar, role }) {
  const fecha = format(parseISO(cita.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-900 capitalize">{fecha}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {cita.horaInicio} – {cita.horaFin}
          </p>
          {role === 'alumno' && cita.profesor && (
            <p className="text-sm text-gray-700 mt-1">
              Prof. {cita.profesor.nombre}
            </p>
          )}
          {role === 'profesor' && cita.alumno && (
            <p className="text-sm text-gray-700 mt-1">
              {cita.alumno.nombre}
            </p>
          )}
          {cita.motivo && (
            <p className="text-sm text-gray-500 mt-1 italic">{cita.motivo}</p>
          )}
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge[cita.estado] || 'bg-gray-100 text-gray-600'}`}
        >
          {cita.estado}
        </span>
      </div>

      {cita.estado === 'pendiente' && (
        <div className="flex gap-2 mt-3">
          {onReprogramar && (
            <button
              onClick={() => onReprogramar(cita)}
              className="text-xs px-3 py-1.5 rounded border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            >
              Reprogramar
            </button>
          )}
          {onCancelar && (
            <button
              onClick={() => onCancelar(cita.id)}
              className="text-xs px-3 py-1.5 rounded border border-red-300 text-red-600 hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
