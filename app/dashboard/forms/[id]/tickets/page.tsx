'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2, QrCode, Search } from 'lucide-react';

interface TicketRow {
  id: string;
  ticket_number: string;
  attendee_name?: string;
  attendee_email?: string;
  ticket_type?: string;
  ticket_url?: string;
  checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
}

export default function FormTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets?formId=${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [id, session?.access_token]);

  const handleCheckIn = async (ticketNumber: string) => {
    if (!session?.access_token) return;
    setCheckingIn(ticketNumber);
    try {
      const response = await fetch(`/api/tickets/checkin/${ticketNumber}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to check in ticket');
      }
      await fetchTickets();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCheckingIn(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const haystack = `${ticket.ticket_number} ${ticket.attendee_name || ''} ${ticket.attendee_email || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const checkedInCount = tickets.filter((ticket) => ticket.checked_in).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/forms/${id}`} className="text-primary hover:underline mb-4 inline-block">
          Back to form
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tickets</h1>
            <p className="text-gray-600">Validate and check in tickets generated from this form.</p>
          </div>
          <Button asChild>
            <Link href={`/checkin/${id}`} className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Open Scanner
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total Tickets</p>
          <p className="text-3xl font-bold mt-2">{tickets.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Checked In</p>
          <p className="text-3xl font-bold mt-2">{checkedInCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Remaining</p>
          <p className="text-3xl font-bold mt-2">{tickets.length - checkedInCount}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ticket number, name, or email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-2">Ticket</th>
                  <th className="text-left p-2">Attendee</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Created</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono">{ticket.ticket_number}</td>
                    <td className="p-2">
                      <p className="font-medium">{ticket.attendee_name || 'Guest'}</p>
                      {ticket.attendee_email && <p className="text-xs text-gray-500">{ticket.attendee_email}</p>}
                    </td>
                    <td className="p-2">{ticket.ticket_type || 'General Admission'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.checked_in ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ticket.checked_in ? 'Checked in' : 'Not checked in'}
                      </span>
                    </td>
                    <td className="p-2">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {ticket.ticket_url && (
                          <a href={ticket.ticket_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">PDF</Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          disabled={ticket.checked_in || checkingIn === ticket.ticket_number}
                          onClick={() => handleCheckIn(ticket.ticket_number)}
                          className="gap-1"
                        >
                          {checkingIn === ticket.ticket_number ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Check In
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
