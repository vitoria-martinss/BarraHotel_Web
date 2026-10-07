import { Button } from '../ui';
import { formatCurrency, type Room } from '../data';

export function QuartoCard({ room, onDetail }: { room: Room; onDetail: () => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={room.photo}
          alt={room.category}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-slate-800" style={{ fontFamily: 'var(--font-display)' }}>
              {room.category}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[#B8963E]">{formatCurrency(room.dailyRate)}</p>
            <p className="text-xs text-slate-400">/diária</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span>{room.capacity} pessoa{room.capacity > 1 ? 's' : ''}</span>
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onDetail}>
          Ver detalhes
        </Button>
      </div>
    </div>
  );
}