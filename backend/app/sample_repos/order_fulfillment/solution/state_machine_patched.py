"""
Patched State Machine with cancellation transitions enabled
"""
from typing import Dict, Set
from ..models import OrderStatus

VALID_TRANSITIONS: Dict[OrderStatus, Set[OrderStatus]] = {
    OrderStatus.DRAFT: {OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED},
    OrderStatus.PENDING_PAYMENT: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.PROCESSING, OrderStatus.CANCELLED}, # Added CANCELLED transition from PAID
    OrderStatus.PROCESSING: {OrderStatus.SHIPPED, OrderStatus.CANCELLED}, # Added CANCELLED transition before shipment
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
    OrderStatus.REFUNDED: set(),
}

class InvalidStateTransitionError(Exception):
    def __init__(self, current_state: OrderStatus, target_state: OrderStatus, reason: str = ""):
        self.current_state = current_state
        self.target_state = target_state
        self.reason = reason
        msg = f"Cannot transition order from {current_state.value} to {target_state.value}"
        if reason:
            msg += f": {reason}"
        super().__init__(msg)

class OrderStateMachine:
    @staticmethod
    def can_transition(current: OrderStatus, target: OrderStatus) -> bool:
        allowed = VALID_TRANSITIONS.get(current, set())
        return target in allowed

    @staticmethod
    def validate_transition(current: OrderStatus, target: OrderStatus):
        if not OrderStateMachine.can_transition(current, target):
            raise InvalidStateTransitionError(current, target, "Illegal transition graph traversal")
