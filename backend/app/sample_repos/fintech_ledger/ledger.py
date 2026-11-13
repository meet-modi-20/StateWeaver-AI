"""
Fintech Double-Entry Ledger Core Engine
"""
from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime

class TransactionStatus(str, Enum):
    INITIALIZED = "INITIALIZED"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    POSTED = "POSTED"
    DISPUTED = "DISPUTED"
    REVERSED = "REVERSED"
    RECONCILED = "RECONCILED"

class AccountType(str, Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"

@dataclass
class Account:
    account_id: str
    name: str
    account_type: AccountType
    balance: float = 0.0

@dataclass
class JournalEntry:
    account_id: str
    debit: float = 0.0
    credit: float = 0.0

@dataclass
class Transaction:
    tx_id: str
    entries: List[JournalEntry]
    description: str
    status: TransactionStatus = TransactionStatus.INITIALIZED
    created_at: datetime = field(default_factory=datetime.utcnow)
    reversal_tx_id: Optional[str] = None

class LedgerService:
    def __init__(self):
        self.accounts: Dict[str, Account] = {
            "1000": Account("1000", "Cash Reserves", AccountType.ASSET, balance=100000.0),
            "2000": Account("2000", "Customer Deposits", AccountType.LIABILITY, balance=100000.0),
            "4000": Account("4000", "Processing Fee Revenue", AccountType.REVENUE, balance=0.0),
        }
        self.transactions: Dict[str, Transaction] = {}

    def post_transaction(self, tx_id: str, entries: List[JournalEntry], description: str) -> Transaction:
        # Double-entry invariant: sum(debit) == sum(credit)
        total_debit = sum(e.debit for e in entries)
        total_credit = sum(e.credit for e in entries)
        if abs(total_debit - total_credit) > 0.001:
            raise ValueError(f"Unbalanced journal entry: Debits ({total_debit}) != Credits ({total_credit})")

        tx = Transaction(tx_id=tx_id, entries=entries, description=description, status=TransactionStatus.POSTED)
        for entry in entries:
            acc = self.accounts[entry.account_id]
            if acc.account_type in (AccountType.ASSET, AccountType.EXPENSE):
                acc.balance += (entry.debit - entry.credit)
            else:
                acc.balance += (entry.credit - entry.debit)

        self.transactions[tx_id] = tx
        return tx
