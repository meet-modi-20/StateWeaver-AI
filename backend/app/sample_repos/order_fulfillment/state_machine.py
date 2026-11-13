"""
State Machine Engine for Order Lifecycle
"""
from typing import Dict, Set
from .models import OrderStatus

# Permissible state transitions in the baseline system
VALID_TRANSITIONS: Dict[OrderStatus, Set[OrderStatus]] = {
    OrderStatus.DRAFT: {OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED},
    OrderStatus.PENDING_PAYMENT: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.PROCESSING}, # Notice: In baseline, CANCELLED from PAID is not yet supported or implemented
    OrderStatus.PROCESSING: {OrderStatus.SHIPPED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
    OrderStatus.REFUNDED: set(),
}

class InvalidStateTransitionError(Exception):
    """Raised when an illegal order status transition is attempted."""
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
