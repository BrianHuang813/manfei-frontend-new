# 消費記錄：換行支援 & 分期付款設計

Date: 2026-05-09

## 範圍

兩個獨立功能，可分開實作：

1. **項目名稱換行支援**：純前端改動，讓 `service_name` 欄位支援多行輸入與正確顯示。
2. **分期付款記錄**：前後端皆需改動，在 `transactions` 表新增欄位，前端新增分期 UI 流程。

---

## 功能一：項目名稱換行支援

### 問題

`service_name` 欄位目前使用 `<input type="text">`，不支援換行輸入；顯示時也未處理 `\n`，導致換行符號無法呈現。

### 解法

後端無需改動（字串欄位本身可儲存 `\n`）。只改 `src/pages/admin/Customers.jsx`：

- 新增表單與編輯 Modal 的 `<input type="text">` 改為 `<textarea rows={2}>`，樣式保持一致
- 列表顯示的 `<p>{txn.service_name}</p>` 加上 `whitespace-pre-wrap`

---

## 功能二：分期付款（方案 A — 欄位擴充）

### 資料模型

在 `transactions` 表新增欄位：

| 欄位 | 型別 | 預設值 | 說明 |
|---|---|---|---|
| `is_installment` | boolean | false | 是否為分期付款 |
| `total_installments` | integer | null | 總期數（如 3） |
| `amount_per_installment` | decimal | null | 預設每期金額 |
| `paid_installments` | integer | 0 | 已繳期數 |
| `paid_amount` | decimal | 0 | 實際已繳總額 |

`remaining_amount` 由前端計算：`amount - paid_amount`。

### API

新增一個繳款端點：

```
POST /api/admin/customers/{userId}/transactions/{txnId}/pay
Body: { amount: number }
```

後端執行：`paid_installments += 1`、`paid_amount += amount`。

現有 `updateTransaction` 端點（PUT）需同步支援 `total_installments`、`amount_per_installment` 的更新。

### 前端 UI 流程

**新增表單**
- 新增「分期付款」toggle
- 勾選後展開「總期數」輸入欄，`amount_per_installment` 自動計算（唯讀顯示）

**列表顯示**
- 非分期：顯示同現在
- 分期：金額下方加一行 `已繳 X / Y 期・剩餘 NT$Z`
- 未繳清時顯示「記錄繳款」按鈕

**記錄繳款 Modal**
- 顯示預設本期金額（可手動修改）
- 確認後呼叫 `/pay` 端點
- 已繳清（`paid_installments === total_installments`）則按鈕不顯示

**編輯 Modal**
- 可修改 `total_installments`、`amount_per_installment`
- `paid_installments`、`paid_amount` 僅顯示，不可編輯

### 不支援的情境

- 無法查看每期個別繳款的日期與金額（若未來需要，需新增 sub-table）
- 不支援退款或取消已繳款項

---

## 實作順序建議

1. 後端 migration：新增欄位
2. 後端 API：新增 `/pay` 端點、更新 `updateTransaction`
3. 前端功能一：換行支援（小改動，可獨立 PR）
4. 前端功能二：分期付款 UI
