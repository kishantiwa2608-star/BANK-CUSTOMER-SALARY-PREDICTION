document.addEventListener('DOMContentLoaded', () => {
  // State elements
  const ageInput = document.getElementById('age');
  const ageVal = document.getElementById('ageVal');
  
  const creditScoreInput = document.getElementById('creditScore');
  const creditScoreVal = document.getElementById('creditScoreVal');
  const creditRating = document.getElementById('creditRating');
  
  const balanceInput = document.getElementById('balance');
  const tenureInput = document.getElementById('tenure');
  const tenureVal = document.getElementById('tenureVal');
  
  const numOfProductsInput = document.getElementById('numOfProducts');
  const numOfProductsVal = document.getElementById('numOfProductsVal');

  const geographySelect = document.getElementById('geography');
  
  // Toggle groups
  const genderBtns = document.querySelectorAll('#genderGroup .toggle-btn');
  const crCardBtns = document.querySelectorAll('#crCardGroup .toggle-btn');
  const activeBtns = document.querySelectorAll('#activeGroup .toggle-btn');
  const exitedBtns = document.querySelectorAll('#exitedGroup .toggle-btn');

  let currentGender = 'Female';
  let hasCrCard = 1;
  let isActiveMember = 1;
  let exited = 0;

  // Initialize toggle listeners
  setupToggleGroup(genderBtns, (val) => { currentGender = val; calculateAndDisplay(); });
  setupToggleGroup(crCardBtns, (val) => { hasCrCard = parseInt(val); calculateAndDisplay(); });
  setupToggleGroup(activeBtns, (val) => { isActiveMember = parseInt(val); calculateAndDisplay(); });
  setupToggleGroup(exitedBtns, (val) => { exited = parseInt(val); calculateAndDisplay(); });

  function setupToggleGroup(buttons, callback) {
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        callback(btn.dataset.value);
      });
    });
  }

  // Update slider value tags
  ageInput.addEventListener('input', (e) => {
    ageVal.textContent = e.target.value + ' yrs';
    calculateAndDisplay();
  });

  creditScoreInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    creditScoreVal.textContent = val;
    let rating = 'Fair';
    if (val >= 800) rating = 'Excellent ⭐';
    else if (val >= 740) rating = 'Very Good';
    else if (val >= 670) rating = 'Good';
    else if (val >= 580) rating = 'Fair';
    else rating = 'Poor';
    creditRating.textContent = rating;
    calculateAndDisplay();
  });

  balanceInput.addEventListener('input', () => calculateAndDisplay());
  tenureInput.addEventListener('input', (e) => {
    tenureVal.textContent = e.target.value + ' yrs';
    calculateAndDisplay();
  });

  numOfProductsInput.addEventListener('input', (e) => {
    numOfProductsVal.textContent = e.target.value;
    calculateAndDisplay();
  });

  geographySelect.addEventListener('change', () => calculateAndDisplay());

  // Main prediction formula matching exact Python fallback & model baseline
  function predictSalary() {
    const age = parseInt(ageInput.value) || 30;
    const creditScore = parseInt(creditScoreInput.value) || 650;
    const balance = parseFloat(balanceInput.value) || 0;
    const tenure = parseInt(tenureInput.value) || 1;
    const numOfProducts = parseInt(numOfProductsInput.value) || 2;
    const geography = geographySelect.value || 'France';

    const geoBonus = { France: 0, Spain: 2200, Germany: 3800 };
    const genderBonus = { Female: 0, Male: 1200 };

    let salary = 42000;
    salary += (creditScore - 650) * 35;
    salary += (age - 30) * 800;
    salary += balance * 0.01;
    salary += tenure * 1800;
    salary += (numOfProducts - 2) * 3500;
    salary += hasCrCard * 900;
    salary += isActiveMember * 1500;
    salary += exited * 1100;
    salary += (geoBonus[geography] || 0);
    salary += (genderBonus[currentGender] || 0);

    return Math.max(salary, 10000);
  }

  // Calculate and render results dynamically
  function calculateAndDisplay() {
    const salary = predictSalary();
    
    // Animate salary output display
    const salaryElem = document.getElementById('predictedSalaryVal');
    animateNumber(salaryElem, salary);

    // Derived statistics
    const monthlyVal = document.getElementById('monthlySalaryVal');
    const dailyVal = document.getElementById('dailyRateVal');
    const tierVal = document.getElementById('tierVal');

    monthlyVal.textContent = '$' + Math.round(salary / 12).toLocaleString();
    dailyVal.textContent = '$' + Math.round(salary / 260).toLocaleString();

    let tier = 'Standard';
    if (salary > 120000) tier = 'Platinum 💎';
    else if (salary > 80000) tier = 'Gold 🌟';
    else if (salary > 45000) tier = 'Silver ✨';
    tierVal.textContent = tier;

    // Update factor breakdown bars
    const age = parseInt(ageInput.value) || 30;
    const balance = parseFloat(balanceInput.value) || 0;
    const creditScore = parseInt(creditScoreInput.value) || 650;

    const ageContribution = Math.min(Math.max(((age - 18) / 74) * 100, 10), 100);
    const balanceContribution = Math.min(Math.max((balance / 250000) * 100, 5), 100);
    const creditContribution = Math.min(Math.max(((creditScore - 300) / 550) * 100, 15), 100);

    document.getElementById('ageBarFill').style.width = ageContribution.toFixed(0) + '%';
    document.getElementById('balanceBarFill').style.width = balanceContribution.toFixed(0) + '%';
    document.getElementById('creditBarFill').style.width = creditContribution.toFixed(0) + '%';

    // Persona text update
    const personaTitle = document.getElementById('personaTitle');
    const personaDesc = document.getElementById('personaDesc');

    if (salary > 90000 && balance > 50000) {
      personaTitle.textContent = 'High-Net-Worth Executive';
      personaDesc.textContent = 'Strong account balance combined with high predicted earnings potential.';
    } else if (age < 35 && salary > 60000) {
      personaTitle.textContent = 'Emerging Young Professional';
      personaDesc.textContent = 'High upward career trajectory with fast growing financial metrics.';
    } else if (isActiveMember === 1 && hasCrCard === 1) {
      personaTitle.textContent = 'Core Retained Banking Client';
      personaDesc.textContent = 'High engagement level across credit and active digital services.';
    } else {
      personaTitle.textContent = 'Standard Retail Customer';
      personaDesc.textContent = 'Balanced account profile within typical demographic benchmarks.';
    }
  }

  function animateNumber(elem, finalValue) {
    const startVal = parseFloat(elem.textContent.replace(/[^0-9.-]+/g, "")) || 0;
    const duration = 400; // ms
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (finalValue - startVal) * easedProgress;

      elem.textContent = '$' + current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Initial calculation run
  calculateAndDisplay();
});
