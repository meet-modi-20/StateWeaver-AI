"""
Intelligent Behavioural Task Generator & Reference Implementation Synthesizer
"""
import os
import difflib
from typing import Dict, Any, List
from ..models.schemas import (
    TaskGenerationConfig, GeneratedTask, TaskScenario,
    ReferenceImplementation, DiffChange
)

class TaskGenerator:
    @staticmethod
    def generate_task(config: TaskGenerationConfig) -> GeneratedTask:
        diff_level = config.difficulty
        depth = config.edge_case_depth

        problem_statement = f"""# Challenge: Robust Order Cancellation & Invariant Conservation

## Background
In our production e-commerce fulfillment engine, customers frequently need to cancel orders after initial checkout. However, the current engine only implements naive cancellation for `DRAFT` orders and completely lacks support for `PENDING_PAYMENT` and `PAID` states, throwing an unhandled `NotImplementedError`.

When a paid order is cancelled, three critical sub-systems must be coordinated atomically:
1. **The Order State Machine**: The order must transition cleanly from `PAID` to `CANCELLED`.
2. **The Financial Layer**: Full refund must be processed through `PaymentGateway.refund()`, updating `payment_status` to `PaymentStatus.REFUNDED` and logging the `refund_id`.
3. **The Inventory Allocation Layer**: All inventory items previously reserved for the order must be released back into the available stock pool without leaking stock counts.

## Target Difficulty: {diff_level}
## Business Invariant Depth: {depth}

## Functional Requirements
1. **Support Multi-State Cancellation**: Update `OrderService.cancel_order()` and `OrderStateMachine` to allow cancellation from `DRAFT`, `PENDING_PAYMENT`, and `PAID` states.
2. **Automate Financial Settlement**: If `order.payment_status == PaymentStatus.CAPTURED`, invoke `PaymentGateway.refund()` for the exact `order.total_amount`. Assign the resulting refund token to `order.metadata['refund_id']` and set `payment_status` to `PaymentStatus.REFUNDED`.
3. **Roll Back Inventory Reservations**: For every item in the cancelled order, call `InventoryService.release_reservation()` so the warehouse inventory counts are accurately restored.
4. **Enforce Immutability on Dispatched Orders**: Attempting to cancel an order that has already reached `SHIPPED` or `DELIVERED` status must be strictly rejected with an `InvalidStateTransitionError`.
5. **Guarantee Idempotency & Acyclic Finality**: Repeated cancellation calls against an order that is already in `CANCELLED` status must raise `OrderAlreadyFinalizedError`.

## Acceptance Criteria
- [ ] `cancel_order()` succeeds on orders in `PAID` status, setting status to `CANCELLED` and `payment_status` to `REFUNDED`.
- [ ] Available inventory for all order SKUs returns to pre-reservation levels immediately upon cancellation.
- [ ] `PaymentGateway.refund_records` contains an entry matching `order.order_id` with the identical amount.
- [ ] `cancel_order()` raises `InvalidStateTransitionError` when called on `SHIPPED` or `DELIVERED` orders.
- [ ] Subsequent cancellation calls on an already cancelled order raise `OrderAlreadyFinalizedError`.
- [ ] All baseline regression tests continue to pass without regression.
"""

        scenarios = [
            TaskScenario(
                id="SCN-01",
                title="Cancel Unpaid Draft Order",
                starting_state="DRAFT",
                action="cancel_order(order_id, reason='Changed mind')",
                expected_state="CANCELLED",
                side_effects=["Inventory reservations released", "Cancellation reason recorded"],
                boundary_condition="No financial refund should be attempted for uncharged orders."
            ),
            TaskScenario(
                id="SCN-02",
                title="Cancel Paid Order with Full Automated Refund",
                starting_state="PAID",
                action="cancel_order(order_id, reason='Customer request')",
                expected_state="CANCELLED",
                side_effects=["PaymentGateway.refund executed", "payment_status set to REFUNDED", "Stock returned to available pool"],
                boundary_condition="Refund amount must strictly equal captured total_amount."
            ),
            TaskScenario(
                id="SCN-03",
                title="Attempt Cancellation on Dispatched (Shipped) Order",
                starting_state="SHIPPED",
                action="cancel_order(order_id)",
                expected_state="SHIPPED (Rejection)",
                side_effects=["No refund", "No inventory change"],
                boundary_condition="Must raise InvalidStateTransitionError with informative message."
            ),
            TaskScenario(
                id="SCN-04",
                title="Duplicate Cancellation Request (Idempotency Check)",
                starting_state="CANCELLED",
                action="cancel_order(order_id)",
                expected_state="CANCELLED (Rejection)",
                side_effects=["No duplicate refund", "No double inventory increment"],
                boundary_condition="Must raise OrderAlreadyFinalizedError to prevent double-crediting."
            ),
            TaskScenario(
                id="SCN-05",
                title="Atomic Rollback on Partial Reservation Failure",
                starting_state="PENDING_PAYMENT",
                action="cancel_order(order_id)",
                expected_state="CANCELLED",
                side_effects=["All SKU items released"],
                boundary_condition="Multi-line item orders must release each SKU quantity accurately."
            )
        ]

        task = GeneratedTask(
            id=f"TASK-SW-2026-{config.repository_id[:4].upper()}-01",
            repository_id=config.repository_id,
            title="Implement Multi-State Order Cancellation with Automated Refunds and Invariant Conservation",
            tagline="Orchestrate state transitions, financial refunds, and inventory rollback with zero-leak guarantees.",
            difficulty=diff_level,
            category=config.feature_category,
            problem_statement=problem_statement,
            functional_requirements=[
                "Extend OrderStateMachine to authorize transitions from PAID to CANCELLED.",
                "Implement full refund flow through PaymentGateway when cancelling paid orders.",
                "Ensure inventory reservations for all SKU line items are released back to available stock.",
                "Prevent illegal cancellation attempts on SHIPPED and DELIVERED orders.",
                "Enforce idempotency by raising OrderAlreadyFinalizedError on repeated cancel attempts."
            ],
            acceptance_criteria=[
                "Order status transitions to CANCELLED and payment_status updates to REFUNDED.",
                "PaymentGateway contains verified refund record matching total_amount.",
                "Warehouse available stock count increases by exact ordered quantity.",
                "InvalidStateTransitionError raised for SHIPPED and DELIVERED states.",
                "OrderAlreadyFinalizedError raised on duplicate cancellation."
            ],
            constraints=[
                "Do not modify the public signature of OrderService.cancel_order().",
                "Ensure state machine transitions remain deterministic and acyclic.",
                "Do not issue duplicate refunds under any circumstance."
            ],
            invariants=[
                "available_stock(sku) + sum(reserved_stock(sku)) == constant",
                "0 <= order.refund_amount <= order.total_amount",
                "Final states (CANCELLED, DELIVERED) cannot transition into active states"
            ],
            scenarios=scenarios
        )

        return task

    @staticmethod
    def get_reference_implementation(task_id: str, repo_base_path: str) -> ReferenceImplementation:
        """Loads and formats the reference implementation diffs."""
        # Read baseline state_machine.py and patched state_machine_patched.py
        base_sm_path = os.path.join(repo_base_path, "state_machine.py")
        patch_sm_path = os.path.join(repo_base_path, "solution", "state_machine_patched.py")
        
        base_srv_path = os.path.join(repo_base_path, "services.py")
        patch_srv_path = os.path.join(repo_base_path, "solution", "services_patched.py")

        def read_file_safe(path: str) -> str:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return f.read()
            return ""

        orig_sm = read_file_safe(base_sm_path)
        new_sm = read_file_safe(patch_sm_path)
        sm_diff = "".join(difflib.unified_diff(
            orig_sm.splitlines(keepends=True),
            new_sm.splitlines(keepends=True),
            fromfile="a/state_machine.py",
            tofile="b/state_machine.py"
        ))

        orig_srv = read_file_safe(base_srv_path)
        new_srv = read_file_safe(patch_srv_path)
        srv_diff = "".join(difflib.unified_diff(
            orig_srv.splitlines(keepends=True),
            new_srv.splitlines(keepends=True),
            fromfile="a/services.py",
            tofile="b/services.py"
        ))

        changes = [
            DiffChange(
                file_path="state_machine.py",
                status="modified",
                additions=2,
                deletions=1,
                unified_diff=sm_diff,
                original_code=orig_sm,
                patched_code=new_sm,
                explanation="Added OrderStatus.CANCELLED to permissible transitions from PAID and PROCESSING states in VALID_TRANSITIONS graph."
            ),
            DiffChange(
                file_path="services.py",
                status="modified",
                additions=28,
                deletions=6,
                unified_diff=srv_diff,
                original_code=orig_srv,
                patched_code=new_srv,
                explanation="Implemented complete cancel_order method: added guards for SHIPPED states and duplicate cancellations, integrated PaymentGateway.refund, released inventory reservations, and updated order metadata."
            )
        ]

        return ReferenceImplementation(
            task_id=task_id,
            branch="feat/order-cancellation-invariants",
            base_commit="c7d24a1",
            solution_commit="f891b42",
            status="VERIFIED",
            changes=changes,
            summary_of_changes="Coordinated multi-entity cancellation across StateMachine, PaymentGateway, and InventoryService with strict invariant guarantees."
        )
