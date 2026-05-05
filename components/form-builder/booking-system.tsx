'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin, DollarSign } from 'lucide-react';

interface Slot {
  id: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  booked: number;
  price: number;
}

interface BookingConfig {
  serviceName: string;
  description: string;
  slots: Slot[];
  basePrice: number;
  enableTimeSlots: boolean;
  slotDuration: number;
  maxBookingsPerSlot: number;
}

export default function BookingSystem() {
  const [config, setConfig] = useState<BookingConfig>({
    serviceName: '',
    description: '',
    slots: [],
    basePrice: 0,
    enableTimeSlots: true,
    slotDuration: 30,
    maxBookingsPerSlot: 1,
  });

  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    capacity: 1,
  });

  const generateTimeSlots = (date: string) => {
    const slots = [];
    const startTime = 9; // 9 AM
    const endTime = 17; // 5 PM
    const duration = config.slotDuration;

    for (let hour = startTime; hour < endTime; hour++) {
      for (let minutes = 0; minutes < 60; minutes += duration) {
        const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        slots.push(time);
      }
    }

    return slots;
  };

  const addSlot = () => {
    if (!newSlot.date || !newSlot.time) return;

    const slot: Slot = {
      id: Date.now().toString(),
      date: newSlot.date,
      time: newSlot.time,
      duration: config.slotDuration,
      capacity: newSlot.capacity,
      booked: 0,
      price: config.basePrice,
    };

    setConfig({
      ...config,
      slots: [...config.slots, slot],
    });

    setNewSlot({ date: '', time: '', capacity: 1 });
  };

  const removeSlot = (id: string) => {
    setConfig({
      ...config,
      slots: config.slots.filter(s => s.id !== id),
    });
  };

  const updateSlot = (id: string, updates: Partial<Slot>) => {
    setConfig({
      ...config,
      slots: config.slots.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const getAvailableSlots = () => {
    return config.slots.filter(slot => slot.booked < slot.capacity);
  };

  const getTotalRevenue = () => {
    return config.slots.reduce((sum, slot) => sum + slot.price * slot.booked, 0);
  };

  const timeSlots = newSlot.date ? generateTimeSlots(newSlot.date) : [];

  return (
    <div className="space-y-6">
      {/* Service Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Service Configuration</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <Input
              value={config.serviceName}
              onChange={(e) => setConfig({ ...config, serviceName: e.target.value })}
              placeholder="e.g., Hair Styling, Consultation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Service description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Base Price</label>
              <Input
                type="number"
                value={config.basePrice}
                onChange={(e) => setConfig({ ...config, basePrice: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slot Duration (mins)</label>
              <Input
                type="number"
                value={config.slotDuration}
                onChange={(e) => setConfig({ ...config, slotDuration: parseInt(e.target.value) })}
                min="15"
                max="180"
                step="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Bookings per Slot</label>
              <Input
                type="number"
                value={config.maxBookingsPerSlot}
                onChange={(e) => setConfig({ ...config, maxBookingsPerSlot: parseInt(e.target.value) })}
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slot Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule Slots</h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              {newSlot.date ? (
                <select
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select time...</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              ) : (
                <Input disabled placeholder="Select date first" />
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1">Capacity</label>
              <Button onClick={addSlot} className="w-full">
                Add Slot
              </Button>
            </div>
          </div>
        </div>

        {/* Slots List */}
        <div className="space-y-2">
          {config.slots.map(slot => (
            <div key={slot.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(slot.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {slot.time}
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {slot.booked}/{slot.capacity} booked
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    NGN {slot.price.toFixed(2)}
                  </span>
                </div>
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  value={slot.price}
                  onChange={(e) => updateSlot(slot.id, { price: parseFloat(e.target.value) })}
                  placeholder="Price"
                  className="w-24 text-sm"
                />
                <Button
                  onClick={() => removeSlot(slot.id)}
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Slots</p>
          <p className="text-2xl font-bold">{config.slots.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Available Slots</p>
          <p className="text-2xl font-bold">{getAvailableSlots().length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold">{config.slots.reduce((sum, s) => sum + s.booked, 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">NGN {getTotalRevenue().toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
