function calculateTax() {
  const income = parseFloat(document.getElementById('income').value.replace(/,/g, ''));

  // 检查收入是否为有效数字
  if (isNaN(income) || income <= 0) {
    // 如果收入无效，清空结果区域并返回
    document.getElementById('inputSummary').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('taxSavings').style.display = 'none';
    return;
  }

  const frequency = document.querySelector('input[name="frequency"]:checked').value;
  const taxType = document.querySelector('input[name="taxType"]:checked').value;
  const enableNegativeGearing = document.getElementById('enableNegativeGearing').checked;
  const negativeGearing = enableNegativeGearing ? parseFloat(document.getElementById('negativeGearing').value.replace(/,/g, '')) || 0 : 0;

  let annualIncome = income;
  switch (frequency) {
    case 'monthly': annualIncome *= 12; break;
    case 'fortnightly': annualIncome *= 26; break;
    case 'weekly': annualIncome *= 52; break;
  }

  displayInputSummary(annualIncome, negativeGearing);

  const originalTax = calculateTaxAmount(annualIncome);
  const newTax = calculateTaxAmount(annualIncome - negativeGearing);
  const taxSaved = originalTax - newTax;

  displayResult(annualIncome, originalTax, annualIncome - originalTax);
  if (enableNegativeGearing) {
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

function displayInputSummary(annualIncome, negativeGearing) {
  let summary = `
<p>您的年度总收入为 <span class="highlight">$${formatNumber(annualIncome)}</span> 澳元<br>
<span class="en">Your annual gross income is <span class="highlight">$${formatNumber(annualIncome)}</span> AUD</span></p>
`;

  if (enableNegativeGearing.checked && negativeGearing > 0) {
    summary += `
  <p>您选择的负扣税金额为 <span class="highlight">$${formatNumber(negativeGearing)}</span> 澳元<br>
  <span class="en">Your selected negative gearing amount is <span class="highlight">$${formatNumber(negativeGearing)}</span> AUD</span></p>
`;
  }

  document.getElementById('inputSummary').innerHTML = summary;
}

function displayResult(annualIncome, tax, netIncome) {
  const resultDiv = document.getElementById('result');
  const frequencyFactor = {
    'annually': { label: '每   年<br><span class="en">Annually</span>', factor: 1 },
    'monthly': { label: '每   月<br><span class="en">Monthly</span>', factor: 1 / 12 },
    'fortnightly': { label: '每两周<br><span class="en">Fortnightly</span>', factor: 1 / 26 },
    'weekly': { label: '每 周<br><span class="en">Weekly</span>', factor: 1 / 52 }
  };

  let resultHTML = `
  <h3>计算结果<br><span class="en">Calculation Results</span></h3>
  <table>
      <tr>
          <th class="center-align">薪资周期<br><span class="en">Payment Frequency</span></th>
          <th class="right-align">总收入<br><span class="en">Gross Income</span></th>
          <th class="right-align">税额<br><span class="en">Tax</span></th>
          <th class="right-align">净收入<br><span class="en">Net Income</span></th>
      </tr>
`;

  for (let freq in frequencyFactor) {
    const { label, factor } = frequencyFactor[freq];
    resultHTML += `
      <tr>
          <td class="center-align">${label}</td>
          <td class="right-align">$${formatNumber(annualIncome * factor, 2)}</td>
          <td class="right-align">$${formatNumber(tax * factor, 2)}</td>
          <td class="right-align">$${formatNumber(netIncome * factor, 2)}</td>
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
  <p>负税后应纳税额: $${formatNumber(newTax)}<br>
  <span class="en">Taxable Amount After Negative Gearing: $${formatNumber(newTax)}</span></p>
  <p>预计可省税额: <span class="saved">$${formatNumber(taxSaved)}</span><br>
  <span class="en">Estimated Tax Savings: <span class="saved">$${formatNumber(taxSaved)}</span></span></p>
`;
}

function formatNumber(num) {
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

document.getElementById('enableNegativeGearing').addEventListener('change', function () {
  document.getElementById('negativeGearingInput').style.display = this.checked ? 'block' : 'none';
});

document.getElementById('income').addEventListener('input', function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
});

const negativeGearingInput = document.getElementById('negativeGearing');
negativeGearingInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
});

document.addEventListener('DOMContentLoaded', function () {
  const infoIcon = document.querySelector('.info-icon-container');
  const taxRatePopup = document.getElementById('taxRatePopup');
  const negativeGearingInfo = document.querySelector('.negative-gearing-info');
  const negativeGearingPopup = document.getElementById('negativeGearingPopup');

  function setupPopup(trigger, popup) {
    if (!trigger || !popup) {
      console.error('Trigger or popup element not found:', { trigger, popup });
      return;
    }

    const closeBtn = popup.querySelector('.close');
    if (!closeBtn) {
      console.error('Close button not found in popup');
      return;
    }

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      popup.style.display = 'block';
    });

    closeBtn.addEventListener('click', function () {
      popup.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
      if (event.target == popup) {
        popup.style.display = 'none';
      }
    });
  }

  setupPopup(infoIcon, taxRatePopup);
  setupPopup(negativeGearingInfo, negativeGearingPopup);
});