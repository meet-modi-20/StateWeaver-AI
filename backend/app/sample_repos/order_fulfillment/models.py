"""
Domain Models for Order Fulfillment Engine
"""
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

class OrderStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"

class PaymentStatus(str, Enum):
    UNPAID = "UNPAID"
    AUTHORIZED = "AUTHORIZED"
    CAPTURED = "CAPTURED"
    REFUNDED = "REFUNDED"
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"

@dataclass
class OrderItem:
    sku: str
    name: str
    unit_price: float
    quantity: int

    @property
    def total(self) -> float:
        return round(self.unit_price * self.quantity, 2)

@dataclass
class Order:
    order_id: str
    customer_id: str
    items: List[OrderItem]
    status: OrderStatus = OrderStatus.DRAFT
    payment_status: PaymentStatus = PaymentStatus.UNPAID
    total_amount: float = 0.0
    cancellation_reason: Optional[str] = None
    refund_amount: float = 0.0
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)

    def __post_init__(self):
        if not self.total_amount and self.items:
            self.total_amount = round(sum(item.total for item in self.items), 2)
