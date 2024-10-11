// 为收入输入框添加格式化功能
const incomeInput = document.getElementById('income');
incomeInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
});

document.getElementById('enableSalarySacrifice').addEventListener('change', function () {
  document.getElementById('salarySacrificeInput').style.display = this.checked ? 'block' : 'none';
});

// 为负扣税金额输入框添加格式化功能
const salarySacrificeInput = document.getElementById('salarySacrifice');
salarySacrificeInput.addEventListener('input', function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
});

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

  const originalTax = calculateTaxAmount(annualIncome);
  const newTax = calculateTaxAmount(annualIncome - salarySacrifice);
  const taxSaved = originalTax - newTax;

  displayInputSummary(income, frequency, taxType, enableSalarySacrifice, salarySacrifice);
  displayResult(annualIncome, originalTax, annualIncome - originalTax);
  if (enableSalarySacrifice) {
    displayTaxSavings(originalTax, newTax, taxSaved);
  } else {
    document.getElementById('taxSavings').style.display = 'none';
  }
}

function displayInputSummary(income, frequency, taxType, enableSalarySacrifice, salarySacrifice) {
  const frequencyText = {
    'annually': '每年',
    'monthly': '每月',
    'fortnightly': '每两周',
    'weekly': '每周'
  };
  const taxTypeText = {
    'gross': '总收入 (Gross)',
    'net': '净收入 (Net)'
  };
  const summary = `
                <p>基于<span class="highlight">${frequencyText[frequency]}</span>
                ${taxTypeText[taxType]}<span class="highlight">$${formatNumber(income)}</span>澳元的计算结果：</p>
            `;
  document.getElementById('inputSummary').innerHTML = summary;
}

function displayResult(annualIncome, tax, netIncome) {
  const frequency = document.querySelector('input[name="frequency"]:checked').value;
  const taxType = document.querySelector('input[name="taxType"]:checked').value;

  const frequencyText = {
    'annually': '每年',
    'monthly': '每月',
    'fortnightly': '每两周',
    'weekly': '每周'
  };

  const taxTypeText = {
    'gross': '总收入 (Gross)',
    'net': '净收入 (Net)'
  };

  const summary = `基于${frequencyText[frequency]}${taxTypeText[taxType]}${formatNumber(annualIncome)}澳元的计算结果：`;

  let tableRows = '';
  Object.entries(frequencyText).forEach(([freq, text]) => {
    const factor = getFactor(freq);
    tableRows += `
                    <tr>
                        <td>${text}</td>
                        <td>$${formatNumber(annualIncome * factor)}</td>
                        <td>$${formatNumber(tax * factor)}</td>
                        <td>$${formatNumber(netIncome * factor)}</td>
                    </tr>
                `;
  });

  const result = `
                <h2>计算结果</h2>
                <p>${summary}</p>
                <table>
                    <tr>
                        <th>频率</th>
                        <th>总收入 (澳元)</th>
                        <th>所得税 (澳元)</th>
                        <th>净收入 (澳元)</th>
                    </tr>
                    ${tableRows}
                </table>
            `;

  document.getElementById('result').innerHTML = result;
}

function displayTaxSavings(originalTax, newTax, taxSaved) {
  const taxSavingsDiv = document.getElementById('taxSavings');
  taxSavingsDiv.style.display = 'block';
  taxSavingsDiv.innerHTML = `
                <h3>负扣税影响 (澳元/年)</h3>
                <p>原始应纳税额: $${formatNumber(originalTax)}</p>
                <p>负扣税后应纳税额: $${formatNumber(newTax)}</p>
                <p>节省的税额: <span class="saved">$${formatNumber(taxSaved)}</span></p>
            `;
}

function calculateGrossFromNet(netIncome) {
  let low = netIncome;
  let high = netIncome * 2;

  while (high - low > 0.01) {
    let mid = (low + high) / 2;
    let tax = calculateTaxAmount(mid);
    let calculatedNet = mid - tax;

    if (calculatedNet > netIncome) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return (low + high) / 2;
}

function calculateTaxAmount(income) {
  let tax = 0;
  if (income <= 18200) {
    tax = 0;
  } else if (income <= 45000) {
    tax = (income - 18200) * 0.16;
  } else if (income <= 135000) {
    tax = 4288 + (income - 45000) * 0.30;
  } else if (income <= 190000) {
    tax = 31288 + (income - 135000) * 0.37;
  } else {
    tax = 51563 + (income - 190000) * 0.45;
  }
  return tax;
}

function formatNumber(num) {
  return num.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getFactor(frequency) {
  switch (frequency) {
    case 'monthly':
      return 1 / 12;
    case 'fortnightly':
      return 1 / 26;
    case 'weekly':
      return 1 / 52;
    default:
      return 1;
  }
}