"""
Baseline Regression Test Suite for Order Fulfillment
"""
import unittest
from backend.app.sample_repos.order_fulfillment.models import OrderStatus, OrderItem, PaymentStatus
from backend.app.sample_repos.order_fulfillment.services import OrderService, InventoryService, PaymentGateway

class TestBaselineOrderFlow(unittest.TestCase):
    def setUp(self):
        self.inventory = InventoryService()
        self.payment = PaymentGateway()
        self.service = OrderService(self.inventory, self.payment)
        self.items = [
            OrderItem(sku="SKU-MACBOOK", name="MacBook Pro", unit_price=1999.0, quantity=1),
            OrderItem(sku="SKU-CABLE", name="USB-C Cable", unit_price=19.0, quantity=2),
        ]

    def test_create_order_reserves_inventory(self):
        initial_stock = self.inventory.get_stock("SKU-MACBOOK")
        order = self.service.create_order("CUST-101", self.items)
        self.assertEqual(order.status, OrderStatus.DRAFT)
        self.assertEqual(self.inventory.get_stock("SKU-MACBOOK"), initial_stock - 1)
        self.assertEqual(order.total_amount, 2037.0)

    def test_submit_and_pay_order(self):
        order = self.service.create_order("CUST-101", self.items)
        self.service.submit_for_payment(order.order_id)
        self.assertEqual(order.status, OrderStatus.PENDING_PAYMENT)
        self.service.process_payment(order.order_id)
        self.assertEqual(order.status, OrderStatus.PAID)
        self.assertEqual(order.payment_status, PaymentStatus.CAPTURED)

    def test_ship_order_lifecycle(self):
        order = self.service.create_order("CUST-101", self.items)
        self.service.submit_for_payment(order.order_id)
        self.service.process_payment(order.order_id)
        self.service.ship_order(order.order_id)
        self.assertEqual(order.status, OrderStatus.SHIPPED)

    def test_cancel_draft_order_releases_stock(self):
        initial_stock = self.inventory.get_stock("SKU-MACBOOK")
        order = self.service.create_order("CUST-101", self.items)
        self.assertEqual(self.inventory.get_stock("SKU-MACBOOK"), initial_stock - 1)
        self.service.cancel_order(order.order_id, reason="Customer changed mind")
        self.assertEqual(order.status, OrderStatus.CANCELLED)
        self.assertEqual(self.inventory.get_stock("SKU-MACBOOK"), initial_stock)

if __name__ == "__main__":
    unittest.main()
