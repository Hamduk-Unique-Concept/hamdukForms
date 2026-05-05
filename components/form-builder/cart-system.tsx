'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  variants?: {
    name: string;
    options: string[];
  }[];
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variants: Record<string, string>;
}

interface CartConfig {
  products: Product[];
  cartItems: CartItem[];
  taxRate: number;
  enableShipping: boolean;
  shippingCost: number;
}

export default function CartSystem() {
  const [config, setConfig] = useState<CartConfig>({
    products: [],
    cartItems: [],
    taxRate: 7.5,
    enableShipping: false,
    shippingCost: 0,
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
  });

  const addProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: newProduct.price,
      variants: [],
    };

    setConfig({
      ...config,
      products: [...config.products, product],
    });

    setNewProduct({ name: '', price: 0 });
  };

  const removeProduct = (id: string) => {
    setConfig({
      ...config,
      products: config.products.filter(p => p.id !== id),
      cartItems: config.cartItems.filter(item => item.productId !== id),
    });
  };

  const addToCart = (productId: string) => {
    const product = config.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = config.cartItems.find(item => item.productId === productId);

    if (existingItem) {
      setConfig({
        ...config,
        cartItems: config.cartItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      const cartItem: CartItem = {
        id: Date.now().toString(),
        productId,
        productName: product.name,
        quantity: 1,
        price: product.price,
        variants: {},
      };

      setConfig({
        ...config,
        cartItems: [...config.cartItems, cartItem],
      });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setConfig({
      ...config,
      cartItems: config.cartItems
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0),
    });
  };

  const removeFromCart = (id: string) => {
    setConfig({
      ...config,
      cartItems: config.cartItems.filter(item => item.id !== id),
    });
  };

  const subtotal = config.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (config.taxRate / 100);
  const shipping = config.enableShipping ? config.shippingCost : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="space-y-6">
      {/* Product Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Product Management</h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Product name"
            />
            <Input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              placeholder="Price"
              className="w-32"
            />
            <Button onClick={addProduct} variant="default">
              Add Product
            </Button>
          </div>

          <div className="space-y-2">
            {config.products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">NGN {product.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCart(product.id)}
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add to Cart
                  </Button>
                  <Button
                    onClick={() => removeProduct(product.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>

        {config.cartItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Cart is empty</p>
        ) : (
          <div className="space-y-4">
            {config.cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">NGN {item.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="w-24 text-right">
                    <p className="font-semibold">NGN {(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-red-50 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Settings */}
        <div className="mt-6 pt-6 border-t space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
              <Input
                type="number"
                value={config.taxRate}
                onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) })}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-1">
                <input
                  type="checkbox"
                  checked={config.enableShipping}
                  onChange={(e) => setConfig({ ...config, enableShipping: e.target.checked })}
                />
                Enable Shipping
              </label>
              {config.enableShipping && (
                <Input
                  type="number"
                  value={config.shippingCost}
                  onChange={(e) => setConfig({ ...config, shippingCost: parseFloat(e.target.value) })}
                  placeholder="Shipping cost"
                />
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t space-y-2 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>NGN {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({config.taxRate}%)</span>
            <span>NGN {tax.toFixed(2)}</span>
          </div>
          {config.enableShipping && (
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>NGN {shipping.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span>NGN {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
