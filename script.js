let currentLang = 'zh';

    function toggleLanguage() {
      currentLang = currentLang === 'zh' ? 'en' : 'zh';
      requestAnimationFrame(() => {
        document.body.classList.toggle('en-mode', currentLang === 'en');
        document.body.classList.toggle('zh-mode', currentLang === 'zh');
        document.getElementById('langToggle').textContent = currentLang === 'zh' ? 'EN' : '中文';
        updateLanguage();
      });
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
      const resultTitle = document.getElementById('resultTitle');
      const inputSummary = document.getElementById('inputSummary');
      const result = document.getElementById('result');
      const taxSavings = document.getElementById('taxSavings');
    
      if (isNaN(income) || income <= 0) {
        [inputSummary, result, taxSavings, resultTitle].forEach(el => el.style.display = 'none');
        return;
      }
    
      resultTitle.style.display = 'block';
    
      const frequency = document.querySelector('input[name="frequency"]:checked').value;
      const enableNegativeGearing = document.getElementById('enableNegativeGearing').checked;
      const negativeGearing = enableNegativeGearing ? parseFloat(document.getElementById('negativeGearing').value.replace(/,/g, '')) || 0 : 0;
    
      const annualIncome = calculateAnnualIncome(income, frequency);
    
      displayInputSummary(annualIncome, negativeGearing);
    
      const originalTax = calculateTaxAmount(annualIncome);
      const newTax = calculateTaxAmount(annualIncome - negativeGearing);
      const taxSaved = originalTax - newTax;
    
      displayResult(annualIncome, originalTax, annualIncome - originalTax);
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
          <span class="zh">原始应纳税额: </span>
          <span class="en">Original Tax Amount: </span>
          $${formatNumber(originalTax)}
        </p>
        <p>
          <span class="zh">负扣税后应纳税额: </span>
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
    
    const debouncedFormatInput = debounce(function(e) {
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value !== '') {
        value = parseInt(value, 10).toLocaleString('en-AU');
      }
      e.target.value = value;
    }, 300);
    
    document.getElementById('income').addEventListener('input', debouncedFormatInput);
    document.getElementById('negativeGearing').addEventListener('input', debouncedFormatInput);

    document.addEventListener('DOMContentLoaded', function () {
      const infoIcon = document.querySelector('.output-section .info-icon-container');
      const taxRatePopup = document.getElementById('taxRatePopup');
      const negativeGearingInfo = document.querySelector('.negative-gearing-info');
      const negativeGearingPopup = document.getElementById('negativeGearingPopup');
      const taxSavingsPopup = document.getElementById('taxSavingsPopup');

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

      // 使用事件委托来处理动态创建的 taxSavingsInfo 元素
      document.addEventListener('click', function (event) {
        const taxSavingsInfo = event.target.closest('.tax-savings-info');
        if (taxSavingsInfo && taxSavingsPopup) {
          event.preventDefault();
          taxSavingsPopup.style.display = 'block';
        }
      });

      // 设置 taxSavingsPopup 的关闭按钮
      const taxSavingsCloseBtn = taxSavingsPopup.querySelector('.close');
      if (taxSavingsCloseBtn) {
        taxSavingsCloseBtn.addEventListener('click', function () {
          taxSavingsPopup.style.display = 'none';
        });
      }
    });