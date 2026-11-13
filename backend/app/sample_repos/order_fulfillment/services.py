"""
Order Fulfillment and Lifecycle Services
"""
from typing import Dict, Optional
from datetime import datetime
from .models import Order, OrderStatus, PaymentStatus
from .state_machine import OrderStateMachine, InvalidStateTransitionError

class InsufficientStockError(Exception):
    pass

class PaymentProcessingError(Exception):
    pass

class OrderAlreadyFinalizedError(Exception):
    pass

class InventoryService:
    def __init__(self):
        self._stock: Dict[str, int] = {
            "SKU-MACBOOK": 50,
            "SKU-IPHONE": 100,
            "SKU-CABLE": 500,
            "SKU-KEYBOARD": 75,
        }
        self._reserved: Dict[str, int] = {}

    def reserve(self, sku: str, quantity: int) -> bool:
        available = self._stock.get(sku, 0)
        if available < quantity:
            raise InsufficientStockError(f"Insufficient stock for {sku}. Available: {available}, requested: {quantity}")
        self._stock[sku] -= quantity
        self._reserved[sku] = self._reserved.get(sku, 0) + quantity
        return True

    def release_reservation(self, sku: str, quantity: int) -> bool:
        reserved = self._reserved.get(sku, 0)
        actual_release = min(reserved, quantity)
        self._reserved[sku] = reserved - actual_release
        self._stock[sku] = self._stock.get(sku, 0) + quantity
        return True

    def get_stock(self, sku: str) -> int:
        return self._stock.get(sku, 0)

class PaymentGateway:
    def __init__(self):
        self.transactions: Dict[str, dict] = {}
        self.refund_records: Dict[str, dict] = {}

    def charge(self, order_id: str, amount: float) -> str:
        tx_id = f"TX-{order_id}-{int(datetime.utcnow().timestamp())}"
        self.transactions[order_id] = {
            "tx_id": tx_id,
            "amount": amount,
            "status": "SUCCESS",
            "timestamp": datetime.utcnow()
        }
        return tx_id

    def refund(self, order_id: str, amount: float, reason: str = "") -> str:
        if order_id not in self.transactions:
            raise PaymentProcessingError(f"No captured payment found for order {order_id}")
        tx = self.transactions[order_id]
        if amount > tx["amount"]:
            raise PaymentProcessingError(f"Refund amount {amount} exceeds charged amount {tx['amount']}")
        refund_id = f"REF-{order_id}-{int(datetime.utcnow().timestamp())}"
        self.refund_records[order_id] = {
            "refund_id": refund_id,
            "amount": amount,
            "reason": reason,
            "timestamp": datetime.utcnow()
        }
        return refund_id

class OrderService:
    def __init__(self, inventory: Optional[InventoryService] = None, payment: Optional[PaymentGateway] = None):
        self.inventory = inventory or InventoryService()
        self.payment = payment or PaymentGateway()
        self.orders: Dict[str, Order] = {}

    def create_order(self, customer_id: str, items) -> Order:
        order_id = f"ORD-{len(self.orders) + 1:05d}"
        for item in items:
            self.inventory.reserve(item.sku, item.quantity)
        order = Order(order_id=order_id, customer_id=customer_id, items=items, status=OrderStatus.DRAFT)
        self.orders[order_id] = order
        return order

    def submit_for_payment(self, order_id: str) -> Order:
        order = self.get_order(order_id)
        OrderStateMachine.validate_transition(order.status, OrderStatus.PENDING_PAYMENT)
        order.status = OrderStatus.PENDING_PAYMENT
        order.updated_at = datetime.utcnow()
        return order

    def process_payment(self, order_id: str) -> Order:
        order = self.get_order(order_id)
        OrderStateMachine.validate_transition(order.status, OrderStatus.PAID)
        self.payment.charge(order.order_id, order.total_amount)
        order.status = OrderStatus.PAID
        order.payment_status = PaymentStatus.CAPTURED
        order.updated_at = datetime.utcnow()
        return order

    def ship_order(self, order_id: str) -> Order:
        order = self.get_order(order_id)
        if order.status == OrderStatus.PAID:
            order.status = OrderStatus.PROCESSING
        OrderStateMachine.validate_transition(order.status, OrderStatus.SHIPPED)
        order.status = OrderStatus.SHIPPED
        order.updated_at = datetime.utcnow()
        return order

    def get_order(self, order_id: str) -> Order:
        if order_id not in self.orders:
            raise KeyError(f"Order {order_id} not found")
        return self.orders[order_id]

    # Baseline stub for cancel_order
    def cancel_order(self, order_id: str, reason: str = "") -> Order:
        order = self.get_order(order_id)
        if order.status in (OrderStatus.SHIPPED, OrderStatus.DELIVERED):
            raise InvalidStateTransitionError(order.status, OrderStatus.CANCELLED, "Shipped or delivered orders cannot be cancelled")
        if order.status == OrderStatus.CANCELLED:
            raise OrderAlreadyFinalizedError(f"Order {order_id} has already been cancelled")
        if order.status == OrderStatus.DRAFT:
            for item in order.items:
                self.inventory.release_reservation(item.sku, item.quantity)
            order.status = OrderStatus.CANCELLED
            order.cancellation_reason = reason
            order.updated_at = datetime.utcnow()
            return order
        # NOTE: Handling of PAID orders, refund issuance, idempotency, and partial status transitions is NOT implemented in baseline!
        raise NotImplementedError("Cancellation for paid orders and comprehensive invariant handling is not implemented.")
