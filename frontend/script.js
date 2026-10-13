const form = document.getElementById("emi-form");
const errorEl = document.getElementById("form-error");
const resultsEl = document.getElementById("results");
const scheduleEl = document.getElementById("schedule");
const scheduleBody = document.getElementById("schedule-body");
const tenureSummary = document.getElementById("tenure-summary");

const emiValue = document.getElementById("emi-value");
const interestValue = document.getElementById("interest-value");
const totalValue = document.getElementById("total-value");

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

let breakupChart;

function showError(message) {
  errorEl.hidden = false;
  errorEl.textContent = message;
  resultsEl.hidden = true;
  scheduleEl.hidden = true;
}

function renderChart(principal, totalInterest) {
  const ctx = document.getElementById("breakup-chart");

  if (breakupChart) {
    breakupChart.destroy();
  }

  breakupChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Principal", "Interest"],
      datasets: [
        {
          data: [principal, totalInterest],
          backgroundColor: ["#0f766e", "#f59e0b"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

function renderSchedule(rows, months) {
  scheduleBody.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.month}</td>
          <td>${money.format(row.payment)}</td>
          <td>${money.format(row.principalPaid)}</td>
          <td>${money.format(row.interest)}</td>
          <td>${money.format(row.balance)}</td>
        </tr>
      `
    )
    .join("");

  tenureSummary.textContent = `${months} monthly payments`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorEl.hidden = true;

  const principal = Number(document.getElementById("principal").value);
  const annualRate = Number(document.getElementById("annual-rate").value);
  const years = Number(document.getElementById("years").value);
  const extraMonths = Number(document.getElementById("months").value);
  const validation = validateLoanInputs(principal, annualRate, years, extraMonths);

  if (!validation.ok) {
    showError(validation.message);
    return;
  }

  const summary = summarizeLoan(principal, annualRate, validation.months);

  emiValue.textContent = money.format(summary.emi);
  interestValue.textContent = money.format(summary.totalInterest);
  totalValue.textContent = money.format(summary.totalPayable);

  resultsEl.hidden = false;
  scheduleEl.hidden = false;
  renderChart(summary.chart.principal, summary.chart.interest);
  renderSchedule(summary.rows, validation.months);
});
