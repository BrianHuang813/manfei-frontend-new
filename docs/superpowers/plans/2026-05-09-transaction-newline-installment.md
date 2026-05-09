# Transaction Newline & Installment Payment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓消費記錄的項目名稱支援換行顯示，並新增分期付款功能（建立時設定計畫，逐期記錄繳款，統計顯示剩餘）。

**Architecture:** Feature 1 純前端修改（`<textarea>` + `whitespace-pre-wrap`）。Feature 2 後端新增 5 個欄位到 `transactions` table + 一個 `/pay` 端點，前端新增分期 UI 流程，資料計算在前端完成（remaining = amount - paid_amount）。

**Tech Stack:** FastAPI, SQLAlchemy (async), Alembic, PostgreSQL, React + TanStack Query, Tailwind CSS

---

## File Map

| 檔案 | 異動類型 | 說明 |
|---|---|---|
| `backend/alembic/versions/20260509_0900_b1c2d3e4_add_installment_fields.py` | 新增 | DB migration |
| `backend/models.py` | 修改 | Transaction model 新增 5 欄位 |
| `backend/schemas.py` | 修改 | 更新 3 個 schema，新增 InstallmentPayRequest |
| `backend/routers/admin_router.py` | 修改 | 更新 create/update route，新增 /pay endpoint |
| `frontend-new/src/api/admin.js` | 修改 | 新增 payInstallment helper |
| `frontend-new/src/pages/admin/Customers.jsx` | 修改 | 所有前端 UI 變更 |

---

## Task 1: DB Migration — 新增分期欄位

**Files:**
- Create: `backend/alembic/versions/20260509_0900_b1c2d3e4_add_installment_fields.py`

- [ ] **Step 1: 建立 migration 檔案**

```python
"""add_installment_fields_to_transactions

Revision ID: b1c2d3e4
Revises: a3f5b9e2
Create Date: 2026-05-09 09:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b1c2d3e4'
down_revision: Union[str, None] = 'a3f5b9e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('transactions', sa.Column('is_installment', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('transactions', sa.Column('total_installments', sa.Integer(), nullable=True))
    op.add_column('transactions', sa.Column('amount_per_installment', sa.Integer(), nullable=True))
    op.add_column('transactions', sa.Column('paid_installments', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('transactions', sa.Column('paid_amount', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('transactions', 'paid_amount')
    op.drop_column('transactions', 'paid_installments')
    op.drop_column('transactions', 'amount_per_installment')
    op.drop_column('transactions', 'total_installments')
    op.drop_column('transactions', 'is_installment')
```

- [ ] **Step 2: 執行 migration**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
alembic upgrade head
```

Expected: `Running upgrade a3f5b9e2 -> b1c2d3e4, add_installment_fields_to_transactions`

- [ ] **Step 3: 驗證欄位已存在**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
python -c "
from database import engine
import asyncio, sqlalchemy as sa

async def check():
    async with engine.connect() as conn:
        result = await conn.execute(sa.text(\"SELECT column_name FROM information_schema.columns WHERE table_name='transactions' AND column_name LIKE '%installment%' OR column_name='paid_amount'\"))
        print([r[0] for r in result.fetchall()])

asyncio.run(check())
"
```

Expected: `['is_installment', 'total_installments', 'amount_per_installment', 'paid_installments', 'paid_amount']` 或類似順序。

- [ ] **Step 4: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
git add alembic/versions/20260509_0900_b1c2d3e4_add_installment_fields.py
git commit -m "feat: add installment fields migration to transactions table"
```

---

## Task 2: Backend Model — 更新 Transaction

**Files:**
- Modify: `backend/models.py` (Transaction class, 第 171 行附近)

- [ ] **Step 1: 在 Transaction class 的 `deleted_at` 欄位後新增 5 個欄位**

找到 `deleted_at` 那行（第 189 行），在它後面、`user = relationship` 前面插入：

```python
    # Installment payment fields (nullable = non-installment transactions)
    is_installment = Column(Boolean, nullable=False, default=False, server_default='false')
    total_installments = Column(Integer, nullable=True)
    amount_per_installment = Column(Integer, nullable=True)
    paid_installments = Column(Integer, nullable=False, default=0, server_default='0')
    paid_amount = Column(Integer, nullable=False, default=0, server_default='0')
```

- [ ] **Step 2: 驗證 import 可成功（不需要啟動 server）**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
python -c "from models import Transaction; print([c.name for c in Transaction.__table__.columns])"
```

Expected: list 中包含 `is_installment`, `total_installments`, `amount_per_installment`, `paid_installments`, `paid_amount`。

- [ ] **Step 3: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
git add models.py
git commit -m "feat: add installment columns to Transaction model"
```

---

## Task 3: Backend Schemas — 更新 & 新增

**Files:**
- Modify: `backend/schemas.py`

- [ ] **Step 1: 更新 TransactionCreate（第 310 行附近）**

替換整個 `TransactionCreate` class：

```python
class TransactionCreate(BaseModel):
    service_name: str = Field(..., min_length=1, max_length=255)
    amount: int = Field(..., ge=0)
    transaction_date: Optional[Date] = None
    is_installment: bool = False
    total_installments: Optional[int] = Field(None, ge=2, le=120)
    amount_per_installment: Optional[int] = Field(None, ge=0)
```

- [ ] **Step 2: 更新 TransactionUpdate（第 316 行附近）**

替換整個 `TransactionUpdate` class：

```python
class TransactionUpdate(BaseModel):
    service_name: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[int] = Field(None, ge=0)
    transaction_date: Optional[Date] = None
    total_installments: Optional[int] = Field(None, ge=2, le=120)
    amount_per_installment: Optional[int] = Field(None, ge=0)
```

- [ ] **Step 3: 更新 TransactionResponse（第 322 行附近）**

替換整個 `TransactionResponse` class：

```python
class TransactionResponse(BaseModel):
    id: _uuid.UUID
    user_id: _uuid.UUID
    service_name: str
    amount: int
    transaction_date: Date
    sort_order: int
    is_installment: bool
    total_installments: Optional[int] = None
    amount_per_installment: Optional[int] = None
    paid_installments: int
    paid_amount: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

- [ ] **Step 4: 在 TransactionBatchSort 之後新增 InstallmentPayRequest**

在 `TransactionBatchSort` class 後面（`# ==================== Member / Customer Schemas` 之前）新增：

```python
class InstallmentPayRequest(BaseModel):
    amount: int = Field(..., ge=0)
```

- [ ] **Step 5: 驗證 schemas import 成功**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
python -c "from schemas import TransactionCreate, TransactionUpdate, TransactionResponse, InstallmentPayRequest; print('OK')"
```

Expected: `OK`

- [ ] **Step 6: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
git add schemas.py
git commit -m "feat: update transaction schemas for installment support"
```

---

## Task 4: Backend Routes — 更新 create/update，新增 /pay

**Files:**
- Modify: `backend/routers/admin_router.py`

- [ ] **Step 1: 在 import 行加入 InstallmentPayRequest**

找到 admin_router.py 第 23 行附近的 import：

```python
from schemas import (
    ...
    TransactionCreate, TransactionResponse, TransactionUpdate, TransactionBatchSort,
    ...
)
```

在 `TransactionBatchSort` 後加上 `, InstallmentPayRequest`：

```python
    TransactionCreate, TransactionResponse, TransactionUpdate, TransactionBatchSort,
    InstallmentPayRequest,
```

- [ ] **Step 2: 更新 create_customer_transaction（第 807 行附近）**

找到 `txn = Transaction(` 那段，替換成：

```python
    txn = Transaction(
        user_id=user_id,
        service_name=payload.service_name,
        amount=payload.amount,
        transaction_date=transaction_date,
        sort_order=next_sort_order,
        is_installment=payload.is_installment,
        total_installments=payload.total_installments if payload.is_installment else None,
        amount_per_installment=payload.amount_per_installment if payload.is_installment else None,
        paid_installments=0,
        paid_amount=0,
    )
```

- [ ] **Step 3: 更新 update_customer_transaction（第 862 行附近）**

找到 `# Update only provided fields` 那段，在 `transaction_date` 的更新之後加入：

```python
    if payload.total_installments is not None:
        txn.total_installments = payload.total_installments
    if payload.amount_per_installment is not None:
        txn.amount_per_installment = payload.amount_per_installment
```

- [ ] **Step 4: 在 `reorder_customer_transactions` 之前新增 `/pay` endpoint**

在 `@router.patch("/customers/{user_id}/transactions/reorder"` 之前插入：

```python
@router.post("/customers/{user_id}/transactions/{txn_id}/pay", response_model=TransactionResponse)
async def pay_installment(
    user_id: uuid.UUID,
    txn_id: uuid.UUID,
    payload: InstallmentPayRequest,
    db: AsyncSession = Depends(get_db),
):
    """Record one installment payment, incrementing paid_installments and paid_amount."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == txn_id,
            Transaction.user_id == user_id,
            Transaction.deleted_at.is_(None),
        )
    )
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="消費記錄不存在")
    if not txn.is_installment:
        raise HTTPException(status_code=400, detail="此記錄非分期付款")
    if txn.paid_installments >= txn.total_installments:
        raise HTTPException(status_code=400, detail="分期已全數繳清")

    txn.paid_installments += 1
    txn.paid_amount += payload.amount
    await db.commit()
    await db.refresh(txn)
    return txn

```

- [ ] **Step 5: 啟動後端確認無 import/syntax 錯誤**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
python -c "from routers.admin_router import router; print('router OK')"
```

Expected: `router OK`

- [ ] **Step 6: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/backend
git add routers/admin_router.py
git commit -m "feat: add installment pay endpoint and update create/update routes"
```

---

## Task 5: Frontend API — 新增 payInstallment helper

**Files:**
- Modify: `frontend-new/src/api/admin.js`

- [ ] **Step 1: 在 `reorderCustomerTransactions` 函式後面新增**

```javascript
/**
 * Record one installment payment for a transaction.
 * @param {string} userId
 * @param {string} txnId
 * @param {{ amount: number }} payData
 * @returns {Promise<Object>} Updated transaction
 */
export const payInstallment = async (userId, txnId, payData) => {
  const { data } = await api.post(`/api/admin/customers/${userId}/transactions/${txnId}/pay`, payData)
  return data
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
git add src/api/admin.js
git commit -m "feat: add payInstallment API helper"
```

---

## Task 6: 前端 — 換行支援（Feature 1）

**Files:**
- Modify: `frontend-new/src/pages/admin/Customers.jsx`

這個 task 只改 3 個地方，可以獨立完成。

- [ ] **Step 1: 新增表單的 input 改為 textarea（第 421 行附近）**

找到新增表單的 `service_name` input：

```jsx
                      <input
                        type="text"
                        value={newTxn.service_name}
                        onChange={(e) => setNewTxn((p) => ({ ...p, service_name: e.target.value }))}
                        placeholder="例：深層護膚療程"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
```

替換成：

```jsx
                      <textarea
                        rows={2}
                        value={newTxn.service_name}
                        onChange={(e) => setNewTxn((p) => ({ ...p, service_name: e.target.value }))}
                        placeholder="例：深層護膚療程"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        required
                      />
```

- [ ] **Step 2: 編輯 Modal 的 input 改為 textarea（第 542 行附近）**

找到編輯 Modal 的 `service_name` input：

```jsx
                        <input
                          type="text"
                          value={editingTxn.service_name}
                          onChange={(e) => setEditingTxn((p) => ({ ...p, service_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
```

替換成：

```jsx
                        <textarea
                          rows={2}
                          value={editingTxn.service_name}
                          onChange={(e) => setEditingTxn((p) => ({ ...p, service_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
```

- [ ] **Step 3: 列表顯示加上 whitespace-pre-wrap（第 482 行附近）**

找到：

```jsx
                          <p className="text-sm font-medium text-gray-900">{txn.service_name}</p>
```

替換成：

```jsx
                          <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{txn.service_name}</p>
```

- [ ] **Step 4: 開啟瀏覽器手動驗證**

啟動前端 dev server（若尚未執行）：

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
npm run dev
```

進入管理介面 → 任一顧客 → 新增消費記錄，在名稱欄位按 Enter 換行，確認顯示正確（名稱在列表上多行顯示）。

- [ ] **Step 5: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
git add src/pages/admin/Customers.jsx
git commit -m "feat: support multiline service_name in transaction form and display"
```

---

## Task 7: 前端 — 新增表單：分期付款欄位

**Files:**
- Modify: `frontend-new/src/pages/admin/Customers.jsx`

- [ ] **Step 1: 更新 newTxn 初始 state（第 175 行）**

找到：

```javascript
  const [newTxn, setNewTxn] = useState({ service_name: '', amount: '', transaction_date: null })
```

替換成：

```javascript
  const [newTxn, setNewTxn] = useState({
    service_name: '',
    amount: '',
    transaction_date: null,
    is_installment: false,
    total_installments: '',
  })
```

- [ ] **Step 2: 更新 handleAddTxn 送出邏輯（第 253 行附近）**

找到 `handleAddTxn` 裡的 mutation 呼叫：

```javascript
      service_name: newTxn.service_name.trim(),
      amount: parseInt(newTxn.amount, 10),
      transaction_date: newTxn.transaction_date || undefined,
```

替換成：

```javascript
      service_name: newTxn.service_name.trim(),
      amount: parseInt(newTxn.amount, 10),
      transaction_date: newTxn.transaction_date || undefined,
      is_installment: newTxn.is_installment,
      total_installments: newTxn.is_installment ? parseInt(newTxn.total_installments, 10) : undefined,
      amount_per_installment: newTxn.is_installment && newTxn.amount && newTxn.total_installments
        ? Math.round(parseInt(newTxn.amount, 10) / parseInt(newTxn.total_installments, 10))
        : undefined,
```

- [ ] **Step 3: 更新 addTxnMutation 成功後重置 state（第 189 行附近）**

找到：

```javascript
      setNewTxn({ service_name: '', amount: '', transaction_date: null })
```

替換成：

```javascript
      setNewTxn({ service_name: '', amount: '', transaction_date: null, is_installment: false, total_installments: '' })
```

- [ ] **Step 4: 在新增表單金額欄位之後加入分期 UI**

找到新增表單的日期欄位：

```jsx
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">消費日期（選填，預設今日）</label>
```

在這個 `<div>` 之前（日期欄位前面）插入：

```jsx
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newTxn.is_installment}
                          onChange={(e) => setNewTxn((p) => ({ ...p, is_installment: e.target.checked, total_installments: '' }))}
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-xs font-medium text-gray-700">分期付款</span>
                      </label>
                      {newTxn.is_installment && (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">總期數</label>
                            <input
                              type="number"
                              min="2"
                              max="120"
                              value={newTxn.total_installments}
                              onChange={(e) => setNewTxn((p) => ({ ...p, total_installments: e.target.value }))}
                              placeholder="例：3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          {newTxn.amount && newTxn.total_installments && (
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">每期預設</p>
                              <p className="text-sm font-semibold text-primary-600">
                                NT${Math.round(parseInt(newTxn.amount, 10) / parseInt(newTxn.total_installments, 10)).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
```

- [ ] **Step 5: 手動驗證新增表單**

在瀏覽器中開啟任一顧客 → 新增消費紀錄 → 勾選「分期付款」→ 輸入總金額 9000、期數 3，確認顯示「每期預設 NT$3,000」。送出後確認新記錄出現在列表。

- [ ] **Step 6: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
git add src/pages/admin/Customers.jsx
git commit -m "feat: add installment fields to transaction add form"
```

---

## Task 8: 前端 — 列表：分期統計顯示 & 繳款按鈕

**Files:**
- Modify: `frontend-new/src/pages/admin/Customers.jsx`

- [ ] **Step 1: import payInstallment**

找到 Customers.jsx 最上方的 import（第 8-10 行附近）：

```javascript
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  reorderCustomerTransactions,
} from '../../api/admin'
```

替換成：

```javascript
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
  reorderCustomerTransactions,
  payInstallment,
} from '../../api/admin'
```

- [ ] **Step 2: 新增 payingTxn & payAmount state**

在 `const [editingTxn, setEditingTxn] = useState(null)` 附近，新增：

```javascript
  const [payingTxn, setPayingTxn] = useState(null)
  const [payAmount, setPayAmount] = useState('')
```

- [ ] **Step 3: 新增 payInstallmentMutation**

在 `updateTxnMutation` 定義後面新增：

```javascript
  const payInstallmentMutation = useMutation({
    mutationFn: ({ txnId, amount }) => payInstallment(userId, txnId, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', userId] })
      setPayingTxn(null)
      setPayAmount('')
    },
  })
```

- [ ] **Step 4: 在列表的 service_name 下方新增分期統計列**

找到列表 item 裡的：

```jsx
                          <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{txn.service_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            消費日期: ...
                          </p>
```

在 `消費日期` 那個 `<p>` 的後面插入：

```jsx
                          {txn.is_installment && (
                            <p className="text-xs mt-0.5">
                              <span className={txn.paid_installments >= txn.total_installments ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                已繳 {txn.paid_installments}/{txn.total_installments} 期
                              </span>
                              {txn.paid_installments < txn.total_installments && (
                                <span className="text-gray-400">・剩餘 NT${(txn.amount - txn.paid_amount).toLocaleString()}</span>
                              )}
                              {txn.paid_installments >= txn.total_installments && (
                                <span className="text-green-600">・已繳清</span>
                              )}
                            </p>
                          )}
```

- [ ] **Step 5: 在操作按鈕區加入「記錄繳款」按鈕**

找到列表 item 的按鈕區（edit / delete 按鈕旁）：

```jsx
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                            NT${txn.amount?.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
```

在 `<div className="flex items-center gap-1">` 裡的第一個 button（edit 按鈕）之前插入：

```jsx
                            {txn.is_installment && txn.paid_installments < txn.total_installments && (
                              <button
                                onClick={() => {
                                  setPayingTxn(txn)
                                  setPayAmount(String(txn.amount_per_installment || ''))
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                              >
                                記錄繳款
                              </button>
                            )}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
git add src/pages/admin/Customers.jsx
git commit -m "feat: show installment summary and pay button in transaction list"
```

---

## Task 9: 前端 — 記錄繳款 Modal

**Files:**
- Modify: `frontend-new/src/pages/admin/Customers.jsx`

- [ ] **Step 1: 在編輯 Modal 之後新增繳款 Modal**

找到「Edit Transaction Modal」的結尾 `</div>` 後面（第 586 行附近），緊接著新增繳款 Modal：

```jsx
              {/* Pay Installment Modal */}
              {payingTxn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 pointer-events-auto">
                  <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">記錄繳款</h4>
                    <p className="text-xs text-gray-400 mb-4">
                      第 {payingTxn.paid_installments + 1} / {payingTxn.total_installments} 期・
                      剩餘 NT${(payingTxn.amount - payingTxn.paid_amount).toLocaleString()}
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">本次繳款金額 (NT$)</label>
                        <input
                          type="number"
                          min="0"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            if (!payAmount) return
                            payInstallmentMutation.mutate({ txnId: payingTxn.id, amount: parseInt(payAmount, 10) })
                          }}
                          disabled={!payAmount || payInstallmentMutation.isPending}
                          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {payInstallmentMutation.isPending ? '處理中...' : '確認繳款'}
                        </button>
                        <button
                          onClick={() => { setPayingTxn(null); setPayAmount('') }}
                          className="flex-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
```

- [ ] **Step 2: 手動驗證完整流程**

1. 新增一筆消費記錄，勾選分期、總額 NT$9,000、3 期
2. 確認列表顯示「已繳 0/3 期・剩餘 NT$9,000」及「記錄繳款」按鈕
3. 點「記錄繳款」→ 預設金額 3,000（可修改）→ 確認
4. 確認列表更新為「已繳 1/3 期・剩餘 NT$6,000」
5. 繳清 3 期後確認顯示「已繳 3/3 期・已繳清」且按鈕消失

- [ ] **Step 3: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
git add src/pages/admin/Customers.jsx
git commit -m "feat: add record installment payment modal"
```

---

## Task 10: 前端 — 編輯 Modal 顯示分期資訊

**Files:**
- Modify: `frontend-new/src/pages/admin/Customers.jsx`

- [ ] **Step 1: 在編輯 Modal 的日期欄位後加入分期資訊區塊**

找到編輯 Modal 的日期欄位結尾（`transaction_date` input 後面），在 `<div className="flex items-center gap-2 pt-2">` 之前插入：

```jsx
                      {editingTxn.is_installment && (
                        <div className="space-y-2 pt-1 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500">分期資訊</p>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 mb-1">總期數</label>
                              <input
                                type="number"
                                min="2"
                                value={editingTxn.total_installments || ''}
                                onChange={(e) => setEditingTxn((p) => ({ ...p, total_installments: parseInt(e.target.value, 10) || null }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-500 mb-1">每期金額</label>
                              <input
                                type="number"
                                min="0"
                                value={editingTxn.amount_per_installment || ''}
                                onChange={(e) => setEditingTxn((p) => ({ ...p, amount_per_installment: parseInt(e.target.value, 10) || null }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>已繳：{editingTxn.paid_installments} 期</span>
                            <span>已繳金額：NT${(editingTxn.paid_amount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
```

- [ ] **Step 2: 更新 handleSaveEditTxn 送出邏輯（第 275 行附近）**

找到 `handleSaveEditTxn` 裡的 mutation 呼叫：

```javascript
      service_name: editingTxn.service_name.trim(),
      amount: parseInt(editingTxn.amount, 10),
      transaction_date: editingTxn.transaction_date,
```

替換成：

```javascript
      service_name: editingTxn.service_name.trim(),
      amount: parseInt(editingTxn.amount, 10),
      transaction_date: editingTxn.transaction_date,
      total_installments: editingTxn.total_installments || undefined,
      amount_per_installment: editingTxn.amount_per_installment || undefined,
```

- [ ] **Step 3: 手動驗證編輯分期記錄**

點選分期記錄的編輯按鈕，確認：
1. 顯示「分期資訊」區塊，可修改總期數和每期金額
2. 「已繳 X 期」「已繳金額 NT$Y」顯示正確且無法直接修改
3. 儲存後列表上的統計資訊正確更新

- [ ] **Step 4: 最終整合測試**

完整跑一次新增 → 繳款 × 2 → 編輯期數 → 繳清流程，確認數字正確。

- [ ] **Step 5: Commit**

```bash
cd /Users/brianhuang/ManFei-Spa/frontend-new
git add src/pages/admin/Customers.jsx
git commit -m "feat: show installment fields in transaction edit modal"
```
