// 精算結果（誰が誰にいくら返すか）を計算する
export const calcSettlement = (members, payments) => {
  const totals = {}
  members.forEach((m) => (totals[m] = 0))

  // 未精算の支払いのみを対象に計算する
  payments.filter((p) => !p.settled).forEach((p) => {
    const paid = p.paidBy
    const amount = p.amount

    if (p.splitMode === 'ratio' && p.ratios) {
      // 比率モードの場合
      const ratioSum = p.ratios.reduce((s, r) => s + r.ratio, 0)
      p.ratios.forEach((r) => {
        const share = (amount * r.ratio) / ratioSum
        if (r.name === paid) {
          totals[paid] += amount - share
        } else {
          totals[r.name] -= share
        }
      })
    } else if (p.splitMode === 'amount' && p.amounts) {
      // 金額指定モードの場合
      p.amounts.forEach((a) => {
        if (a.name === paid) {
          totals[paid] += amount - Number(a.amount)
        } else {
          totals[a.name] -= Number(a.amount)
        }
      })
    } else {
      // 均等割りの場合
      const share = amount / members.length
      members.forEach((m) => {
        if (m === paid) {
          totals[m] += amount - share
        } else {
          totals[m] -= share
        }
      })
    }
  })

  // 誰が誰にいくら返すかをまとめる
  const results = []
  const debtors = members.filter((m) => totals[m] < 0)
  const creditors = members.filter((m) => totals[m] > 0)

  debtors.forEach((debtor) => {
    let debt = Math.abs(totals[debtor])
    creditors.forEach((creditor) => {
      if (debt > 0 && totals[creditor] > 0) {
        const amount = Math.min(debt, totals[creditor])
        results.push({ from: debtor, to: creditor, amount: Math.round(amount) })
        debt -= amount
        totals[creditor] -= amount
      }
    })
  })

  return results
}

// 合計金額を計算する
export const calcTotal = (payments) => {
  if (!payments || payments.length === 0) return 0
  return payments.reduce((sum, p) => sum + p.amount, 0)
}

// 未精算の件数を数える
export const calcPendingCount = (payments) => {
  if (!payments) return 0
  return payments.filter((p) => !p.settled).length
}