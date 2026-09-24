"use strict";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

function money(value) {
  return moneyFormatter.format(Number(value) || 0);
}

function numberValue(id) {
  return Number(document.getElementById(id).value);
}

function validatePositive(values) {
  return values.every(Number.isFinite) && values.every(v => v >= 0);
}

function showResult(id, html, type = "success") {
  const element = document.getElementById(id);

  element.className = `result ${type}`;
  element.innerHTML = html;
}

function showSection(id) {
  document.querySelectorAll(".calculator").forEach(section => {
    section.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


/* =========================
   FUTURE VALUE
========================= */

function calcFV() {
  const P = numberValue("fvP");
  const r = numberValue("fvR") / 100;
  const t = numberValue("fvT");

  if (!validatePositive([P, r, t])) {
    return showResult(
      "fvResult",
      "Please enter valid non-negative values.",
      "error"
    );
  }

  const fv = P * Math.pow(1 + r, t);

  showResult(
    "fvResult",
    `<strong>Future Value: ${money(fv)}</strong><br>
     Interest Earned: ${money(fv - P)}`
  );
}


/* =========================
   PRESENT VALUE
========================= */

function calcPV() {
  const FV = numberValue("pvF");
  const r = numberValue("pvR") / 100;
  const t = numberValue("pvT");

  if (!validatePositive([FV, r, t])) {
    return showResult(
      "pvResult",
      "Please enter valid non-negative values.",
      "error"
    );
  }

  const pv = FV / Math.pow(1 + r, t);

  showResult(
    "pvResult",
    `<strong>Present Value: ${money(pv)}</strong>`
  );
}


/* =========================
   SIMPLE INTEREST
========================= */

function calcSimple() {
  const P = numberValue("siP");
  const r = numberValue("siR") / 100;
  const t = numberValue("siT");

  if (!validatePositive([P, r, t])) {
    return showResult(
      "siResult",
      "Please enter valid non-negative values.",
      "error"
    );
  }

  const si = P * r * t;
  const maturity = P + si;

  showResult(
    "siResult",
    `<strong>Simple Interest: ${money(si)}</strong><br>
     Maturity Value: ${money(maturity)}`
  );
}


/* =========================
   COMPOUND INTEREST
========================= */

function calcCompound() {
  const P = numberValue("ciP");
  const r = numberValue("ciR") / 100;
  const t = numberValue("ciT");
  const n = numberValue("ciN");

  if (!validatePositive([P, r, t, n]) || n <= 0) {
    return showResult(
      "ciResult",
      "Please enter valid values.",
      "error"
    );
  }

  const amount =
    P * Math.pow(1 + r / n, n * t);

  const ci = amount - P;

  showResult(
    "ciResult",
    `<strong>Final Amount: ${money(amount)}</strong><br>
     Compound Interest: ${money(ci)}`
  );
}


/* =========================
   EMI CALCULATION
========================= */

function calculateEMI(P, annualRate, years) {
  const months = Math.round(years * 12);

  const monthlyRate =
    annualRate / 100 / 12;

  if (monthlyRate === 0) {
    return {
      emi: P / months,
      months
    };
  }

  const factor =
    Math.pow(1 + monthlyRate, months);

  const emi =
    P *
    monthlyRate *
    factor /
    (factor - 1);

  return {
    emi,
    months
  };
}


function calcEMI() {
  const P = numberValue("emiP");
  const annualRate = numberValue("emiR");
  const years = numberValue("emiT");

  if (
    !validatePositive([P, annualRate, years]) ||
    P <= 0 ||
    years <= 0
  ) {
    return showResult(
      "emiResult",
      "Please enter valid loan amount, rate and tenure.",
      "error"
    );
  }

  const { emi, months } =
    calculateEMI(
      P,
      annualRate,
      years
    );

  const total =
    emi * months;

  const interest =
    total - P;

  showResult(
    "emiResult",
    `<strong>Monthly EMI: ${money(emi)}</strong><br>
     Number of Payments: ${months}<br>
     Total Payment: ${money(total)}<br>
     Total Interest: ${money(interest)}`
  );
}


/* =========================
   AMORTIZATION
========================= */

function calcAmortization() {
  const P = numberValue("amP");
  const annualRate = numberValue("amR");
  const years = numberValue("amT");

  if (
    !validatePositive([P, annualRate, years]) ||
    P <= 0 ||
    years <= 0
  ) {
    return showResult(
      "amSummary",
      "Please enter valid loan amount, rate and tenure.",
      "error"
    );
  }

  const { emi, months } =
    calculateEMI(
      P,
      annualRate,
      years
    );

  const monthlyRate =
    annualRate / 100 / 12;

  let balance = P;
  let totalInterest = 0;

  let rows = "";

  for (let month = 1; month <= months; month++) {

    const opening = balance;

    const interest =
      opening * monthlyRate;

    let principal =
      emi - interest;

    let payment = emi;

    if (
      month === months ||
      principal > opening
    ) {
      principal = opening;

      payment =
        principal + interest;
    }

    balance =
      Math.max(
        0,
        opening - principal
      );

    totalInterest += interest;

    rows += `
      <tr>
        <td>${month}</td>
        <td>${money(opening)}</td>
        <td>${money(interest)}</td>
        <td>${money(principal)}</td>
        <td>${money(payment)}</td>
        <td>${money(balance)}</td>
      </tr>
    `;
  }

  showResult(
    "amSummary",
    `<strong>Monthly EMI: ${money(emi)}</strong><br>
     Total Interest: ${money(totalInterest)}<br>
     Total Payment: ${money(P + totalInterest)}`
  );

  document.querySelector(
    "#amTable tbody"
  ).innerHTML = rows;
}


/* =========================
   SCENARIO ANALYSIS
========================= */

function calcScenario() {

  const P =
    numberValue("scP");

  const years =
    numberValue("scT");

  const rates =
    [8, 10, 12, 15];

  if (
    !validatePositive([P, years]) ||
    P <= 0 ||
    years <= 0
  ) {

    document.querySelector(
      "#scTable tbody"
    ).innerHTML =
      `<tr>
        <td colspan="4">
          Please enter valid loan amount and tenure.
        </td>
      </tr>`;

    return;
  }

  const rows =
    rates.map(rate => {

      const {
        emi,
        months
      } =
        calculateEMI(
          P,
          rate,
          years
        );

      const total =
        emi * months;

      const interest =
        total - P;

      return `
        <tr>
          <td>${rate}%</td>
          <td>${money(emi)}</td>
          <td>${money(total)}</td>
          <td>${money(interest)}</td>
        </tr>
      `;

    }).join("");

  document.querySelector(
    "#scTable tbody"
  ).innerHTML = rows;
}


/* =========================
   INITIALIZATION
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    showSection("fv");
  }
);