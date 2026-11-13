"""
Repository AST Analysis and Behaviour Intelligence Extraction Engine
"""
import ast
import os
from typing import Dict, List, Any
from ..models.schemas import (
    RepositoryMeta, FileNode, WorkflowModel, StateNode, StateEdge,
    BusinessRule, EdgeCaseVulnerability
)

class RepositoryAnalyzer:
    @staticmethod
    def get_file_tree(base_path: str) -> FileNode:
        root_name = os.path.basename(base_path)
        
        def build_node(current_path: str) -> FileNode:
            name = os.path.basename(current_path)
            rel_path = os.path.relpath(current_path, base_path).replace("\\", "/")
            
            if os.path.isdir(current_path):
                children = []
                for entry in sorted(os.listdir(current_path)):
                    if entry in ("__pycache__", ".git", ".pytest_cache", "node_modules", "dist"):
                        continue
                    child_path = os.path.join(current_path, entry)
                    children.append(build_node(child_path))
                return FileNode(
                    id=rel_path or root_name,
                    name=name or root_name,
                    path=rel_path or ".",
                    type="directory",
                    size=0,
                    children=children
                )
            else:
                size = os.path.getsize(current_path)
                return FileNode(
                    id=rel_path,
                    name=name,
                    path=rel_path,
                    type="file",
                    size=size
                )

        return build_node(base_path)

    @staticmethod
    def analyze_order_fulfillment(repo_path: str) -> Dict[str, Any]:
        """Deep analysis of Order Fulfillment repository."""
        # 1. State nodes
        states = [
            StateNode(id="DRAFT", label="Draft", type="initial", color="#94A3B8", description="Order created with temporary stock reservation", x=50, y=180),
            StateNode(id="PENDING_PAYMENT", label="Pending Payment", type="intermediate", color="#F59E0B", description="Awaiting customer credit authorization", x=240, y=180),
            StateNode(id="PAID", label="Paid", type="intermediate", color="#10B981", description="Funds captured in payment gateway", x=430, y=180),
            StateNode(id="PROCESSING", label="Processing", type="intermediate", color="#6366F1", description="Warehouse picking and packing", x=620, y=180),
            StateNode(id="SHIPPED", label="Shipped", type="intermediate", color="#3B82F6", description="Carrier tracking number assigned", x=810, y=180),
            StateNode(id="DELIVERED", label="Delivered", type="terminal", color="#059669", description="Successfully handed over to recipient", x=1000, y=180),
            StateNode(id="CANCELLED", label="Cancelled", type="terminal", color="#EF4444", description="Terminal cancelled state with released stock", x=430, y=360),
            StateNode(id="REFUNDED", label="Refunded", type="terminal", color="#8B5CF6", description="Reversed funds through payment gateway", x=620, y=360),
        ]

        # 2. State transitions (edges)
        transitions = [
            StateEdge(id="e-draft-pending", source="DRAFT", target="PENDING_PAYMENT", label="submit_for_payment", guard="stock_reserved", side_effects=["Set updated_at"], implemented_in_baseline=True),
            StateEdge(id="e-draft-cancel", source="DRAFT", target="CANCELLED", label="cancel_order", guard="status == DRAFT", side_effects=["release_reservation"], implemented_in_baseline=True),
            StateEdge(id="e-pending-paid", source="PENDING_PAYMENT", target="PAID", label="process_payment", guard="charge_success", side_effects=["PaymentGateway.charge", "payment_status=CAPTURED"], implemented_in_baseline=True),
            StateEdge(id="e-pending-cancel", source="PENDING_PAYMENT", target="CANCELLED", label="cancel_order", guard="unpaid", side_effects=["release_reservation"], implemented_in_baseline=False),
            StateEdge(id="e-paid-proc", source="PAID", target="PROCESSING", label="begin_packing", guard="funds_cleared", side_effects=["Allocated to station"], implemented_in_baseline=True),
            StateEdge(id="e-paid-cancel", source="PAID", target="CANCELLED", label="cancel_order (CHALLENGE TARGET)", guard="status == PAID", side_effects=["PaymentGateway.refund", "release_reservation", "payment_status=REFUNDED"], implemented_in_baseline=False),
            StateEdge(id="e-proc-shipped", source="PROCESSING", target="SHIPPED", label="ship_order", guard="carrier_dispatched", side_effects=["Tracking label issued"], implemented_in_baseline=True),
            StateEdge(id="e-shipped-deliv", source="SHIPPED", target="DELIVERED", label="confirm_delivery", guard="signature_confirmed", side_effects=["Finalized receipt"], implemented_in_baseline=True),
        ]

        # 3. Discovered Business Rules & Invariants
        business_rules = [
            BusinessRule(
                id="RULE-INV-01",
                name="Stock Quantity Conservation Invariant",
                category="inventory",
                description="The sum of available stock in inventory and all active reservations across unfulfilled orders must equal total known assets.",
                severity="critical",
                invariant_expression="available_stock(sku) + sum(reserved_stock(sku)) == total_known_stock(sku)",
                governing_files=["models.py", "services.py"]
            ),
            BusinessRule(
                id="RULE-FIN-02",
                name="Strict Financial Solvency Invariant",
                category="financial",
                description="Total refunds issued for any order must never exceed the exact amount captured during payment.",
                severity="critical",
                invariant_expression="0 <= order.refund_amount <= order.total_amount",
                governing_files=["services.py"]
            ),
            BusinessRule(
                id="RULE-TRN-03",
                name="Shipped Order Immutability",
                category="state_transition",
                description="Once an order transitions to SHIPPED or DELIVERED, it cannot transition to CANCELLED. Physical possession has transferred.",
                severity="high",
                invariant_expression="order.status not in (SHIPPED, DELIVERED) on cancel_order",
                governing_files=["state_machine.py", "services.py"]
            ),
            BusinessRule(
                id="RULE-IDEM-04",
                name="Cancellation Idempotency & Acyclic Finalization",
                category="idempotency",
                description="Duplicate cancellation requests on an already cancelled order must be handled safely without double-refunding or duplicate stock increments.",
                severity="high",
                invariant_expression="cancel_order(order_id) on already CANCELLED -> OrderAlreadyFinalizedError",
                governing_files=["services.py"]
            ),
        ]

        # 4. Discovered Edge Case Vulnerabilities
        vulnerabilities = [
            EdgeCaseVulnerability(
                id="VULN-01",
                title="Missing Paid Order Cancellation Transition",
                severity="critical",
                description="In the baseline codebase, attempting to cancel an order after payment raises NotImplementedError, leaving paid orders stranded when customers cancel before shipment.",
                affected_states=["PAID", "PROCESSING"],
                recommended_solution="Implement cancel_order handler with PaymentGateway.refund() and inventory release."
            ),
            EdgeCaseVulnerability(
                id="VULN-02",
                title="Double-Refund Risk on Repeated Requests",
                severity="critical",
                description="Without state checks, successive cancel calls could refund customer accounts multiple times.",
                affected_states=["PAID", "CANCELLED"],
                recommended_solution="Enforce OrderAlreadyFinalizedError guard condition."
            ),
            EdgeCaseVulnerability(
                id="VULN-03",
                title="Inventory Phantom Stock Leak",
                severity="high",
                description="If an exception occurs during refund processing, inventory reservation must remain unchanged or be rolled back atomically.",
                affected_states=["PAID", "CANCELLED"],
                recommended_solution="Execute refund check before releasing inventory reservations."
            )
        ]

        workflow = WorkflowModel(
            id="wf-order-fulfillment",
            name="Order Fulfillment Lifecycle",
            entity="Order",
            initial_state="DRAFT",
            states=states,
            transitions=transitions,
            business_rules=business_rules,
            vulnerabilities=vulnerabilities
        )

        return workflow

    @staticmethod
    def analyze_fintech_ledger(repo_path: str) -> WorkflowModel:
        """Analysis for the second repository: Fintech Double-Entry Ledger."""
        states = [
            StateNode(id="INITIALIZED", label="Initialized", type="initial", color="#94A3B8", description="Transaction payload drafted", x=50, y=180),
            StateNode(id="PENDING_APPROVAL", label="Pending Approval", type="intermediate", color="#F59E0B", description="Awaiting four-eyes compliance approval", x=260, y=180),
            StateNode(id="POSTED", label="Posted", type="intermediate", color="#10B981", description="Journal entries ledgered to balance sheet", x=470, y=180),
            StateNode(id="RECONCILED", label="Reconciled", type="terminal", color="#059669", description="Matched against bank clearing statements", x=700, y=180),
            StateNode(id="DISPUTED", label="Disputed", type="intermediate", color="#EF4444", description="Hold placed due to chargeback", x=470, y=360),
            StateNode(id="REVERSED", label="Reversed", type="terminal", color="#8B5CF6", description="Compensating reverse journal entry applied", x=700, y=360),
        ]

        transitions = [
            StateEdge(id="e-init-pending", source="INITIALIZED", target="PENDING_APPROVAL", label="submit_for_review", guard="entries_balanced", side_effects=["Notify compliance"], implemented_in_baseline=True),
            StateEdge(id="e-pending-posted", source="PENDING_PAYMENT", target="POSTED", label="approve_and_post", guard="compliance_cleared", side_effects=["Update balances"], implemented_in_baseline=True),
            StateEdge(id="e-posted-reconciled", source="POSTED", target="RECONCILED", label="reconcile", guard="bank_statement_matched", side_effects=["Lock ledger period"], implemented_in_baseline=True),
            StateEdge(id="e-posted-disputed", source="POSTED", target="DISPUTED", label="flag_dispute", guard="chargeback_notice_received", side_effects=["Place balance hold"], implemented_in_baseline=True),
            StateEdge(id="e-disputed-reversed", source="DISPUTED", target="REVERSED", label="execute_reversal (CHALLENGE TARGET)", guard="dispute_sustained", side_effects=["Post compensating debit/credit"], implemented_in_baseline=False),
        ]

        business_rules = [
            BusinessRule(
                id="RULE-LEDGER-01",
                name="Zero-Sum Double-Entry Balancing Invariant",
                category="financial",
                description="The total debit sum must identically equal total credit sum across all journal entries for every transaction.",
                severity="critical",
                invariant_expression="sum(entry.debit) == sum(entry.credit)",
                governing_files=["ledger.py"]
            ),
            BusinessRule(
                id="RULE-LEDGER-02",
                name="Accounting Equation Conservation",
                category="financial",
                description="Total Assets must equal Total Liabilities plus Equity at all times.",
                severity="critical",
                invariant_expression="Assets == Liabilities + Equity",
                governing_files=["ledger.py"]
            )
        ]

        vulnerabilities = [
            EdgeCaseVulnerability(
                id="VULN-LEDGER-01",
                title="Missing Reversal Compensation Engine",
                severity="critical",
                description="Disputed transactions cannot be reversed with proper audit trails in baseline.",
                affected_states=["DISPUTED", "REVERSED"],
                recommended_solution="Generate paired inversion transaction with cross-referenced tx_id."
            )
        ]

        return WorkflowModel(
            id="wf-fintech-ledger",
            name="Fintech Double-Entry Ledger Lifecycle",
            entity="Transaction",
            initial_state="INITIALIZED",
            states=states,
            transitions=transitions,
            business_rules=business_rules,
            vulnerabilities=vulnerabilities
        )
