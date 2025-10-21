import { useEffect, useState } from 'react';
import axios from 'axios';

const RoomSettings = () => {
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/rooms').then((response) => setRooms(response.data.rooms));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Inventory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between">
              <p className="font-semibold">Room {room.number}</p>
              <span className="text-xs text-white/50">{room.type}</span>
            </div>
            <p className="text-sm text-white/60">Floor {room.floor}</p>
            <p className="text-xs text-white/40">Smoking: {room.smoking ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSettings;
