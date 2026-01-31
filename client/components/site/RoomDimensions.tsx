import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Room {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  coats: number;
}

interface RoomDimensionsProps {
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
}

export function RoomDimensions({ rooms, onRoomsChange }: RoomDimensionsProps) {
  const addRoom = () => {
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      name: `Room ${rooms.length + 1}`,
      length: 4,
      width: 3.5,
      height: 2.4,
      coats: 1,
    };
    onRoomsChange([...rooms, newRoom]);
  };

  const removeRoom = (id: string) => {
    onRoomsChange(rooms.filter((r) => r.id !== id));
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    onRoomsChange(
      rooms.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    );
  };

  const totalArea = rooms.reduce((sum, room) => {
    const wallArea = 2 * room.height * (room.length + room.width);
    return sum + wallArea;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Room dimensions</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add multiple rooms to calculate total paint needed
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addRoom}
          className="gap-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card className="border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No rooms added yet. Click "Add room" to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <Card key={room.id} className="border p-3">
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5 md:items-end">
                <div className="md:col-span-1">
                  <Label className="text-xs">Room name</Label>
                  <Input
                    size="sm"
                    value={room.name}
                    onChange={(e) =>
                      updateRoom(room.id, { name: e.target.value })
                    }
                    placeholder="e.g. Bedroom 1"
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Length (m)</Label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.1"
                    value={room.length}
                    onChange={(e) =>
                      updateRoom(room.id, {
                        length: Math.max(0.5, Number(e.target.value) || 0),
                      })
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Width (m)</Label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.1"
                    value={room.width}
                    onChange={(e) =>
                      updateRoom(room.id, {
                        width: Math.max(0.5, Number(e.target.value) || 0),
                      })
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Height (m)</Label>
                  <Input
                    type="number"
                    min="1.5"
                    step="0.1"
                    value={room.height}
                    onChange={(e) =>
                      updateRoom(room.id, {
                        height: Math.max(1.5, Number(e.target.value) || 0),
                      })
                    }
                    className="h-8 text-sm"
                  />
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRoom(room.id)}
                  className="h-8 w-full text-destructive hover:bg-destructive/10 md:w-auto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Wall area:</span>
                <span className="font-semibold">
                  {(2 * room.height * (room.length + room.width)).toFixed(1)} m²
                </span>
              </div>
            </Card>
          ))}

          {rooms.length > 0 && (
            <Card className="border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  Total wall area
                </span>
                <span className="text-lg font-bold text-primary">
                  {totalArea.toFixed(1)} m²
                </span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
