function getTenureMonths(years, extraMonths) {
  return Number(years) * 12 + Number(extraMonths);
}

function validateLoanInputs(principal, annualRate, years, extraMonths) {
  const months = getTenureMonths(years, extraMonths);

  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(years) ||
    !Number.isFinite(extraMonths)
  ) {
    return {
      ok: false,
      months,
      message: "Enter a loan amount above 0 and a tenure of at least 1 month.",
    };
  }

  if (principal <= 0 || annualRate < 0 || months <= 0 || extraMonths < 0 || extraMonths > 11) {
    return {
      ok: false,
      months,
      message: "Enter a loan amount above 0 and a tenure of at least 1 month.",
    };
  }

  return { ok: true, months };
}

function calculateEmi(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function buildSchedule(principal, annualRate, months, emi) {
  const monthlyRate = annualRate / 12 / 100;
  const rows = [];
  let balance = principal;

  for (let month = 1; month <= months; month += 1) {
    const interest = balance * monthlyRate;
    let principalPaid = emi - interest;
    let payment = emi;

    if (month === months || principalPaid > balance) {
      principalPaid = balance;
      payment = principalPaid + interest;
    }

    balance = Math.max(0, balance - principalPaid);
    rows.push({
      month,
      payment,
      principalPaid,
      interest,
      balance,
    });
  }

  return rows;
}

function summarizeLoan(principal, annualRate, months) {
  const emi = calculateEmi(principal, annualRate, months);
  const rows = buildSchedule(principal, annualRate, months, emi);
  const totalPayable = rows.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = totalPayable - principal;

  return {
    emi,
    rows,
    totalPayable,
    totalInterest,
    chart: {
      principal,
      interest: Math.max(totalInterest, 0),
    },
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getTenureMonths,
    validateLoanInputs,
    calculateEmi,
    buildSchedule,
    summarizeLoan,
  };
}
