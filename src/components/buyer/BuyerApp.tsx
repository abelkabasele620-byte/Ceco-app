import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BuyerHome } from './BuyerHome';
import { ProductDetail } from './ProductDetail';
import { SellerProfileView } from './SellerProfileView';
import { CartAndCheckout } from './CartAndCheckout';
import { BuyerOrders } from './BuyerOrders';
import { BuyerMessages } from './BuyerMessages';
import { BuyerFavorites } from './BuyerFavorites';
import { BuyerProfile } from './BuyerProfile';
import { BuyerBottomNav } from './BuyerBottomNav';
import { Product } from '../../types';

export const BuyerApp: React.FC = () => {
  const {
    activeBuyerTab,
    setActiveBuyerTab,
    selectedProduct,
    setSelectedProduct,
    selectedSeller,
    setSelectedSeller,
  } = useApp();

  const [directCheckoutProduct, setDirectCheckoutProduct] = useState<Product | null>(null);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);

  const handleCheckoutNow = (product: Product) => {
    setDirectCheckoutProduct(product);
    setSelectedProduct(null);
    setActiveBuyerTab('cart');
  };

  const handleOrderCompleted = (orderId: string) => {
    setDirectCheckoutProduct(null);
    setHighlightOrderId(orderId);
    setActiveBuyerTab('orders');
  };

  // If a seller profile is open
  if (selectedSeller) {
    return (
      <div className="relative min-h-full">
        <SellerProfileView
          seller={selectedSeller}
          onBack={() => setSelectedSeller(null)}
        />
        <BuyerBottomNav />
      </div>
    );
  }

  // If a product detail is open
  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onCheckoutNow={handleCheckoutNow}
      />
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Active Tab View */}
      {activeBuyerTab === 'home' && <BuyerHome />}
      {activeBuyerTab === 'favorites' && <BuyerFavorites />}
      {activeBuyerTab === 'cart' && (
        <CartAndCheckout
          directProduct={directCheckoutProduct}
          onOrderCompleted={handleOrderCompleted}
          onContinueShopping={() => {
            setDirectCheckoutProduct(null);
            setActiveBuyerTab('home');
          }}
        />
      )}
      {activeBuyerTab === 'orders' && (
        <BuyerOrders initialSelectedOrderId={highlightOrderId} />
      )}
      {activeBuyerTab === 'messages' && <BuyerMessages />}
      {activeBuyerTab === 'profile' && <BuyerProfile />}

      {/* Floating Bottom Nav */}
      <BuyerBottomNav />
    </div>
  );
};
