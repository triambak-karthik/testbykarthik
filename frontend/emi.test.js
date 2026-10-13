(function runEmiTests() {
  if (typeof print !== "function") {
    print = function (message) {
      console.log(message);
    };
  }

  const tests = [];
  const failures = [];

  function test(name, fn) {
    tests.push({ name, fn });
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  function almostEqual(actual, expected, tolerance, message) {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(
        message || `Expected ${actual} to be within ${tolerance} of ${expected}`
      );
    }
  }

  test("TC01: standard reducing-balance EMI matches the closed-form formula", function () {
    const principal = 500000;
    const annualRate = 8.5;
    const months = 60;
    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, months);
    const expected = (principal * monthlyRate * factor) / (factor - 1);
    almostEqual(calculateEmi(principal, annualRate, months), expected, 0.0001);
  });

  test("TC02: default demo loan produces a stable EMI around Rs 10,258", function () {
    const summary = summarizeLoan(500000, 8.5, 60);
    almostEqual(summary.emi, 10258.27, 0.5);
    almostEqual(summary.totalPayable, 615496, 2);
  });

  test("TC03: zero interest splits the principal evenly", function () {
    const summary = summarizeLoan(120000, 0, 12);
    assertEqual(summary.emi, 10000);
    assertEqual(summary.totalInterest, 0);
    assertEqual(summary.totalPayable, 120000);
    assertEqual(summary.rows.length, 12);
    assertEqual(summary.chart.interest, 0);
  });

  test("TC04: years plus extra months become total tenure", function () {
    assertEqual(getTenureMonths(5, 0), 60);
    assertEqual(getTenureMonths(1, 6), 18);
    const summary = summarizeLoan(180000, 0, getTenureMonths(1, 6));
    assertEqual(summary.rows.length, 18);
    assertEqual(summary.emi, 10000);
  });

  test("TC05: amortization schedule ends at zero balance", function () {
    const summary = summarizeLoan(500000, 8.5, 60);
    const last = summary.rows[summary.rows.length - 1];
    assertEqual(summary.rows.length, 60);
    almostEqual(last.balance, 0, 0.01);
  });

  test("TC06: principal recovered across the schedule equals the loan amount", function () {
    const principal = 750000;
    const summary = summarizeLoan(principal, 9.25, 84);
    const recovered = summary.rows.reduce(function (sum, row) {
      return sum + row.principalPaid;
    }, 0);
    almostEqual(recovered, principal, 0.05);
  });

  test("TC07: interest rows add up to total interest", function () {
    const summary = summarizeLoan(400000, 11, 36);
    const interestSum = summary.rows.reduce(function (sum, row) {
      return sum + row.interest;
    }, 0);
    almostEqual(interestSum, summary.totalInterest, 0.05);
    almostEqual(summary.totalPayable, 400000 + summary.totalInterest, 0.05);
  });

  test("TC08: chart data is principal versus interest", function () {
    const summary = summarizeLoan(250000, 7.5, 24);
    assertEqual(summary.chart.principal, 250000);
    almostEqual(summary.chart.interest, summary.totalInterest, 0.01);
    almostEqual(
      summary.chart.principal + summary.chart.interest,
      summary.totalPayable,
      0.05
    );
  });

  test("TC09: one-month loan is principal plus one month of interest", function () {
    const principal = 100000;
    const annualRate = 12;
    const summary = summarizeLoan(principal, annualRate, 1);
    const expectedInterest = principal * (annualRate / 12 / 100);
    almostEqual(summary.emi, principal + expectedInterest, 0.01);
    almostEqual(summary.rows[0].balance, 0, 0.01);
  });

  test("TC10: rejects invalid principal, rate, or tenure", function () {
    assertEqual(validateLoanInputs(0, 8.5, 5, 0).ok, false);
    assertEqual(validateLoanInputs(-1000, 8.5, 5, 0).ok, false);
    assertEqual(validateLoanInputs(500000, -1, 5, 0).ok, false);
    assertEqual(validateLoanInputs(500000, 8.5, 0, 0).ok, false);
    assertEqual(validateLoanInputs(500000, 8.5, 1, 12).ok, false);
    assertEqual(validateLoanInputs(500000, 8.5, 1, -1).ok, false);
  });

  test("TC11: accepts a valid loan including extra months", function () {
    const result = validateLoanInputs(500000, 0, 0, 1);
    assertEqual(result.ok, true);
    assertEqual(result.months, 1);
    assertEqual(validateLoanInputs(500000, 8.5, 2, 3).ok, true);
  });

  tests.forEach(function (item) {
    try {
      item.fn();
      print("PASS  " + item.name);
    } catch (error) {
      failures.push(item.name + ": " + error.message);
      print("FAIL  " + item.name + " — " + error.message);
    }
  });

  print("");
  print(tests.length - failures.length + " passed, " + failures.length + " failed, " + tests.length + " total");

  if (failures.length > 0) {
    throw new Error("Test failures:\n" + failures.join("\n"));
  }
})();
