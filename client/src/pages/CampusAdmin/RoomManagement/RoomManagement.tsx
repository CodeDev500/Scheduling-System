import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Users, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import api from '../../../api/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import { useToast } from '../../../hooks/useToast';

interface Room {
  id: number;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const toast = useToast();

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle room added
  const handleRoomAdded = (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
  };

  // Handle room updated
  const handleRoomUpdated = (updatedRoom: Room) => {
    setRooms(prev => prev.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    ));
  };

  // Handle edit room
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowEditModal(true);
  };
  // Handle delete room
  const handleDelete = async (roomId: number) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/rooms/${roomId}`);
      const data = response.data;
      
      toast.success(data.message || 'Room deleted successfully');
      
      // Refresh rooms list
      fetchRooms();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader 
            title="Room Management" 
            subtitle="Manage classroom and facility information"
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading rooms...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search rooms by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
              />
            </div>
            
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md px-6 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </div>
        </div>


        {/* Rooms Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rooms List</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredRooms.length} of {rooms.length} rooms
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No rooms found matching your search.' : 'No rooms available. Create your first room to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.capacity} students</TableCell>
                      <TableCell>{new Date(room.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(room.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRoom(room)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDelete(room.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Modals */}
        {showAddModal && (
          <AddRoomModal
            onClose={() => setShowAddModal(false)}
            onRoomAdded={handleRoomAdded}
          />
        )}
        
        {showEditModal && editingRoom && (
          <EditRoomModal
            room={editingRoom}
            onClose={() => {
              setShowEditModal(false);
              setEditingRoom(null);
            }}
            onRoomUpdated={handleRoomUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default RoomManagement;