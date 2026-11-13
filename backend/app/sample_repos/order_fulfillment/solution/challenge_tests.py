"""
Comprehensive Evaluation Test Suite for Order Cancellation Challenge
Categorized into: Functional, Edge Cases, Invariants, and Regression.
"""
import unittest
from backend.app.sample_repos.order_fulfillment.models import OrderStatus, OrderItem, PaymentStatus
from backend.app.sample_repos.order_fulfillment.solution.services_patched import (
    OrderService, InventoryService, PaymentGateway,
    InvalidStateTransitionError, OrderAlreadyFinalizedError
)

class TestFunctionalRequirements(unittest.TestCase):
    """Category 1: Functional Business Logic Tests"""
    def setUp(self):
        self.inventory = InventoryService()
        self.payment = PaymentGateway()
        self.service = OrderService(self.inventory, self.payment)
        self.items = [
            OrderItem(sku="SKU-MACBOOK", name="MacBook Pro", unit_price=1999.0, quantity=1),
            OrderItem(sku="SKU-KEYBOARD", name="Magic Keyboard", unit_price=99.0, quantity=1),
        ]

    def test_cancel_draft_order_releases_all_inventory(self):
        initial_mac = self.inventory.get_stock("SKU-MACBOOK")
        initial_kb = self.inventory.get_stock("SKU-KEYBOARD")
        
        order = self.service.create_order("CUST-201", self.items)
        self.assertEqual(self.inventory.get_stock("SKU-MACBOOK"), initial_mac - 1)
        self.assertEqual(self.inventory.get_stock("SKU-KEYBOARD"), initial_kb - 1)
        
        cancelled = self.service.cancel_order(order.order_id, reason="Changed mind")
        self.assertEqual(cancelled.status, OrderStatus.CANCELLED)
        self.assertEqual(cancelled.cancellation_reason, "Changed mind")
        self.assertEqual(self.inventory.get_stock("SKU-MACBOOK"), initial_mac)
        self.assertEqual(self.inventory.get_stock("SKU-KEYBOARD"), initial_kb)

    def test_cancel_pending_payment_order(self):
        order = self.service.create_order("CUST-202", self.items)
        self.service.submit_for_payment(order.order_id)
        self.assertEqual(order.status, OrderStatus.PENDING_PAYMENT)
        
        cancelled = self.service.cancel_order(order.order_id, reason="Card declined")
        self.assertEqual(cancelled.status, OrderStatus.CANCELLED)

    def test_cancel_paid_order_triggers_refund_and_releases_inventory(self):
        initial_mac = self.inventory.get_stock("SKU-MACBOOK")
        order = self.service.create_order("CUST-203", self.items)
        self.service.submit_for_payment(order.order_id)
        self.service.process_payment(order.order_id)
        self.assertEqual(order.status, OrderStatus.PAID)
        self.assertEqual(order.payment_status, PaymentStatus.CAPTURED)

        cancelled = self.service.cancel_order(order.order_id, reason="Customer requested refund")
        self.assertEqual(cancelled.status, OrderStatus.CANCELLED)
        self.assertEqual(cancelled.payment_status, PaymentStatus.REFUNDED)
        self.assertEqual(cancelled.refund_amount, 2098.0)
        self.assertIn("refund_id", cancelled.metadata)
        self.assertEqual(self.inventory.get_stock("SKU-MACBOOK"), initial_mac)


class TestEdgeCases(unittest.TestCase):
    """Category 2: Edge Cases & Boundary Conditions"""
    def setUp(self):
        self.inventory = InventoryService()
        self.payment = PaymentGateway()
        self.service = OrderService(self.inventory, self.payment)
        self.items = [OrderItem(sku="SKU-IPHONE", name="iPhone 16", unit_price=999.0, quantity=2)]

    def test_cannot_cancel_shipped_order(self):
        order = self.service.create_order("CUST-301", self.items)
        self.service.submit_for_payment(order.order_id)
        self.service.process_payment(order.order_id)
        self.service.ship_order(order.order_id)
        self.assertEqual(order.status, OrderStatus.SHIPPED)

        with self.assertRaises(InvalidStateTransitionError) as ctx:
            self.service.cancel_order(order.order_id, reason="Late cancellation")
        self.assertIn("SHIPPED", str(ctx.exception))

    def test_duplicate_cancellation_rejection(self):
        order = self.service.create_order("CUST-302", self.items)
        self.service.cancel_order(order.order_id, reason="First cancel")
        self.assertEqual(order.status, OrderStatus.CANCELLED)

        # Attempting second cancellation must be rejected idempotently
        with self.assertRaises(OrderAlreadyFinalizedError):
            self.service.cancel_order(order.order_id, reason="Duplicate cancel")

    def test_cancellation_of_empty_sku_order_handles_gracefully(self):
        order = self.service.create_order("CUST-303", [])
        cancelled = self.service.cancel_order(order.order_id, reason="Empty order")
        self.assertEqual(cancelled.status, OrderStatus.CANCELLED)


class TestBusinessInvariants(unittest.TestCase):
    """Category 3: Business Invariant Conservation Laws"""
    def setUp(self):
        self.inventory = InventoryService()
        self.payment = PaymentGateway()
        self.service = OrderService(self.inventory, self.payment)

    def test_stock_conservation_invariant(self):
        initial_stock = self.inventory.get_stock("SKU-IPHONE")
        order1 = self.service.create_order("CUST-401", [OrderItem("SKU-IPHONE", "iPhone", 999.0, 5)])
        order2 = self.service.create_order("CUST-402", [OrderItem("SKU-IPHONE", "iPhone", 999.0, 3)])
        
        # Stock conservation: stock + reserved == initial_stock
        current_stock = self.inventory.get_stock("SKU-IPHONE")
        reserved_stock = self.inventory._reserved.get("SKU-IPHONE", 0)
        self.assertEqual(current_stock + reserved_stock, initial_stock)

        # Cancel one order
        self.service.cancel_order(order1.order_id, "Stock test")
        current_stock = self.inventory.get_stock("SKU-IPHONE")
        reserved_stock = self.inventory._reserved.get("SKU-IPHONE", 0)
        self.assertEqual(current_stock + reserved_stock, initial_stock)

    def test_financial_solvency_invariant(self):
        order = self.service.create_order("CUST-403", [OrderItem("SKU-IPHONE", "iPhone", 999.0, 1)])
        self.service.submit_for_payment(order.order_id)
        self.service.process_payment(order.order_id)
        
        cancelled = self.service.cancel_order(order.order_id, "Refund check")
        tx = self.payment.transactions[order.order_id]
        ref = self.payment.refund_records[order.order_id]
        # Invariant: Refunded amount must exactly match charged amount, never exceeding it
        self.assertEqual(ref["amount"], tx["amount"])
        self.assertEqual(cancelled.refund_amount, tx["amount"])


class TestRegressionBaselines(unittest.TestCase):
    """Category 4: Regression Tests - Preserving Baseline Operations"""
    def setUp(self):
        self.inventory = InventoryService()
        self.payment = PaymentGateway()
        self.service = OrderService(self.inventory, self.payment)

    def test_standard_order_to_delivery_happy_path_unaffected(self):
        order = self.service.create_order("CUST-501", [OrderItem("SKU-CABLE", "Cable", 19.0, 2)])
        self.service.submit_for_payment(order.order_id)
        self.service.process_payment(order.order_id)
        self.service.ship_order(order.order_id)
        self.assertEqual(order.status, OrderStatus.SHIPPED)

if __name__ == "__main__":
    unittest.main()
