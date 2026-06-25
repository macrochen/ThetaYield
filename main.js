import './style.css'

const premiumInput = document.getElementById('premium');
const strikeInput = document.getElementById('strike');
const dteInput = document.getElementById('dte');
const expDateInput = document.getElementById('exp-date');
const marketRadios = document.getElementsByName('market');
const quickTagsContainer = document.getElementById('quick-tags');
const annualizedYieldEl = document.getElementById('annualized-yield');
const absoluteYieldEl = document.getElementById('absolute-yield');

function calculateYields() {
  const premium = parseFloat(premiumInput.value);
  const strike = parseFloat(strikeInput.value);
  const dte = parseInt(dteInput.value, 10);

  if (isNaN(premium) || isNaN(strike) || strike <= 0) {
    absoluteYieldEl.textContent = '--%';
    annualizedYieldEl.textContent = '--%';
    return;
  }

  const roc = premium / strike;
  absoluteYieldEl.textContent = (roc * 100).toFixed(2) + '%';

  if (!isNaN(dte) && dte > 0) {
    const annualized = roc * (365 / dte);
    annualizedYieldEl.textContent = (annualized * 100).toFixed(2) + '%';
  } else {
    annualizedYieldEl.textContent = '--%';
  }
}

function updateDateFromDTE() {
  const dte = parseInt(dteInput.value, 10);
  if (!isNaN(dte) && dte > 0) {
    const d = new Date();
    d.setDate(d.getDate() + dte);
    expDateInput.value = d.toISOString().split('T')[0];
  } else {
    expDateInput.value = '';
  }
  calculateYields();
}

function updateDTEFromDate() {
  if (expDateInput.value) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(expDateInput.value);
    selectedDate.setHours(0, 0, 0, 0);
    const diffTime = selectedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      dteInput.value = diffDays;
    } else {
      dteInput.value = '';
    }
  } else {
    dteInput.value = '';
  }
  calculateYields();
}

[premiumInput, strikeInput].forEach(input => {
  input.addEventListener('input', calculateYields);
});

dteInput.addEventListener('input', updateDateFromDTE);
expDateInput.addEventListener('input', updateDTEFromDate);

// Helper: difference in days between two dates (ignoring time)
function getDaysBetween(d1, d2) {
  const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Generate tags based on market
function updateQuickTags() {
  const selectedMarket = Array.from(marketRadios).find(r => r.checked).value;
  quickTagsContainer.innerHTML = '';
  
  if (selectedMarket === 'Custom') {
    return;
  }

  const today = new Date();
  const tags = [];

  // Logic for US: Next 3 Fridays
  if (selectedMarket === 'US') {
    for (let i = 1; i <= 3; i++) {
      let d = new Date(today);
      d.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
      if (i > 1) {
        d.setDate(d.getDate() + 7 * (i - 1));
      }
      tags.push(d);
    }
  }

  // Logic for A-Share: 4th Wednesday of current and next month
  if (selectedMarket === 'A') {
    for (let m = 0; m <= 1; m++) {
      let d = new Date(today.getFullYear(), today.getMonth() + m, 1);
      let count = 0;
      while (d.getMonth() === (today.getMonth() + m) % 12) {
        if (d.getDay() === 3) { // Wednesday
          count++;
          if (count === 4) {
            if (d >= today) tags.push(new Date(d));
            break;
          }
        }
        d.setDate(d.getDate() + 1);
      }
    }
  }

  // Logic for HK: second to last weekday of current and next month
  // Approximate logic: find last day of month, then walk backwards to find second-to-last weekday
  if (selectedMarket === 'HK') {
    for (let m = 0; m <= 1; m++) {
      let lastDay = new Date(today.getFullYear(), today.getMonth() + m + 1, 0);
      let weekdaysFound = 0;
      let d = new Date(lastDay);
      while (weekdaysFound < 2) {
        if (d.getDay() !== 0 && d.getDay() !== 6) { // Not Sunday or Saturday
          weekdaysFound++;
        }
        if (weekdaysFound < 2) {
          d.setDate(d.getDate() - 1);
        }
      }
      if (d >= today) tags.push(new Date(d));
    }
  }

  // Render tags
  tags.forEach(date => {
    const days = getDaysBetween(today, date);
    if (days === 0) return; // Ignore today as DTE 0 doesn't make sense for annualized calculation
    
    const tag = document.createElement('div');
    tag.className = 'tag';
    // Format date MM/DD
    const label = `${date.getMonth() + 1}/${date.getDate()} (${days}d)`;
    tag.textContent = label;
    tag.onclick = () => {
      dteInput.value = days;
      updateDateFromDTE(); // This will also call calculateYields
    };
    quickTagsContainer.appendChild(tag);
  });
}

marketRadios.forEach(radio => {
  radio.addEventListener('change', updateQuickTags);
});

// Init
updateQuickTags();
