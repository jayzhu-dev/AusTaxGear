let currentLang = 'zh';

function toggleLanguage() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  document.body.classList.toggle('en-mode', currentLang === 'en');
  document.body.classList.toggle('zh-mode', currentLang === 'zh');
  document.getElementById('langToggle').textContent = currentLang === 'zh' ? 'EN' : '中文';
  updateLanguage();
}

function updateLanguage() {
  document.querySelectorAll('[data-zh]').forEach(el => {
    if (el.tagName === 'TD' || el.tagName === 'TH') {
      el.textContent = el.getAttribute(`data-${currentLang}`);
    } else {
      el.innerHTML = el.getAttribute(`data-${currentLang}`);
    }
  });
}

document.getElementById('langToggle').addEventListener('click', toggleLanguage);

// 初始化语言
document.body.classList.add('zh-mode');
updateLanguage();

function calculateTax() {
  const income = parseFloat(document.getElementById('income').value.replace(/,/g, ''));

  if (isNaN(income) || income <= 0) {
    document.getElementById('inputSummary').innerHTML = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('taxSavings').style.display = 'none';
    document.getElementById('resultTitle').style.display = 'none'; // 隐藏标题
    return;
  }

  // 显示"计算结果"标
  document.getElementById('resultTitle').style.display = 'block';

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

  updateLanguage(); // 确保新显示的标题使用正确的语言
}

function calculateTaxAmount(income) {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.19;
  if (income <= 120000) return 5092 + (income - 45000) * 0.325;
  if (income <= 180000) return 29467 + (income - 120000) * 0.37;
  return 51667 + (income - 180000) * 0.45;
}

function displayInputSummary(annualIncome, negativeGearing) {
  const inputSummaryDiv = document.getElementById('inputSummary');
  inputSummaryDiv.innerHTML = `
    <p class="summary-item">
      <span class="zh">您的年度总收入为 </span>
      <span class="en">Annual gross income </span>
      <span class="highlight">$${formatNumber(annualIncome)}</span>
      <span class="zh"> 澳元</span>
      <span class="en"> AUD</span>
    </p>
  `;

  if (document.getElementById('enableNegativeGearing').checked && negativeGearing > 0) {
    inputSummaryDiv.innerHTML += `
      <p class="summary-item">
        <span class="zh">您选择的负扣税金额为 </span>
        <span class="en">Selected negative gearing amount </span>
        <span class="highlight">$${formatNumber(negativeGearing)}</span>
        <span class="zh"> 澳元</span>
        <span class="en"> AUD</span>
      </p>
    `;
  }

  updateLanguage();
}

function displayResult(annualIncome, tax, netIncome) {
  const resultDiv = document.getElementById('result');
  const frequencyFactor = {
    'annually': { zh: '每年', en: 'Annually', factor: 1 },
    'monthly': { zh: '每月', en: 'Monthly', factor: 1 / 12 },
    'fortnightly': { zh: '每两周', en: 'Fortnightly', factor: 1 / 26 },
    'weekly': { zh: '每周', en: 'Weekly', factor: 1 / 52 }
  };

  let resultHTML = `
    <table>
      <thead>
        <tr>
          <th class="frequency-column" data-zh="薪资周期" data-en="Frequency"></th>
          <th class="amount-column" data-zh="总收入" data-en="Gross income"></th>
          <th class="amount-column" data-zh="税额" data-en="Income tax"></th>
          <th class="amount-column" data-zh="净收入" data-en="Net income"></th>
        </tr>
      </thead>
      <tbody>
  `;

  for (let freq in frequencyFactor) {
    const { zh, en, factor } = frequencyFactor[freq];
    resultHTML += `
      <tr>
        <td class="frequency-column">
          <span class="zh">${zh}</span>
          <span class="en">${en}</span>
        </td>
        <td class="amount-column">$${formatNumber(annualIncome * factor)}</td>
        <td class="amount-column">$${formatNumber(tax * factor)}</td>
        <td class="amount-column">$${formatNumber(netIncome * factor)}</td>
      </tr>
    `;
  }

  resultHTML += '</tbody></table>';
  resultDiv.innerHTML = resultHTML;
  updateLanguage();
}

function displayTaxSavings(originalTax, newTax, taxSaved) {
  const taxSavingsDiv = document.getElementById('taxSavings');
  taxSavingsDiv.style.display = 'block';
  taxSavingsDiv.innerHTML = `
    <h3>
      <span class="zh">负扣税影响 (澳元/年)</span>
      <span class="en">Impact of Negative Gearing (AUD/Year)</span>
    </h3>
    <p>
      <span class="zh">原始税额: </span>
      <span class="en">Original Tax Amount: </span>
      $${formatNumber(originalTax)}
    </p>
    <p>
      <span class="zh">负扣税后税额: </span>
      <span class="en">Tax Amount After Negative Gearing: </span>
      $${formatNumber(newTax)}
    </p>
    <p>
      <span class="zh">预计可省税额: </span>
      <span class="en">Estimated Tax Savings: </span>
      <span class="saved">$${formatNumber(taxSaved)}</span>
    </p>
  `;
  updateLanguage();
}

function formatNumber(num) {
  return Math.round(num).toLocaleString('en-AU');
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
  const infoIcon = document.querySelector('.output-section .info-icon-container');
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
