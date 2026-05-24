'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billTo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  billFrom: {
    companyName: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
  currency: string;
}

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    billTo: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    billFrom: {
      companyName: 'Your Company',
      email: 'company@example.com',
      phone: '+234 XXX XXX XXXX',
      address: 'Lagos, Nigeria',
    },
    items: [],
    notes: 'Thank you for your business!',
    taxRate: 7.5,
    currency: 'NGN',
  });

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  const addItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;

    const item: InvoiceItem = {
      id: Date.now().toString(),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
    };

    setInvoice({
      ...invoice,
      items: [...invoice.items, item],
    });

    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (id: string) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter(item => item.id !== id),
    });
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;

  const generatePDF = () => {
    // Implementation for PDF generation using libraries like pdfkit or html2pdf
    console.log('Generating PDF for invoice:', invoice);
    alert('PDF generation would be implemented here using pdfkit or html2pdf library');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">From</h3>
            <div className="space-y-2">
              <Input
                value={invoice.billFrom.companyName}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billFrom: { ...invoice.billFrom, companyName: e.target.value }
                })}
                placeholder="Company name"
              />
              <Input
                value={invoice.billFrom.email}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billFrom: { ...invoice.billFrom, email: e.target.value }
                })}
                placeholder="Email"
              />
              <Input
                value={invoice.billFrom.phone}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billFrom: { ...invoice.billFrom, phone: e.target.value }
                })}
                placeholder="Phone"
              />
              <Input
                value={invoice.billFrom.address}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billFrom: { ...invoice.billFrom, address: e.target.value }
                })}
                placeholder="Address"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Bill To</h3>
            <div className="space-y-2">
              <Input
                value={invoice.billTo.name}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billTo: { ...invoice.billTo, name: e.target.value }
                })}
                placeholder="Customer name"
              />
              <Input
                value={invoice.billTo.email}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billTo: { ...invoice.billTo, email: e.target.value }
                })}
                placeholder="Email"
              />
              <Input
                value={invoice.billTo.phone}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billTo: { ...invoice.billTo, phone: e.target.value }
                })}
                placeholder="Phone"
              />
              <Input
                value={invoice.billTo.address}
                onChange={(e) => setInvoice({
                  ...invoice,
                  billTo: { ...invoice.billTo, address: e.target.value }
                })}
                placeholder="Address"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Invoice #</label>
            <Input
              value={invoice.invoiceNumber}
              onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Invoice Date</label>
            <Input
              type="date"
              value={invoice.invoiceDate}
              onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <Input
              type="date"
              value={invoice.dueDate}
              onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={invoice.currency}
              onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option>NGN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Line Items</h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-4 gap-2">
            <Input
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Item description"
            />
            <Input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
              placeholder="Qty"
            />
            <Input
              type="number"
              value={newItem.unitPrice}
              onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) })}
              placeholder="Unit price"
            />
            <Button onClick={addItem} variant="default">
              Add Item
            </Button>
          </div>

          {/* Items Table */}
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{item.description}</td>
                  <td className="p-2 text-center">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) })}
                      className="w-12 text-center text-sm"
                    />
                  </td>
                  <td className="p-2 text-right">₦{item.unitPrice.toLocaleString()}</td>
                  <td className="p-2 text-right font-semibold">
                    ₦{(item.quantity * item.unitPrice).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg ml-auto w-64">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({invoice.taxRate}%)</span>
            <span>₦{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button onClick={generatePDF} className="gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" /> Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
