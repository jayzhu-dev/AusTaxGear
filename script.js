// 全局变量,用于跟踪当前语言
let currentLang = 'zh';

// 切换语言的函数
function toggleLanguage() {
  // 切换语言between中文和英文
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  // 使用requestAnimationFrame来优化性能,确保DOM更新在下一帧执行
  requestAnimationFrame(() => {
    // 切换body的类名来应用不同的语言样式
    document.body.classList.toggle('en-mode', currentLang === 'en');
    document.body.classList.toggle('zh-mode', currentLang === 'zh');
    // 更新语言切换按钮的文本
    document.getElementById('langToggle').textContent = currentLang === 'zh' ? 'EN' : '中文';
    // 更新页面上所有需要翻译的元素
    updateLanguage();
  });
}

// 更新页面上所有需要翻译的元素的函数
function updateLanguage() {
  // 选择所有带有data-zh属性的元素
  document.querySelectorAll('[data-zh]').forEach(el => {
    // 对于表格的单元格,只更新textContent
    if (el.tagName === 'TD' || el.tagName === 'TH') {
      el.textContent = el.getAttribute(`data-${currentLang}`);
    } else {
      // 对于其他元素,更新innerHTML以支持HTML标签
      el.innerHTML = el.getAttribute(`data-${currentLang}`);
    }
  });
}

// 为语言切换按钮添加点击事件监听器
document.getElementById('langToggle').addEventListener('click', toggleLanguage);

// 初始化语言设置
document.body.classList.add('zh-mode');
updateLanguage();

function calculateTax() {
  const incomeInput = parseFloat(document.getElementById('income').value.replace(/,/g, ''));
  const includeSuperannuation = document.getElementById('includeSuperannuation').checked;
  const frequency = document.querySelector('input[name="frequency"]:checked').value;
  const taxType = document.querySelector('input[name="taxType"]:checked').value;
  const resultTitle = document.getElementById('resultTitle');
  const inputSummary = document.getElementById('inputSummary');
  const result = document.getElementById('result');
  const taxSavings = document.getElementById('taxSavings');

  if (isNaN(incomeInput) || incomeInput <= 0) {
    [inputSummary, result, taxSavings, resultTitle].forEach(el => el.style.display = 'none');
    return;
  }

  resultTitle.style.display = 'block';
  const enableNegativeGearing = document.getElementById('enableNegativeGearing').checked;
  const negativeGearing = enableNegativeGearing ? parseFloat(document.getElementById('negativeGearing').value.replace(/,/g, '')) || 0 : 0;

  const superRate = includeSuperannuation ? parseFloat(document.getElementById('superannuationRate').value) / 100 : 0.115;

  let annualIncome, superannuation;

  if (taxType === 'gross') {
    annualIncome = calculateAnnualIncome(incomeInput, frequency);
    if (includeSuperannuation) {
      superannuation = annualIncome * superRate / (1 + superRate);
      annualIncome -= superannuation;
    } else {
      superannuation = annualIncome * superRate;
    }
  } else { // net income
    const netAnnualIncome = calculateAnnualIncome(incomeInput, frequency);
    annualIncome = calculateGrossFromNet(netAnnualIncome);
    if (includeSuperannuation) {
      superannuation = annualIncome * superRate / (1 + superRate);
      annualIncome -= superannuation;
    } else {
      superannuation = annualIncome * superRate;
    }
  }

  // 计算税额时考虑负扣税
  const taxableIncome = annualIncome - negativeGearing;
  const tax = calculateTaxAmount(taxableIncome);

  // 计算净收入时不考虑负扣税
  const netIncome = annualIncome - tax;

  displayInputSummary(annualIncome, negativeGearing, taxType);

  // 计算原始税额和新税额,用于显示税收节省
  const originalTax = calculateTaxAmount(annualIncome);
  const newTax = calculateTaxAmount(taxableIncome);
  const taxSaved = originalTax - newTax;

  displayResult(annualIncome, superannuation, tax, netIncome, taxType, frequency);

  taxSavings.style.display = enableNegativeGearing ? 'block' : 'none';
  
  if (enableNegativeGearing) {
    displayTaxSavings(originalTax, newTax, taxSaved);
  }

  updateLanguage();
}

function calculateAnnualIncome(income, frequency) {
  const factors = { monthly: 12, fortnightly: 26, weekly: 52 };
  return income * (factors[frequency] || 1);
}

function calculateTaxAmount(income) {
  if (income <= 18200) return 0;
  if (income <= 45000) return (income - 18200) * 0.19;
  if (income <= 120000) return 5092 + (income - 45000) * 0.325;
  if (income <= 180000) return 29467 + (income - 120000) * 0.37;
  return 51667 + (income - 180000) * 0.45;
}

function calculateGrossFromNet(netIncome) {
  // 这个函数使用二分法来反推总收入
  let low = netIncome;
  let high = netIncome * 2; // 假设最高税率不超过50%
  let mid, tax, netFromGross;

  while (high - low > 0.01) { // 精确到分
    mid = (low + high) / 2;
    tax = calculateTaxAmount(mid);
    netFromGross = mid - tax;

    if (netFromGross > netIncome) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.round(mid * 100) / 100; // 四舍五入到分
}

function displayInputSummary(annualIncome, negativeGearing, taxType) {
  const inputSummaryDiv = document.getElementById('inputSummary');
  const incomeType = taxType === 'gross' ? '总收入' : '净收入';
  const incomeTypeEn = taxType === 'gross' ? 'gross income' : 'net income';

  inputSummaryDiv.innerHTML = `
    <p class="summary-item">
      <span class="zh">您的年度总收入为 </span>
      <span class="en">Annual ${incomeTypeEn} </span>
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

// 显示计算结果的函数
function displayResult(annualIncome, superannuation, tax, netIncome, taxType, frequency) {
  const resultDiv = document.getElementById('result');
  const frequencyFactor = {
    'annually': { zh: '每年', en: 'Annually', factor: 1 },
    'monthly': { zh: '每月', en: 'Monthly', factor: 1 / 12 },
    'fortnightly': { zh: '双周', en: 'Fortnightly', factor: 1 / 26 },
    'weekly': { zh: '每周', en: 'Weekly', factor: 1 / 52 }
  };

  let resultHTML = `
    <table>
      <thead>
        <tr>
          <th class="frequency-column" data-zh="薪资周期" data-en="Frequency"></th>
          <th class="amount-column" data-zh="总收入" data-en="Gross income"></th>
          <th class="amount-column" data-zh="养老金" data-en="Super"></th>
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
        <td class="amount-column">$${formatNumber(superannuation * factor)}</td>
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
    <div class="result-header">
      <h3>
        <span class="zh">负扣税影响 (澳元/年)</span>
        <span class="en">Impact of Negative Gearing (AUD/Year)</span>
      </h3>
      <div class="info-icon-container tax-savings-info">
        <svg class="info-icon" viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
        <span class="info-text">
          <span class="zh">计算说明</span>
          <span class="en">Calculation Note</span>
        </span>
      </div>
    </div>
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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedFormatInput = debounce(function (e) {
  let value = e.target.value.replace(/[^\d]/g, '');
  if (value !== '') {
    value = parseInt(value, 10).toLocaleString('en-AU');
  }
  e.target.value = value;
}, 300);

document.getElementById('income').addEventListener('input', debouncedFormatInput);
document.getElementById('negativeGearing').addEventListener('input', debouncedFormatInput);

// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
  // 获取需要的DOM元素
  const infoIcon = document.querySelector('.output-section .info-icon-container');
  const taxRatePopup = document.getElementById('taxRatePopup');
  const negativeGearingInfo = document.querySelector('.negative-gearing-info');
  const negativeGearingPopup = document.getElementById('negativeGearingPopup');
  const taxSavingsPopup = document.getElementById('taxSavingsPopup');

  // 设置弹窗的函数
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

    // 点击触发器显示弹窗
    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      popup.style.display = 'block';
    });

    // 点击关闭按钮隐藏弹窗
    closeBtn.addEventListener('click', function () {
      popup.style.display = 'none';
    });

    // 点击弹窗外部区域隐藏弹窗
    window.addEventListener('click', function (event) {
      if (event.target == popup) {
        popup.style.display = 'none';
      }
    });
  }

  // 设置税率和负扣税信息弹窗
  setupPopup(infoIcon, taxRatePopup);
  setupPopup(negativeGearingInfo, negativeGearingPopup);

  // 使用事件委托来处理动态创建的 taxSavingsInfo 元素
  document.addEventListener('click', function (event) {
    const taxSavingsInfo = event.target.closest('.tax-savings-info');
    if (taxSavingsInfo && taxSavingsPopup) {
      event.preventDefault();
      taxSavingsPopup.style.display = 'block';
    }
  });

  // 设置税收节省信息弹窗的关闭按钮
  const taxSavingsCloseBtn = taxSavingsPopup.querySelector('.close');
  if (taxSavingsCloseBtn) {
    taxSavingsCloseBtn.addEventListener('click', function () {
      taxSavingsPopup.style.display = 'none';
    });
  }

  const superannuationInfo = document.querySelector('.superannuation-info');
  const superannuationPopup = document.getElementById('superannuationPopup');

  // 设置养老金信息弹窗
  setupPopup(superannuationInfo, superannuationPopup);

  const includeSuperannuationCheckbox = document.getElementById('includeSuperannuation');
  const superannuationRateInput = document.getElementById('superannuationRate');

  includeSuperannuationCheckbox.addEventListener('change', function () {
    if (this.checked) {
      superannuationRateInput.disabled = false;
      superannuationRateInput.classList.add('enabled');
    } else {
      superannuationRateInput.disabled = true;
      superannuationRateInput.classList.remove('enabled');
    }
  });

  superannuationRateInput.addEventListener('input', function () {
    let value = parseFloat(this.value);
    if (value < 11.5) this.value = '11.5';
    if (value > 15) this.value = '15';
    calculateTax();
  });

  // 添加触摸事件监听器
  superannuationRateInput.addEventListener('touchstart', function (e) {
    e.stopPropagation(); // 阻止事件冒泡
  });
});