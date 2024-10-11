function calculateTax() {
  const income = parseFloat(document.getElementById('income').value.replace(/,/g, ''));
  const frequency = document.querySelector('input[name="frequency"]:checked').value;
  const taxType = document.querySelector('input[name="taxType"]:checked').value;
  const enableSalarySacrifice = document.getElementById('enableSalarySacrifice').checked;
  const salarySacrifice = enableSalarySacrifice ? parseFloat(document.getElementById('salarySacrifice').value.replace(/,/g, '')) || 0 : 0;

  let annualIncome = income;
  switch (frequency) {
    case 'monthly': annualIncome *= 12; break;
    case 'fortnightly': annualIncome *= 26; break;
    case 'weekly': annualIncome *= 52; break;
  }

  displayInputSummary(annualIncome);

  const originalTax = calculateTaxAmount(annualIncome);
  const newTax = calculateTaxAmount(annualIncome - salarySacrifice);
  const taxSaved = originalTax - newTax;

  displayResult(annualIncome, originalTax, annualIncome - originalTax);
  if (enableSalarySacrifice) {
    displayTaxSavings(originalTax, newTax, taxSaved);
  } else {
    document.getElementById('taxSavings').style.display = 'none';
  }
}

function calculateTaxAmount(income) {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.19;
  if (income <= 120000) return 5092 + (income - 45000) * 0.325;
  if (income <= 180000) return 29467 + (income - 120000) * 0.37;
  return 51667 + (income - 180000) * 0.45;
}

function displayInputSummary(annualIncome) {
  const summary = `
      <p>您的年度总收入为 <span class="highlight">$${formatNumber(annualIncome)}</span> 澳元<br>
      <span class="en">Your annual gross income is <span class="highlight">$${formatNumber(annualIncome)}</span> AUD</span></p>
  `;
  document.getElementById('inputSummary').innerHTML = summary;
}

function displayResult(annualIncome, tax, netIncome) {
  const resultDiv = document.getElementById('result');
  const frequencyFactor = {
    'annually': { label: '每年<br><span class="en">Annually</span>', factor: 1 },
    'monthly': { label: '每月<br><span class="en">Monthly</span>', factor: 1 / 12 },
    'fortnightly': { label: '每两周<br><span class="en">Fortnightly</span>', factor: 1 / 26 },
    'weekly': { label: '每周<br><span class="en">Weekly</span>', factor: 1 / 52 }
  };

  let resultHTML = `
      <h3>计算结果<br><span class="en">Calculation Results</span></h3>
      <table>
          <tr>
              <th>薪资周期<br><span class="en">Payment Frequency</span></th>
              <th>总收入<br><span class="en">Gross Income</span></th>
              <th>税额<br><span class="en">Tax</span></th>
              <th>净收入<br><span class="en">Net Income</span></th>
          </tr>
  `;

  for (let freq in frequencyFactor) {
    const { label, factor } = frequencyFactor[freq];
    resultHTML += `
          <tr>
              <td>${label}</td>
              <td>$${formatNumber(annualIncome * factor)}</td>
              <td>$${formatNumber(tax * factor)}</td>
              <td>$${formatNumber(netIncome * factor)}</td>
          </tr>
      `;
  }

  resultHTML += '</table>';
  resultDiv.innerHTML = resultHTML;
}

function displayTaxSavings(originalTax, newTax, taxSaved) {
  const taxSavingsDiv = document.getElementById('taxSavings');
  taxSavingsDiv.style.display = 'block';
  taxSavingsDiv.innerHTML = `
      <h3>负扣税影响 (澳元/年)<br><span class="en">Impact of Negative Gearing (AUD/Year)</span></h3>
      <p>原始应纳税额: $${formatNumber(originalTax)}<br>
      <span class="en">Original Taxable Amount: $${formatNumber(originalTax)}</span></p>
      <p>负扣税后应纳税额: $${formatNumber(newTax)}<br>
      <span class="en">Taxable Amount After Negative Gearing: $${formatNumber(newTax)}</span></p>
      <p>预计可省税额: <span class="saved">$${formatNumber(taxSaved)}</span><br>
      <span class="en">Estimated Tax Savings: <span class="saved">$${formatNumber(taxSaved)}</span></span></p>
  `;
}

function formatNumber(num) {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.getElementById('enableSalarySacrifice').addEventListener('change', function () {
  document.getElementById('salarySacrificeInput').style.display = this.checked ? 'block' : 'none';
});

document.getElementById('income').addEventListener('input', function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
});

const salarySacrificeInput = document.getElementById('salarySacrifice');
salarySacrificeInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
});