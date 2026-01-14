"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Package, Check, User, ShoppingCart, Banknote, Truck, CreditCard, AlertCircle, ShoppingBag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

type Order = {
    id: string;
    tran_id: string;
    amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled' | 'refunded' | 'pending_verification';
    orderType?: 'single_offer' | 'cart_checkout';
    createdAt: any;
    buyerInfo: { 
        name: string; 
        email: string;
        phone?: string;
        address?: string;
    };
    offerInfo?: {
        buyRequestTitle: string;
        sellerName: string;
        price: number;
    };
    cartItems?: Array<{
        productId: string;
        productName: string;
        productImage?: string;
        price: number;
        quantity: number;
        sellerId: string;
        sellerName: string;
        subtotal: number;
    }>;
    sellerId?: string;
    sellerIds?: string[];
    buyerId: string;
    shippingCost?: number;
    taxAmount?: number;
    subtotal?: number;
    totalAmount?: number;
};

const statusMap = {
    pending: { text: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-800', icon: CreditCard },
    pending_verification: { text: 'Payment Verification', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    paid: { text: 'Paid', color: 'bg-blue-100 text-blue-800', icon: Check },
    shipped: { text: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { text: 'Delivered', color: 'bg-green-100 text-green-800', icon: Check },
    failed: { text: 'Payment Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    cancelled: { text: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
    refunded: { text: 'Refunded', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

export default function OrderTrackingPage() {
    const { orderId } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const orderRef = doc(db, 'orders', orderId as string);
        const unsubscribe = onSnapshot(orderRef, (doc) => {
            if (doc.exists()) {
                setOrder({ id: doc.id, ...doc.data() } as Order);
            } else {
                console.error("No such order!");
                setOrder(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [orderId]);

    const handleUpdateStatus = async (newStatus: Order['status']) => {
        if (!user || !order) {
            toast.error("You are not authorized to update this order.");
            return;
        }
        
        // Check if user is seller or buyer (seller can update shipping/delivery, buyer can request cancellation)
        const isSeller = user.uid === order.sellerId || (order.sellerIds && order.sellerIds.includes(user.uid));
        const isBuyer = user.uid === order.buyerId;
        
        if (!isSeller && !isBuyer) {
            toast.error("You are not authorized to update this order.");
            return;
        }
        
        // Buyers can only cancel pending orders
        if (isBuyer && newStatus === 'cancelled' && order.status !== 'pending') {
            toast.error("Only pending orders can be cancelled by buyers.");
            return;
        }
        
        // Sellers can update to shipped/delivered
        if (isSeller && !['shipped', 'delivered', 'cancelled'].includes(newStatus)) {
            toast.error("Sellers can only update to shipped, delivered, or cancelled.");
            return;
        }

        setIsUpdatingStatus(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, { 
                status: newStatus,
                updatedAt: serverTimestamp()
            });

            // Send notification to the other party
            const notification = {
                userId: isSeller ? order.buyerId : order.sellerId || order.sellerIds?.[0] || '',
                title: `Order Status Updated`,
                message: `Order ${order.tran_id} status has been updated to: ${statusMap[newStatus]?.text || newStatus}.`,
                link: `/orders/${order.id}`,
                read: false,
                createdAt: serverTimestamp(),
            };
            await addDoc(collection(db, "notifications"), notification);

            toast.success(`Order status updated to ${statusMap[newStatus]?.text || newStatus}`);
        } catch (error) {
            console.error("Error updating order status:", error);
            toast.error("Failed to update order status.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('BDT', 'Tk');
    };

    const getOrderTitle = () => {
        if (order?.orderType === 'cart_checkout') {
            const itemCount = order.cartItems?.length || 0;
            return `Cart Order (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
        } else if (order?.offerInfo?.buyRequestTitle) {
            return order.offerInfo.buyRequestTitle;
        } else {
            return "Order";
        }
    };

    const getSellerInfo = () => {
        if (order?.orderType === 'cart_checkout') {
            const sellerCount = order.sellerIds?.length || 0;
            if (sellerCount > 1) {
                return `${sellerCount} sellers`;
            } else if (order.cartItems?.[0]?.sellerName) {
                return order.cartItems[0].sellerName;
            } else {
                return "Seller";
            }
        } else if (order?.offerInfo?.sellerName) {
            return order.offerInfo.sellerName;
        } else if (order?.sellerId) {
            return "Seller";
        } else {
            return "Multiple sellers";
        }
    };

    const getDisplayAmount = () => {
        if (order?.totalAmount) return order.totalAmount;
        if (order?.amount) return order.amount;
        return 0;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-10 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or has been removed.</p>
                        <Button asChild>
                            <Link href="/buyer/orders">Back to My Orders</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const currentStatus = statusMap[order.status] || statusMap.pending;
    const StatusIcon = currentStatus.icon;
    const isSeller = user && (user.uid === order.sellerId || (order.sellerIds && order.sellerIds.includes(user.uid)));
    const isBuyer = user && user.uid === order.buyerId;
    const canUpdateStatus = isSeller || (isBuyer && order.status === 'pending');

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
                <p className="text-muted-foreground">Track your order status and details</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div>
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <ShoppingBag className="h-6 w-6 text-emerald-600" />
                                        {getOrderTitle()}
                                    </CardTitle>
                                    <CardDescription>
                                        Order ID: <span className="font-mono">{order.tran_id}</span>
                                        <span className="mx-2">•</span>
                                        Placed on {order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'N/A'}
                                    </CardDescription>
                                </div>
                                <Badge className={`px-3 py-1 text-sm ${currentStatus.color} flex items-center gap-2`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {currentStatus.text}
                                </Badge>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            {/* Order Details */}
                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-1">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <ShoppingCart className="h-4 w-4" /> 
                                        Product Details
                                    </h3>
                                    <p className="text-muted-foreground">{getOrderTitle()}</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <User className="h-4 w-4" /> 
                                        {order.orderType === 'cart_checkout' ? 'Sellers' : 'Seller'}
                                    </h3>
                                    <p className="text-muted-foreground">{getSellerInfo()}</p>
                                </div>
                            </div>

                            {/* Cart Items (for cart checkout) */}
                            {order.orderType === 'cart_checkout' && order.cartItems && order.cartItems.length > 0 && (
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-4">Order Items ({order.cartItems.length})</h3>
                                    <div className="space-y-3">
                                        {order.cartItems.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                                        <ShoppingCart className="h-5 w-5 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium line-clamp-1">{item.productName}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Seller: {item.sellerName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Quantity: {item.quantity} × {formatCurrency(item.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Summary */}
                            <div className="border-t pt-6">
                                <h3 className="font-semibold mb-4">Payment Summary</h3>
                                <div className="space-y-2">
                                    {order.subtotal && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatCurrency(order.subtotal)}</span>
                                        </div>
                                    )}
                                    {order.shippingCost && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{formatCurrency(order.shippingCost)}</span>
                                        </div>
                                    )}
                                    {order.taxAmount && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span>{formatCurrency(order.taxAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total Amount</span>
                                        <span className="text-emerald-600">{formatCurrency(getDisplayAmount())}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Buyer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-4 w-4" /> Buyer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="font-semibold">{order.buyerInfo.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.buyerInfo.email}</p>
                                </div>
                                {order.buyerInfo.phone && (
                                    <p className="text-sm">Phone: {order.buyerInfo.phone}</p>
                                )}
                                {order.buyerInfo.address && (
                                    <p className="text-sm">Address: {order.buyerInfo.address}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-4 w-4" /> Order Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['paid', 'shipped', 'delivered'].map((statusKey) => {
                                    const status = statusKey as keyof typeof statusMap;
                                    const isCompleted = 
                                        status === 'paid' && ['paid', 'shipped', 'delivered'].includes(order.status) ||
                                        status === 'shipped' && ['shipped', 'delivered'].includes(order.status) ||
                                        status === 'delivered' && order.status === 'delivered';
                                    
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}>
                                                {isCompleted ? <Check className="h-3 w-3" /> : null}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{statusMap[status]?.text}</p>
                                                {isCompleted && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.createdAt ? format(order.createdAt.toDate(), 'MMM d, yyyy') : 'Date not available'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Update Status (if authorized) */}
                    {canUpdateStatus && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Update Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Select 
                                        onValueChange={(value) => handleUpdateStatus(value as Order['status'])} 
                                        value={order.status}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {isSeller ? (
                                                <>
                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                    <SelectItem value="cancelled">Cancel Order</SelectItem>
                                                </>
                                            ) : (
                                                <SelectItem value="cancelled">Request Cancellation</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        className="w-full" 
                                        onClick={() => handleUpdateStatus(order.status)}
                                        disabled={isUpdatingStatus}
                                    >
                                        {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        {isSeller 
                                            ? 'Update the shipping status of this order'
                                            : 'Request cancellation for this pending order'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Contact Button */}
                    <Button asChild className="w-full" variant="outline">
                        <Link href="/messages">Contact Support</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}